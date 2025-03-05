'use client'

import { AnalysisOverviewCard } from "./analysis-overview-card"

interface TaxOverviewCardProps {
  taxBurden: number
  taxSavings: number
}

export function TaxOverviewCard({ taxBurden, taxSavings }: TaxOverviewCardProps) {
  // Convert tax savings to a score between 0-100
  const taxScore = Math.min(100, Math.max(0, (taxSavings / taxBurden) * 100 + 50))
  
  return (
    <AnalysisOverviewCard
      title="Taxes"
      score={taxScore}
      scoreVariant="tax"
    >
      <div className="flex justify-between">
        <span>Tax Savings:</span>
        <span className="text-green-700">+${taxSavings}K/y</span>
      </div>
      <div className="mt-2 text-center text-muted-foreground/70 italic">
        Consult with a tax advisor
      </div>
    </AnalysisOverviewCard>
  )
} 