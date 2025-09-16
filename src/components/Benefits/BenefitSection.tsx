"use client"
import Image from "next/image";
import clsx from "clsx";
import { motion, Variants } from "framer-motion"

import SectionTitle from "../SectionTitle";
import { IBenefit } from "@/types";

interface Props {
    benefit: IBenefit;
    imageAtRight?: boolean;
    index?: number;
}

const containerVariants: Variants = {
    offscreen: {
        opacity: 0,
        y: 100
    },
    onscreen: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            bounce: 0.2,
            duration: 0.9,
            delayChildren: 0.2,
            staggerChildren: 0.1,
        }
    }
};

export const childVariants = {
    offscreen: {
        opacity: 0,
        x: -50,
    },
    onscreen: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            bounce: 0.2,
            duration: 1,
        }
    },
};

const BenefitSection: React.FC<Props> = ({ benefit, imageAtRight, index }: Props) => {
    const { title, description, imageSrc } = benefit;

    return (
        <section className="benefit-section">
            <div className="max-w-[90%] mx-auto">
                <motion.div
                    className="flex flex-wrap flex-col items-center justify-center gap-2 lg:flex-row lg:gap-12 lg:flex-nowrap mb-24"
                variants={containerVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true }}
            >
                <div
                    className={clsx("flex flex-wrap items-center w-full lg:w-1/2", { "justify-start": imageAtRight, "lg:order-1 justify-end": !imageAtRight })}
                    
                >
                    <div className="w-full  text-center lg:text-left border border-black">
                        <motion.div
                            className="flex flex-col w-full"
                            variants={childVariants}
                        >
                            <SectionTitle>
                                <h3 className="w-full">
                                    {title}
                                </h3>
                            </SectionTitle>

                            <p className="mt-1.5 mx-auto lg:ml-0 leading-normal text-foreground-accent">
                                {description}
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className={clsx("mt-5 lg:mt-0 w-full lg:w-1/2", { "lg:order-2": imageAtRight })}>
                    <div className={clsx("w-full flex", { "justify-start": imageAtRight, "justify-end": !imageAtRight })}>
                        <div className="
    relative
    w-full h-[450px]              
    md:h-[550px]   
    lg:h-[600px] 
    overflow-hidden 
    rounded-xl
    border border-black
">
                            <Image 
                                src={imageSrc} 
                                alt={title}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 384px, (max-width: 1024px) 450px, 500px"
                                priority={index === 0}
                            />
                        </div>
                    </div>
                </div>
                </motion.div>
            </div>
        </section>
    );
}

export default BenefitSection