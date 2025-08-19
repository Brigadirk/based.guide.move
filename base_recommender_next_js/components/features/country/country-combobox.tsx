"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Country } from "@/types/country"
import { CountryFlag } from "@/components/features/country/CountryFlag"
import { getCountries } from "@/lib/utils/country-utils"
import countryInfo from "@/data/country_info.json"

interface CountryComboboxProps {
  selectedCountry: Country | null
  onSelect: (country: Country | null) => void
}

export function CountryCombobox({
  selectedCountry,
  onSelect,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCountries() {
      try {
        setIsLoading(true)
        setIsError(false)
        setError(null)
        
        // For now, use a simple fallback since the API might not be available
        // In a real app, this would fetch from the actual API
        const fallbackCountries: Country[] = [
          {
            id: "US",
            name: "United States",
            region: "North America",
            flag_emoji: "🇺🇸",
            flag_png: "",
            capital: "Washington D.C.",
            currency_code: "USD",
            currency_name: "US Dollar",
            currency_symbol: "$",
            languages: ["English"],
            population: 331000000,
            area_sq_km: 9833520,
            timezones: ["UTC-5"],
            calling_codes: ["+1"],
            tld: [".us"],
            visa_requirements: {},
            tax_system: {
              income_tax_rate: 22,
              corporate_tax_rate: 21,
              vat_rate: 0,
              wealth_tax: false,
              capital_gains_tax_rate: 20
            },
            cost_of_living_index: 100,
            healthcare_system: "Private",
            education_system: "Public/Private",
            quality_of_life_index: 85,
            safety_index: 75,
            internet_speed_mbps: 150,
            climate: "Temperate",
            major_industries: ["Technology", "Finance"],
            popular_visa_types: [],
            digital_nomad_visa: false,
            golden_visa: false,
            citizenship_by_investment: false,
            residency_by_investment: false
          }
        ]
        
        const countryNames = getCountries()
        const localCountries: Country[] = countryNames.map((name) => {
          const info = (countryInfo as any)[name] || {}
          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            region: "",
            flag_emoji: "",
            flag_png: "",
            capital: "",
            currency_code: info.currency_shorthand || "USD",
            currency_name: info.currency_name || "Unknown",
            currency_symbol: "",
            language: info.dominant_language || ["Unknown"],
            population: 0,
            area: 0,
            timezone: "",
            phone_code: "",
            internet_tld: "",
            visa_free_score: 0,
            safety_score: 0,
            cost_of_living_index: 0,
            freedom_index: 0,
            happiness_score: 0,
            gdp_per_capita: 0,
            tax_burden: 0,
            ease_of_business: 0,
            innovation_index: 0,
            education_index: 0,
            healthcare_index: 0,
            climate: "",
            best_time_to_visit: "",
            main_languages: info.dominant_language || ["Unknown"],
            government_type: "",
            driving_side: "",
            electrical_outlet: "",
            emergency_numbers: {
              police: "",
              medical: "",
              fire: ""
            },
            visa_requirements: "",
            time_to_citizenship: "",
            dual_citizenship: false,
            scores: {
              overall: 0,
              visa: 0,
              cost: 0,
              safety: 0,
              lifestyle: 0,
              tax: 0,
              climate: 0,
              healthcare: 0,
              education: 0,
              infrastructure: 0
            }
          }
        })
        
        setCountries(localCountries)
      } catch (err) {
        console.error('Error fetching countries for combobox:', err)
        setIsError(true)
        setError(err instanceof Error ? err : new Error('Failed to load countries'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedCountry && (
              <CountryFlag countryCode={selectedCountry.id} size="sm" />
            )}
            <span>{selectedCountry ? selectedCountry.name : "Search countries..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search countries..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          {isLoading && <CommandEmpty>Loading countries...</CommandEmpty>}
          {isError && (
            <CommandEmpty className="text-destructive">
              {error instanceof Error ? error.message : 'Failed to load countries'}
            </CommandEmpty>
          )}
          {!isLoading && !isError && filteredCountries.length === 0 && (
            <CommandEmpty>No countries found.</CommandEmpty>
          )}
          <CommandGroup>
            {filteredCountries.map((country) => (
              <CommandItem
                key={country.id}
                value={country.name}
                onSelect={() => {
                  onSelect(country)
                  setOpen(false)
                  setSearchValue("")
                }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <CountryFlag countryCode={country.id} size="sm" />
                  <span>{country.name}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedCountry?.id === country.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 