'use client';

import { communityOfferDetails } from "@/data/community";
import { FiUsers, FiCheckCircle, FiMessageSquare } from "react-icons/fi";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const CommunityContent: React.FC = () => {
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
            // Process the payment success
            setIsProcessing(true);
            setProcessingStatus('processing');
            
            // Call the process-payment function
            fetch('/.netlify/functions/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session_id: sessionId }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setProcessingStatus('success');
                    setStatusMessage('Your VIP upgrade has been confirmed!');
                } else {
                    setProcessingStatus('error');
                    setStatusMessage(data.message || 'There was an issue processing your upgrade.');
                }
            })
            .catch(error => {
                console.error('Payment processing error:', error);
                setProcessingStatus('error');
                setStatusMessage('Unable to process your upgrade. Please contact support.');
            })
            .finally(() => {
                // Hide the processing message after 3 seconds
                setTimeout(() => {
                    setIsProcessing(false);
                }, 3000);
            });
        }
    }, [searchParams]);
    
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 z-50">
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center">
                            {processingStatus === 'processing' && (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Processing your VIP upgrade...</h3>
                                    <p className="text-gray-600">Please wait while we update your account.</p>
                                </>
                            )}
                            {processingStatus === 'success' && (
                                <>
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                                        <FiCheckCircle className="text-green-600" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                                    <p className="text-gray-600">{statusMessage}</p>
                                </>
                            )}
                            {processingStatus === 'error' && (
                                <>
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                                        <span className="text-red-600 text-2xl">!</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Issue</h3>
                                    <p className="text-gray-600">{statusMessage}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Community Offer Section */}
            <section className="h-screen flex items-center">
                <div className="w-full h-full">
                    <div className="grid lg:grid-cols-2 h-full">
                        {/* Left Column - Image */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 mix-blend-overlay z-10"></div>
                            <Image 
                                src={communityOfferDetails.imageSrc}
                                alt="Exclusive Fleet Manager Community"
                                fill
                                className="object-contain"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                            {/* Community Badge */}
                            <div className="absolute top-8 left-8 z-20">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                    <FiUsers className="text-white" />
                                    EXCLUSIVE COMMUNITY
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column - Content */}
                        <div className="flex items-center justify-center p-8 lg:p-12">
                            <div className="max-w-lg text-gray-900">
                                {/* Header */}
                                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                                    {communityOfferDetails.heading}
                                </h1>
                                
                                <h2 className="text-xl lg:text-2xl text-gray-600 mb-8">
                                    {communityOfferDetails.subheading}
                                </h2>
                                
                                {/* Offer Details */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-200/50 shadow-lg">
                                    <h3 className="text-2xl font-bold mb-4 text-blue-700">
                                        {communityOfferDetails.offer.title}
                                    </h3>
                                    
                                    <p className="text-gray-700 mb-6">
                                        {communityOfferDetails.offer.description}
                                    </p>
                                    
                                    {/* Features List */}
                                    <ul className="space-y-3 mb-6">
                                        {communityOfferDetails.offer.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-3 text-gray-700">
                                                <FiCheckCircle className="text-blue-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Community Access */}
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center gap-2 text-blue-600 text-lg font-semibold mb-2">
                                        <FiMessageSquare />
                                        Join Fleet Managers Worldwide
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        Connect • Learn • Grow Together
                                    </div>
                                </div>
                                
                                {/* CTA Button */}
                                <a 
                                    href={communityOfferDetails.offer.communityUrl}
                                    className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-8 rounded-full text-center text-lg hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-xl"
                                >
                                    {communityOfferDetails.offer.buttonText}
                                </a>
                                
                                {/* Community Note */}
                                <p className="text-center text-gray-500 text-sm mt-4">
                                    Free to join • Fleet managers only • Active community
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const CommunityPage: React.FC = () => {
    return (
        <Suspense 
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            }
        >
            <CommunityContent />
        </Suspense>
    );
};

export default CommunityPage;