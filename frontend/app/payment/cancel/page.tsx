'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your payment was cancelled. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => router.push('/signup')}
            className="w-full"
            variant="default"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="w-full"
            variant="outline"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 