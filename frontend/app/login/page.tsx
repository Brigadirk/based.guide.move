'use client'

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AuthCard } from "@/components/features/auth/auth-card"
import { AuthForm } from "@/components/features/auth/auth-form"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      toast.success("Logged in successfully!")
      router.push(returnUrl || '/profile')
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || "Failed to login. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your account"
    >
      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Login"
        alternateLink={{
          text: "Don't have an account?",
          href: "/signup",
          linkText: "Sign up"
        }}
      />
    </AuthCard>
  )
} 