import { CountryAnalysis } from "@/types/user"
import { Card, CardContent } from "@/components/ui/card"
import { AnalysisHeader } from "@/components/features/analysis/analysis-header"
import { AnalysisInput } from "@/components/features/analysis/analysis-input"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AnalysisCardProps {
  analysis: Partial<CountryAnalysis> & {
    id: string
    countryId: string
    createdAt: string
    score: number
    personalTaxRate?: number | null
    costOfLivingAdjusted?: number | null
    recommendedVisaType?: string | null
    originCountry?: {
      id: string
      name: string
    }
    intentions?: {
      duration: string
      workType: string
      income: string
    }
  }
  countryName: string
}

export function AnalysisCard({ analysis, countryName }: AnalysisCardProps) {
  const taxSavings = analysis.personalTaxRate ? (analysis.personalTaxRate - 30) * 1000 : 0
  
  const hasRequiredInputData = analysis.originCountry?.id && 
    analysis.originCountry.name && 
    analysis.countryId &&
    analysis.intentions?.duration &&
    analysis.intentions.workType &&
    analysis.intentions.income

  return (
    <Card className="hover:bg-accent/5 transition-colors">
      <Link href={`/analyses/${analysis.countryId}`} className="block">
        <AnalysisHeader
          analysis={{
            id: analysis.id,
            score: analysis.score,
            createdAt: analysis.createdAt
          }}
          variant="compact"
        />
        
        {hasRequiredInputData && analysis.originCountry && analysis.intentions && (
          <div className="px-4">
            <AnalysisInput
              origin={analysis.originCountry}
              destination={{
                id: analysis.countryId,
                name: countryName
              }}
              intentions={analysis.intentions}
            />
          </div>
        )}
        
        <CardContent className="pt-4">
          <div className="text-center space-y-1">
            <p className={cn(
              "text-2xl font-medium",
              taxSavings >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
            )}>
              {taxSavings >= 0 ? '+' : ''}{Math.abs(taxSavings).toLocaleString()} $/year
            </p>
            <p className="text-muted-foreground">
              {taxSavings >= 0 ? 'Estimated savings' : 'Additional cost'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mt-4 border-t border-border/50 pt-4">
            <div className="text-center">
              <p className="text-xl font-medium">{analysis.personalTaxRate || 0}%</p>
              <p className="text-muted-foreground">Tax Rate</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium">${analysis.costOfLivingAdjusted || 0}/mo</p>
              <p className="text-muted-foreground">Living Cost</p>
            </div>
          </div>

          {analysis.recommendedVisaType && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <span className="text-muted-foreground">Visa:</span>
              <span className="font-medium">{analysis.recommendedVisaType}</span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
} 