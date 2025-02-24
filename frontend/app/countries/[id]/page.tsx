import { getCountry } from "@/lib/api"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { AnalysisCtaButton } from "@/components/analysis-cta-button"

interface CountryPageProps {
  params: {
    id: string
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const country = await getCountry(params.id)
  // Mock hasAnalysis - in real app this would come from user session/API
  const hasAnalysis = false
  
  if (!country) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <h1 className="text-4xl font-bold flex-1">{country.name}</h1>
          {!hasAnalysis && (
            <Card className="w-full md:w-auto md:min-w-[300px] p-6">
              <h3 className="font-semibold mb-2">Want a personalized plan?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get a detailed analysis based on your situation
              </p>
              <AnalysisCtaButton fullWidth />
            </Card>
          )}
        </div>
        
        <div className="grid gap-8">
          <section className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Tax Overview</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-muted rounded">
                <div className="text-sm text-muted-foreground">Personal Income Tax</div>
                <div className="font-medium">{country.taxHighlights.personalIncomeTax}</div>
              </div>
              <div className="p-4 bg-muted rounded">
                <div className="text-sm text-muted-foreground">Corporate Tax</div>
                <div className="font-medium">{country.taxHighlights.corporateTax}</div>
              </div>
              <div className="p-4 bg-muted rounded">
                <div className="text-sm text-muted-foreground">VAT Rate</div>
                <div className="font-medium">{country.taxHighlights.vatRate}</div>
              </div>
              <div className="p-4 bg-muted rounded">
                <div className="text-sm text-muted-foreground">Tax Score</div>
                <div className="font-medium">{country.taxScore}/100</div>
              </div>
            </div>
            <div className="prose max-w-none">
              <p>{country.taxDescription}</p>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Living Costs</h2>
            <div className="prose max-w-none">
              <p className="text-xl mb-4">Average monthly living cost: ${country.livingCost}</p>
              <p>{country.livingCostDescription}</p>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Quality of Life</h2>
            <div className="prose max-w-none">
              <p>{country.qualityOfLifeDescription}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 