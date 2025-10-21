/*
 * Certificate Provisioning for AWS IoT
 */

#ifndef CERT_PROVISIONING_H
#define CERT_PROVISIONING_H

#include <stdbool.h>

/* Security tag definitions for AWS IoT certificates */
#define AWS_SEC_TAG_ROOT_CA    16842753
#define AWS_SEC_TAG_DEVICE_CERT 16842754
#define AWS_SEC_TAG_DEVICE_KEY  16842755

/**
 * Check if AWS certificates are already provisioned in modem storage
 * Returns: true if all certificates exist, false otherwise
 */
bool cert_provisioning_check(void);

/**
 * Provision AWS certificates to modem secure storage
 * Only writes if certificates are missing (check-first, write-once)
 * Returns: 0 on success, negative errno on failure
 */
int cert_provisioning_init(void);

#endif /* CERT_PROVISIONING_H */
