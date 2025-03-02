import { CountryAnalysis } from "@/types/user"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { getCountryFlagUrl } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

interface AnalysisCardProps {
  analysis: CountryAnalysis
  countryName: string
}

export function AnalysisCard({ analysis, countryName }: AnalysisCardProps) {
  return (
    <Card className="hover:bg-accent transition-colors">
      <Link href={`/analyses/${analysis.countryId}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-6 h-4 relative">
              <Image
                src={getCountryFlagUrl(analysis.countryId)}
                alt={`${countryName} flag`}
                fill
                className="object-contain rounded"
              />
            </div>
            {countryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {analysis.personalTaxRate !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Personal Tax Rate</span>
                  <span className="font-medium">{analysis.personalTaxRate}%</span>
                </div>
              )}
              {analysis.corporateTaxRate !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Corporate Tax Rate</span>
                  <span className="font-medium">{analysis.corporateTaxRate}%</span>
                </div>
              )}
              {analysis.costOfLivingAdjusted !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adjusted Living Cost</span>
                  <span className="font-medium">${analysis.costOfLivingAdjusted}/mo</span>
                </div>
              )}
            </div>
            {analysis.recommendedVisaType && (
              <div className="text-sm">
                <span className="text-muted-foreground">Recommended Visa: </span>
                <span className="font-medium">{analysis.recommendedVisaType}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Analyzed on {formatDate(analysis.createdAt)}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
} 