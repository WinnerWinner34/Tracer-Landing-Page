export interface IMenuItem {
    text: string;
    url: string;
}

export interface IBenefit {
    title: string;
    description: string;
    imageSrc: string;
}

export interface IPricing {
    name: string;
    price: number | string;
    features: string[];
}

export interface IFAQ {
    question: string;
    answer: string;
}

export interface ISocials {
    facebook?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    threads?: string;
    twitter?: string;
    youtube?: string;
    x?: string;
    [key: string]: string | undefined;
}

export interface IVIPOffer {
    heading: string;
    subheading: string;
    offer: {
        title: string;
        description: string;
        features: string[];
        urgency: string;
        reservationPrice: string;
        buttonText: string;
        paymentUrl: string;
    };
    imageSrc: string;
}

export interface ICommunityOffer {
    heading: string;
    subheading: string;
    offer: {
        title: string;
        description: string;
        features: string[];
        buttonText: string;
        communityUrl: string;
    };
    imageSrc: string;
}