"use client"

import { useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Globe, MapPin, Languages, Lightbulb } from "lucide-react"
import { PageHeading } from "@/components/ui/page-heading"
import { useFormStore } from "@/lib/stores"
import { getLanguages } from "@/lib/utils/country-utils"
import { SectionHint } from "@/components/ui/section-hint"
import { CountryFlag } from "@/components/features/country/CountryFlag"

// Map country names to flag codes - same as used in SelectedDestinationCard
const countryToFlagCode: Record<string, string> = {
  // A
  "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Andorra": "ad", "Angola": "ao",
  "Antigua and Barbuda": "ag", "Argentina": "ar", "Armenia": "am", "Australia": "au", "Austria": "at", "Azerbaijan": "az",
  // B
  "Bahamas": "bs", "Bahrain": "bh", "Bangladesh": "bd", "Barbados": "bb", "Belarus": "by", "Belgium": "be",
  "Belize": "bz", "Benin": "bj", "Bhutan": "bt", "Bolivia": "bo", "Bosnia and Herzegovina": "ba", "Botswana": "bw",
  "Brazil": "br", "Brunei": "bn", "Bulgaria": "bg", "Burkina Faso": "bf", "Burundi": "bi",
  // C
  "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca", "Cape Verde": "cv", "Central African Republic": "cf",
  "Chad": "td", "Chile": "cl", "China": "cn", "Colombia": "co", "Comoros": "km", "Congo": "cg",
  "Democratic Republic of the Congo": "cd", "Costa Rica": "cr", "Croatia": "hr", "Cuba": "cu", "Cyprus": "cy", "Czech Republic": "cz",
  // D
  "Denmark": "dk", "Djibouti": "dj", "Dominica": "dm", "Dominican Republic": "do",
  // E
  "Ecuador": "ec", "Egypt": "eg", "El Salvador": "sv", "Equatorial Guinea": "gq", "Eritrea": "er", "Estonia": "ee",
  "Eswatini": "sz", "Ethiopia": "et",
  // F
  "Fiji": "fj", "Finland": "fi", "France": "fr",
  // G
  "Gabon": "ga", "Gambia": "gm", "Georgia": "ge", "Germany": "de", "Ghana": "gh", "Greece": "gr",
  "Grenada": "gd", "Guatemala": "gt", "Guinea": "gn", "Guinea-Bissau": "gw", "Guyana": "gy",
  // H
  "Haiti": "ht", "Honduras": "hn", "Hungary": "hu",
  // I
  "Iceland": "is", "India": "in", "Indonesia": "id", "Iran": "ir", "Iraq": "iq", "Ireland": "ie",
  "Israel": "il", "Italy": "it", "Ivory Coast": "ci",
  // J
  "Jamaica": "jm", "Japan": "jp", "Jordan": "jo",
  // K
  "Kazakhstan": "kz", "Kenya": "ke", "Kiribati": "ki", "Kuwait": "kw", "Kyrgyzstan": "kg",
  // L
  "Laos": "la", "Latvia": "lv", "Lebanon": "lb", "Lesotho": "ls", "Liberia": "lr", "Libya": "ly",
  "Liechtenstein": "li", "Lithuania": "lt", "Luxembourg": "lu",
  // M
  "Madagascar": "mg", "Malawi": "mw", "Malaysia": "my", "Maldives": "mv", "Mali": "ml", "Malta": "mt",
  "Marshall Islands": "mh", "Mauritania": "mr", "Mauritius": "mu", "Mexico": "mx", "Micronesia": "fm",
  "Moldova": "md", "Monaco": "mc", "Mongolia": "mn", "Montenegro": "me", "Morocco": "ma", "Mozambique": "mz", "Myanmar": "mm",
  // N
  "Namibia": "na", "Nauru": "nr", "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz", "Nicaragua": "ni",
  "Niger": "ne", "Nigeria": "ng", "North Korea": "kp", "North Macedonia": "mk", "Norway": "no",
  // O
  "Oman": "om",
  // P
  "Pakistan": "pk", "Palau": "pw", "Palestine": "ps", "Panama": "pa", "Papua New Guinea": "pg", "Paraguay": "py",
  "Peru": "pe", "Philippines": "ph", "Poland": "pl", "Portugal": "pt",
  // Q
  "Qatar": "qa",
  // R
  "Romania": "ro", "Russia": "ru", "Rwanda": "rw",
  // S
  "Saint Kitts and Nevis": "kn", "Saint Lucia": "lc", "Saint Vincent and the Grenadines": "vc", "Samoa": "ws",
  "San Marino": "sm", "Sao Tome and Principe": "st", "Saudi Arabia": "sa", "Senegal": "sn", "Serbia": "rs",
  "Seychelles": "sc", "Sierra Leone": "sl", "Singapore": "sg", "Slovakia": "sk", "Slovenia": "si",
  "Solomon Islands": "sb", "Somalia": "so", "South Africa": "za", "South Korea": "kr", "South Sudan": "ss",
  "Spain": "es", "Sri Lanka": "lk", "Sudan": "sd", "Suriname": "sr", "Sweden": "se", "Switzerland": "ch", "Syria": "sy",
  // T
  "Taiwan": "tw", "Tajikistan": "tj", "Tanzania": "tz", "Thailand": "th", "Timor-Leste": "tl", "Togo": "tg",
  "Tonga": "to", "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr", "Turkmenistan": "tm", "Tuvalu": "tv",
  // U
  "Uganda": "ug", "Ukraine": "ua", "United Arab Emirates": "ae", "United Kingdom": "gb", "United States": "us", "Uruguay": "uy", "Uzbekistan": "uz",
  // V
  "Vanuatu": "vu", "Vatican City": "va", "Venezuela": "ve", "Vietnam": "vn",
  // Y
  "Yemen": "ye",
  // Z
  "Zambia": "zm", "Zimbabwe": "zw"
}

function getCountryFlagCode(countryName: string): string {
  // Direct mapping first
  if (countryToFlagCode[countryName]) {
    return countryToFlagCode[countryName]
  }
  
  // Fallback: try lowercase, replace spaces with hyphens
  const normalized = countryName.toLowerCase().replace(/\s+/g, '-')
  return normalized
}

interface DestinationProps {
  onComplete: () => void
}

// Full country dataset copied from the Streamlit project
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
      <PageHeading 
        title="Candidate Destination"
        description="Select the country and region you are interested in relocating to"
        icon={<Globe className="w-7 h-7 text-green-600" />}
      />

      {/* Removed About this section hint per request */}

      {/* Country Selection Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardContent className="pt-4">
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
                      <Accordion type="single" collapsible>
                        <AccordionItem value="region-importance" className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-2">
                                                             <Lightbulb className="w-5 h-5 text-amber-600" />
                              <span className="font-medium text-amber-800 dark:text-amber-200">
                                Why is the region selection important?
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="text-sm text-muted-foreground space-y-2">
                              <p>• Visa quotas, processing times and special programs can be region-specific</p>
                              <p>• Tax rates, incentives or reporting rules sometimes differ by region</p>
                              <p>• Labour-market shortage lists and investment zones are often regional</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

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
                      <Lightbulb className="w-5 h-5 text-blue-600" />
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
              Submit and Continue to Personal Information
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Selected Destination Display */}
      {selectedCountry && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CountryFlag 
                countryCode={getCountryFlagCode(selectedCountryData?.name || selectedCountry)} 
                size="lg"
                className="flex-shrink-0"
              />
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
                      <Languages className="w-4 h-4" /> Dominant language{langs.length > 1 ? 's' : ''}: {langs.join(", ")}
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