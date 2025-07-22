"use client"

import { useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, MapPin, Languages } from "lucide-react"
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
  const { getFormData, updateFormData, formData, isSectionComplete } = useFormStore()
  
    // Use formData.destination directly to avoid race conditions with getFormData
  const selectedCountry = formData.destination?.country || ""
  const selectedRegion = formData.destination?.region || ""

  // Component lifecycle tracking
  useEffect(() => {
    // Component mounted
    return () => {
      // Component unmounted - cleanup if needed
    }
  }, [])

  const handleCountryChange = (countryCode: string) => {
    if (!countryCode || countryCode.trim() === "") return
    
    updateFormData("destination.country", countryCode)
    updateFormData("destination.region", "") // Clear region when country changes
  }

  const handleRegionChange = (region: string) => {
    if (!region || region.trim() === "") return
    
    updateFormData("destination.region", region)
  }

  const handleContinue = () => {
    // Verify we have required data before proceeding
    const currentCountry = formData.destination?.country || selectedCountry
    const currentRegion = formData.destination?.region || selectedRegion
    
    if (!currentCountry || currentCountry.trim() === "") {
      return
    }
    
    // Check if country has regions
    const countryData = COUNTRIES.find(c => c.name === currentCountry)
    const hasRegions = countryData?.regions && countryData.regions.length > 0
    
    // If country has regions, require region selection
    if (hasRegions && (!currentRegion || currentRegion.trim() === "")) {
      return
    }
    
    // Final save to ensure data persistence before navigation
    updateFormData("destination.country", currentCountry)
    if (hasRegions) {
      updateFormData("destination.region", currentRegion)
    } else {
      // For countries without regions, set region to indicate no regions available
      updateFormData("destination.region", "No regional divisions")
    }
    
    onComplete()
  }

  const selectedCountryData = useMemo(() => {
    return COUNTRIES.find((c) => c.name === selectedCountry)
  }, [selectedCountry])

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="text-center space-y-2">
        <Globe className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          Where would you like to move?
        </h2>
        <p className="text-muted-foreground">
          Select your desired destination country and region to get personalized recommendations.
        </p>
      </div>

      <SectionHint title="📋 About this section">
        Choosing a destination country and region allows the questionnaire to tailor subsequent tax, residency, and language questions to local rules—many inputs later on depend on this choice.
      </SectionHint>

      {/* Country Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="country" className="text-base font-medium">
                Country
              </Label>
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="mt-2">
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
              <div>
                <Label htmlFor="region" className="text-base font-medium">
                  Region/State
                </Label>
                {selectedCountryData?.regions && selectedCountryData.regions.length > 0 ? (
                  <Select 
                    value={selectedRegion} 
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountryData.regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 p-3 bg-muted rounded-md border-dashed border-2">
                    <p className="text-sm text-muted-foreground">
                      ℹ️ This country does not have regions that change the rules for immigration or taxation purposes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Destination Display - Only show after section completion */}
      {selectedCountry && isSectionComplete('destination') && (
        <Card className="border-border bg-muted">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Selected Destination
                </h3>
                <p className="text-muted-foreground">
                  {selectedCountryData?.name}
                  {selectedCountryData?.regions && selectedCountryData.regions.length > 0 && selectedRegion && selectedRegion !== "No regional divisions"
                    ? `, ${selectedRegion}`
                    : ""
                  }
                </p>
                {/* languages */}
                {(() => {
                  const langs = getLanguages(selectedCountry, selectedRegion || "")
                  if (langs.length === 0) return null
                  return (
                    <p className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
                      <Languages className="w-3 h-3" /> Dominant languages: {langs.join(", ")}
                    </p>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={(() => {
            if (!selectedCountry) return true
            const countryData = COUNTRIES.find(c => c.name === selectedCountry)
            const hasRegions = countryData?.regions && countryData.regions.length > 0
            return hasRegions ? !selectedRegion : false
          })()}
          size="lg"
          className="px-8"
        >
          Continue
        </Button>
      </div>




    </div>
  )
} 