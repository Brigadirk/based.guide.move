'use client'

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { user, logout } = useAuth()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div>{user.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div>{user.email}</div>
          </div>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => logout()}
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 