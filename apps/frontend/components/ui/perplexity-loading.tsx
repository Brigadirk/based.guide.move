"use client"

import { useState, useEffect } from "react"
import { Brain, Sparkles, Zap, Search, BookOpen, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PerplexityLoadingProps {
  isLoading: boolean
  loadingText?: string
  className?: string
}

const loadingSteps = [
  { icon: Search, text: "Analyzing your information...", duration: 2000 },
  { icon: Brain, text: "Processing with AI...", duration: 2500 },
  { icon: BookOpen, text: "Researching regulations...", duration: 2000 },
  { icon: Target, text: "Generating insights...", duration: 1500 },
  { icon: Sparkles, text: "Finalizing results...", duration: 1000 }
]

export function PerplexityLoading({ 
  isLoading, 
  loadingText = "Generating Analysis...",
  className = "" 
}: PerplexityLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      setStepProgress(0)
      return
    }

    let stepTimer: NodeJS.Timeout
    let stepProgressTimer: NodeJS.Timeout

    const startStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        // Keep animating on the last step until loading completes
        setCurrentStep(loadingSteps.length - 1)
        return
      }

      setCurrentStep(stepIndex)
      setStepProgress(0)
      
      const step = loadingSteps[stepIndex]
      const stepDuration = step.duration
      const stepProgressIncrement = 100 / (stepDuration / 50)

      // Animate step progress
      stepProgressTimer = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = prev + stepProgressIncrement
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 50)

      // Move to next step
      stepTimer = setTimeout(() => {
        clearInterval(stepProgressTimer)
        startStep(stepIndex + 1)
      }, stepDuration)
    }

    startStep(0)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(stepProgressTimer)
    }
  }, [isLoading])

  if (!isLoading) return null

  const CurrentIcon = loadingSteps[currentStep]?.icon || Sparkles

  return (
    <Card className={`border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 ${className}`}>
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Main loading header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="relative">
                {/* Pulsing background circle */}
                <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-purple-400 rounded-full animate-pulse opacity-30"></div>
                
                {/* Main icon */}
                <div className="relative bg-purple-600 text-white p-4 rounded-full">
                  <Brain className="w-8 h-8 animate-pulse" />
                </div>
                
                {/* Floating sparkles */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="absolute -bottom-1 -left-1">
                  <Zap className="w-4 h-4 text-blue-400 animate-bounce" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
              {loadingText}
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-300">
              Powered by Perplexity AI
            </p>
          </div>

          {/* Subtext to indicate ongoing work without specific percentage */}
          <div className="text-center text-xs text-purple-600 dark:text-purple-400">Working on your analysis…</div>

          {/* Current step indicator */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="relative">
              <CurrentIcon className="w-5 h-5 text-purple-600 animate-pulse" />
              {/* Step progress ring */}
              <div 
                className="absolute inset-0 border-2 border-purple-300 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, rgb(147 51 234) ${stepProgress * 3.6}deg, transparent ${stepProgress * 3.6}deg)`
                }}
              />
            </div>
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {loadingSteps[currentStep]?.text || "Processing..."}
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2">
            {loadingSteps.map((step, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-purple-600 scale-110' 
                    : index === currentStep 
                    ? 'bg-purple-400 scale-125 animate-pulse' 
                    : 'bg-purple-200 dark:bg-purple-800'
                }`}
              />
            ))}
          </div>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
