'use client'

import { ResidencyIntentionsForm } from "@/components/forms/analysis/residency-intentions-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ResidencyIntentions, Profile } from "@/types/profile"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProfileSelector } from "@/components/ui/profile-selector"
import { ProfileCard } from "@/components/ui/profile-card"

export default function RequestAnalysisPage() {
  const router = useRouter()
  const { user, selectedProfile: currentProfile } = useAuth()
  const [formData, setFormData] = useState<{ residencyIntentions?: ResidencyIntentions }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(currentProfile || null)

  const handleCreateNewProfile = () => {
    router.push('/profile/new')
  }

  useEffect(() => {
    if (user && (!user.analysisTokens || user.analysisTokens <= 0)) {
      router.push('/products')
    }
  }, [user, router])

  useEffect(() => {
    if (currentProfile) {
      setSelectedProfile(currentProfile)
    }
  }, [currentProfile])

  const handleSubmit = async () => {
    if (!formData.residencyIntentions) {
      toast.error("Please fill out the residency intentions form")
      return
    }

    setIsSubmitting(true)
    try {
      // Generate a mock analysis ID
      const mockAnalysisId = `analysis-${Date.now()}`
      toast.success("Analysis started! Redirecting to results...")
      router.push(`/analyses/${mockAnalysisId}`)
    } catch (error) {
      console.error("Failed to submit analysis request:", error)
      toast.error("Failed to submit analysis request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-6">
            <div>
              <CardTitle>Request Analysis</CardTitle>
              <CardDescription>
                Tell us about your move intentions to get personalized analysis
              </CardDescription>
            </div>
            <div className="space-y-3">
              <ProfileSelector
                profiles={[user?.profiles?.[0]].filter(Boolean) as Profile[]}
                selectedProfile={selectedProfile}
                onSelect={setSelectedProfile}
                onCreateNew={handleCreateNewProfile}
              />
              {selectedProfile && (
                <ProfileCard 
                  profile={selectedProfile}
                  showFinancials={true}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResidencyIntentionsForm
            data={formData}
            onUpdate={setFormData}
          />
          
          <div className="mt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.residencyIntentions}
              size="lg"
              className="w-full"
            >
              {isSubmitting ? "Processing..." : "🍌 Pay with 1 banana"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 