'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        console.log('Processing payment with session ID:', sessionId)
        
        if (!sessionId) {
          setError('No session ID found')
          return
        }

        // Verify the payment session and get user email
        console.log('Making verification request...')
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          console.error('Verification failed with status:', response.status)
          const errorData = await response.json()
          console.error('Error details:', errorData)
          throw new Error('Failed to verify payment')
        }

        const { email } = await response.json()
        console.log('Got email:', email)
        
        // Redirect to set password page
        router.push(`/set-password?email=${encodeURIComponent(email)}`)
      } catch (error: any) {
        console.error('Payment processing error:', error)
        setError('Failed to process payment. Please contact support.')
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Payment Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/signup')}
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            {isProcessing ? (
              'Processing your payment...'
            ) : (
              'Welcome to based.guide! Please set your password to continue.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
} 