'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm as AuthLoginForm } from "@/components/auth/forms/LoginForm"
import { useAuth } from "@/lib/auth/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null)
      setUnverifiedEmail(null)
      setResendSuccess(false)
      await login(data.email, data.password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.detail?.code === "EMAIL_NOT_VERIFIED" || 
          err.message?.toLowerCase().includes("verify") || 
          err.detail?.message?.toLowerCase().includes("verify")) {
        setUnverifiedEmail(err.detail?.email || data.email)
        setError("Please verify your email before logging in.")
      } else if (err.message?.toLowerCase().includes("network") || err.message?.toLowerCase().includes("failed to fetch")) {
        setError("Unable to connect to the server. Please check your internet connection or try again later.")
      } else {
        setError(err.message || "Invalid email or password.")
      }
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return

    try {
      setIsResendingVerification(true)
      setError(null)
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      setResendSuccess(true)
      setError(data.message || "Verification email request accepted. Due to technical issues, email delivery cannot be guaranteed. Please contact support if you don't receive the email within 5 minutes.")
    } catch (err) {
      console.error("Failed to resend verification:", err)
      if (err instanceof Error && err.message.toLowerCase().includes("network")) {
        setError("Unable to connect to the server. Please check your internet connection or try again later.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to resend verification email. Please try again.")
      }
    } finally {
      setIsResendingVerification(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex flex-col gap-2">
              <span>{error}</span>
              {unverifiedEmail && (
                <Button
                  variant="link"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification || resendSuccess}
                  className="p-0 h-auto font-normal hover:no-underline"
                >
                  {isResendingVerification ? (
                    <span className="flex items-center gap-2">
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                      Sending verification email...
                    </span>
                  ) : (
                    "Click here to resend verification email"
                  )}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        {resendSuccess && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              Verification email request accepted. Due to technical issues, email delivery cannot be guaranteed. Please contact support if you don't receive the email within 5 minutes.
            </AlertDescription>
          </Alert>
        )}
        <AuthLoginForm onSubmit={handleSubmit} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
} 