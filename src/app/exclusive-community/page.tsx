import { communityOfferDetails } from "@/data/community";
import { FiUsers, FiCheckCircle, FiMessageSquare } from "react-icons/fi";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Exclusive Fleet Manager Community - Tracer Fleet Tracking",
    description: "Join our exclusive community of fleet managers. Influence product development, get early updates, and network with industry experts.",
    robots: "noindex, nofollow" // Keep private until ready
};

const CommunityPage: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 z-50">
            {/* Community Offer Section */}
            <section className="h-screen flex items-center">
                <div className="w-full h-full">
                    <div className="grid lg:grid-cols-2 h-full">
                        {/* Left Column - Image */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 mix-blend-overlay z-10"></div>
                            <img 
                                src={communityOfferDetails.imageSrc}
                                alt="Exclusive Fleet Manager Community"
                                className="w-full h-full object-contain"
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

export default CommunityPage;