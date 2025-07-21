'use client'

import { AnalysisOverviewCard } from "./analysis-overview-card"

interface TimelineOverviewCardProps {
  feasibility: string
  score?: number
}

export function TimelineOverviewCard({ feasibility, score = 75 }: TimelineOverviewCardProps) {
  return (
    <AnalysisOverviewCard
      title="Timeline"
      score={score}
      scoreVariant="global"
    >
      <div className="flex justify-between">
        <span>Feasibility:</span>
        <span>{feasibility}</span>
      </div>
      <div className="mt-2 text-center text-muted-foreground/70 italic">
        Plan your move carefully
      </div>
    </AnalysisOverviewCard>
  )
} 