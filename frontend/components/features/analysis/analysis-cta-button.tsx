'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"
import { supabase } from "@/lib/supabase/client"
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
  const { user } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    
    try {
      if (!user) {
        router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      const { data: userData } = await supabase
        .from('profiles')
        .select('analysis_tokens')
        .eq('id', user.id)
        .single()

      // If user has no bananas, redirect to products page
      if (!userData?.analysis_tokens || userData.analysis_tokens <= 0) {
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
    if (!user) return '🔒 Get personalized analysis'
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