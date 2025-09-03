import React from 'react';
import Image from 'next/image';

import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';

import { heroDetails } from '@/data/hero';

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="relative bg-black min-h-screen flex items-center justify-center px-5"
        >
            {/* Remove the old background elements and replace with simple dark background */}
            
            <div className="max-w-7xl mx-auto w-full">
                {/* Grid Layout - responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Side - Text Content */}
                    <div className="space-y-6 text-center lg:text-left">
                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-lg md:max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                            {heroDetails.heading}
                        </h1>
                        
                        {/* Subheading with enhanced styling */}
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            {heroDetails.subheading}
                        </p>

                       
                    </div>
                    
                    {/* Right Side - App Mockup with Dashboard-style Frame */}
                    <div className="relative flex justify-center lg:justify-end">
                        {/* Blue border frame around the mockup */}
                        <div className="border-2 border-blue-500 rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-black relative">
                            {/* App Mockup - Responsive sizing */}
                            <Image
                                src={heroDetails.centerImageSrc}
                                width={384}
                                height={340}
                                quality={100}
                                sizes="(max-width: 768px) 80vw, (max-width: 1024px) 350px, 400px"
                                priority={true}
                                unoptimized={true}
                                alt="app mockup"
                                className="relative z-10 rounded-xl w-full h-auto max-w-[280px] sm:max-w-[420px] md:max-w-[650px] lg:max-w-[600px]"
                            />
                            
                            {/* Optional: Add some dashboard-style elements around the mockup */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full"></div>
                            
                            {/* Background gradient overlay */}
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;