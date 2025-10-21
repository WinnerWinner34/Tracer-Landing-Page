# FleetTracker - CMakeLists.txt for SDK v3.1.1
# Based on cellular/location sample

cmake_minimum_required(VERSION 3.20.0)

find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(FleetTracker)

# Include src directory for cert headers
target_include_directories(app PRIVATE src)

# Application source files
target_sources(app PRIVATE
    src/main.c
    src/transmission_manager.c
    src/device_identity.c
    src/cert_provisioning.c
    src/mqtt_manager.c
    src/aws_protocol.c
)