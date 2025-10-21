/*
 * AWS Protocol - Binary Message Encoding
 * Implements custom binary format from documentation.md
 */

#ifndef AWS_PROTOCOL_H
#define AWS_PROTOCOL_H

#include <stdint.h>
#include <modem/location.h>

/* Binary Message Structures (Little-Endian) */

/* Tel Header: size + unused checksum (zeros) */
struct tel_header {
    uint16_t size;           /* Message size excluding header */
    uint8_t checksum[28];    /* Unused - filled with zeros */
} __attribute__((packed));

/* Full GPS (20 bytes) */
struct full_gps {
    int32_t latitude;        /* Degrees * 10^7 */
    int32_t longitude;       /* Degrees * 10^7 */
    int16_t altitude;        /* Meters */
    uint16_t speed;          /* km/h * 10 */
    uint16_t heading;        /* Degrees * 10 */
    uint8_t accuracy;        /* Meters */
    uint8_t sats;            /* Satellite count */
    uint16_t hdop;           /* HDOP * 10 */
} __attribute__((packed));

/* Compressed GPS (12 bytes) */
struct compressed_gps {
    int32_t latitude;        /* Degrees * 10^7 */
    int32_t longitude;       /* Degrees * 10^7 */
    uint16_t speed;          /* km/h * 10 */
    uint16_t time_offset;    /* Seconds from first timestamp */
} __attribute__((packed));

/* Message Type 0x01: Full GPS + Compressed GPS Series */
#define TEL_ENUMERATOR_GPS_BATCH 0x01

/**
 * Encode GPS batch into binary format
 * 
 * @param locations Array of GPS fixes
 * @param count Number of fixes (1-20)
 * @param output_buffer Output buffer for binary message
 * @param output_len Returns message length
 * @return 0 on success, negative on error
 */
int aws_encode_gps_batch(const struct location_event_data *locations,
                         uint8_t count,
                         uint8_t *output_buffer,
                         size_t *output_len);

#endif /* AWS_PROTOCOL_H */