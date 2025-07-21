'use client'

import { AnalysisOverviewCard } from "./analysis-overview-card"

interface VisaOverviewCardProps {
  score: number
  visaName: string
}

export function VisaOverviewCard({ score, visaName }: VisaOverviewCardProps) {
  return (
    <AnalysisOverviewCard
      title="Visa Eligibility"
      score={score}
    >
      <div className="flex justify-between">
        <span>Most eligible visa:</span>
        <span>{visaName}</span>
      </div>
      <div className="mt-2 text-center text-muted-foreground/70 italic">
        Work with a visa specialist
      </div>
    </AnalysisOverviewCard>
  )
} 