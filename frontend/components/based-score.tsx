'use client'

import { cn } from "@/lib/utils"

interface BasedScoreProps {
  score: number
  showLabel?: boolean
  className?: string
  labelClassName?: string
  scoreClassName?: string
  variant?: 'default' | 'white'
}

const BASED_LABELS = {
  1: 'Fake and Gay',
  2: 'Fake',
  3: 'Bad',
  4: 'Weak',
  5: 'Meh',
  6: 'Alright',
  7: 'Good',
  8: 'Very Good',
  9: 'Based',
  10: 'Unfathomably Based'
} as const

// Normalize score to 1-10 scale
// Assuming tax scores typically range from 0-100
function normalizeScore(score: number): number {
  // First ensure the input is between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score))
  // Convert to 1-10 scale
  return Math.max(1, Math.min(10, Math.round(clampedScore / 10)))
}

export function BasedScore({ 
  score: rawScore, 
  showLabel = true, 
  className,
  labelClassName,
  scoreClassName,
  variant = 'default'
}: BasedScoreProps) {
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
          {BASED_LABELS[score as keyof typeof BASED_LABELS]}
        </span>
      )}
    </div>
  )
} 