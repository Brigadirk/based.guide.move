import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
  id: string
  icon: React.ReactNode
  optional?: boolean
  completed?: boolean
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep?: number
  onStepClick?: (index: number) => void
}

export function ProgressSteps({ 
  steps, 
  currentStep = -1, 
  onStepClick
}: ProgressStepsProps) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-2.5 w-full h-0.5 bg-muted">
        <div
          className="absolute left-0 h-full bg-primary transition-all duration-500"
          style={{ 
            width: `${currentStep === -1 
              ? (steps.filter(s => s.completed).length / (steps.length - 1)) * 100
              : (currentStep / (steps.length - 1)) * 100}%` 
          }}
        />
      </div>
      <ol className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isComplete = currentStep === -1 ? step.completed : index < currentStep
          const isCurrent = currentStep === -1 ? false : index === currentStep
          
          return (
            <li key={step.id}>
              <button
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  isComplete ? "bg-primary text-primary-foreground" : 
                  isCurrent ? "bg-primary text-primary-foreground" :
                  "bg-muted"
                )}
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 flex items-center justify-center">
                    {step.icon}
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
} 