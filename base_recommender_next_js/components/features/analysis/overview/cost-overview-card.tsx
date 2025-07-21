'use client'

import { AnalysisOverviewCard } from "./analysis-overview-card"

interface CostOverviewCardProps {
  costDifference: string
  score?: number
}

export function CostOverviewCard({ costDifference, score = 75 }: CostOverviewCardProps) {
  return (
    <AnalysisOverviewCard
      title="Cost of Living"
      score={score}
      scoreVariant="lifestyle"
    >
      <div className="flex justify-between">
        <span>Cost Difference:</span>
        <span>{costDifference}</span>
      </div>
      <div className="mt-2 text-center text-muted-foreground/70 italic">
        Research housing costs
      </div>
    </AnalysisOverviewCard>
  )
} 