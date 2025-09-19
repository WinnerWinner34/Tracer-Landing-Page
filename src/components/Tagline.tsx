import React from 'react';
import { taglineDetails } from '@/data/tagline';

const Tagline: React.FC = () => {
    return (
        <section className="py-16 md:py-24">
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground leading-relaxed">
                    {taglineDetails.textParts.prefix}
                    <span className="text-red-600">{taglineDetails.textParts.highlight}</span>
                    {taglineDetails.textParts.suffix}
                </h2>
                <div className="w-full h-px bg-black mt-8"></div>
            </div>
        </section>
    );
};

export default Tagline;