import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    console.log('Verifying payment with session ID:', sessionId)

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log('Session retrieved:', session)

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed')
    }

    // Get the user ID from the metadata
    const userId = session.metadata?.user_id
    const email = session.customer_email
    if (!userId || !email) {
      throw new Error('No user ID or email found in session metadata')
    }

    // Update the user's membership status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_member: true,
        analysis_tokens: 5, // Give them 5 tokens to start with
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      throw updateError
    }

    // Create a payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: session.id,
        user_id: userId,
        amount: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
        created_at: new Date().toISOString(),
      })

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Don't throw here as the main operation succeeded
    }

    // Send a magic link for immediate login
    const { error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      }
    })

    if (magicLinkError) {
      console.error('Error sending magic link:', magicLinkError)
      throw magicLinkError
    }

    console.log('Magic link sent to:', email)

    return NextResponse.json({
      success: true,
      email: email,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
} 