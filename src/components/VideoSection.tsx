"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from './SectionTitle';

const VideoSection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        const containerElement = containerRef.current;

        if (!containerElement) return;

        // Create intersection observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    console.log('Intersection Observer:', {
                        isIntersecting: entry.isIntersecting,
                        ratio: entry.intersectionRatio,
                        isVideoLoaded
                    });
                    
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                        setIsInView(true);
                        // Play video when in view
                        if (videoElement && isVideoLoaded) {
                            console.log('Attempting to play video...');
                            videoElement.play().catch((error) => {
                                console.error('Auto-play was prevented:', error);
                                setVideoError('Click video to play');
                            });
                        }
                    } else {
                        setIsInView(false);
                        // Pause video when out of view
                        if (videoElement) {
                            console.log('Pausing video (out of view)');
                            videoElement.pause();
                        }
                    }
                });
            },
            {
                threshold: [0, 0.3, 0.5, 1.0], // More granular thresholds
                rootMargin: '0px', // Simplified margin
            }
        );

        // Start observing
        observer.observe(containerElement);

        // Cleanup
        return () => {
            if (containerElement) {
                observer.unobserve(containerElement);
            }
            observer.disconnect();
        };
    }, [isVideoLoaded]);

    // Handle video loaded event
    const handleVideoLoad = () => {
        console.log('Video loaded successfully');
        setIsVideoLoaded(true);
        setVideoError(null);
        // Try to play if already in view
        if (isInView && videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.error('Auto-play was prevented:', error);
                setVideoError('Auto-play blocked. Click to play.');
            });
        }
    };

    // Handle video error
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = e.currentTarget;
        console.error('Video error:', video.error);
        setVideoError('Failed to load video. Please check your connection.');
        setIsVideoLoaded(false);
    };

    // Handle video load start
    const handleLoadStart = () => {
        console.log('Video loading started...');
    };

    // Handle video can play
    const handleCanPlay = () => {
        console.log('Video can play - ready for playback');
        setIsVideoLoaded(true);
        setVideoError(null);
        
        // Try autoplay once video can play (for testing)
        if (videoRef.current && !videoRef.current.paused) {
            console.log('Video is already playing');
        } else if (videoRef.current) {
            console.log('Attempting autoplay on canPlay event');
            videoRef.current.play().catch(err => {
                console.warn('Autoplay failed, user interaction required:', err);
                setVideoError('Click to play video');
            });
        }
    };

    // Manual play on click (fallback)
    const handleVideoClick = () => {
        if (videoRef.current && isVideoLoaded) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(err => {
                    console.error('Manual play failed:', err);
                });
            } else {
                videoRef.current.pause();
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
                            5-Second Install
                        </h3>
                    </SectionTitle>
                    <p className="mt-4 text-lg text-foreground-accent max-w-2xl mx-auto">
                        Watch how quick and easy it is to get started with Tracer Fleet Tracking
                    </p>
                </motion.div>

                {/* Video Container */}
                <motion.div 
                    variants={itemVariants}
                    className="w-full max-w-4xl mx-auto"
                >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                        {/* Loading placeholder */}
                        {!isVideoLoaded && !videoError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                                <div className="text-gray-500">
                                    <svg className="animate-spin h-12 w-12 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p>Loading video...</p>
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
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Video Element */}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain cursor-pointer"
                            muted={true}
                            loop={true}
                            playsInline={true}
                            preload="metadata"
                            autoPlay={false}
                            controls={false}
                            onLoadedData={handleVideoLoad}
                            onLoadStart={handleLoadStart}
                            onCanPlay={handleCanPlay}
                            onError={handleVideoError}
                            onClick={handleVideoClick}
                        >
                            <source 
                                src="/videos-gifs/Install-shortened.mp4" 
                                type="video/mp4" 
                            />
                            Your browser does not support the video tag.
                        </video>

                        {/* Play overlay indicator - shows when click is needed */}
                        {isVideoLoaded && videoError === 'Click to play video' && (
                            <div 
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer"
                                onClick={handleVideoClick}
                            >
                                <div className="bg-white bg-opacity-95 rounded-full p-6 shadow-lg">
                                    <svg className="w-16 h-16 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                                <p className="absolute bottom-4 text-white text-sm">Click to play</p>
                            </div>
                        )}
                    </div>

                    {/* Video caption */}
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Installing Tracer takes less than 5 seconds - just plug and go!
                    </p>
                </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default VideoSection;