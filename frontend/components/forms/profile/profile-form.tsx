'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Steps } from "@/components/features/profile/steps"
import { PersonalInfoForm } from "@/components/forms/profile/personal-info-form"
import { FinancialInfoForm } from "@/components/forms/profile/financial-info-form"
import { FamilyForm } from "@/components/forms/profile/family-form"
import { Profile } from "@/types/profile"
import { validateProfile, getStepStatus, StepValidation, ValidationStatus } from "@/lib/profile-validation"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ProfileFormProps {
  profile?: Partial<Profile>
  onSubmit: (profile: Partial<Profile>) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
}

const STEPS = [
  { id: "basic", title: "Basic Information", component: PersonalInfoForm },
  { id: "financial", title: "Financial Information", component: FinancialInfoForm },
  { id: "family", title: "Family Information", component: FamilyForm }
]

const hasMinimumRequiredInfo = (profile: Partial<Profile>) => {
  const validation = validateProfile(profile)
  return validation.isValid
}

export function ProfileForm({ profile = {}, onSubmit, submitLabel = "Save Profile", isSubmitting = false }: ProfileFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<Profile>>({
    nickname: profile.nickname || "",
    avatar: profile.avatar || "",
    personalInformation: profile.personalInformation || {
      dateOfBirth: "",
      nationalities: [{ country: "" }],
      maritalStatus: "Single",
      currentResidency: {
        country: "",
        status: "Citizen"
      }
    },
    financialInformation: profile.financialInformation || {
      incomeSources: [],
      assets: [],
      liabilities: []
    },
    dependents: profile.dependents || []
  })

  const [validation, setValidation] = useState<ValidationStatus>(() => validateProfile(formData))

  useEffect(() => {
    setValidation(validateProfile(formData))
  }, [formData])

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
    if (!hasMinimumRequiredInfo(formData)) {
      toast.error("Please complete all required information before submitting")
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error("Failed to save profile. Please try again.")
    }
  }

  const getStepValidationStatus = (stepIndex: number) => {
    const stepId = STEPS[stepIndex].id as keyof typeof validation.sections
    if (!validation) return "incomplete"
    return validation.sections[stepId] ? "complete" : validation.warnings.length > 0 ? "warning" : "incomplete"
  }

  const getCurrentStepValidation = () => {
    const stepId = STEPS[currentStep].id as keyof typeof validation.sections
    return {
      isValid: validation.sections[stepId],
      errors: validation.errors,
      warnings: validation.warnings
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

          {currentStep === 0 && (
            <div className="mb-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Enter a nickname for this profile"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL (optional)</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.avatar} alt={formData.nickname} />
                    <AvatarFallback>
                      {formData.nickname ? formData.nickname.slice(0, 2).toUpperCase() : "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="Enter an avatar URL (optional)"
                  />
                </div>
              </div>
            </div>
          )}

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
            data={formData}
            onUpdate={(updatedData) => {
              setFormData(prev => ({ ...prev, ...updatedData }))
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
              {currentStep === STEPS.length - 1 ? submitLabel : "Continue"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
} 