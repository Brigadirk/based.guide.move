'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { products, Product } from "@/lib/api"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, updateUserData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const productId = searchParams.get('productId')
  const returnUrl = searchParams.get('returnUrl') || '/'

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        router.push('/products')
        return
      }

      try {
        const availableProducts = await products.getAvailable()
        const selectedProduct = availableProducts.find(p => p.id === productId)
        
        if (!selectedProduct) {
          setError('Product not found')
          return
        }

        setProduct(selectedProduct)
      } catch (error) {
        console.error('Failed to load product:', error)
        setError('Failed to load product details')
      }
    }

    loadProduct()
  }, [productId, router])

  const handlePayment = async () => {
    if (!product) return

    setLoading(true)
    try {
      const result = await products.purchase(product.id)
      await updateUserData()
      router.push(`/success?returnUrl=${encodeURIComponent(returnUrl)}`)
    } catch (error) {
      console.error('Payment failed:', error)
      setError('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-6">Error</h1>
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => router.push('/products')}
            className="w-full mt-4"
          >
            Back to Products
          </Button>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Complete Purchase</h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-2 border-b">
            <span>Product</span>
            <span>{product.name}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Price</span>
            <span>${(product.price / 100).toFixed(2)}</span>
          </div>

          {user?.isMember && (
            <div className="flex justify-between py-2 border-b">
              <span>Current Token Balance</span>
              <span>{user.analysisTokens}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${(product.price / 100).toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Complete Purchase'}
        </Button>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          This is a test checkout page. No actual payment will be processed.
        </p>
      </Card>
    </div>
  )
} 