'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setError("Invalid verification link")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to verify email')
        }

        toast.success("Email verified successfully!")
        router.push('/login')
      } catch (error: any) {
        console.error('Email verification error:', error)
        const errorMessage = error.message || "Failed to verify email. Please try again."
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router])

  if (isVerifying) {
    return (
      <AuthCard
        title="Verifying your email"
        description="Please wait while we verify your email address..."
      >
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AuthCard>
    )
  }

  if (error) {
    return (
      <AuthCard
        title="Verification Failed"
        description={error}
      >
        <div className="text-center">
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
          >
            Back to Login
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Email Verified"
      description="Your email has been verified successfully. You can now log in to your account."
    >
      <div className="text-center">
        <Button
          onClick={() => router.push('/login')}
        >
          Continue to Login
        </Button>
      </div>
    </AuthCard>
  )
} 