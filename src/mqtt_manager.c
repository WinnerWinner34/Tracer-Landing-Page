/*
 * MQTT Manager - AWS IoT Core Connection
 * Custom Authorizer Implementation for nRF9160
 * Fixed for offloaded sockets mode
 */

#include "mqtt_manager.h"
#include "cert_provisioning.h"
#include <zephyr/kernel.h>
#include <zephyr/net/mqtt.h>
#include <zephyr/net/socket.h>
#include <zephyr/random/random.h>
#include <modem/modem_key_mgmt.h>
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(mqtt_manager, LOG_LEVEL_INF);

/* AWS Configuration */
#define AWS_ENDPOINT "a3p4wum0t8th5r-ats.iot.us-east-2.amazonaws.com"
#define AWS_PORT 443  // Port 443 with ALPN for custom authorizer
#define AUTHORIZER_NAME "MainAuthorizer"

/* MQTT Buffers */
#define MQTT_BUFFER_SIZE 512
static uint8_t rx_buffer[MQTT_BUFFER_SIZE];
static uint8_t tx_buffer[MQTT_BUFFER_SIZE];
static uint8_t payload_buffer[512];

/* MQTT Client */
static struct mqtt_client client;
static struct sockaddr_storage broker;
static bool connected = false;
static char device_imei[32];

/* TLS Configuration - using security tags from cert_provisioning.h */
static sec_tag_t sec_tag_list[] = {
    AWS_SEC_TAG_ROOT_CA,
    AWS_SEC_TAG_DEVICE_CERT,
    AWS_SEC_TAG_DEVICE_KEY
};

/* MQTT Event Handler */
static void mqtt_evt_handler(struct mqtt_client *const c,
                             const struct mqtt_evt *evt)
{
    switch (evt->type) {
    case MQTT_EVT_CONNACK:
        if (evt->result == 0) {
            LOG_INF("✅ MQTT Connected to AWS IoT Core");
            connected = true;
        } else {
            LOG_ERR("❌ MQTT Connection failed: %d", evt->result);
            LOG_ERR("   Check: Certificates loaded? Lambda authorizer active?");
            connected = false;
        }
        break;

    case MQTT_EVT_DISCONNECT:
        LOG_WRN("📡 MQTT Disconnected: %d", evt->result);
        connected = false;
        break;

    case MQTT_EVT_PUBACK:
        LOG_DBG("✅ MQTT Publish ACK: msg_id=%d", evt->param.puback.message_id);
        break;

    case MQTT_EVT_PUBLISH:
        LOG_INF("📨 MQTT Echo received from AWS");
        LOG_INF("   Topic: %.*s",
                evt->param.publish.message.topic.topic.size,
                evt->param.publish.message.topic.topic.utf8);
        LOG_INF("   Payload: %d bytes", evt->param.publish.message.payload.len);
        LOG_HEXDUMP_INF(evt->param.publish.message.payload.data,
                        evt->param.publish.message.payload.len,
                        "Echo data:");
        break;

    default:
        LOG_DBG("MQTT Event: %d", evt->type);
        break;
    }
}

/* Poll MQTT socket - using offloaded socket API */
static void mqtt_poll_thread(void)
{
    struct zsock_pollfd fds;
    
    while (1) {
        if (connected) {
            fds.fd = client.transport.tcp.sock;
            fds.events = ZSOCK_POLLIN;
            
            int ret = zsock_poll(&fds, 1, 1000);
            
            if (ret > 0) {
                mqtt_input(&client);
            }
            
            mqtt_live(&client);
        } else {
            k_sleep(K_SECONDS(1));
        }
    }
}

K_THREAD_DEFINE(mqtt_poll_tid, 2048, mqtt_poll_thread, NULL, NULL, NULL, 7, 0, 0);

/* Initialize MQTT Manager */
int mqtt_manager_init(const char *imei)
{
    if (!imei) {
        return -EINVAL;
    }

    strncpy(device_imei, imei, sizeof(device_imei) - 1);
    LOG_INF("🔧 MQTT Manager init - IMEI: %s", device_imei);

    return 0;
}

/* Connect to AWS IoT Core */
int mqtt_manager_connect(void)
{
    int err;
    struct zsock_addrinfo *result;
    struct zsock_addrinfo hints = {
        .ai_family = AF_INET,
        .ai_socktype = SOCK_STREAM
    };

    if (connected) {
        LOG_INF("Already connected");
        return 0;
    }

    LOG_INF("☁️ Connecting to AWS IoT Core...");
    LOG_INF("   Endpoint: %s:%d", AWS_ENDPOINT, AWS_PORT);
    LOG_INF("   Authorizer: %s", AUTHORIZER_NAME);
    LOG_INF("   Client ID: %s", device_imei);

    /* Resolve endpoint - offloaded DNS */
    err = zsock_getaddrinfo(AWS_ENDPOINT, NULL, &hints, &result);
    if (err) {
        LOG_ERR("DNS lookup failed: %d", err);
        return err;
    }

    /* Setup broker address */
    struct sockaddr_in *broker_addr = (struct sockaddr_in *)&broker;
    broker_addr->sin_family = AF_INET;
    broker_addr->sin_port = htons(AWS_PORT);
    broker_addr->sin_addr.s_addr = ((struct sockaddr_in *)result->ai_addr)->sin_addr.s_addr;
    zsock_freeaddrinfo(result);

    /* Initialize MQTT client */
    mqtt_client_init(&client);

    /* Setup client ID (IMEI) */
    client.client_id.utf8 = (uint8_t *)device_imei;
    client.client_id.size = strlen(device_imei);

    /* Setup username for custom authorizer */
    static char username[128];
    snprintf(username, sizeof(username), "?x-amz-customauthorizer-name=%s", AUTHORIZER_NAME);
    static struct mqtt_utf8 user_name;
    user_name.utf8 = (uint8_t *)username;
    user_name.size = strlen(username);
    client.user_name = &user_name;

    /* Setup password (IMEI as token) */
    static struct mqtt_utf8 password;
    password.utf8 = (uint8_t *)device_imei;
    password.size = strlen(device_imei);
    client.password = &password;

    /* Setup broker */
    client.broker = &broker;
    client.evt_cb = mqtt_evt_handler;
    client.protocol_version = MQTT_VERSION_3_1_1;

    /* Setup TLS - modem handles encryption */
    client.transport.type = MQTT_TRANSPORT_SECURE;
    
    struct mqtt_sec_config *tls_config = &client.transport.tls.config;
    tls_config->peer_verify = TLS_PEER_VERIFY_REQUIRED;
    tls_config->cipher_count = 0;
    tls_config->sec_tag_count = ARRAY_SIZE(sec_tag_list);
    tls_config->sec_tag_list = sec_tag_list;
    tls_config->hostname = AWS_ENDPOINT;

    /* Setup buffers */
    client.rx_buf = rx_buffer;
    client.rx_buf_size = sizeof(rx_buffer);
    client.tx_buf = tx_buffer;
    client.tx_buf_size = sizeof(tx_buffer);

    /* Connect */
    LOG_INF("🔐 Starting TLS handshake...");
    err = mqtt_connect(&client);
    if (err) {
        LOG_ERR("❌ MQTT connect failed: %d", err);
        LOG_ERR("   Common causes:");
        LOG_ERR("   - Certificates not provisioned");
        LOG_ERR("   - Wrong security tags");
        LOG_ERR("   - Lambda authorizer rejecting IMEI");
        return err;
    }

    /* Wait for CONNACK */
    k_sleep(K_SECONDS(5));

    if (connected) {
        LOG_INF("✅ AWS IoT Core connected successfully");
    } else {
        LOG_WRN("⏰ Connection timeout - check RTT for errors");
    }

    return connected ? 0 : -ETIMEDOUT;
}

/* Publish data to AWS */
int mqtt_manager_publish(const char *topic, const uint8_t *data, size_t len)
{
    if (!connected) {
        LOG_WRN("Not connected - cannot publish");
        return -ENOTCONN;
    }

    if (len > sizeof(payload_buffer)) {
        LOG_ERR("Payload too large: %zu bytes", len);
        return -ENOMEM;
    }

    /* Copy to payload buffer */
    memcpy(payload_buffer, data, len);

    struct mqtt_publish_param param = {
        .message.topic.qos = MQTT_QOS_0_AT_MOST_ONCE,
        .message.topic.topic.utf8 = (uint8_t *)topic,
        .message.topic.topic.size = strlen(topic),
        .message.payload.data = payload_buffer,
        .message.payload.len = len,
        .message_id = sys_rand32_get() & 0xFFFF,
        .dup_flag = 0,
        .retain_flag = 0,
    };

    LOG_INF("📤 Publishing to: %s (%zu bytes)", topic, len);

    int err = mqtt_publish(&client, &param);
    if (err) {
        LOG_ERR("Publish failed: %d", err);
        return err;
    }

    LOG_INF("✅ Message sent");
    return 0;
}

/* Check connection status */
bool mqtt_manager_is_connected(void)
{
    return connected;
}

/* Disconnect */
void mqtt_manager_disconnect(void)
{
    if (connected) {
        mqtt_disconnect(&client, MQTT_DISCONNECT_NORMAL);
        connected = false;
        LOG_INF("Disconnected from AWS");
    }
}