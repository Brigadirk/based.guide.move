'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const success = login(
      formData.get('email') as string,
      formData.get('password') as string
    )

    if (success) {
      router.push('/')
    } else {
      setError('Invalid credentials. Try test@example.com / password123')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue="test@example.com"
                required 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                defaultValue="password123"
                required 
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button className="w-full" type="submit">
              Sign up
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Use the pre-filled credentials for testing
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 