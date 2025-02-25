'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { products, Product } from "@/lib/api"
import { ProductCard } from "@/components/product-card"
import { useAuth } from "@/lib/auth-context"

export default function ProductsPage() {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchaseInProgress, setPurchaseInProgress] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await products.getAvailable()
        setAvailableProducts(data)
      } catch (error: any) {
        console.error('Failed to load products:', error)
        setError(error.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [isAuthenticated, router])

  const handlePurchase = async (productId: string) => {
    setPurchaseInProgress(productId)
    try {
      router.push(`/checkout?productId=${productId}&returnUrl=${encodeURIComponent(window.location.pathname)}`)
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setPurchaseInProgress(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Available Products</h1>
        <div>Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Available Products</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Available Products</h1>
      {availableProducts.length === 0 ? (
        <div>No products available for {user?.isMember ? 'members' : 'non-members'}.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPurchase={handlePurchase}
              loading={purchaseInProgress === product.id}
            />
          ))}
        </div>
      )}
    </div>
  )
} 