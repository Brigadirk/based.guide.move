'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthCard } from '@/components/features/auth/auth-card'
import { AuthForm } from '@/components/features/auth/auth-form'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validateEmail = (email: string): string | null => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return 'Invalid email address'
    }
    return null
  }

  const handleSubmit = async (email: string) => {
    setError(null)
    setIsLoading(true)

    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Registration failed')
      }

      const { checkout_url } = await response.json()
      
      if (!checkout_url) {
        throw new Error('No checkout URL received')
      }

      // Redirect to Stripe checkout
      window.location.href = checkout_url
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.message === 'Email already registered') {
        setError('This email is already registered')
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.')
      }
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your email to get started with a premium membership"
    >
      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Continue to payment"
        alternateLink={{
          text: "Already have an account?",
          href: "/login",
          linkText: "Log in"
        }}
        emailOnly={true}
      />
    </AuthCard>
  )
} 