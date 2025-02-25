'use client'

import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createCheckoutSession } from "../lib/stripe"
import { useState } from "react"

interface AnalysisCtaButtonProps {
  variant?: "default" | "secondary"
  className?: string
  fullWidth?: boolean
}

export function AnalysisCtaButton({ 
  variant = "default", 
  className = "", 
  fullWidth = false 
}: AnalysisCtaButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    
    try {
      if (!isAuthenticated) {
        router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      const checkoutUrl = await createCheckoutSession()
      router.push(checkoutUrl)
    } catch (error) {
      console.error('Failed to handle checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleClick}
      variant={variant}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      size="lg"
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Get personalized analysis'}
    </Button>
  )
} 