"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import { videoDetails } from '@/data/video';

const VideoSection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        const containerElement = containerRef.current;

        if (!containerElement || !videoElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                    // Video is in view - try to play
                    if (isVideoLoaded) {
                        videoElement.play().catch(() => {
                            // Autoplay blocked - show click to play
                            setNeedsUserInteraction(true);
                        });
                    }
                } else {
                    // Video is out of view - pause
                    if (!videoElement.paused) {
                        videoElement.pause();
                    }
                    setNeedsUserInteraction(false);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(containerElement);

        return () => {
            observer.disconnect();
        };
    }, [isVideoLoaded]); // Only recreate when video load state changes

    // Single video load handler - when video is ready to play
    const handleVideoLoaded = () => {
        setIsVideoLoaded(true);
        setVideoError(null);
    };

    // Error handler
    const handleVideoError = () => {
        setVideoError(videoDetails.errorMessage);
        setIsVideoLoaded(false);
    };

    // Manual play on click
    const handleVideoClick = () => {
        const video = videoRef.current;
        if (video && isVideoLoaded) {
            if (video.paused) {
                video.play().catch(() => {
                    setNeedsUserInteraction(true);
                });
                setNeedsUserInteraction(false);
            } else {
                video.pause();
            }
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delayChildren: 0.2,
                staggerChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="video-section mb-24 mt-24" ref={containerRef}>
            <div className="max-w-[90%] mx-auto">
                <motion.div
                    className="flex flex-col items-center justify-center gap-8 px-5"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Section Title */}
                    <motion.div variants={itemVariants} className="text-center">
                        <SectionTitle>
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                                {videoDetails.heading}
                            </h3>
                        </SectionTitle>
                        <p className="mt-4 text-lg text-foreground-accent max-w-2xl mx-auto">
                            {videoDetails.description}
                        </p>
                    </motion.div>

                    {/* Video Container */}
                    <motion.div 
                        variants={itemVariants}
                        className="w-full max-w-4xl mx-auto"
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                            {/* Loading placeholder - only show when not loaded and no error */}
                            {!isVideoLoaded && !videoError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                                    <div className="text-gray-500">
                                        <svg className="animate-spin h-12 w-12 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p>{videoDetails.loadingMessage}</p>
                                    </div>
                                </div>
                            )}

                            {/* Error state */}
                            {videoError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                                    <div className="text-center p-4">
                                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-700 font-medium">{videoError}</p>
                                    </div>
                                </div>
                            )}

                            {/* Click to play overlay */}
                            {isVideoLoaded && needsUserInteraction && (
                                <div 
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-20"
                                    onClick={handleVideoClick}
                                >
                                    <div className="bg-white bg-opacity-95 rounded-full p-6 shadow-lg hover:bg-opacity-100 transition-all">
                                        <svg className="w-16 h-16 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                    <p className="absolute bottom-4 text-white text-lg font-medium">{videoDetails.clickToPlayMessage}</p>
                                </div>
                            )}

                            {/* Video Element */}
                            <video
                                ref={videoRef}
                                className="w-full h-full object-contain cursor-pointer"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                onCanPlay={handleVideoLoaded}
                                onError={handleVideoError}
                                onClick={handleVideoClick}
                            >
                                <source 
                                    src={videoDetails.videoSrc} 
                                    type="video/mp4" 
                                />
                                {videoDetails.browserFallbackMessage}
                            </video>
                        </div>

                        {/* Video caption */}
                        <p className="text-center text-sm text-gray-500 mt-4">
                            {videoDetails.caption}
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default VideoSection;