'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AuthCard } from '@/components/features/auth/auth-card'
import { AuthForm } from '@/components/features/auth/auth-form'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile')
    }
  }, [isAuthenticated, router])

  const validateForm = (email: string, password: string): string | null => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return 'Invalid email address'
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }

    return null
  }

  const handleSubmit = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    const validationError = validateForm(email, password)
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      await register(email, password)
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.message === 'Email already registered') {
        setError('This email is already registered')
      } else if (err.message.includes('password')) {
        setError(err.message)
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to get started"
    >
      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Sign up"
        alternateLink={{
          text: "Already have an account?",
          href: "/login",
          linkText: "Log in"
        }}
      />
    </AuthCard>
  )
} 