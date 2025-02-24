'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const { login, user, isLoading } = useAuth()
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/')
    }
  }, [isLoading, user, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const success = login(
      formData.get('email') as string,
      formData.get('password') as string
    )

    if (success) {
      router.push(returnUrl)
    } else {
      setError('Invalid credentials')
    }
  }

  // Don't render form if loading or already authenticated
  if (isLoading || user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <Input 
              name="email"
              type="email"
              defaultValue="test@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Password</label>
            <Input 
              name="password"
              type="password"
              defaultValue="password123"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full">
            Login
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Use the pre-filled credentials for testing
          </p>
        </form>
      </Card>
    </div>
  )
} 