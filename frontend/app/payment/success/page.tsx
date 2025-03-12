'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

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

        const data = await response.json()
        console.log('Got email:', data.email)
        setEmail(data.email)
        setIsProcessing(false)
      } catch (error: any) {
        console.error('Payment processing error:', error)
        setError('Failed to process payment. Please contact support.')
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [searchParams])

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-500">Payment Processing Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isProcessing) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
          <CardDescription>Please wait while we process your payment...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <CardTitle>Payment Successful!</CardTitle>
        </div>
        <CardDescription>Thank you for your payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Check your email</p>
          </div>
          <p className="text-sm text-muted-foreground">
            We've sent a verification email to <span className="font-medium">{email}</span>. 
            Please check your inbox and click the verification link to complete your registration.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>After verifying your email, you'll be able to set your password and access your account.</p>
        </div>
      </CardContent>
    </Card>
  )
} 