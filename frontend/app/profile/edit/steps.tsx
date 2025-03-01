'use client'

import { ProgressSteps } from "@/components/progress-steps"
import { User, Wallet, MapPin, Users, Heart } from "lucide-react"

const FORM_STEPS = [
  { id: "personal", icon: <User className="h-2.5 w-2.5" /> },
  { id: "financial", icon: <Wallet className="h-2.5 w-2.5" /> },
  { id: "residency", icon: <MapPin className="h-2.5 w-2.5" /> },
  { id: "dependents", icon: <Users className="h-2.5 w-2.5" /> },
  { id: "partner", icon: <Heart className="h-2.5 w-2.5" />, optional: true }
]

interface StepsProps {
  currentStep: number
  onStepClick: (index: number) => void
}

export function Steps({ currentStep, onStepClick }: StepsProps) {
  return (
    <ProgressSteps
      steps={FORM_STEPS}
      currentStep={currentStep}
      onStepClick={onStepClick}
    />
  )
} 