import { ScoreBadge, ScoreVariant } from "@/components/ui/score-badge"
import { cn } from "@/lib/utils"

interface ScoreDisplayProps {
  variant: ScoreVariant
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showScore?: boolean
  className?: string
}

export function ScoreDisplay({
  variant,
  score,
  size = 'md',
  showLabel = true,
  showScore = true,
  className
}: ScoreDisplayProps) {
  return (
    <div className={cn(
      "flex items-center gap-2",
      size === 'sm' && "text-sm",
      size === 'lg' && "text-lg",
      className
    )}>
      <ScoreBadge
        variant={variant}
        score={score}
        showLabel={showLabel}
        showScore={showScore}
        className={cn(
          size === 'sm' && "text-xs",
          size === 'lg' && "text-base"
        )}
      />
    </div>
  )
}

// Compound components for specific use cases
export function GlobalScore(props: Omit<ScoreDisplayProps, 'variant'>) {
  return <ScoreDisplay variant="global" {...props} />
}

export function PersonalScore(props: Omit<ScoreDisplayProps, 'variant'>) {
  return <ScoreDisplay variant="personal" {...props} />
}

export function TaxScore(props: Omit<ScoreDisplayProps, 'variant'>) {
  return <ScoreDisplay variant="tax" {...props} />
}

export function VisaScore(props: Omit<ScoreDisplayProps, 'variant'>) {
  return <ScoreDisplay variant="visa" {...props} />
}

export function ProfileScore(props: Omit<ScoreDisplayProps, 'variant'>) {
  return <ScoreDisplay variant="profile" {...props} />
} 