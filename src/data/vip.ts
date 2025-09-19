export const vipOfferDetails = {
    heading: "Reserve your Tracer Tag!",
    subheading: "Join VIP for",
    priceCallout: "and get...",
    offer: {
        title: "Reserve Your Tracer Tag for Just $1",
        description: "Lock in the deepest discount available - better than our upcoming Kickstarter pricing. Plus get an exclusive Tracer window cling.",
        features: [
            "Guaranteed Lowest Price",
            "Priority Shipping",
            "Access to Tracer's exclusive community"
        ],
        urgency: "Limited time offer - ends before Kickstarter launch",
        reservationPrice: "$1",
        buttonText: "Reserve My Tracer Tag",
        paymentNote: "Payment Processed with Stripe",
        paymentUrl: (email?: string) => {
            const baseUrl = "https://buy.stripe.com/eVqcMY09Pa4ocMy1ywaIM00";
            return email ? `${baseUrl}?locked_prefilled_email=${encodeURIComponent(email)}` : baseUrl;
        }
    },
    badgeText: "VIP EXCLUSIVE",
    imageSrc: "/images/Tracer-Centered-Gradient-whit-black.jpeg"
};