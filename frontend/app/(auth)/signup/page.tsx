'use client'

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthCard } from "@/components/auth/AuthCard"
import { SignupForm } from "@/components/auth/forms/SignupForm"
import type { SignupFormData } from "@/lib/auth/validation"

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signup(data.email, data.password)
      toast.success("Account created successfully! Please check your email to verify your account.")
      router.push('/login')
    } catch (error: any) {
      console.error('Signup error:', error)
      const errorMessage = error.message || error.detail?.message || "Failed to create account. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to create your account"
    >
      <SignupForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthCard>
  )
} 