'use client'

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Steps } from "./steps"
import { PersonalInfoForm } from "./steps/personal-info-form"
import { FinancialInfoForm } from "./steps/financial-info-form"
import { ResidencyIntentionsForm } from "./steps/residency-intentions-form"
import { DependentsForm } from "./steps/dependents-form"
import { PartnerInfoForm } from "./steps/partner-info-form"
import { Profile } from "@/types/profile"

const STEPS = [
  { id: "personal", title: "Personal", component: PersonalInfoForm },
  { id: "financial", title: "Financial", component: FinancialInfoForm },
  { id: "residency", title: "Residency", component: ResidencyIntentionsForm },
  { id: "dependents", title: "Dependents", component: DependentsForm },
  { id: "partner", title: "Partner", component: PartnerInfoForm }
]

const hasMinimumRequiredInfo = (profile: Partial<Profile>) => {
  return Boolean(
    profile.personalInformation?.dateOfBirth &&
    profile.personalInformation?.currentResidency?.country &&
    (profile.financialInformation?.incomeSources?.length ?? 0) > 0 &&
    profile.residencyIntentions?.intendedCountry
  )
}

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Partial<Profile>>(user?.profile || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const CurrentStepComponent = STEPS[currentStep].component

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
      toast.success("Progress saved!")
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await updateProfile(profile as Profile)
      toast.success("Profile updated successfully!")
      
      if (hasMinimumRequiredInfo(profile)) {
        toast.success("Pro Bonobo is now ready to provide personalized recommendations!")
      }
      
      router.push('/profile')
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="p-6">
        <p className="text-muted-foreground">
          Complete your profile to help Mr. Pro Bonobo give you recommendations.
        </p>
      </div>

      <div className="sticky top-14 bg-background z-50 border-b shadow-sm">
        <div className="px-6 py-4">
          <Steps
            currentStep={currentStep}
            onStepClick={(index) => setCurrentStep(index)}
          />
        </div>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <CurrentStepComponent
            data={profile}
            onUpdate={(updatedData) => {
              setProfile(prev => ({ ...prev, ...updatedData }))
            }}
          />

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentStep === STEPS.length - 1 ? "Complete" : "Continue"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
} 