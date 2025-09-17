"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { FiMail, FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { contactFormDetails } from '@/data/contactForm';

// Types
interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

interface ContactFormProps {
  variant?: 'light' | 'dark';
  className?: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  redirectUrl?: string;
}

// Initial form state
const initialFormData: FormData = {
  email: '',
};

const ContactForm: React.FC<ContactFormProps> = ({ variant = 'light', className = '' }) => {
  // State management
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormData>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (value: string): string | undefined => {
    if (!value.trim()) return contactFormDetails.emailRequiredMessage;
    if (!validateEmail(value)) return contactFormDetails.emailInvalidMessage;
    return undefined;
  };

  // Validate form
  const validateForm = (): boolean => {
    const error = validateField(formData.email);
    if (error) {
      setErrors({ email: error });
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setFormData({ email: value });

    // Clear error if field becomes valid
    if (touched.has('email')) {
      const error = validateField(value);
      setErrors({ email: error });
    }

    // Clear submit status when user starts typing again
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  // Handle field blur
  const handleBlur = () => {
    setTouched(prev => new Set(prev).add('email' as keyof FormData));
    const error = validateField(formData.email);
    setErrors({ email: error });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark field as touched
    setTouched(new Set<keyof FormData>(['email']));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Send to Netlify function with full contact data
      const response = await fetch(contactFormDetails.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: contactFormDetails.genericName,
          message: contactFormDetails.defaultMessage.replace('{email}', formData.email)
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        // Immediate redirect to VIP page with email parameter
        const redirectUrl = data.redirectUrl || `${contactFormDetails.defaultRedirectUrl}?email=${encodeURIComponent(formData.email)}`;
        window.location.href = redirectUrl;
      } else {
        setSubmitStatus('error');
        
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          const emailError = data.errors.find(err => err.field === 'email');
          if (emailError) {
            setErrors({ email: emailError.message });
          }
        }
        
        setSubmitMessage(data.message || data.error || contactFormDetails.defaultErrorMessage);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setSubmitMessage(contactFormDetails.connectionErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Style classes based on variant
  const isDark = variant === 'dark';
  
  const inputBaseClass = `
    w-full px-4 py-3 rounded-lg transition-all duration-200
    placeholder-opacity-60 text-sm
    focus:outline-none focus:ring-2
  `;

  const inputClass = isDark
    ? `${inputBaseClass} 
       bg-white/10 backdrop-blur-sm border border-white/20 
       text-white placeholder-white/60
       focus:bg-white/15 focus:border-white/40 focus:ring-white/30`
    : `${inputBaseClass}
       bg-white border border-gray-200 
       text-gray-900 placeholder-gray-500
       focus:border-[var(--primary)] focus:ring-[var(--primary)]/20`;

  const errorClass = 'text-xs flex items-center gap-1';
  const errorTextClass = isDark ? 'text-red-300' : 'text-red-500';

  const buttonClass = `
    px-6 py-3 rounded-lg font-medium
    transition-all duration-200 flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    whitespace-nowrap
  `;

  const buttonVariantClass = isDark
    ? 'bg-white text-[var(--primary)] hover:bg-white/90 focus:ring-2 focus:ring-white/50'
    : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--primary)]/50';

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {/* Success State */}
      {submitStatus === 'success' ? (
        <div className="text-center space-y-4 py-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            isDark ? 'bg-white/20' : 'bg-green-100'
          }`}>
            <FiCheck className={isDark ? 'text-white' : 'text-green-600'} size={32} />
          </div>
          <div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {contactFormDetails.successTitle}
            </h3>
            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
              {submitMessage}
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitStatus('idle');
              setSubmitMessage('');
            }}
            className={`text-sm ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'} underline transition-colors`}
          >
            {contactFormDetails.submitAnotherEmailText}
          </button>
        </div>
      ) : (
        <>
          

          {/* Email Form */}
          <form 
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">
                  {contactFormDetails.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className={isDark ? 'text-white/50' : 'text-gray-400'} size={18} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={contactFormDetails.emailPlaceholder}
                    className={`${inputClass} pl-10 ${errors.email && touched.has('email') ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.email && touched.has('email')}
                    aria-describedby={errors.email && touched.has('email') ? 'email-error' : undefined}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {errors.email && touched.has('email') && (
                  <p id="email-error" className={`${errorClass} ${errorTextClass} mt-1`}>
                    <FiAlertCircle size={12} />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonClass} ${buttonVariantClass} sm:w-auto w-full`}
                aria-label="Get started with fleet tracking"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                    <span>{contactFormDetails.processingButtonText}</span>
                  </>
                ) : (
                  <>
                    <span>{contactFormDetails.submitButtonText}</span>
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && !errors.email && (
              <div
                className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                  isDark
                    ? 'bg-red-500/20 text-red-100 border border-red-500/30'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
                role="alert"
                aria-live="polite"
              >
                <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
                <span>{submitMessage}</span>
              </div>
            )}

          </form>
        </>
      )}
    </div>
  );
};

export default ContactForm;