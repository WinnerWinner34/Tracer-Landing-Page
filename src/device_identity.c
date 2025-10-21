/*
 * Device Identity - IMEI Extraction and Device ID Generation
 */

#include "device_identity.h"
#include <zephyr/kernel.h>
#include <modem/modem_info.h>
#include <string.h>

static char device_imei[32];
static char device_id[32];
static bool initialized = false;

int device_identity_init(void)
{
	int err;

	printk("🔧 Initializing device identity...\n");

	/* Extract IMEI from modem */
	err = modem_info_init();
	if (err) {
		printk("❌ Failed to init modem_info: %d\n", err);
		return err;
	}

	err = modem_info_string_get(MODEM_INFO_IMEI, device_imei, sizeof(device_imei));
	if (err < 0) {
		printk("❌ Failed to get IMEI: %d\n", err);
		return err;
	}

	printk("📱 IMEI: %s\n", device_imei);

	/* Generate device ID from last 8 digits of IMEI */
	size_t imei_len = strlen(device_imei);
	if (imei_len >= 8) {
		snprintf(device_id, sizeof(device_id), "FLT-DEV-%s",
		         device_imei + imei_len - 8);
	} else {
		snprintf(device_id, sizeof(device_id), "FLT-DEV-UNKNOWN");
	}

	printk("✅ Device ID: %s\n", device_id);

	initialized = true;
	return 0;
}

const char* device_identity_get_imei(void)
{
	return initialized ? device_imei : "UNKNOWN";
}

const char* device_identity_get_id(void)
{
	return initialized ? device_id : "UNKNOWN";
}
