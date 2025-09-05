import { FiBarChart2, FiBriefcase, FiDollarSign, FiLock, FiPieChart, FiShield, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Know where your vehicles are, every second of every day",
        description: "Tracer's location tracking helps you identify route inefficiencies, ensure drivers stay on authorized job sites, detect unauthorized use, and prevent theft - giving you cost savings and peace of mind at the same time.",
        bullets: [
            {
                title: "Intelligent Categorization",
                description: "Automatically sorts your transactions for crystal-clear insights.",
                icon: <FiBarChart2 size={26} />
            },
            {
                title: "Customizable Goals",
                description: "Set and track financial objectives that matter to you.",
                icon: <FiTarget size={26} />
            },
            {
                title: "Predictive Analysis",
                description: "Get ahead of your finances with spending forecasts and alerts.",
                icon: <FiTrendingUp size={26} />
            },
            
        ],
        imageSrc: "/images/mockup-1.webp"
    },
    {
        title: "Stop dangerous driving before it costs you money",
        description: "Every time a driver speeds or slams the brakes, it's costing you money in fuel and increasing your accident risk - Tracer's driving reports help you spot and stop these expensive habits before they become bigger problems.",
        bullets: [
            {
                title: "Micro-Investing",
                description: "Begin with as little as $1 and watch your money grow.",
                icon: <FiDollarSign size={26} />
            },
            {
                title: "Expert Portfolios",
                description: "Choose from investment strategies tailored to your risk tolerance.",
                icon: <FiBriefcase size={26} />
            },
            {
                title: "Real-Time Performance",
                description: "Track your investments with easy-to-understand metrics and visuals.",
                icon: <FiPieChart size={26} />
            }
        ],
        imageSrc: "/images/mockup-2.webp"
    },
    {
        title: "Get notified the instant something happens",
        description: "When every minute counts, instant notifications can mean the difference between a minor incident and a major crisis. Tracer can alert you immediately when vehicles crash, leave authorized zones, or exhibit dangerous behaviors - so you can respond before small problems become big ones.",
        bullets: [
            {
                title: "Military-Grade Encryption",
                description: "Your information is safeguarded with the highest level of encryption.",
                icon: <FiLock size={26} />
            },
            {
                title: "Biometric Authentication",
                description: "Access your account securely with fingerprint or facial recognition.",
                icon: <FiUser size={26} />
            },
            {
                title: "Real-Time Fraud Detection",
                description: "Our system constantly monitors for suspicious activity to keep your money safe.",
                icon: <FiShield size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
    {
        title: "Forget spreadsheets - your reports write themselves",
        description: "Forget about manually tracking driver behavior or crunching numbers in spreadsheets. Tracer does the heavy lifting and delivers clear reports showing your most efficient drivers, your biggest cost drains, and everything in between.",
        bullets: [
            {
                title: "Military-Grade Encryption",
                description: "Your information is safeguarded with the highest level of encryption.",
                icon: <FiLock size={26} />
            },
            {
                title: "Biometric Authentication",
                description: "Access your account securely with fingerprint or facial recognition.",
                icon: <FiUser size={26} />
            },
            {
                title: "Real-Time Fraud Detection",
                description: "Our system constantly monitors for suspicious activity to keep your money safe.",
                icon: <FiShield size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
]