export const contactFormDetails = {
    // Form labels and placeholders
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your business email",
    submitButtonText: "Get Started",
    processingButtonText: "Processing...",
    
    // Validation messages
    emailRequiredMessage: "Email is required",
    emailInvalidMessage: "Please enter a valid email address",
    
    // Success state
    successTitle: "You're all set!",
    submitAnotherEmailText: "Submit another email",
    
    // Error messages
    defaultErrorMessage: "Something went wrong. Please try again.",
    connectionErrorMessage: "Unable to process. Please check your connection and try again.",
    
    // API configuration
    apiEndpoint: "/.netlify/functions/send-email",
    defaultRedirectUrl: "/vip",
    genericName: "Fleet Manager",
    defaultMessage: "New lead from email capture form. Email: {email}. Please follow up regarding fleet tracking solutions.",
    
    // Success message (this would come from backend, but having a fallback)
    defaultSuccessMessage: "Thank you for your interest! We'll be in touch soon."
}