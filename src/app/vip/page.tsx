'use client';

import { vipOfferDetails } from "@/data/vip";
import { FiStar, FiCheckCircle, FiClock } from "react-icons/fi";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const VIPContent: React.FC = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50">
            {/* VIP Offer Section */}
            <section className="h-screen flex items-center">
                <div className="w-full h-full">
                    <div className="grid lg:grid-cols-2 h-full">
                        {/* Left Column - Image */}
                        <div className="relative">
                            <Image 
                                src={vipOfferDetails.imageSrc}
                                alt="VIP Tracer Tag Offer"
                                fill
                                className="object-contain"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                            {/* VIP Badge */}
                            <div className="absolute top-8 left-8 z-20">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                    <FiStar className="text-black" />
                                    VIP EXCLUSIVE
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column - Content */}
                        <div className="flex items-center justify-center p-8 lg:p-12">
                            <div className="max-w-2xl text-white">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                        Reserve your Tracer Tag!
                                    </h1>
                                    <h2 className="text-2xl lg:text-3xl font-medium text-gray-300">
                                        Join VIP for
                                    </h2>
                                </div>
                                
                                {/* Price Section */}
                                <div className="text-center mb-8">
                                    <div className="text-6xl font-bold text-yellow-400 mb-6">
                                        $1
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-medium text-gray-300">
                                        and get...
                                    </h2>
                                </div>
                                
                                {/* Features List */}
                                <ul className="space-y-4 mb-8 text-xl">
                                    <li className="flex items-center justify-center gap-3 text-gray-300">
                                        <FiCheckCircle className="text-green-400 flex-shrink-0" />
                                        Guaranteed Lowest Price
                                    </li>
                                    <li className="flex items-center justify-center gap-3 text-gray-300">
                                        <FiCheckCircle className="text-green-400 flex-shrink-0" />
                                        Priority Shipping
                                    </li>
                                    <li className="flex items-center justify-center gap-3 text-gray-300">
                                        <FiCheckCircle className="text-green-400 flex-shrink-0" />
                                        Access to Tracer's exclusive community
                                    </li>
                                </ul>
                                
                                {/* Urgency Message */}
                                <div className="flex items-center justify-center gap-2 text-orange-400 text-sm font-medium mb-3">
                                    <FiClock />
                                    Limited time offer - ends before Kickstarter launch
                                </div>

                                {/* CTA Button */}
                                <a 
                                    href={vipOfferDetails.offer.paymentUrl(email || undefined)}
                                    className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-8 rounded-full text-center text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-xl mb-4"
                                >
                                    Reserve My Tracer Tag
                                </a>
                                
                                {/* Security Note */}
                                <p className="text-center text-gray-500 text-sm">
                                    Payment Processed with Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const VIPPage: React.FC = () => {
    return (
        <Suspense 
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center text-white">
                    Loading...
                </div>
            }
        >
            <VIPContent />
        </Suspense>
    );
};

export default VIPPage;