'use client'

import { ProgressSteps } from "@/components/progress-steps"
import { User, Wallet, MapPin, Users, Heart } from "lucide-react"

const FORM_STEPS = [
  { id: "personal", icon: <User className="h-2.5 w-2.5" /> },
  { id: "financial", icon: <Wallet className="h-2.5 w-2.5" /> },
  { id: "residency", icon: <MapPin className="h-2.5 w-2.5" /> },
  { id: "family", icon: <Users className="h-2.5 w-2.5" /> }
]

interface StepsProps {
  currentStep: number
  onStepClick: (index: number) => void
  stepStatuses: Array<"incomplete" | "complete" | "error" | "warning">
}

export function Steps({ currentStep, onStepClick, stepStatuses }: StepsProps) {
  return (
    <ProgressSteps
      steps={FORM_STEPS}
      currentStep={currentStep}
      onStepClick={onStepClick}
      stepStatuses={stepStatuses}
    />
  )
} 