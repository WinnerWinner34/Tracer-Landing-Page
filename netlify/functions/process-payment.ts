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
  apiVersion: '2025-08-27.basil',
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
    // First, try to get the existing contact
    const getContactRequest = new brevo.GetContactInfo();
    
    try {
      // Update contact with VIP status
      const updateContactRequest = new brevo.UpdateContact();
      updateContactRequest.extId = 'vip-customer';
      updateContactRequest.attributes = {
        VIP_STATUS: true,
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
          VIP_STATUS: true,
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
            padding: 48px 24px;
            text-align: center;
          }
          .vip-badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          .email-content {
            padding: 40px 24px;
          }
          .benefit-item {
            display: flex;
            align-items: start;
            margin-bottom: 16px;
          }
          .benefit-icon {
            color: #f97316;
            margin-right: 12px;
            font-size: 20px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
            color: #000000;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
          }
          .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="vip-badge">⭐ VIP MEMBER ⭐</div>
            <h1 style="margin: 0; font-size: 32px;">Welcome to the VIP Club!</h1>
          </div>
          
          <div class="email-content">
            <h2 style="color: #f97316; margin-top: 0;">Congratulations on Your VIP Upgrade!</h2>
            
            <p>Thank you for becoming a VIP member of Tracer Fleet Tracking. Your exclusive benefits are now active!</p>
            
            <h3 style="color: #333; margin-top: 32px;">Your VIP Benefits Include:</h3>
            
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <div>
                <strong>Deepest Discount Available</strong><br>
                You've secured our best pricing - better than our upcoming Kickstarter launch!
              </div>
            </div>
            
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <div>
                <strong>Exclusive Tracer Window Cling</strong><br>
                A special VIP-only accessory for your vehicle.
              </div>
            </div>
            
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <div>
                <strong>Priority Shipping</strong><br>
                Your order will be among the first to ship when available.
              </div>
            </div>
            
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <div>
                <strong>Early Access & Updates</strong><br>
                Be the first to know about new features and products.
              </div>
            </div>
            
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <div>
                <strong>Direct Influence on Development</strong><br>
                Your feedback will help shape the future of Tracer.
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://tracerfleet.com/exclusive-community" class="cta-button">
                Access VIP Community
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f97316; padding: 16px; margin: 32px 0;">
              <strong>What Happens Next?</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>You'll receive updates on production progress</li>
                <li>We'll notify you before your Tracer ships</li>
                <li>Access to exclusive VIP community resources</li>
                <li>Direct line to our product team for feedback</li>
              </ul>
            </div>
            
            <p>If you have any questions, reply to this email and our VIP support team will assist you promptly.</p>
            
            <p style="margin-top: 32px;">
              Welcome to the Tracer family!<br>
              <strong>The Tracer Fleet Tracking Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 8px 0;">
              <strong>Tracer Fleet Tracking</strong><br>
              Next-generation fleet management solutions
            </p>
            <p style="margin: 8px 0; font-size: 11px; color: #9ca3af;">
              © ${new Date().getFullYear()} Tracer Fleet Tracking. All rights reserved.<br>
              You're receiving this because you purchased a VIP membership.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const email = new brevo.SendSmtpEmail();
    email.subject = '🌟 Welcome to Tracer VIP Membership!';
    email.htmlContent = htmlContent;
    email.sender = { name: FROM_NAME, email: FROM_EMAIL };
    email.to = [{ email }];

    await emailApi.sendTransacEmail(email);
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