"use client"

import { useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, MapPin, Languages, Info } from "lucide-react"
import { useFormStore } from "@/lib/stores"
import { getLanguages } from "@/lib/utils/country-utils"
import { SectionHint } from "@/components/ui/section-hint"

interface DestinationProps {
  onComplete: () => void
}

// Full country dataset copied from the Streamlit project
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import countryInfo from "@/data/country_info.json"

type CountryEntry = {
  name: string
  regions: string[]
}

const COUNTRIES: CountryEntry[] = Object.entries(
  countryInfo as Record<
    string,
    { regions?: string[] | Record<string, any> }
  >
).map(([name, info]) => ({
  name,
  regions: Array.isArray(info.regions)
    ? info.regions
    : info.regions
    ? Object.keys(info.regions)
    : [],
}))

export function Destination({ onComplete }: DestinationProps) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  
  // Use correct data structure matching Streamlit
  const selectedCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const selectedRegion = getFormData("residencyIntentions.destinationCountry.region") ?? ""

  // Component lifecycle tracking
  useEffect(() => {
    // Component mounted
    return () => {
      // Component unmounted - cleanup if needed
    }
  }, [])

  const handleCountryChange = (countryCode: string) => {
    if (!countryCode || countryCode.trim() === "") return
    
    updateFormData("residencyIntentions.destinationCountry.country", countryCode)
    updateFormData("residencyIntentions.destinationCountry.region", "") // Clear region when country changes
  }

  const handleRegionChange = (region: string) => {
    if (!region || region.trim() === "") return
    
    updateFormData("residencyIntentions.destinationCountry.region", region)
  }

  const handleContinue = () => {
    if (!selectedCountry || selectedCountry.trim() === "") {
      return
    }
    
    // Check if country has regions
    const countryData = COUNTRIES.find(c => c.name === selectedCountry)
    const hasRegions = countryData?.regions && countryData.regions.length > 0
    
    // If country has regions, require region selection
    if (hasRegions && (!selectedRegion || selectedRegion.trim() === "")) {
      return
    }
    
    // For countries without regions, clear any saved region
    if (!hasRegions) {
      updateFormData("residencyIntentions.destinationCountry.region", "")
    }
    
    markSectionComplete("destination")
    onComplete()
  }

  const selectedCountryData = useMemo(() => {
    return COUNTRIES.find((c) => c.name === selectedCountry)
  }, [selectedCountry])

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Desired Destination</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the country and region you plan to relocate to
        </p>
      </div>

      <SectionHint title="About this section">
        Choosing a destination country and region allows the questionnaire to tailor subsequent tax, residency, and language questions to local rules—many inputs later on depend on this choice.
      </SectionHint>

      {/* Country Selection Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            Destination Country
          </CardTitle>
          <p className="text-sm text-muted-foreground">Enter the country you plan to relocate to</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Destination country *</Label>
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Selection */}
            {selectedCountry && (
              <>
                {selectedCountryData?.regions && selectedCountryData.regions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Region *</Label>
                      
                      {/* Region importance explanation */}
                      <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                Why is the region selection important?
                              </h4>
                              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                <p>• Visa quotas, processing times and special programs can be region-specific</p>
                                <p>• Tax rates, incentives or reporting rules sometimes differ by region</p>
                                <p>• Labour-market shortage lists and investment zones are often regional</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Select 
                        value={selectedRegion} 
                        onValueChange={handleRegionChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Choose a province/state/region if relevant, or 'I don't know yet'`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="I don't know yet">I don't know yet</SelectItem>
                          {selectedCountryData.regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        ✅ No region-specific visa or tax rules—skip region selection for this country.
                      </p>
                    </div>
                  </div>
                )}</>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            <Button
              disabled={(() => {
                if (!selectedCountry) return true
                const countryData = COUNTRIES.find(c => c.name === selectedCountry)
                const hasRegions = countryData?.regions && countryData.regions.length > 0
                return hasRegions ? !selectedRegion : false
              })()}
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Continue to Personal Information
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Selected Destination Display */}
      {selectedCountry && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <MapPin className="w-6 h-6 text-green-600" />
              Your Destination
            </CardTitle>
            <p className="text-sm text-muted-foreground">Selected destination for your relocation</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {selectedCountryData?.regions && selectedCountryData.regions.length > 0 && selectedRegion && selectedRegion !== "I don't know yet"
                    ? `${selectedRegion}, ${selectedCountryData?.name}`
                    : selectedCountryData?.name
                  }
                </h3>
                {(() => {
                  const langs = getLanguages(selectedCountry, selectedRegion || "")
                  if (langs.length === 0) return null
                  return (
                    <p className="text-sm mt-1 flex items-center gap-1 text-muted-foreground">
                      <Languages className="w-4 h-4" /> Dominant languages: {langs.join(", ")}
                    </p>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}




    </div>
  )
} 