import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "Rest easy with Tracer knowing how your vehicles are being driven, and without breaking the bank.",
    quickLinks: [
        {
            text: "Features",
            url: "#features"
        },
        {
            text: "Pricing",
            url: "#pricing"
        },
        {
            text: "Testimonials",
            url: "#testimonials"
        },
        {
            text: "VIP Access",
            url: "/vip"
        }
    ],
    email: 'address@yoursite.com',
    telephone: '+1 (123) 456-7890',
    socials: {
        // github: 'https://github.com',
        // x: 'https://twitter.com/x',
        //twitter: 'https://twitter.com/Twitter',
        facebook: 'https://www.facebook.com/people/Tracer-Fleet-Tracking-LLC/61578293283854/#',
        // youtube: 'https://youtube.com',
        linkedin: 'https://www.linkedin.com/company/tracer-fleet-tracking/?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExTnZndXlRNExoYlVqb3BGdQEe-zm05NHxQbsoU2OxH0ZJxiRzZk_WhwcHaC2y81Ap_mV_x5ku_EqHQCJuAf0_aem_5JbX21ZwL88R7UAPq5b0Sw',
        // threads: 'https://www.threads.net',
        instagram: 'https://www.instagram.com/tracerfleettrackingllc?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExTnZndXlRNExoYlVqb3BGdQEeO4LKiqlASdzwds5d5_o2m-Kb-JYsgAOxlhf13Tcfi3DBOsp3X0lLmClEXM8_aem_DWq3HSeYfMrfY5R71jjcnQ',
    }
}