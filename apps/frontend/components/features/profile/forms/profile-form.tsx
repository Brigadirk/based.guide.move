'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Steps } from "@/components/features/profile/steps"
import { PersonalInfoForm } from "@/components/features/profile/forms/personal-info-form"
import { FinancialInfoForm } from "@/components/features/profile/forms/financial-info-form"
import { FamilyForm } from "@/components/features/profile/forms/family-form"
import { Profile } from "@/types/profile"
import { validateProfile, ValidationStatus } from "@/lib/profile-validation"
import { AlertTriangle } from "lucide-react"

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

export function ProfileForm({ profile = {}, onSubmit, submitLabel = "Save Profile", isSubmitting = false }: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<Profile>>({
    nickname: profile.nickname || "",
    avatar: profile.avatar || "",
    personalInformation: profile.personalInformation || {
      dateOfBirth: "",
      nationalities: [{ country: "", willingToRenounce: false }],
      maritalStatus: "Single",
      currentResidency: {
        country: "",
        status: "Citizen",
        duration: ""
      },
      firstName: "",
      lastName: "",
      hasPartner: false,
      dependents: []
    },
    financialInformation: profile.financialInformation || {
      incomeSituation: "current_income",
      incomeSources: [],
      expectedEmployment: [],
      totalWealth: {
        currency: "USD",
        total: 0,
        primaryResidence: 0
      },
      capitalGains: {
        futureSales: []
      },
      assets: [],
      liabilities: []
    },
    dependents: profile.dependents || []
  })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting profile:', error)
    }
  }

  const getCurrentStepValidation = () => {
    const validation = validateProfile(formData)
    const stepId = STEPS[currentStep].id
    return validation.sections?.[stepId] || { isValid: true, errors: [], warnings: [] }
  }

  const CurrentStepComponent = STEPS[currentStep].component

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
            stepStatuses={STEPS.map(() => getCurrentStepValidation() ? "complete" : "incomplete")}
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

          {!getCurrentStepValidation() && (
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