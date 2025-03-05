import { Country } from "@/types/api"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { AnalysisCtaButton } from "@/components/features/analysis/analysis-cta-button"
import { TaxScore, VisaScore } from "@/components/features/scores/score-display"
import Link from "next/link"
import Image from "next/image"
import { getCountryFlagUrl } from "@/lib/utils"

const countryImageMap: Record<string, string> = {
  'united': 'united-states',
  'netherlands': 'netherlands',
  'portugal': 'portugal',
  'spain': 'spain',
  'switzerland': 'switzerland'
}

interface CountryCardProps {
  country: Country
  hasAnalysis?: boolean
}

export function CountryCard({ country, hasAnalysis = false }: CountryCardProps) {
  const imageId = countryImageMap[country.id] || country.id

  return (
    <Card className="hover:bg-accent transition-colors flex flex-col overflow-hidden">
      <Link href={`/countries/${country.id}`} className="flex-1">
        <div className="relative w-full h-48">
          <Image
            src={`/data/images/countries/${imageId}.jpg`}
            alt={`${country.name} Flag`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <TaxScore 
              score={country.taxScore} 
              size="sm"
              showLabel={false}
              className="backdrop-blur-sm"
            />
            {country.visaAccessibility && (
              <VisaScore
                score={country.visaAccessibility}
                size="sm"
                showLabel={false}
                className="backdrop-blur-sm"
              />
            )}
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-6 h-4 relative">
              <Image
                src={getCountryFlagUrl(country.id)}
                alt={`${country.name} flag`}
                fill
                className="object-contain rounded"
              />
            </div>
            {country.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Living Cost</span>
              <span className="font-medium">${country.livingCost}/mo</span>
            </div>
            <div className="space-y-2 mt-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Income Tax: </span>
                {country.taxHighlights.personalIncomeTax}
              </div>
              <div>
                <span className="font-medium">Corporate Tax: </span>
                {country.taxHighlights.corporateTax}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
      {!hasAnalysis && (
        <CardFooter className="mt-auto pt-4">
          <AnalysisCtaButton variant="secondary" fullWidth />
        </CardFooter>
      )}
    </Card>
  )
} 