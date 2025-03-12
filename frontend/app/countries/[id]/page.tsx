import { getCountry } from "@/lib/server-api"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisCtaButton } from "@/components/features/analysis/analysis-cta-button"
import { CountryScores } from "@/components/features/country/country-scores"
import { Separator } from "@/components/ui/separator"
import { formatNumber, getCountryFlagUrl } from "@/lib/utils"
import Image from "next/image"
import { CountryDetails } from "@/types/api"
import { TaxScore, VisaScore } from "@/components/features/scores/score-display"
import { ScrollableContainer } from "@/components/ui/scrollable-container"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"
import { CountryFlag } from "@/components/features/country/CountryFlag"

const countryImageMap: Record<string, string> = {
  'united': 'united-states',
  'netherlands': 'netherlands',
  'portugal': 'portugal',
  'spain': 'spain',
  'switzerland': 'switzerland',
  'el-salvador': 'el-salvador'
}

interface CountryPageProps {
  params: {
    id: string
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const country = await getCountry(params.id) as CountryDetails
  // Mock hasAnalysis - in real app this would come from user session/API
  const hasAnalysis = false
  
  if (!country) {
    notFound()
  }

  // Use the same image mapping logic as the card
  const imageId = countryImageMap[country.id] || country.id

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Tax Score</div>
                    <TaxScore 
                      score={country.taxScore}
                      size="lg"
                      showLabel={false}
                    />
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Visa Access</div>
                    <VisaScore
                      score={country.visaAccessibility}
                      size="lg"
                      showLabel={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Population</div>
                    <div className="font-medium">{formatNumber(country.population)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">GDP per capita</div>
                    <div className="font-medium">${formatNumber(country.gdpPerCapita)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Currency</div>
                    <div className="font-medium">{country.overview.currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tax Authority</div>
                    <div className="font-medium">{country.overview.tax_authority}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Major Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {country.majorCities.map((city) => (
                    <div key={city.name} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Pop. {formatNumber(city.population)}
                        </div>
                      </div>
                      <div className="text-sm">
                        Based Score: {city.based_score}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality of Life</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{country.qualityOfLifeDescription}</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      value: "taxes",
      label: "Taxes",
      content: (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Tax Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Personal Income Tax</div>
                  <div className="font-medium">{country.taxHighlights.personalIncomeTax}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Corporate Tax</div>
                  <div className="font-medium">{country.taxHighlights.corporateTax}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">VAT Rate</div>
                  <div className="font-medium">{country.taxHighlights.vatRate}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tax Residency Rules</h4>
                <p className="text-muted-foreground">{country.overview.tax_residency_rules}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tax Year</h4>
                <p className="text-muted-foreground">{country.overview.tax_year}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Personal Income Tax Brackets</h4>
                <div className="space-y-2">
                  {country.tax_rates.personal_income_tax.rate.map((bracket, index) => (
                    <div key={index} className="flex justify-between p-2 bg-muted rounded">
                      <span>{bracket.bracket}</span>
                      <span className="font-medium">{bracket.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Corporate Taxation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Corporate Tax Rate</div>
                  <div className="font-medium">{country.tax_rates.corporate_tax.rate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Small Business Rate</div>
                  <div className="font-medium">{country.tax_rates.corporate_tax.small_business_rate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Foreign Income Taxed</div>
                  <div className="font-medium">{country.tax_rates.corporate_tax.foreign_income_taxed ? "Yes" : "No"}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2">Withholding Taxes</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dividends</span>
                      <span>{country.tax_rates.corporate_tax.withholding_taxes.dividends}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Interest</span>
                      <span>{country.tax_rates.corporate_tax.withholding_taxes.interest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Royalties</span>
                      <span>{country.tax_rates.corporate_tax.withholding_taxes.royalties}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>VAT & Other Taxes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Standard VAT Rate</div>
                  <div className="font-medium">{country.tax_rates.vat_gst.rate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Reduced VAT Rate</div>
                  <div className="font-medium">{country.tax_rates.vat_gst.reduced_rate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">VAT Exemptions</div>
                  <div className="font-medium">{country.tax_rates.vat_gst.exemptions}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      value: "visa",
      label: "Visa & Immigration",
      content: (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Digital Nomad Visa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {country.digital_nomad_visa ? (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Available</div>
                    <div className="font-medium">{country.digital_nomad_visa.available ? "Yes" : "No"}</div>
                  </div>
                  {country.digital_nomad_visa.available && (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground">Requirements</div>
                        <div className="font-medium">{country.digital_nomad_visa.requirements}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Tax Benefits</div>
                        <div className="font-medium">{country.digital_nomad_visa.tax_benefits}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">{country.digital_nomad_visa.duration}</div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Digital nomad visa information not available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      value: "living",
      label: "Living",
      content: (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Cost of Living</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Average Monthly Cost</div>
                  <div className="font-medium">${formatNumber(country.livingCost)}</div>
                </div>
                <p className="text-muted-foreground">{country.livingCostDescription}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      value: "business",
      label: "Business",
      content: (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Business Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Currency Exchange Rules</div>
                <div className="font-medium">{country.overview.currency_exchange_rules}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tax Filing Frequency</div>
                <div className="font-medium">{country.overview.tax_filing_frequency}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ]

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden z-10">
        <Image
          src={`/data/images/countries/${imageId}.jpg`}
          alt={`${country.name} landscape`}
          fill
          className="object-cover"
          priority
        />
      </div>

      <Card className="rounded-none shadow-none border-0">
        <CardContent className="py-4 px-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CountryFlag countryCode={country.id} size="md" />
                <h1 className="text-xl font-bold">{country.name}</h1>
              </div>
            </div>
            
            {!hasAnalysis && (
              <div className="w-full">
                <AnalysisCtaButton className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={tabs[0].value} className="w-full">
        <ScrollableContainer className="rounded-lg bg-muted/50">
          <TabsList className="flex space-x-2">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollableContainer>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 