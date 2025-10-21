/*
 * MQTT Manager - AWS IoT Core Connection
 * Handles MQTT connection with custom authorizer
 */

#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

/* Initialize MQTT manager with device IMEI */
int mqtt_manager_init(const char *imei);

/* Connect to AWS IoT Core */
int mqtt_manager_connect(void);

/* Publish binary data to topic */
int mqtt_manager_publish(const char *topic, const uint8_t *data, size_t len);

/* Check if connected */
bool mqtt_manager_is_connected(void);

/* Disconnect from AWS */
void mqtt_manager_disconnect(void);

#endif /* MQTT_MANAGER_H */