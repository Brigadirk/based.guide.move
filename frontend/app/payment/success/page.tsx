'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        if (!sessionId) {
          throw new Error('No session ID found')
        }

        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment')
        }

        setStatus('success')
        setEmail(data.email)
        setMessage('Payment successful! We\'ve sent you a magic link to access your account.')
      } catch (error: any) {
        console.error('Payment processing error:', error)
        setStatus('error')
        setMessage(error.message || 'An error occurred while processing your payment')
      }
    }

    processPayment()
  }, [searchParams])

  return (
    <div className="container max-w-lg mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment {status === 'success' ? 'Successful' : status === 'error' ? 'Failed' : 'Processing'}</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your payment...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Alert variant={status === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>{status === 'success' ? 'Success!' : 'Error'}</AlertTitle>
              <AlertDescription className="mt-2">
                {message}
                {status === 'success' && email && (
                  <p className="mt-2">
                    Please check <strong>{email}</strong> for your login link
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 