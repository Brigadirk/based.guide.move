import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    console.log('Verifying payment with session ID:', sessionId)
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    console.log('Making request to:', `${apiUrl}/stripe/verify-session`)
    
    const response = await fetch(`${apiUrl}/stripe/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error response from backend:', error)
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    console.log('Successfully verified payment:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 