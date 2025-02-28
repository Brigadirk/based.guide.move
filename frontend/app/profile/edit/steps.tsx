'use client'

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: string
  title: string
  optional?: boolean
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-2.5 w-full h-0.5 bg-muted">
        <div
          className="absolute left-0 h-full bg-primary transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <ol className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          
          return (
            <li key={step.id} className="flex flex-col items-center">
              <button
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                  isComplete ? "bg-primary text-primary-foreground" : 
                  isCurrent ? "bg-primary text-primary-foreground" :
                  "bg-muted"
                )}
                onClick={() => onStepClick(index)}
              >
                {isComplete ? <Check className="h-3 w-3" /> : index + 1}
              </button>
              <span className={cn(
                "mt-2 text-sm font-medium",
                (isComplete || isCurrent) ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
                {step.optional && (
                  <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
} 