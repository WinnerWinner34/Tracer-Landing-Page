/*
 * Fleet Tracker Phase 2C+ - Smart LTE Management with Active Modem Monitoring
 *
 * MODIFICATION: Start in LTE+GNSS mode from beginning instead of switching modes.
 * This avoids error 65536 when trying to change XSYSTEMMODE after modem is active.
 */

#include <zephyr/kernel.h>
#include <modem/lte_lc.h>
#include <modem/modem_info.h>
#include <date_time.h>
#include <modem/location.h>
#include <modem/nrf_modem_lib.h>
#include <nrf_modem_at.h>
#include <zephyr/logging/log.h>

#include "transmission_manager.h"
#include "device_identity.h"
#include "cert_provisioning.h"

/* ============================================================================
 * MODEM FAULT HANDLER - Catches modem faults before system reset
 * This handler will print diagnostic information if the modem crashes
 * ============================================================================ */
void nrf_modem_fault_handler(struct nrf_modem_fault_info *fault_info)
{
	printk("\n\n");
	printk("============================================\n");
	printk("❌❌❌ MODEM FAULT DETECTED! ❌❌❌\n");
	printk("============================================\n");
	printk("Reason: %d\n", fault_info->reason);
	printk("Program counter: 0x%08x\n", (unsigned int)fault_info->program_counter);
	printk("============================================\n\n");

	/* Halt instead of reset so we can see the fault in RTT */
	printk("System halted. Press RESET to restart.\n");
	while (1) {
		k_sleep(K_FOREVER);
	}
}

/* ============================================================================
 * GPS STATISTICS AND STATE TRACKING
 * ============================================================================ */
static struct {
	uint32_t total_updates;
	uint32_t valid_fixes;
	uint32_t timeout_count;
	uint32_t error_count;
	uint32_t agnss_requests;
	uint32_t consecutive_failures;
	bool continuous_mode_active;
	bool first_fix_acquired;
	int64_t first_fix_time;
	int64_t last_fix_time;
	uint32_t best_accuracy_cm;
} gps_stats = {0};

/* GPS configuration */
#define GPS_TIMEOUT_MS 90000
#define GPS_BUFFER_SIZE 100
#define GPS_ACCURACY_THRESHOLD 50.0

static uint32_t current_gps_timeout = GPS_TIMEOUT_MS;

/* GPS circular buffer */
static struct {
	struct location_event_data buffer[GPS_BUFFER_SIZE];
	uint8_t write_index;
	uint8_t read_index;
	uint8_t count;
	struct k_mutex lock;
} gps_buffer;

/* ============================================================================
 * LTE STATE MACHINE
 * ============================================================================ */
typedef enum {
	STATE_NORMAL,
	STATE_NO_LTE,
	STATE_CHECKING_LTE
} system_state_t;

static system_state_t current_state = STATE_NO_LTE;

/* LTE check configuration */
#define LTE_CHECK_INTERVAL_SEC (5 * 60)
#define LTE_CHECK_TIMEOUT_SEC 30
#define LTE_DISCONNECT_GRACE_PERIOD_SEC 30

/* Work items for LTE management */
static struct k_work_delayable lte_check_work;
static struct k_work_delayable lte_disconnect_work;

/* Semaphores */
static K_SEM_DEFINE(location_initialized, 0, 1);
static K_SEM_DEFINE(lte_connected, 0, 1);
static K_SEM_DEFINE(time_update_finished, 0, 1);

/* ============================================================================
 * FUNCTION PROTOTYPES
 * ============================================================================ */
static void location_event_handler(const struct location_event_data *event_data);
static void lte_event_handler(const struct lte_lc_evt *const evt);
static void date_time_evt_handler(const struct date_time_evt *evt);
static void lte_check_work_handler(struct k_work *work);
static void lte_disconnect_work_handler(struct k_work *work);

/* Helper function prototypes */
static int switch_to_gnss_only_mode(void);
static int switch_to_normal_mode(void);
static int start_lte_periodic_checks(void);

/* ============================================================================
 * LTE STATE MANAGEMENT HELPERS
 * ============================================================================ */

/* Switch to GNSS-only mode (no LTE) */
static int switch_to_gnss_only_mode(void)
{
	int err;
	
	printk("\n🔵 Switching to GNSS-ONLY mode (LTE disabled)\n");
	printk("   GPS will get 100%% RF time for standalone operation\n");
	
	/* Set system mode to GNSS only */
	err = nrf_modem_at_printf("AT%%XSYSTEMMODE=0,0,1,0");
	if (err) {
		printk("ERROR: Failed to set GNSS-only mode: %d\n", err);
		return err;
	}
	
	/* Re-apply CFUN to ensure it takes effect */
	err = nrf_modem_at_printf("AT+CFUN=1");
	if (err) {
		printk("ERROR: Failed to set CFUN=1: %d\n", err);
		return err;
	}
	
	k_sleep(K_SECONDS(2));
	printk("✅ GNSS-only mode active\n\n");
	
	current_state = STATE_NO_LTE;
	return 0;
}

/* Switch to normal mode (LTE + GNSS) */
static int switch_to_normal_mode(void)
{
	int err;
	
	printk("\n🟢 Switching to NORMAL mode (LTE + GNSS)\n");
	
	/* Set system mode to LTE + GNSS */
	err = nrf_modem_at_printf("AT%%XSYSTEMMODE=1,0,1,0");
	if (err) {
		printk("ERROR: Failed to set LTE+GNSS mode: %d\n", err);
		return err;
	}
	
	/* Re-apply CFUN to ensure it takes effect */
	err = nrf_modem_at_printf("AT+CFUN=1");
	if (err) {
		printk("ERROR: Failed to set CFUN=1: %d\n", err);
		return err;
	}
	
	k_sleep(K_SECONDS(2));
	printk("✅ Normal mode active (A-GNSS will be available)\n\n");
	
	current_state = STATE_NORMAL;
	return 0;
}

/* Start periodic LTE connectivity checks */
static int start_lte_periodic_checks(void)
{
	printk("🔄 Starting periodic LTE checks (every %d minutes)\n", LTE_CHECK_INTERVAL_SEC / 60);
	k_work_schedule(&lte_check_work, K_SECONDS(LTE_CHECK_INTERVAL_SEC));
	return 0;
}

/* ============================================================================
 * LTE PERIODIC CHECK WORK HANDLER
 * ============================================================================ */
static void lte_check_work_handler(struct k_work *work)
{
	int err;

	printk("\n⏰ Periodic LTE check starting (30 second attempt)...\n");
	printk("   GPS continues running in background\n");

	current_state = STATE_CHECKING_LTE;

	/* CRITICAL FIX: Set modem to flight mode to allow system mode change */
	printk("Step 1: Setting modem to flight mode (CFUN=4)...\n");
	err = nrf_modem_at_printf("AT+CFUN=4");
	if (err) {
		printk("ERROR: Failed to set CFUN=4: %d\n", err);
		goto schedule_retry;
	}
	k_sleep(K_SECONDS(2));

	/* Step 2: Change system mode to LTE+GNSS */
	printk("Step 2: Setting system mode to LTE+GNSS...\n");
	err = nrf_modem_at_printf("AT%%XSYSTEMMODE=1,0,1,0");
	if (err) {
		printk("ERROR: Failed to set LTE+GNSS mode: %d\n", err);
		goto restore_gnss_only;
	}

	/* Step 3: Activate the modem with new system mode */
	printk("Step 3: Activating modem (CFUN=1)...\n");
	err = nrf_modem_at_printf("AT+CFUN=1");
	if (err) {
		printk("ERROR: Failed to set CFUN=1: %d\n", err);
		goto restore_gnss_only;
	}
	k_sleep(K_SECONDS(2));

	printk("✅ System mode changed successfully\n");
	current_state = STATE_NORMAL;

	/* Try to connect to LTE */
	printk("Attempting LTE connection...\n");
	k_sem_reset(&lte_connected);
	err = lte_lc_connect_async(lte_event_handler);
	if (err) {
		printk("Failed to start LTE connection: %d\n", err);
		goto restore_gnss_only;
	}

	/* Wait up to 30 seconds for connection */
	err = k_sem_take(&lte_connected, K_SECONDS(LTE_CHECK_TIMEOUT_SEC));
	if (err) {
		printk("⏱️ LTE check timeout - no signal found\n");
		printk("   Switching back to GNSS-only mode\n");

		lte_lc_offline();
		goto restore_gnss_only;
	} else {
		printk("✅ LTE connection established!\n");
		printk("   Staying in NORMAL operation mode\n");
		printk("   A-GNSS data will be automatically downloaded\n\n");
		printk("   GPS thread continues running with A-GNSS support\n");

		/* Stay in NORMAL mode - don't schedule another check */
		return;
	}

restore_gnss_only:
	/* Switch back to GNSS-only */
	switch_to_gnss_only_mode();

schedule_retry:
	/* Schedule next check */
	k_work_schedule(&lte_check_work, K_SECONDS(LTE_CHECK_INTERVAL_SEC));
	printk("   GPS thread continues running in standalone mode\n");
}

/* ============================================================================
 * LTE EVENT HANDLER
 * ============================================================================ */
static void lte_event_handler(const struct lte_lc_evt *const evt)
{
	switch (evt->type) {
	case LTE_LC_EVT_NW_REG_STATUS:
		switch (evt->nw_reg_status) {
		case LTE_LC_NW_REG_REGISTERED_HOME:
		case LTE_LC_NW_REG_REGISTERED_ROAMING:
			printk("📡 LTE: Registered to network\n");

			/* PDN Activation Diagnostics */
			{
				char response[256];
				int err;

				printk("\n📊 PDN DIAGNOSTICS:\n");

				/* Check PDN context activation status */
				memset(response, 0, sizeof(response));
				err = nrf_modem_at_cmd(response, sizeof(response), "AT+CGACT?");
				if (err == 0) {
					printk("   PDN Status: %s\n", response);
				}

				/* Check assigned IP address */
				memset(response, 0, sizeof(response));
				err = nrf_modem_at_cmd(response, sizeof(response), "AT+CGPADDR=0");
				if (err == 0) {
					printk("   IP Address: %s\n", response);
				}

				printk("📊 END PDN DIAGNOSTICS\n\n");
			}

			/* Cancel disconnect grace period if one was scheduled */
			k_work_cancel_delayable(&lte_disconnect_work);

			/* Update state and signal */
			if (current_state == STATE_NO_LTE || current_state == STATE_CHECKING_LTE) {
				printk("📡 LTE: Switching to NORMAL mode - A-GNSS now available\n");
				printk("📡 LTE: Location library will auto-download A-GNSS data\n");
				current_state = STATE_NORMAL;
			}

			k_sem_give(&lte_connected);
			break;

		case LTE_LC_NW_REG_NOT_REGISTERED:
			printk("📡 LTE: Not registered\n");
			break;

		case LTE_LC_NW_REG_SEARCHING:
			printk("📡 LTE: Searching for network\n");
			break;

		case LTE_LC_NW_REG_REGISTRATION_DENIED:
			printk("📡 LTE: Registration denied\n");
			break;

		case LTE_LC_NW_REG_UICC_FAIL:
			printk("📡 LTE: UICC failure\n");
			break;

		default:
			printk("📡 LTE: Registration status %d\n", evt->nw_reg_status);
			break;
		}
		break;

	case LTE_LC_EVT_PSM_UPDATE:
		printk("📡 LTE: PSM parameter update\n");
		break;

	case LTE_LC_EVT_EDRX_UPDATE:
		printk("📡 LTE: eDRX update\n");
		break;

	case LTE_LC_EVT_RRC_UPDATE:
		if (evt->rrc_mode == LTE_LC_RRC_MODE_CONNECTED) {
			printk("📡 LTE: RRC Connected\n");
		} else if (evt->rrc_mode == LTE_LC_RRC_MODE_IDLE) {
			printk("📡 LTE: RRC Idle\n");
		}
		break;

	case LTE_LC_EVT_CELL_UPDATE:
		/* Cellular location changed - not critical for our app */
		break;

	case LTE_LC_EVT_LTE_MODE_UPDATE:
		/* LTE mode changed - not critical */
		break;

	default:
		break;
	}
}

/* ============================================================================
 * LTE DISCONNECT GRACE PERIOD HANDLER
 * ============================================================================ */
static void lte_disconnect_work_handler(struct k_work *work)
{
	enum lte_lc_nw_reg_status status;
	int err;
	
	printk("\n⏱️ 30-second grace period expired, checking LTE status...\n");
	
	err = lte_lc_nw_reg_status_get(&status);
	if (err) {
		printk("Failed to get LTE status: %d\n", err);
		/* Assume still disconnected */
		status = LTE_LC_NW_REG_NOT_REGISTERED;
	}
	
	if (status == LTE_LC_NW_REG_REGISTERED_HOME || 
	    status == LTE_LC_NW_REG_REGISTERED_ROAMING) {
		printk("✅ LTE reconnected during grace period - staying in NORMAL mode\n\n");
		current_state = STATE_NORMAL;
	} else {
		printk("❌ LTE still disconnected - switching to GNSS-only mode\n");
		switch_to_gnss_only_mode();
		start_lte_periodic_checks();
	}
}

/* ============================================================================
 * DATE/TIME EVENT HANDLER
 * ============================================================================ */
static void date_time_evt_handler(const struct date_time_evt *evt)
{
	k_sem_give(&time_update_finished);
}

/* ============================================================================
 * GPS CIRCULAR BUFFER OPERATIONS
 * ============================================================================ */
static void gps_buffer_init(void)
{
	k_mutex_init(&gps_buffer.lock);
	gps_buffer.write_index = 0;
	gps_buffer.read_index = 0;
	gps_buffer.count = 0;
	memset(gps_buffer.buffer, 0, sizeof(gps_buffer.buffer));
	printk("GPS buffer init: %d position capacity\n", GPS_BUFFER_SIZE);
}

static int gps_buffer_add(const struct location_event_data *data)
{
	k_mutex_lock(&gps_buffer.lock, K_FOREVER);
	
	if (gps_buffer.count >= GPS_BUFFER_SIZE) {
		gps_buffer.read_index = (gps_buffer.read_index + 1) % GPS_BUFFER_SIZE;
		gps_buffer.count--;
	}
	
	memcpy(&gps_buffer.buffer[gps_buffer.write_index], data, sizeof(*data));
	gps_buffer.write_index = (gps_buffer.write_index + 1) % GPS_BUFFER_SIZE;
	gps_buffer.count++;
	
	k_mutex_unlock(&gps_buffer.lock);
	return 0;
}

/* ============================================================================
 * LOCATION EVENT HANDLER
 * ============================================================================ */
static void location_event_handler(const struct location_event_data *event_data)
{
	gps_stats.total_updates++;
	
	switch (event_data->id) {
	case LOCATION_EVT_LOCATION:
		gps_stats.valid_fixes++;
		gps_stats.last_fix_time = k_uptime_get();
		
		/* Reset consecutive failures on success */
		if (gps_stats.consecutive_failures > 0) {
			printk("✅ GPS recovered after %u consecutive failures\n", 
			       gps_stats.consecutive_failures);
			gps_stats.consecutive_failures = 0;
			
			/* Reset timeout to normal */
			if (current_gps_timeout != GPS_TIMEOUT_MS) {
				current_gps_timeout = GPS_TIMEOUT_MS;
				printk("   Timeout reset to %u seconds\n", GPS_TIMEOUT_MS / 1000);
			}
		}
		
		/* Track first fix */
		if (!gps_stats.first_fix_acquired) {
			gps_stats.first_fix_acquired = true;
			gps_stats.first_fix_time = k_uptime_get();
			printk("\n🎯 FIRST FIX ACQUIRED!\n");
			printk("   Time to first fix: %lld seconds\n", gps_stats.first_fix_time / 1000);
			printk("   Location: %.6f, %.6f\n",
			       event_data->location.latitude, event_data->location.longitude);
			printk("   Accuracy: %.1f meters\n\n", (double)event_data->location.accuracy);
		}
		
		/* Track best accuracy */
		uint32_t accuracy_cm = (uint32_t)(event_data->location.accuracy * 100);
		if (gps_stats.best_accuracy_cm == 0 || accuracy_cm < gps_stats.best_accuracy_cm) {
			if (gps_stats.best_accuracy_cm > 0) {
				printk("🎯 New best accuracy: %.1fm (was %.1fm)\n",
				       accuracy_cm / 100.0, gps_stats.best_accuracy_cm / 100.0);
			}
			gps_stats.best_accuracy_cm = accuracy_cm;
		}
		
		/* Store in buffer if accuracy is good enough */
		if (event_data->location.accuracy <= GPS_ACCURACY_THRESHOLD) {
			gps_buffer_add(event_data);
			
			/* Submit to transmission manager */
			transmission_manager_add_location(event_data);
		}
		
		/* Reduce logging frequency after first fix */
		if (gps_stats.valid_fixes <= 5 || gps_stats.valid_fixes % 10 == 0) {
			printk("🛰️ GPS#%u: %.6f,%.6f ±%.1fm\n",
			       gps_stats.valid_fixes,
			       event_data->location.latitude,
			       event_data->location.longitude,
			       (double)event_data->location.accuracy);
		}
		
		/* Adaptive timeout adjustment */
		if (gps_stats.consecutive_failures >= 5 && 
		    current_gps_timeout < GPS_TIMEOUT_MS * 2) {
			current_gps_timeout = GPS_TIMEOUT_MS * 2;
			printk("   Increasing timeout to %u seconds for difficult conditions\n", 
			       current_gps_timeout / 1000);
		} else if (gps_stats.consecutive_failures == 0 && 
		           current_gps_timeout > GPS_TIMEOUT_MS) {
			current_gps_timeout = GPS_TIMEOUT_MS;
			printk("   Decreasing threshold\n");
		}
		break;

	case LOCATION_EVT_TIMEOUT:
		gps_stats.timeout_count++;
		gps_stats.consecutive_failures++;
		
		if (gps_stats.timeout_count <= 5 || gps_stats.timeout_count % 10 == 0) {
			printk("⏱️ GPS timeout (count: %u, consecutive: %u)\n", 
			       gps_stats.timeout_count, gps_stats.consecutive_failures);
			
			if (gps_stats.timeout_count == 3 && !gps_stats.first_fix_acquired) {
				printk("   💡 Tip: Move to location with clear sky view\n");
			}
		}
		break;

	case LOCATION_EVT_ERROR:
		gps_stats.error_count++;
		gps_stats.consecutive_failures++;
		printk("❌ GPS error (count: %u)\n", gps_stats.error_count);
		break;

	case LOCATION_EVT_GNSS_ASSISTANCE_REQUEST:
		gps_stats.agnss_requests++;
		if (gps_stats.agnss_requests == 1) {
			printk("📡 A-GNSS assistance requested (helps speed up first fix)\n");
			if (!gps_stats.first_fix_acquired) {
				printk("   Note: First fix may take 5-7 minutes without A-GNSS\n");
			}
		}
		break;

	case LOCATION_EVT_GNSS_PREDICTION_REQUEST:
		/* P-GPS requested - silently ignore */
		break;

	default:
		printk("❓ Unknown GPS event: %d\n", event_data->id);
		break;
	}
}

/* ============================================================================
 * GPS CONTINUOUS TRACKING THREAD
 * ============================================================================ */
void gps_thread(void)
{
	int err;
	struct location_config config = {0};
	
	enum location_method methods[] = {LOCATION_METHOD_GNSS, LOCATION_METHOD_CELLULAR};

	printk("GPS Thread: Waiting for Location library initialization...\n");
	err = k_sem_take(&location_initialized, K_SECONDS(180));
	if (err) {
		printk("GPS Thread: ERROR - Timeout waiting for location_initialized semaphore!\n");
		return;
	}
	
	printk("GPS Thread: Semaphore received! Location library should be ready\n");
	
	k_sleep(K_SECONDS(2));

	printk("GPS Thread: Configuring Phase 2C smart acquisition...\n");

	location_config_defaults_set(&config, ARRAY_SIZE(methods), methods);
	
	config.methods[0].gnss.timeout = current_gps_timeout;
	config.methods[0].gnss.accuracy = LOCATION_ACCURACY_NORMAL;
	
	config.methods[1].cellular.timeout = 30000;
	
	config.interval = 1;
	config.mode = LOCATION_REQ_MODE_FALLBACK;

	gps_stats.continuous_mode_active = true;
	printk("\n========== Phase 2C Configuration ==========\n");
	printk("Primary:  GNSS (timeout: %u sec)\n", current_gps_timeout / 1000);
	printk("Fallback: Cellular (timeout: 30 sec)\n");
	printk("Mode:     Fallback (try GNSS first, cellular if timeout)\n");
	printk("Interval: 1 second (1Hz)\n");
	printk("Dynamic:  Timeout will increase after 5 consecutive failures\n");
	printk("============================================\n\n");

	err = location_request(&config);
	if (err) {
		printk("ERROR: Initial location request failed: %d\n", err);
		printk("GPS tracking will NOT start!\n");
		return;
	}
	
	printk("GPS Thread: Smart acquisition started successfully\n\n");

	/* Monitor for consecutive failures and adjust timeout */
	while (1) {
		k_sleep(K_SECONDS(60));
		
		/* Adjust timeout after 5 consecutive failures */
		if (gps_stats.consecutive_failures >= 5 && 
		    current_gps_timeout == GPS_TIMEOUT_MS) {
			
			current_gps_timeout = GPS_TIMEOUT_MS * 2;
			
			printk("\n⚠️ ADAPTIVE TIMEOUT ADJUSTMENT\n");
			printk("   Consecutive failures: %u\n", gps_stats.consecutive_failures);
			printk("   New GNSS timeout: %u seconds (was %u)\n", 
			       current_gps_timeout / 1000, GPS_TIMEOUT_MS / 1000);
			printk("   This gives GPS more time to acquire signal\n\n");
			
			config.methods[0].gnss.timeout = current_gps_timeout;
		}
	}
}

K_THREAD_DEFINE(gps_tid, 4096, gps_thread, NULL, NULL, NULL, 5, 0, 0);

/* ============================================================================
 * HEARTBEAT THREAD
 * ============================================================================ */
void heartbeat_thread(void)
{
	static uint32_t seconds_counter = 0;
	while (1) {
		k_sleep(K_SECONDS(30));
		seconds_counter += 30;
		
		uint32_t success_rate = 0;
		if (gps_stats.total_updates > 0) {
			success_rate = (gps_stats.valid_fixes * 100) / gps_stats.total_updates;
		}

		uint8_t batch_count = 0;
		int64_t last_tx = 0;
		transmission_manager_get_stats(&batch_count, &last_tx);

		printk("\n⏱️ Runtime: %u sec | GPS: %u/%u (%u%%) | Buf: %u/%u | Batch: %u/20",
		       seconds_counter,
		       gps_stats.valid_fixes,
		       gps_stats.total_updates,
		       success_rate,
		       gps_buffer.count,
		       GPS_BUFFER_SIZE,
		       batch_count);
		
		if (gps_stats.best_accuracy_cm > 0) {
			printk(" | Best: %.1fm", gps_stats.best_accuracy_cm / 100.0);
		}
		
		if (current_gps_timeout != GPS_TIMEOUT_MS) {
			printk(" | Timeout: %us", current_gps_timeout / 1000);
		}
		
		printk("\n");
	}
}

K_THREAD_DEFINE(heartbeat_tid, 1024, heartbeat_thread, NULL, NULL, NULL, 7, 0, 0);

/* ============================================================================
 * MAIN APPLICATION
 * ============================================================================ */
int main(void)
{
	int err;

	printk("\n========================================================\n");
	printk("Fleet Tracker Phase 2C+ - Smart LTE Management\n");
	printk("SDK v3.1.1 | 1Hz GPS | Adaptive LTE State Management\n");
	printk("========================================================\n\n");

	printk("Features:\n");
	printk("  • GNSS primary + Cellular fallback\n");
	printk("  • GNSS-only mode when no LTE (100%% RF time)\n");
	printk("  • Periodic LTE checks (every 5 minutes)\n");
	printk("  • 30-second grace period on LTE disconnect\n");
	printk("  • Dynamic timeout adjustment\n");
	printk("  • Enhanced statistics tracking\n\n");

	gps_buffer_init();

	printk("Initializing modem library...\n");
	err = nrf_modem_lib_init();
	if (err) {
		printk("ERROR: Modem initialization failed: %d\n", err);
		return err;
	}
	printk("Modem library initialized\n\n");

	/* Initialize device identity */
	printk("\nStep: Initializing device identity...\n");
	err = device_identity_init();
	if (err) {
		printk("❌ Device identity init failed: %d\n", err);
		return 0;
	}
	printk("✅ Device identity initialized\n");
	printk("   Device ID: %s\n", device_identity_get_id());
	printk("   IMEI: %s\n\n", device_identity_get_imei());

	/* CRITICAL: Provision certificates BEFORE LTE connection starts */
	printk("\n📜 Checking AWS certificates...\n");
	if (cert_provisioning_check()) {
		printk("✅ Certificates already present in modem storage\n");
		printk("   Skipping provisioning to preserve flash wear\n\n");
	} else {
		printk("⚠️  Certificates missing - provisioning now...\n");
		err = cert_provisioning_init();
		if (err) {
			printk("❌ ERROR: Certificate provisioning failed: %d\n", err);
			printk("   Check that convert_certs.py was run successfully\n");
			printk("   AWS connection will fail without certificates\n");
		} else {
			printk("✅ Certificates provisioned successfully\n\n");
		}
	}

	/* Initialize work items */
	k_work_init_delayable(&lte_check_work, lte_check_work_handler);
	k_work_init_delayable(&lte_disconnect_work, lte_disconnect_work_handler);

	/* ================================================================== */
	/* BAND LOCK CHECK */
	/* ================================================================== */
	printk("========================================\n");
	printk("🔍 CHECKING BAND CONFIGURATION\n");
	printk("========================================\n");

	char band_response[100];
	int ret = nrf_modem_at_cmd(band_response, sizeof(band_response), "AT%%XBANDLOCK?");
	if (ret) {
		printk("⚠️ Failed to query band lock: %d\n", ret);
	} else {
		printk("Band lock: %s\n", band_response);
	}

	memset(band_response, 0, sizeof(band_response));
	ret = nrf_modem_at_cmd(band_response, sizeof(band_response), "AT%%XBANDLOCK=2");
	if (ret) {
		printk("⚠️ Failed to query supported bands: %d\n", ret);
	} else {
		printk("Supported bands: %s\n", band_response);
	}
	printk("========================================\n\n");

	/* ================================================================== */
	/* DEVICE IDENTIFICATION */
	/* ================================================================== */
	{
		printk("\n========================================\n");
		printk("📱 DEVICE IDENTIFICATION\n");
		printk("========================================\n");
		
		char imei[16];
		ret = nrf_modem_at_cmd(imei, sizeof(imei), "AT+CGSN");
		if (ret == 0) {
			/* Remove any newlines/carriage returns */
			for (int i = 0; i < sizeof(imei); i++) {
				if (imei[i] == '\r' || imei[i] == '\n') {
					imei[i] = '\0';
					break;
				}
			}
			printk("✅ IMEI: %s\n", imei);
			printk("   (Write this down for SIM activation!)\n");
		} else {
			printk("❌ Failed to get IMEI: %d\n", ret);
		}

		printk("========================================\n\n");
	}

	/* ===================================================================
	 * CRITICAL CHANGE: Start in LTE+GNSS mode from the beginning
	 * 
	 * WHY: Avoids error 65536 that occurs when trying to change system
	 * mode (AT%XSYSTEMMODE) after the modem is already active. The modem
	 * won't let you change modes once CFUN=1 has been called.
	 * 
	 * PREVIOUS APPROACH (broken):
	 *   1. Start in LTE-only (1,0,0,0)
	 *   2. Connect LTE
	 *   3. Try to switch to LTE+GNSS (1,0,1,0) ← ERROR 65536!
	 * 
	 * NEW APPROACH (works):
	 *   1. Start in LTE+GNSS (1,0,1,0) from beginning
	 *   2. No mode switching needed
	 *   3. Everything works!
	 * 
	 * This matches mainV1-Working_RTT_LTE_GNSS.c which successfully
	 * starts in LTE+GNSS mode.
	 * =================================================================== */
	printk("Configuring modem system mode for LTE-M + GNSS from start...\n");
	err = nrf_modem_at_printf("AT%%XSYSTEMMODE=1,0,1,0");
	if (err) {
		printk("ERROR: Failed to set system mode: %d\n", err);
	} else {
		printk("System mode set: LTE-M + GNSS\n");
		printk("   (Both radios enabled from the start - no switching needed)\n");
	}

	/* TEMPORARILY DISABLED - These AT commands fail with error 65536 and may cause modem fault
	 * Will re-enable once modem is stable
	 * ===================================================================
	 * EXTERNAL ANTENNA CONFIGURATION - CRITICAL FOR CUSTOM PCB
	 * Must be configured AFTER system mode but BEFORE CFUN=1
	 * =================================================================== */
	/*
	printk("\n📡 Configuring external LTE/GNSS antennas...\n");

	err = nrf_modem_at_printf("AT%%XCOEX0=0");
	if (err) {
		printk("⚠️ COEX disable failed: %d (continuing anyway)\n", err);
	} else {
		printk("✅ Coexistence disabled - LTE gets 100%% RF time\n");
	}

	err = nrf_modem_at_printf("AT%%XMAGPIO=1,0,0,1,1,1574,1577");
	if (err) {
		printk("⚠️ MAGPIO config failed: %d\n", err);
		printk("   WARNING: Modem may use onboard antenna (won't work!)\n");
	} else {
		printk("✅ MAGPIO configured for external antenna\n");
	}

	printk("📡 Antenna configuration complete\n\n");
	*/
	/* ================================================================== */

	/* ================================================================== */


	/* ================================================================
	 * LTE INITIALIZATION - Let lte_lc handle everything
	 * ================================================================ */
	printk("\n📡 Step 1: Starting LTE connection (non-blocking)...\n");
	printk("   Modem will connect in background\n");
	printk("   APN configured via Kconfig\n");

	lte_lc_register_handler(lte_event_handler);

	if (IS_ENABLED(CONFIG_DATE_TIME)) {
		date_time_register_handler(date_time_evt_handler);
		printk("📅 Date/time handler registered\n");
	}

	lte_lc_psm_req(true);

	err = lte_lc_connect_async(lte_event_handler);
	if (err) {
		printk("❌ Failed to start LTE: %d\n", err);
		printk("   GPS will work in standalone mode\n");
	} else {
		printk("✅ LTE connecting in background\n\n");
	}

	printk("⏳ Waiting 15 seconds for modem stabilization...\n");
	printk("   (LTE connecting in background)\n");
	k_sleep(K_SECONDS(15));

	printk("\nStep 5: Time sync will happen automatically when LTE connects\n");
	if (IS_ENABLED(CONFIG_DATE_TIME)) {
		printk("✅ Date/time handler already registered (will sync via LTE when available)\n");
	}

	/* ===================================================================
	 * NOTE: Step 5.5 "Enabling GNSS" section has been REMOVED
	 * 
	 * WHY: We already enabled GNSS at the start (line ~211) with 
	 * AT%XSYSTEMMODE=1,0,1,0. The old Step 5.5 tried to switch from
	 * LTE-only to LTE+GNSS which caused error 65536.
	 * 
	 * Since we start in LTE+GNSS mode, no switching is needed!
	 * =================================================================== */

	/* Initialize Location library */
	printk("\nStep 6: About to initialize Location library...\n");
	err = location_init(location_event_handler);
	if (err) {
		printk("ERROR: Location library init failed: %d\n", err);
		return -1;
	}
	printk("Step 7: Location library initialized successfully!\n");

	/* Initialize transmission manager */
	printk("Step 11: Initializing transmission manager...\n");
	err = transmission_manager_init();
	if (err) {
		printk("ERROR: Transmission manager init failed: %d\n", err);
	}

	/* Signal GPS thread */
	printk("Step 8: Giving semaphore to GPS thread...\n");
	k_sem_give(&location_initialized);
	printk("Step 9: Semaphore given! GPS thread should start now.\n");

	printk("\nStep 10: Phase 2C+ smart acquisition configured!\n");
	printk("Buffer: %d positions (%.1f min @ 1Hz)\n",
	       GPS_BUFFER_SIZE, (float)GPS_BUFFER_SIZE / 60.0);
	printk("Accuracy threshold: %.1fm\n", GPS_ACCURACY_THRESHOLD);
	
	if (current_state == STATE_NORMAL) {
		printk("\n💡 System in NORMAL mode\n");
		printk("   LTE: Connected\n");
		printk("   GPS: Will use A-GNSS for faster fixes\n");
		printk("   Cellular fallback: Available\n\n");
	} else {
		printk("\n💡 System in GNSS-ONLY mode\n");
		printk("   LTE: Checking every 5 minutes\n");
		printk("   GPS: Standalone (cold start may take 5-7 minutes)\n");
		printk("   (Move to location with clear sky view for best results)\n\n");
	}

	/* Main loop with state monitoring */
	while (1) {
		k_sleep(K_SECONDS(60));
		
		const char *state_str;
		switch (current_state) {
		case STATE_NORMAL:
			state_str = "NORMAL (LTE+GNSS)";
			break;
		case STATE_NO_LTE:
			state_str = "GNSS-ONLY";
			break;
		case STATE_CHECKING_LTE:
			state_str = "CHECKING_LTE";
			break;
		default:
			state_str = "UNKNOWN";
			break;
		}
		
		printk("Main loop alive - uptime: %lld seconds - State: %s\n", 
		       k_uptime_get() / 1000, state_str);
	}

	return 0;
}