'use client'

import { AnalysisOverviewCard } from "./analysis-overview-card"

interface LifestyleOverviewCardProps {
  matchLevel: string
  score?: number
}

export function LifestyleOverviewCard({ matchLevel, score = 80 }: LifestyleOverviewCardProps) {
  return (
    <AnalysisOverviewCard
      title="Lifestyle Match"
      score={score}
      scoreVariant="lifestyle"
    >
      <div className="flex justify-between">
        <span>Match Level:</span>
        <span>{matchLevel}</span>
      </div>
      <div className="mt-2 text-center text-muted-foreground/70 italic">
        Join expat groups
      </div>
    </AnalysisOverviewCard>
  )
} 