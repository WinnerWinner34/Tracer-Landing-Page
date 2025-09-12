import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import Stripe from 'stripe';
import * as brevo from '@getbrevo/brevo';

// Types
interface ProcessPaymentBody {
  session_id: string;
}

// Environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tracerfleet.com';
const FROM_NAME = process.env.FROM_NAME || 'Tracer Fleet Tracking';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil', // TODO: Update when stable version available
});

// Initialize Brevo API clients
const contactsApi = new brevo.ContactsApi();
contactsApi.setApiKey(
  brevo.ContactsApiApiKeys.apiKey,
  BREVO_API_KEY
);

const emailApi = new brevo.TransactionalEmailsApi();
emailApi.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY
);

// Update Brevo contact to VIP status
const updateBrevoContact = async (email: string): Promise<boolean> => {
  try {
    try {
      // Update contact with VIP status - Fixed: Convert boolean to string
      const updateContactRequest = new brevo.UpdateContact();
      updateContactRequest.extId = 'vip-customer';
      updateContactRequest.attributes = {
        VIP_STATUS: 'true', // Fixed: String instead of boolean
        VIP_PURCHASE_DATE: new Date().toISOString(),
        CUSTOMER_TYPE: 'VIP'
      };

      await contactsApi.updateContact(email, updateContactRequest);
      console.log(`Brevo contact updated to VIP status for: ${email}`);
      return true;
    } catch (updateError: any) {
      // If contact doesn't exist, create it as VIP
      if (updateError?.status === 404) {
        const createContactRequest = new brevo.CreateContact();
        createContactRequest.email = email;
        createContactRequest.extId = 'vip-customer';
        createContactRequest.attributes = {
          FIRSTNAME: 'Fleet',
          LASTNAME: 'Manager',
          VIP_STATUS: 'true', // Fixed: String instead of boolean
          VIP_PURCHASE_DATE: new Date().toISOString(),
          CUSTOMER_TYPE: 'VIP'
        };

        await contactsApi.createContact(createContactRequest);
        console.log(`Brevo VIP contact created for: ${email}`);
        return true;
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Brevo contact update error:', error);
    return false;
  }
};

// Send VIP welcome email
const sendVIPWelcomeEmail = async (email: string): Promise<boolean> => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to VIP Membership</title>
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
            background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
          }
          .email-body {
            padding: 40px 30px;
          }
          .email-footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .vip-badge {
            background-color: #fbbf24;
            color: #1f2937;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
          }
          .feature-list {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .checkmark {
            background-color: #10b981;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 12px;
          }
          .cta-button {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: bold;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="vip-badge">🌟 VIP MEMBER</div>
            <h1 style="margin: 0; font-size: 28px;">Welcome to Tracer VIP!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
              You're now part of our exclusive community
            </p>
          </div>
          
          <div class="email-body">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Your VIP Benefits Are Active!</h2>
            
            <p style="margin-bottom: 20px;">
              Thank you for upgrading to VIP membership! You now have access to exclusive features and priority support.
            </p>
            
            <div class="feature-list">
              <div class="feature-item">
                <div class="checkmark">✓</div>
                <span>Priority customer support</span>
              </div>
              <div class="feature-item">
                <div class="checkmark">✓</div>
                <span>Advanced fleet analytics</span>
              </div>
              <div class="feature-item">
                <div class="checkmark">✓</div>
                <span>Early access to new features</span>
              </div>
              <div class="feature-item">
                <div class="checkmark">✓</div>
                <span>Exclusive webinars and training</span>
              </div>
              <div class="feature-item">
                <div class="checkmark">✓</div>
                <span>Custom reporting dashboard</span>
              </div>
            </div>
            
            <p style="margin-top: 30px;">
              Our team will be in touch within 24 hours to help you get the most out of your VIP membership.
            </p>
            
            <a href="https://tracerfleet.com/vip-dashboard" class="cta-button">
              Access Your VIP Dashboard
            </a>
          </div>
          
          <div class="email-footer">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              © 2024 Tracer Fleet Tracking. All rights reserved.<br>
              You're receiving this because you purchased a VIP membership.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Fixed: Use correct property name for SendSmtpEmail
    const emailPayload = {
      subject: '🌟 Welcome to Tracer VIP Membership!',
      htmlContent: htmlContent,
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: email }]
    };

    await emailApi.sendTransacEmail(emailPayload);
    console.log('VIP welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send VIP welcome email:', error);
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
        success: false,
        message: 'Method not allowed'
      }),
    };
  }

  try {
    // Check required environment variables
    if (!STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Payment processing is not configured properly.'
        }),
      };
    }

    if (!BREVO_API_KEY) {
      console.error('Missing BREVO_API_KEY environment variable');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Email service is not configured properly.'
        }),
      };
    }

    // Parse request body
    let body: ProcessPaymentBody;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Invalid request body'
        }),
      };
    }

    // Validate session_id
    if (!body.session_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Session ID is required'
        }),
      };
    }

    // Retrieve checkout session from Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(body.session_id);
    } catch (stripeError: any) {
      console.error('Stripe session retrieval error:', stripeError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Invalid or expired session'
        }),
      };
    }

    // Verify session is completed
    if (session.payment_status !== 'paid') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Payment not completed'
        }),
      };
    }

    // Extract customer email
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error('No customer email found in session');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Customer email not found'
        }),
      };
    }

    console.log(`Processing VIP upgrade for: ${customerEmail}`);

    // Update Brevo contact to VIP status
    const contactUpdated = await updateBrevoContact(customerEmail);
    if (!contactUpdated) {
      console.warn('Failed to update Brevo contact, but continuing...');
    }

    // Send VIP welcome email
    const emailSent = await sendVIPWelcomeEmail(customerEmail);
    if (!emailSent) {
      console.warn('Failed to send welcome email, but payment was successful');
    }

    // Success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'VIP membership activated successfully!',
        data: {
          email: customerEmail,
          vipStatus: true,
          contactUpdated,
          welcomeEmailSent: emailSent
        }
      }),
    };

  } catch (error: any) {
    console.error('Unexpected error in process-payment function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'An unexpected error occurred. Please contact support.'
      }),
    };
  }
};