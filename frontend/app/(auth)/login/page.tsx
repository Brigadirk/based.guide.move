'use client'

import { useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm } from "@/components/auth/forms/LoginForm"
import type { LoginFormData } from "@/lib/auth/validation"

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data)
    setIsLoading(true)
    setError(null)

    try {
      // Use Supabase's magic link authentication
      const result = await signIn(data.email)
      if (result.error) throw result.error

      if (result.user && result.user.email_confirmed_at === null) {
        toast.info("Email not verified. Please check your email for the verification link.")
        return
      }

      toast.success("Magic link sent! Check your email.")
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || error.detail?.message || "Failed to send magic link. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account"
    >
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthCard>
  )
} 