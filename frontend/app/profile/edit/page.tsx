'use client'

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProfileProgressBar } from "@/components/profile-progress"
import { Profile } from "@/types/profile"
import { BasicInfoForm } from "./basic-info-form"
import { TaxPreferencesForm } from "./tax-preferences-form"
import { LifestyleForm } from "./lifestyle-form"

const steps = ["Basic Info", "Tax Preferences", "Lifestyle"]

export default function EditProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Profile>({
    email: user?.email || "",
    income: null,
    occupation: "",
    currentCountry: "",
    interestedCountries: [],
    taxPreferences: {
      maxTaxRate: null,
      corporateTaxImportant: false,
      vatImportant: false
    },
    lifestyle: {
      remoteWork: false,
      costOfLiving: null,
      climatePreference: null
    }
  })

  if (!user) {
    router.push('/login')
    return null
  }

  const progress = {
    total: steps.length,
    completed: currentStep,
    sections: {
      basic: currentStep >= 1,
      tax: currentStep >= 2,
      lifestyle: currentStep >= 3
    }
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleComplete = () => {
    // Here you would typically save the profile data
    console.log('Profile data:', profile)
    router.push('/profile')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="mb-8">
          <ProfileProgressBar progress={progress} />
        </div>

        <div className="mb-8">
          {currentStep === 0 && (
            <BasicInfoForm
              profile={profile}
              onUpdate={setProfile}
            />
          )}
          {currentStep === 1 && (
            <TaxPreferencesForm
              profile={profile}
              onUpdate={setProfile}
            />
          )}
          {currentStep === 2 && (
            <LifestyleForm
              profile={profile}
              onUpdate={setProfile}
            />
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete}>
              Complete
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
} 