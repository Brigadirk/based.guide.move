'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AuthCard } from "@/components/auth/AuthCard"
import { ResetPasswordForm } from "@/components/auth/forms/ResetPasswordForm"
import type { ResetPasswordFormData } from "@/lib/auth/validation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <AuthCard
        title="Invalid Reset Link"
        description="This password reset link is invalid or has expired. Please request a new one."
      >
        <div className="text-center">
          <button
            onClick={() => router.push('/forgot-password')}
            className="text-primary hover:underline"
          >
            Request New Reset Link
          </button>
        </div>
      </AuthCard>
    )
  }

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          ...data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reset password')
      }

      toast.success("Password reset successfully!")
      router.push('/login')
    } catch (error: any) {
      console.error('Reset password error:', error)
      const errorMessage = error.message || "Failed to reset password. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your new password below"
    >
      <ResetPasswordForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthCard>
  )
} 