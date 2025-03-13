import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Get the user ID from the metadata
      const userId = session.metadata?.user_id
      if (!userId) {
        throw new Error('No user ID found in session metadata')
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
      }

      // Generate and send email verification link
      const { error: emailError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: session.customer_email as string,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify`,
        }
      })

      if (emailError) {
        console.error('Error sending verification email:', emailError)
        throw emailError
      }

      return NextResponse.json({ received: true })
    } catch (error: any) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
} 