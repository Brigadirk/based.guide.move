'use client'

import React, { useState } from "react"
import { Product } from "@/types/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProductListProps {
  products: Product[]
  onPurchase: (productId: string) => Promise<{ success: boolean, error?: string }>
  isLoading: boolean
  error: string | null
}

export function ProductList({
  products,
  onPurchase,
  isLoading,
  error
}: ProductListProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const handlePurchase = async (productId: string) => {
    try {
      setPurchasingId(productId)
      const result = await onPurchase(productId)
      
      if (result.success) {
        toast.success("Purchase successful!")
      } else {
        toast.error(result.error || "Purchase failed")
      }
    } catch (err) {
      toast.error("An error occurred during purchase")
      console.error(err)
    } finally {
      setPurchasingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No products are currently available. Please check back later.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              {product.type === 'banana_pack' 
                ? `${product.bananaAmount} 🍌`
                : 'Annual Membership'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">
              ${(product.price / 100).toFixed(2)}
            </div>
            {product.type === 'member_bundle' && (
              <p className="text-muted-foreground">
                Full access to all features
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handlePurchase(product.id)} 
              disabled={!!purchasingId}
              className="w-full"
            >
              {purchasingId === product.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Purchase'
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 