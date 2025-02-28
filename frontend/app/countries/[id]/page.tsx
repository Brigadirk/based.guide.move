import { getCountry } from "@/lib/server-api"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisCtaButton } from "@/components/analysis-cta-button"
import { CountryScores } from "@/components/country-scores"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { formatNumber, getCountryFlagUrl } from "@/lib/utils"
import Image from "next/image"
import { CountryDetails } from "@/types/api"

const countryImageMap: Record<string, string> = {
  'sv': 'el-salvador',
  'nl': 'netherlands',
  'pt': 'portugal',
  'ch': 'switzerland'
}

interface CountryPageProps {
  params: {
    id: string
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { id } = await params
  const country = await getCountry(id) as CountryDetails
  // Mock hasAnalysis - in real app this would come from user session/API
  const hasAnalysis = false
  
  if (!country) {
    notFound()
  }

  const imageName = countryImageMap[id] || id

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden z-10">
        <Image
          src={`/data/images/countries/${imageName}.png`}
          alt={`${country.name} landscape`}
          fill
          className="object-cover"
          priority
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        {/* Sticky Header Section */}
        <div className="sticky top-14 bg-background border-b">
          <div className="max-w-[1400px] mx-auto">
            <Card className="rounded-none shadow-none border-0">
              <CardContent className="py-4 px-4 md:px-6">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-6 relative">
                        <Image
                          src={getCountryFlagUrl(id)}
                          alt={`${country.name} flag`}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      <h1 className="text-2xl font-bold">{country.name}</h1>
                    </div>
                    <div className="flex gap-6 border-l pl-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Based</div>
                        <div className="text-xl font-bold">{country.taxScore}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Visa</div>
                        <div className="text-xl font-bold">{country.visaAccessibility}</div>
                      </div>
                    </div>
                  </div>
                  
                  {!hasAnalysis && (
                    <div className="ml-auto">
                      <AnalysisCtaButton />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tab List */}
            <div className="bg-card border-t">
              <div className="overflow-x-auto">
                <div className="px-4 md:px-6">
                  <TabsList className="w-full justify-start inline-flex h-12">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="taxes">Taxes</TabsTrigger>
                    <TabsTrigger value="visa">Visa & Immigration</TabsTrigger>
                    <TabsTrigger value="living">Living</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 space-y-8">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-8">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-8">
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
          </TabsContent>

          {/* Visa Tab */}
          <TabsContent value="visa" className="space-y-8">
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
          </TabsContent>

          {/* Living Tab */}
          <TabsContent value="living" className="space-y-8">
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
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-8">
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 