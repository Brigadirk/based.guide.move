"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, MapPin, Languages } from "lucide-react"
import { useFormData } from "@/lib/hooks/use-form-data"
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
  const { getFormData, updateFormData } = useFormData()
  const [selectedCountry, setSelectedCountry] = useState<string>(
    getFormData("destination.country") || ""
  )
  const [selectedRegion, setSelectedRegion] = useState(getFormData("destination.region") || "")

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
    setSelectedRegion("") // Reset region when country changes
    updateFormData("destination.country", countryCode)
    updateFormData("destination.region", "")
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    updateFormData("destination.region", region)
  }

  const handleContinue = () => {
    if (selectedCountry && selectedRegion) {
      onComplete()
    }
  }

  const selectedCountryData = useMemo(
    () => COUNTRIES.find((c) => c.name === selectedCountry),
    [selectedCountry]
  )

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

      <SectionHint>
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
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
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
                <Select value={selectedRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCountryData?.regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Destination Display */}
      {selectedCountry && selectedRegion && (
        <Card className="border-border bg-muted">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Selected Destination
                </h3>
                <p className="text-muted-foreground">
                  {selectedCountryData?.name}, {selectedRegion}
                </p>
                {/* languages */}
                {(() => {
                  const langs = getLanguages(selectedCountry, selectedRegion)
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
          disabled={!selectedCountry || !selectedRegion}
          size="lg"
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  )
} 