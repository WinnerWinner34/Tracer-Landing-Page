export const vipOfferDetails = {
    heading: "Exclusive VIP Pre-Launch Offer",
    subheading: "Get Your Tracer Tag Before Anyone Else",
    offer: {
        title: "Reserve Your Tracer Tag for Just $1",
        description: "Lock in the deepest discount available - better than our upcoming Kickstarter pricing. Plus get an exclusive Tracer window cling.",
        features: [
            "Deeper discount than Kickstarter pricing",
            "Exclusive Tracer window cling included",
            "Priority shipping when available",
            "VIP member status"
        ],
        urgency: "Limited time offer - ends before Kickstarter launch",
        reservationPrice: "$1",
        buttonText: "Reserve My Tracer Tag",
        paymentUrl: (email?: string) => {
            const baseUrl = "https://buy.stripe.com/test_6oU00j1vM0vAfTb2330co00";
            return email ? `${baseUrl}?locked_prefilled_email=${encodeURIComponent(email)}` : baseUrl;
        }
    },
    imageSrc: "/images/Tracer-Centered-Gradient-whit-black.jpeg" // Placeholder image path
};