import { NextRequest, NextResponse } from 'next/server';
import {  getStripeServer  } from '@/lib/stripe';
import Stripe from 'stripe';

/**
 * GET handler for retrieving Stripe checkout session data
 * Used by the success page to display order confirmation details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Validate session ID parameter
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { 
          error: 'Missing or invalid session ID',
          code: 'INVALID_SESSION_ID'
        },
        { status: 400 }
      );
    }

    // Check for test mode in development
    if (process.env.NODE_ENV === 'development' && sessionId === 'test_success') {
      // Return mock data for testing the success page
      return NextResponse.json({
        customer_email: 'test@cardify.club',
        amount_total: 2500, // $25.00
        quantity: 3,
        marketing_consent: true,
        payment_status: 'paid',
        session_id: 'test_success',
        created: Date.now(),
      }, { status: 200 });
    }

    // Validate session ID format (Stripe session IDs start with 'cs_')
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json(
        { 
          error: 'Invalid session ID format',
          code: 'INVALID_SESSION_ID_FORMAT'
        },
        { status: 400 }
      );
    }

    const stripe = getStripeServer('platform'); // or 'market'

    // Retrieve the checkout session from Stripe
    let session: Stripe.Checkout.Session;
    try {
session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'line_items', 'line_items.data.price.product'],
      });
    } catch (stripeError: any) {
      console.error('Stripe session retrieval error:', stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { 
            error: 'Session not found or has expired',
            code: 'SESSION_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      // Handle other Stripe errors
      return NextResponse.json(
        { 
          error: 'Failed to retrieve session data',
          code: 'STRIPE_ERROR'
        },
        { status: 500 }
      );
    }

    // Validate that the session is completed (payment was successful)
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { 
          error: 'Session payment not completed',
          code: 'PAYMENT_NOT_COMPLETED',
          payment_status: session.payment_status
        },
        { status: 400 }
      );
    }

    // Extract relevant data for the success page
    const responseData = {
      customer_email: session.customer_details?.email || session.customer_email || '',
      amount_total: session.amount_total || 0,
      quantity: parseInt(session.metadata?.quantity || '1', 10),
      marketing_consent: session.consent?.promotions === 'opt_in',
      payment_status: session.payment_status,
      session_id: session.id,
      created: session.created,
    };

    // Validate that we have essential data
    if (!responseData.customer_email) {
      console.warn('Session retrieved but missing customer email:', sessionId);
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in session retrieval:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Restrict other HTTP methods
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}