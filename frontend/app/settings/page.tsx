'use client'

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MessagesSquare } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { isAuthenticated, logout, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isDiscordConnected, setIsDiscordConnected] = useState(false)

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
    // In a real app, you would fetch the Discord connection status here
    setIsDiscordConnected(false)
  }, [user])

  useEffect(() => {
    console.log('Settings Page - Auth State:', { isAuthenticated, authLoading })
    
    if (!authLoading && !isAuthenticated) {
      console.log('Settings Page - Redirecting to login')
      router.push('/login?returnUrl=/settings')
    }
  }, [isAuthenticated, authLoading, router])

  const handleEmailUpdate = async () => {
    setIsUpdatingEmail(true)
    try {
      // Implement email update logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleDiscordConnect = async () => {
    // Implement Discord OAuth flow here
    window.open('/api/discord/connect', '_blank')
  }

  if (authLoading || !isAuthenticated) {
    console.log('Settings Page - Loading or not authenticated:', { authLoading, isAuthenticated })
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          {authLoading ? "Loading..." : "Please log in"}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your email address and account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <Button 
                onClick={handleEmailUpdate}
                disabled={isUpdatingEmail}
              >
                {isUpdatingEmail ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Based Guide looks on your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Community</CardTitle>
          <CardDescription>Connect with the Based Guide community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Discord Account</Label>
              <div className="text-sm text-muted-foreground">
                {isDiscordConnected 
                  ? "Your Discord account is connected"
                  : "Connect your Discord account to join our community"}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDiscordConnect}
              className="gap-2"
            >
              <MessagesSquare className="h-5 w-5" />
              {isDiscordConnected ? "Disconnect" : "Connect Discord"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Careful with these actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline"
            onClick={logout}
            className="text-destructive hover:text-destructive"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 