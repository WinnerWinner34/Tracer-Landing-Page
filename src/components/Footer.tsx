import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

import { siteDetails } from '@/data/siteDetails';
import { footerDetails } from '@/data/footer';
import { getPlatformIconByName } from '@/utils';

const Footer: React.FC = () => {
    return (
        <footer className="bg-hero-background text-foreground py-10 rounded-t-3xl -mt-12">
            <div className="max-w-7xl w-full mx-auto px-6 pt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <Link href="/" className="flex items-center gap-2">
                        <Image 
                            src="/images/TracerPin-New.svg" 
                            alt="Tracer Fleet Tracking Icon" 
                            width={28} 
                            height={28} 
                            className="min-w-fit w-5 h-5 md:w-7 md:h-7" 
                        />
                        <h3 className="manrope text-xl font-semibold cursor-pointer">
                            {siteDetails.siteName}
                        </h3>
                    </Link>
                    <p className="mt-3.5 text-foreground-accent">
                        {footerDetails.subheading}
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="text-foreground-accent">
                        {footerDetails.quickLinks.map(link => (
                            <li key={link.text} className="mb-2">
                                <Link href={link.url} className="hover:text-foreground">{link.text}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Contact Us</h4>

                    
                    {footerDetails.socials && (
                        <div className="mt-5 space-y-3">
                            {Object.keys(footerDetails.socials).map(platformName => {
                                if (platformName && footerDetails.socials[platformName]) {
                                    return (
                                        <div key={platformName} className="flex items-center gap-3">
                                            <Link
                                                href={footerDetails.socials[platformName]}
                                                aria-label={platformName}
                                                className="flex items-center gap-3 text-foreground-accent hover:text-foreground"
                                            >
                                                {getPlatformIconByName(platformName)}
                                                <span>
                                                    {platformName === 'facebook' && '@Tracer-Fleet-Tracking-LLC'}
                                                    {platformName === 'linkedin' && '@tracer-fleet-tracking'}  
                                                    {platformName === 'instagram' && '@tracerfleettrackingllc'}
                                                </span>
                                            </Link>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-8 md:text-center text-foreground-accent px-6">
                <p>Copyright &copy; {new Date().getFullYear()} {siteDetails.siteName}. All rights reserved.</p>
                <p className="text-sm mt-2 text-gray-500">Made with &hearts; by <a href="https://nexilaunch.com" target="_blank">Nexi Launch</a></p>
                <p className="text-sm mt-2 text-gray-500">UI kit by <a href="https://ui8.net/youthmind/products/fintech-finance-mobile-app-ui-kit" target="_blank">Youthmind</a></p>
            </div>
        </footer>
    );
};

export default Footer;
