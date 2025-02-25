'use client'

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('Settings Page - Auth State:', { isAuthenticated, isLoading })
    
    const timer = setTimeout(() => {
      setIsLoading(false)
      console.log('Settings Page - After Timeout:', { isAuthenticated, isLoading: false })
      
      if (!isAuthenticated) {
        console.log('Settings Page - Redirecting to login')
        router.push('/login?returnUrl=/settings')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    console.log('Settings Page - Rendering null:', { isLoading, isAuthenticated })
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="destructive" 
            onClick={logout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 