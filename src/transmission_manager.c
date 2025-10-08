/*
 * Transmission Manager - LTE On-Demand Implementation for SDK 3.1.1
 * Handles intelligent data batching and transmission scheduling
 */

#include <zephyr/kernel.h>
#include <modem/lte_lc.h>
#include <modem/location.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(transmission_mgr, LOG_LEVEL_INF);

#define TRANSMISSION_BATCH_SIZE_MAX  20
#define TRANSMISSION_INTERVAL_SEC    300  /* 5 minutes */

/* Location data batch buffer */
struct location_batch {
    struct location_event_data locations[TRANSMISSION_BATCH_SIZE_MAX];
    uint8_t count;
    int64_t last_transmission_time;
};

static struct location_batch batch_buffer = {0};
static struct k_work transmission_work;
static struct k_work_delayable scheduled_transmission_work;

/* Add location to batch buffer */
int transmission_manager_add_location(const struct location_event_data *location)
{
    if (batch_buffer.count >= TRANSMISSION_BATCH_SIZE_MAX) {
        printk("📦 Batch buffer full (%d locations), triggering immediate transmission\n", 
               batch_buffer.count);
        k_work_submit(&transmission_work);
        return -ENOMEM;
    }
    
    memcpy(&batch_buffer.locations[batch_buffer.count], location, 
           sizeof(struct location_event_data));
    batch_buffer.count++;
    
    printk("📍 Location added to batch (%d/%d)\n", 
           batch_buffer.count, TRANSMISSION_BATCH_SIZE_MAX);
    
    return 0;
}

/* Transmit batch to cloud (placeholder for now) */
static void transmit_batch_to_cloud(void)
{
    if (batch_buffer.count == 0) {
        printk("📤 No data to transmit\n");
        return;
    }
    
    printk("\n========================================\n");
    printk("📤 TRANSMISSION: Sending batch of %d locations\n", batch_buffer.count);
    printk("========================================\n");
    
    /* Display the batch contents */
    for (int i = 0; i < batch_buffer.count; i++) {
        printk("  [%d] Lat: %.6f, Lon: %.6f, Acc: %.1fm\n",
               i + 1,
               batch_buffer.locations[i].location.latitude,
               batch_buffer.locations[i].location.longitude,
               batch_buffer.locations[i].location.accuracy);
    }
    
    printk("========================================\n\n");
    
    /* TODO: In Phase 3B, we'll add actual cloud transmission here */
    
    /* Clear batch after "transmission" */
    batch_buffer.count = 0;
    batch_buffer.last_transmission_time = k_uptime_get();
}

/* Transmission work handler */
static void transmission_work_handler(struct k_work *work)
{
    printk("🌐 Transmission triggered\n");
    
    /* TODO: In Phase 3B, we'll activate LTE here */
    /* For now, just transmit the batch */
    
    transmit_batch_to_cloud();
}

/* Scheduled transmission work handler */
static void scheduled_transmission_work_handler(struct k_work *work)
{
    printk("⏰ Scheduled transmission interval reached\n");
    k_work_submit(&transmission_work);
    
    /* Reschedule next transmission */
    k_work_schedule(&scheduled_transmission_work, K_SECONDS(TRANSMISSION_INTERVAL_SEC));
}

/* Initialize transmission manager */
int transmission_manager_init(void)
{
    printk("📡 Initializing transmission manager...\n");
    printk("   Batch size: %d locations\n", TRANSMISSION_BATCH_SIZE_MAX);
    printk("   Interval: %d seconds (%d minutes)\n", 
           TRANSMISSION_INTERVAL_SEC, TRANSMISSION_INTERVAL_SEC / 60);
    
    k_work_init(&transmission_work, transmission_work_handler);
    k_work_init_delayable(&scheduled_transmission_work, 
                          scheduled_transmission_work_handler);
    
    /* Schedule first transmission */
    k_work_schedule(&scheduled_transmission_work, K_SECONDS(TRANSMISSION_INTERVAL_SEC));
    
    printk("✅ Transmission manager initialized\n\n");
    
    return 0;
}

/* Get transmission stats */
void transmission_manager_get_stats(uint8_t *batch_count, int64_t *last_tx_time)
{
    if (batch_count) {
        *batch_count = batch_buffer.count;
    }
    if (last_tx_time) {
        *last_tx_time = batch_buffer.last_transmission_time;
    }
}