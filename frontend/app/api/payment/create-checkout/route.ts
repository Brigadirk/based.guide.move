import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create user in Supabase without password (will be set after email verification)
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // Don't auto-confirm email
      password: crypto.randomUUID(), // Temporary random password
    })

    if (signUpError || !user) {
      console.error('Error creating user:', signUpError)
      return NextResponse.json(
        { error: signUpError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_MEMBERSHIP_PRICE_ID,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Payment session creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 