import { Country } from "@/types/api"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { AnalysisCtaButton } from "@/components/analysis-cta-button"
import Link from "next/link"

interface CountryCardProps {
  country: Country
  hasAnalysis?: boolean // Changed from hasGuide to hasAnalysis
}

export function CountryCard({ country, hasAnalysis = false }: CountryCardProps) {
  return (
    <Card className="hover:bg-accent transition-colors flex flex-col">
      <Link href={`/countries/${country.id}`}>
        <CardHeader>
          <CardTitle>{country.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Tax Score</span>
              <span className="font-medium">{country.taxScore}/100</span>
            </div>
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