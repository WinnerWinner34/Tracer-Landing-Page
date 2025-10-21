/*
 * AWS Protocol - Binary Message Encoding
 * Implements binary GPS format per documentation.md
 * SDK 3.1.1 - No checksum validation (zeros sent)
 */

#include "aws_protocol.h"
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(aws_protocol, LOG_LEVEL_INF);

/* Encode single full GPS position */
static void encode_full_gps(const struct location_event_data *loc,
                            struct full_gps *out)
{
    /* Convert double to int32 (degrees * 10^7) */
    out->latitude = (int32_t)(loc->location.latitude * 10000000.0);
    out->longitude = (int32_t)(loc->location.longitude * 10000000.0);

    // TODO: These fields not available in SDK 3.1.1 location_data
    /* Altitude in meters */
    // out->altitude = (int16_t)loc->location.altitude;
    out->altitude = 0;

    /* Speed: km/h * 10 */
    // out->speed = (uint16_t)(loc->location.speed * 3.6 * 10.0);  /* m/s to km/h */
    out->speed = 0;

    /* Heading: degrees * 10 */
    // out->heading = (uint16_t)(loc->location.heading * 10.0);
    out->heading = 0;
    
    /* Accuracy in meters (capped at 255) */
    out->accuracy = (uint8_t)(loc->location.accuracy > 255 ? 255 : loc->location.accuracy);
    
    /* Satellites and HDOP - not available in location API, use defaults */
    out->sats = 0;      /* TODO: Get from GNSS subsystem if needed */
    out->hdop = 0;      /* TODO: Get from GNSS subsystem if needed */
}

/* Encode compressed GPS position */
static void encode_compressed_gps(const struct location_event_data *loc,
                                  uint16_t time_offset,
                                  struct compressed_gps *out)
{
    /* Convert double to int32 (degrees * 10^7) */
    out->latitude = (int32_t)(loc->location.latitude * 10000000.0);
    out->longitude = (int32_t)(loc->location.longitude * 10000000.0);

    // TODO: These fields not available in SDK 3.1.1 location_data
    /* Speed: km/h * 10 */
    // out->speed = (uint16_t)(loc->location.speed * 3.6 * 10.0);
    out->speed = 0;
    
    /* Time offset from first fix */
    out->time_offset = time_offset;
}

/* Encode GPS batch into binary format */
int aws_encode_gps_batch(const struct location_event_data *locations,
                         uint8_t count,
                         uint8_t *output_buffer,
                         size_t *output_len)
{
    if (!locations || !output_buffer || !output_len || count == 0 || count > 20) {
        LOG_ERR("Invalid parameters");
        return -EINVAL;
    }

    LOG_INF("📦 Encoding GPS batch: %d locations", count);

    uint8_t *ptr = output_buffer;
    
    /* Reserve space for header (will fill at end) */
    struct tel_header *header = (struct tel_header *)ptr;
    ptr += sizeof(struct tel_header);
    
    /* Message body starts here */
    uint8_t *body_start = ptr;
    
    /* Tel Enumerator: 0x01 for GPS batch */
    *ptr++ = TEL_ENUMERATOR_GPS_BATCH;
    
    /* Timestamp: 64-bit UNIX timestamp */
    uint64_t timestamp = (uint64_t)(k_uptime_get() / 1000);  /* Convert ms to seconds */
    memcpy(ptr, &timestamp, sizeof(timestamp));
    ptr += sizeof(timestamp);
    
    /* First GPS position (Full GPS - 20 bytes) */
    struct full_gps first_gps;
    encode_full_gps(&locations[0], &first_gps);
    memcpy(ptr, &first_gps, sizeof(first_gps));
    ptr += sizeof(first_gps);
    
    /* Count of compressed GPS (0 if only 1 position) */
    uint8_t compressed_count = count - 1;
    *ptr++ = compressed_count;
    
    /* Compressed GPS array (if more than 1 position) */
    for (uint8_t i = 1; i < count; i++) {
        struct compressed_gps comp;
        
        /* Time offset: assume 1 second between fixes (1Hz GPS) */
        uint16_t time_offset = i;
        
        encode_compressed_gps(&locations[i], time_offset, &comp);
        memcpy(ptr, &comp, sizeof(comp));
        ptr += sizeof(comp);
    }
    
    /* Calculate message body size */
    size_t body_size = ptr - body_start;
    
    /* Fill header */
    header->size = (uint16_t)body_size;  /* Little-endian */
    /* No checksum - AWS backend doesn't validate */
    memset(header->checksum, 0, 28);
    
    /* Total message size */
    *output_len = sizeof(struct tel_header) + body_size;
    
    LOG_INF("✅ Encoded: %zu bytes (header: %zu, body: %zu)",
            *output_len, sizeof(struct tel_header), body_size);
    LOG_INF("   Full GPS: 1, Compressed GPS: %d", compressed_count);
    
    return 0;
}