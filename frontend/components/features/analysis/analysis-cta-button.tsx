'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
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
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    
    try {
      if (!isAuthenticated) {
        router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      // If user has no bananas, redirect to products page
      if (!user?.analysisTokens || user.analysisTokens <= 0) {
        router.push('/products')
        return
      }

      // Redirect to order analysis page
      router.push('/analyses/request')
      
    } catch (error) {
      console.error('Failed to handle analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (loading) return '🔄 Processing...'
    if (!isAuthenticated) return '🔒 Get personalized analysis'
    if (!user?.analysisTokens || user.analysisTokens <= 0) return '🍌 Get analysis bananas'
    return '🍌 Analyze with banana'
  }

  return (
    <Button 
      onClick={handleClick}
      variant={variant}
      className={`w-full md:w-auto ${fullWidth ? 'w-full' : ''} ${className}`}
      size="lg"
      disabled={loading}
    >
      {getButtonText()}
    </Button>
  )
} 