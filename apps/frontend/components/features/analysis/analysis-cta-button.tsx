'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores"
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
  const { user, hasMembership, bananaBalance } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent parent Link from triggering
    e.stopPropagation()
    setLoading(true)
    
    try {
      // Case 4: Not authenticated
      if (!user) {
        router.push(`/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      // Case 3: Authenticated but not a member
      if (!hasMembership) {
        router.push('/membership-required')
        return
      }

      // Case 2: Authenticated member with no bananas
      if (bananaBalance <= 0) {
        router.push('/products')
        return
      }

      // Case 1: Authenticated member with bananas
      router.push('/analyses/request')
      
    } catch (error) {
      console.error('Failed to handle analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (loading) return '🔄 Processing...'
    
    // Case 4: Not authenticated
    if (!user) return 'Join now to analyze your relocation'
    
    // Case 3: Authenticated but not a member
    if (!hasMembership) return 'Become a member to analyze your relocation'
    
    // Case 2: Authenticated member with no bananas
    if (bananaBalance <= 0) return 'Get 🍌 to analyze your relocation'
    
    // Case 1: Authenticated member with bananas
    return 'Use 1 🍌 to analyze your relocation'
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