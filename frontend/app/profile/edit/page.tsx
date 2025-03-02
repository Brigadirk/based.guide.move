'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Steps } from "./steps"
import { PersonalInfoForm } from "./steps/personal-info-form"
import { FinancialInfoForm } from "./steps/financial-info-form"
import { ResidencyIntentionsForm } from "./steps/residency-intentions-form"
import { FamilyForm } from "./steps/family-form"
import { Profile } from "@/types/profile"
import { validateProfile, getStepStatus, StepValidation } from "@/lib/profile-validation"
import { AlertTriangle } from "lucide-react"

const STEPS = [
  { id: "personal", title: "Personal Information", component: PersonalInfoForm },
  { id: "financial", title: "Financial Information", component: FinancialInfoForm },
  { id: "residency", title: "Residency Intentions", component: ResidencyIntentionsForm },
  { id: "family", title: "Family Information", component: FamilyForm }
]

const hasMinimumRequiredInfo = (profile: Partial<Profile>) => {
  const validation = validateProfile(profile)
  return (
    validation.personal.isValid &&
    validation.financial.isValid &&
    validation.residency.isValid
  )
}

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Partial<Profile>>(user?.profile || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validation, setValidation] = useState<Record<string, StepValidation>>(() => ({
    personal: { isValid: false, errors: [], warnings: [] },
    financial: { isValid: false, errors: [], warnings: [] },
    residency: { isValid: false, errors: [], warnings: [] },
    family: { isValid: false, errors: [], warnings: [] }
  }))

  useEffect(() => {
    const result = validateProfile(profile)
    if (result) {
      setValidation(result)
    }
  }, [profile])

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
    if (!hasMinimumRequiredInfo(profile)) {
      toast.error("Please complete all required information before submitting")
      return
    }

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

  const getStepValidationStatus = (stepIndex: number) => {
    const stepId = STEPS[stepIndex].id as keyof ReturnType<typeof validateProfile>
    if (!validation) return "incomplete"
    return validation[stepId] ? getStepStatus(validation[stepId]) : "incomplete"
  }

  const getCurrentStepValidation = () => {
    const stepId = STEPS[currentStep].id as keyof ReturnType<typeof validateProfile>
    return validation[stepId]
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
            onStepClick={setCurrentStep}
            stepStatuses={STEPS.map((_, index) => getStepValidationStatus(index))}
          />
        </div>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              {STEPS[currentStep].title}
            </h2>
          </div>

          {!getCurrentStepValidation()?.isValid && (
            <div className="mb-6 flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/5 rounded-md">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Required Information Missing</p>
                <p className="mt-1 text-muted-foreground">Please fill in all required fields in this section for accurate recommendations.</p>
              </div>
            </div>
          )}

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