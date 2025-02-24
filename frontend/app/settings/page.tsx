'use client'

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SettingsPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?returnUrl=/settings')
    }
  }, [isLoading, user, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Show nothing while loading or if not authenticated
  if (isLoading || !user) {
    return null
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div>{user.email}</div>
          </div>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 