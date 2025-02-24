'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const price = searchParams.get('price') || '99'
  const product = searchParams.get('product') || 'Tax Analysis'
  const returnUrl = searchParams.get('returnUrl') || '/'

  const handlePayment = async () => {
    setLoading(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push(`/success?returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-2 border-b">
            <span>{product}</span>
            <span>${price}</span>
          </div>
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${price}</span>
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay $${price}`}
        </Button>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          This is a mock checkout page for demonstration purposes.
        </p>
      </Card>
    </div>
  )
} 