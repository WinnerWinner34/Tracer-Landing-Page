/*
 * Transmission Manager - Header File
 * Handles intelligent data batching and transmission scheduling
 */

#ifndef TRANSMISSION_MANAGER_H
#define TRANSMISSION_MANAGER_H

#include <modem/location.h>
#include <stdint.h>

/**
 * Initialize the transmission manager
 * 
 * @return 0 on success, negative error code on failure
 */
int transmission_manager_init(void);

/**
 * Add a location to the transmission batch buffer
 * 
 * @param location Pointer to location event data to add
 * @return 0 on success, -ENOMEM if buffer is full
 */
int transmission_manager_add_location(const struct location_event_data *location);

/**
 * Get current transmission statistics
 * 
 * @param batch_count Pointer to store current batch count (can be NULL)
 * @param last_tx_time Pointer to store last transmission time (can be NULL)
 */
void transmission_manager_get_stats(uint8_t *batch_count, int64_t *last_tx_time);

#endif /* TRANSMISSION_MANAGER_H */