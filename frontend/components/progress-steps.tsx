'use client'

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

/**
 * Common interface for step data used in both interactive and non-interactive progress components
 */
export interface Step {
  id: string
  icon: React.ReactNode
  optional?: boolean
}

/**
 * Props for the fully interactive stepper component used in multi-step forms
 */
interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  onStepClick: (index: number) => void
  stepStatuses: Array<"incomplete" | "complete" | "error" | "warning">
}

/**
 * Props for a simpler, non-interactive progress display
 */
interface SimpleProgressProps {
  steps: (Step & { completed: boolean })[]
}

/**
 * ProgressSteps - An interactive stepper component for multi-step forms
 * Used in scenarios where users need to navigate between different steps,
 * like in the profile edit wizard.
 */
export function ProgressSteps({ steps, currentStep, onStepClick, stepStatuses }: ProgressStepsProps) {
  return (
    <div className="relative">
      <div
        className="absolute left-0 top-[15px] h-0.5 w-full bg-muted"
        style={{
          clipPath: "inset(0 0.5px)", // This prevents the line from sticking out
        }}
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: `${((currentStep) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      <ul className="relative z-10 flex w-full justify-between">
        {steps.map((step, index) => {
          const status = stepStatuses[index]
          const isActive = index === currentStep
          const isPast = index < currentStep
          const hasError = status === "error" || status === "warning"

          return (
            <li
              key={step.id}
              className="flex items-center cursor-pointer"
              onClick={() => onStepClick(index)}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  // Past or active steps always have primary background
                  (isPast || isActive) && "bg-primary",
                  // Future steps have muted background
                  (!isActive && !isPast) && "bg-muted"
                )}
              >
                <div className={cn(
                  // Show red icon if there are errors, regardless of step state
                  hasError && "text-destructive",
                  // For steps without errors:
                  !hasError && (isPast || isActive) && "text-primary-foreground", // White icon on dark background
                  !hasError && !isPast && !isActive && "text-muted-foreground", // Muted icon on future steps
                )}>
                  {isPast && status === "complete" ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * SimpleProgress - A non-interactive progress display
 * Used for showing completion status, like in the profile overview page
 * where we just want to display progress without any interaction.
 */
export function SimpleProgress({ steps }: SimpleProgressProps) {
  return (
    <div className="relative">
      <div
        className="absolute left-0 top-[15px] h-0.5 w-full bg-muted"
        style={{
          clipPath: "inset(0 0.5px)",
        }}
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      <ul className="relative z-10 flex w-full justify-between">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-center"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                step.completed ? "bg-primary" : "bg-muted"
              )}
            >
              <div className={cn(
                step.completed ? "text-primary-foreground" : "text-muted-foreground",
              )}>
                {step.completed ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 