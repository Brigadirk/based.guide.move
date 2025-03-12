'use client'

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const returnUrl = searchParams.get('returnUrl') || '/'

  useEffect(() => {
    // Could add confetti or other success animations here
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Purchase Successful!</h1>
        
        <div className="space-y-4 mb-8">
          {user?.isMember && (
            <p>
              Your new token balance: <span className="font-bold">{user.analysisTokens}</span>
            </p>
          )}
          
          <p className="text-muted-foreground">
            Thank you for your purchase. You can now continue using our services.
          </p>
        </div>

        <Button 
          onClick={() => router.push(returnUrl)}
          className="w-full"
        >
          Continue
        </Button>
      </Card>
    </div>
  )
} 