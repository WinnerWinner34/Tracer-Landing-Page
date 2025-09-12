import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import * as brevo from '@getbrevo/brevo';

// Types
interface EmailRequestBody {
  name: string;
  email: string;
  message: string;
}

interface EmailValidationError {
  field: string;
  message: string;
}

// Environment variables
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';
const SITE_URL = process.env.SITE_URL || 'https://tracerfleet.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tracerfleet.com';
const FROM_NAME = process.env.FROM_NAME || 'Tracer Fleet Tracking';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY
);

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100;
};

const validateMessage = (message: string): boolean => {
  return message.length >= 10 && message.length <= 5000;
};

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 5000); // Limit length
};

// Email template functions
const getAdminEmailHtml = (name: string, email: string, message: string): string => {
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedMessage = sanitizeInput(message);
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .email-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          padding: 32px 24px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .email-content {
          padding: 32px 24px;
        }
        .info-section {
          margin-bottom: 24px;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        }
        .info-label {
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          color: #333333;
          font-size: 15px;
          word-wrap: break-word;
        }
        .info-value a {
          color: #6366f1;
          text-decoration: none;
        }
        .info-value a:hover {
          text-decoration: underline;
        }
        .message-section {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-left: 4px solid #6366f1;
          padding: 20px;
          border-radius: 8px;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .email-footer {
          background-color: #f9fafb;
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .timestamp {
          color: #6b7280;
          font-size: 13px;
          margin-top: 24px;
          text-align: right;
          font-style: italic;
        }
        .badge {
          display: inline-block;
          background-color: #dbeafe;
          color: #1e40af;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>📧 New Contact Form Submission</h1>
          <div class="badge">Tracer Fleet Tracking</div>
        </div>
        
        <div class="email-content">
          <div class="info-section">
            <div class="info-label">From</div>
            <div class="info-value">${sanitizedName}</div>
          </div>
          
          <div class="info-section">
            <div class="info-label">Email Address</div>
            <div class="info-value">
              <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a>
            </div>
          </div>
          
          <div class="info-section message-section">
            <div class="info-label">Message</div>
            <div class="info-value">${sanitizedMessage}</div>
          </div>
          
          <div class="timestamp">
            Received: ${timestamp}
          </div>
        </div>
        
        <div class="email-footer">
          <p style="margin: 0 0 8px 0;">
            This email was sent from the Tracer Fleet Tracking contact form.
          </p>
          <p style="margin: 0; font-size: 11px; color: #9ca3af;">
            © ${new Date().getFullYear()} Tracer Fleet Tracking. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getUserEmailHtml = (name: string): string => {
  const sanitizedName = sanitizeInput(name);
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Tracer Fleet Tracking</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .email-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          padding: 48px 24px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0 0 12px 0;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .email-header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.95;
        }
        .email-content {
          padding: 40px 24px;
        }
        .greeting {
          font-size: 18px;
          color: #333333;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .message-text {
          font-size: 15px;
          line-height: 1.8;
          color: #4b5563;
          margin-bottom: 24px;
        }
        .info-box {
          background-color: #f0f9ff;
          border-left: 4px solid #6366f1;
          padding: 24px;
          margin: 32px 0;
          border-radius: 8px;
        }
        .info-box h3 {
          margin: 0 0 16px 0;
          color: #1e40af;
          font-size: 16px;
          font-weight: 600;
        }
        .info-box ul {
          margin: 0;
          padding-left: 20px;
          color: #4b5563;
        }
        .info-box li {
          margin: 10px 0;
          line-height: 1.6;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          margin: 24px 0;
        }
        .cta-container {
          text-align: center;
          margin: 32px 0;
        }
        .email-footer {
          background-color: #f9fafb;
          padding: 32px 24px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .email-footer a {
          color: #6366f1;
          text-decoration: none;
        }
        .email-footer a:hover {
          text-decoration: underline;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 32px 0;
        }
        .signature {
          margin-top: 32px;
        }
        .signature strong {
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Thank You for Reaching Out!</h1>
          <p>We've received your message</p>
        </div>
        
        <div class="email-content">
          <div class="greeting">
            Hi ${sanitizedName},
          </div>
          
          <div class="message-text">
            Thank you for contacting Tracer Fleet Tracking. We appreciate your interest in our comprehensive fleet management solutions.
          </div>
          
          <div class="message-text">
            Our team has received your inquiry and will review it carefully. We understand that efficient fleet management is crucial for your business, and we're committed to providing you with the best possible solution.
          </div>
          
          <div class="info-box">
            <h3>What happens next?</h3>
            <ul>
              <li>A fleet tracking specialist will review your message within 1 business day</li>
              <li>We'll reach out via email to discuss your specific requirements</li>
              <li>If needed, we can schedule a personalized demo of our platform</li>
              <li>You'll receive tailored recommendations based on your fleet size and needs</li>
            </ul>
          </div>
          
          <div class="message-text">
            In the meantime, feel free to explore our website to learn more about how Tracer can transform your fleet operations:
          </div>
          
          <div class="cta-container">
            <a href="${SITE_URL}" class="cta-button">Explore Tracer Features</a>
          </div>
          
          <div class="divider"></div>
          
          <div class="signature">
            <div class="message-text">
              We look forward to helping you optimize your fleet operations!
            </div>
            
            <div class="message-text">
              Best regards,<br>
              <strong>The Tracer Fleet Tracking Team</strong>
            </div>
          </div>
        </div>
        
        <div class="email-footer">
          <p style="margin: 0 0 12px 0;">
            <strong>Tracer Fleet Tracking</strong><br>
            Real-time GPS tracking and fleet management solutions
          </p>
          
          <p style="margin: 0 0 12px 0;">
            <a href="${SITE_URL}">Website</a> | 
            <a href="mailto:${FROM_EMAIL}">Support</a>
          </p>
          
          <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af;">
            © ${year} Tracer Fleet Tracking. All rights reserved.<br>
            This is an automated response. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Brevo contact creation function
const createBrevoContact = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        extId: 'general-contact',
        attributes: {
          FIRSTNAME: 'Fleet',
          LASTNAME: 'Manager'
        }
      })
    });

    if (response.ok || response.status === 400) {
      // 200/201 = created, 400 = already exists (both OK)
      console.log(`Brevo contact ${response.status === 400 ? 'already exists' : 'created'} for: ${email}`);
      return true;
    }
    
    console.error('Brevo contact creation failed:', response.status, await response.text());
    return false;
  } catch (error) {
    console.error('Brevo contact creation error:', error);
    return false;
  }
};

// Main handler
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests'
      }),
    };
  }

  try {
    // Check required environment variables
    if (!BREVO_API_KEY) {
      console.error('Missing BREVO_API_KEY environment variable');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          message: 'Email service is not configured properly. Please contact support.'
        }),
      };
    }

    if (!CONTACT_TO_EMAIL) {
      console.error('Missing CONTACT_TO_EMAIL environment variable');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          message: 'Contact email is not configured. Please contact support.'
        }),
      };
    }

    // Parse request body
    let body: EmailRequestBody;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request',
          message: 'Request body must be valid JSON'
        }),
      };
    }

    // Validate required fields
    const errors: EmailValidationError[] = [];

    if (!body.name) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (!validateName(body.name)) {
      errors.push({ 
        field: 'name', 
        message: 'Name must be between 2 and 100 characters' 
      });
    }

    if (!body.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validateEmail(body.email)) {
      errors.push({ 
        field: 'email', 
        message: 'Please enter a valid email address' 
      });
    }

    if (!body.message) {
      errors.push({ field: 'message', message: 'Message is required' });
    } else if (!validateMessage(body.message)) {
      errors.push({ 
        field: 'message', 
        message: 'Message must be between 10 and 5000 characters' 
      });
    }

    if (errors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Validation failed',
          message: 'Please correct the errors and try again',
          errors 
        }),
      };
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(body.name);
    const sanitizedEmail = sanitizeInput(body.email);
    const sanitizedMessage = sanitizeInput(body.message);

    // Send admin notification email
    const adminEmail = new brevo.SendSmtpEmail();
    adminEmail.subject = `New Contact Form Submission from ${sanitizedName}`;
    adminEmail.htmlContent = getAdminEmailHtml(sanitizedName, sanitizedEmail, sanitizedMessage);
    adminEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
    adminEmail.to = [{ email: CONTACT_TO_EMAIL }];
    adminEmail.replyTo = { email: sanitizedEmail, name: sanitizedName };

    try {
      await apiInstance.sendTransacEmail(adminEmail);
      console.log('Admin notification email sent successfully');
    } catch (error: any) {
      console.error('Failed to send admin email:', error?.response?.body || error);
      
      // Parse Brevo error if available
      let errorMessage = 'Failed to send notification email';
      if (error?.response?.body) {
        try {
          const brevoError = JSON.parse(error.response.body);
          errorMessage = brevoError.message || errorMessage;
        } catch (e) {
          // Keep default error message
        }
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Email delivery failed',
          message: errorMessage
        }),
      };
    }

    // Create Brevo contact (non-blocking - don't fail if this doesn't work)
    const contactCreated = await createBrevoContact(sanitizedEmail);
    if (!contactCreated) {
      console.warn('Contact creation failed, but continuing with email flow');
    }

    // Send user confirmation email
    const userEmail = new brevo.SendSmtpEmail();
    userEmail.subject = 'Thank you for contacting Tracer Fleet Tracking';
    userEmail.htmlContent = getUserEmailHtml(sanitizedName);
    userEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
    userEmail.to = [{ email: sanitizedEmail, name: sanitizedName }];

    try {
      await apiInstance.sendTransacEmail(userEmail);
      console.log('User confirmation email sent successfully');
    } catch (error: any) {
      console.error('Failed to send user confirmation email:', error?.response?.body || error);
      // Don't fail the entire request if confirmation email fails
      // Admin notification was already sent successfully
    }

    // Success response with VIP redirect URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Thank you for your message. We\'ll get back to you within 1 business day.',
        data: {
          name: sanitizedName,
          email: sanitizedEmail
        },
        redirectUrl: `/vip?email=${encodeURIComponent(sanitizedEmail)}`
      }),
    };

  } catch (error: any) {
    console.error('Unexpected error in send-email function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
    };
  }
};