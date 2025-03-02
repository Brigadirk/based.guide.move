'use client'

import { cn } from "@/lib/utils"

interface VisaScoreProps {
  score: number
  showLabel?: boolean
  className?: string
  labelClassName?: string
  scoreClassName?: string
  variant?: 'default' | 'white'
}

const VISA_LABELS = {
  1: 'Impossible',
  2: 'Very Hard',
  3: 'Hard', 
  4: 'Difficult',
  5: 'Medium',
  6: 'Doable',
  7: 'Easy',
  8: 'Very Easy',
  9: 'Simple',
  10: 'Open Border'
} as const

// Normalize score to 1-10 scale
function normalizeScore(score: number): number {
  // First ensure the input is between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score))
  // Convert to 1-10 scale
  return Math.max(1, Math.min(10, Math.round(clampedScore / 10)))
}

export function VisaScore({ 
  score: rawScore, 
  showLabel = true, 
  className,
  labelClassName,
  scoreClassName,
  variant = 'default'
}: VisaScoreProps) {
  // Normalize the score to 1-10 scale
  const score = normalizeScore(rawScore)
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-md px-2.5 py-0.5 text-sm font-medium",
      variant === 'default' 
        ? "bg-background border border-border text-foreground" 
        : "bg-black/80 text-white",
      className
    )}>
      <span className={cn(
        "font-semibold tabular-nums",
        variant === 'default' ? "text-foreground" : "text-white",
        scoreClassName
      )}>
        {score}
      </span>
      {showLabel && (
        <span className={cn(
          "font-medium",
          variant === 'default' ? "text-foreground/80" : "text-white/90",
          labelClassName
        )}>
          {VISA_LABELS[score as keyof typeof VISA_LABELS]}
        </span>
      )}
    </div>
  )
} 