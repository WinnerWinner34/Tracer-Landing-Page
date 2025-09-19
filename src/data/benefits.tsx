import { IBenefit } from "@/types"
import React from "react"

export const benefits: IBenefit[] = [
    {
        title: "Vehicle Locations",
        subheading: <>Know where your vehicles are, <span className="text-red-600">every second of every day</span></>,
        description: <>Tracer's location tracking helps you identify route inefficiencies, ensure drivers stay on authorized job sites, detect unauthorized use, and prevent theft - giving you cost savings and peace of mind <span className="text-red-600">every second of every day</span>.</>,
        imageSrc: "/images/Ubiviewer-Dashboard-Columbus-with-Pins.webp"
    },
    {
        title: "Prevent Accidents",
        subheading: <>Stop dangerous driving <span className="text-red-600">before it costs you money</span></>,
        description: <>Every time a driver speeds or slams the brakes, it's costing you money in fuel and increasing your accident risk - Tracer's driving reports help you spot and stop these expensive habits <span className="text-red-600">before it costs you money</span>.</>,
        imageSrc: "/images/RiskMitigationReport-withData.webp"
    },
    {
        title: "Instant Notifications",
        subheading: <>Get notified <span className="text-red-600">the instant something happens</span></>,
        description: <>When every minute counts, instant notifications can mean the difference between a minor incident and a major crisis. Tracer can alert you immediately <span className="text-red-600">the instant something happens</span> when vehicles crash, leave authorized zones, or exhibit dangerous behaviors - so you can respond before small problems become big ones.</>,
        imageSrc: "/images/AlertLikelyVehicleCrash.png"
    },
    {
        title: "Geofences",
        subheading: <>Know when a vehicle <span className="text-red-600">enters or leaves a zone</span></>,
        description: <>Geofencing lets you draw virtual boundaries on the map and receive instant alerts the moment a vehicle <span className="text-red-600">enters or leaves a zone</span>. Whether it's leaving the depot at dawn, arriving at the first job site, or straying from its assigned territory, you'll know the moment it happens—so you can relax knowing your fleet is exactly where it should be.</>,
        imageSrc: "/images/Geofence.png"
    },
]