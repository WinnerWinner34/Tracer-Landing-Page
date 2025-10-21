/*
 * Device Identity API
 */

#ifndef DEVICE_IDENTITY_H
#define DEVICE_IDENTITY_H

/* Initialize device identity (extracts IMEI) */
int device_identity_init(void);

/* Get device IMEI */
const char* device_identity_get_imei(void);

/* Get device ID (FLT-DEV-xxxxxxxx) */
const char* device_identity_get_id(void);

#endif /* DEVICE_IDENTITY_H */
