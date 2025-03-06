'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaxScore } from "@/components/features/scores/score-display"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCallback, useEffect, useState } from 'react'
import { Country } from '@/types/api'
import { getCountries } from '@/lib/server-api'
import Fuse from 'fuse.js'
import { CountryFlag } from "@/components/features/country/CountryFlag"

interface CountrySearchComboboxProps {
  onSelect: (country: Country) => void
  className?: string
  placeholder?: string
}

interface EnhancedCountry extends Country {
  aliases: string[]
}

// Common country aliases and alternative names
const COUNTRY_ALIASES: Record<string, string[]> = {
  'US': ['USA', 'United States', 'United States of America', 'The United States', 'America'],
  'GB': ['UK', 'United Kingdom', 'Great Britain', 'Britain'],
  'CZ': ['Czechia', 'Czech Republic', 'The Czech Republic'],
  'DE': ['Germany', 'Deutschland', 'Federal Republic of Germany'],
  'FR': ['France', 'French Republic'],
  'JP': ['Japan', 'Nippon', 'Land of the Rising Sun'],
  // Add more as needed
}

export function CountrySearchCombobox({ onSelect, className, placeholder = "Search for a country..." }: CountrySearchComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [countries, setCountries] = useState<EnhancedCountry[]>([])
  const [searchResults, setSearchResults] = useState<EnhancedCountry[]>([])
  const [selectedCountry, setSelectedCountry] = useState<EnhancedCountry | null>(null)

  // Initialize Fuse instance for fuzzy search
  const fuse = React.useMemo(() => {
    return new Fuse(countries, {
      keys: ['name', 'aliases'],
      threshold: 0.3,
      includeScore: true,
    })
  }, [countries])

  // Fetch countries and enhance with aliases
  useEffect(() => {
    const fetchAndEnhanceCountries = async () => {
      try {
        const fetchedCountries = await getCountries()
        const enhancedCountries = fetchedCountries.map((country: Country) => ({
          ...country,
          aliases: COUNTRY_ALIASES[country.id] || []
        }))
        setCountries(enhancedCountries)
        setSearchResults(enhancedCountries)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      }
    }

    fetchAndEnhanceCountries()
  }, [])

  // Handle search with debounce
  const handleSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults(countries)
      return
    }

    const results = fuse.search(term)
    setSearchResults(results.map(result => result.item))
  }, [countries, fuse])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, handleSearch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            className
          )}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <CountryFlag countryCode={selectedCountry.id} size="sm" />
              <span>{selectedCountry.name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex flex-col">
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No countries found
              </div>
            ) : (
              searchResults.map((country) => (
                <Button
                  key={country.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 rounded-none",
                    selectedCountry?.id === country.id && "bg-accent"
                  )}
                  onClick={() => {
                    setSelectedCountry(country)
                    setOpen(false)
                    onSelect(country)
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedCountry?.id === country.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-3 w-full">
                    <CountryFlag countryCode={country.id} size="sm" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="truncate">{country.name}</span>
                        {country.taxScore !== undefined && (
                          <TaxScore 
                            score={country.taxScore} 
                            size="sm"
                            showLabel={false}
                          />
                        )}
                      </div>
                      {country.aliases.length > 0 && (
                        <span className="text-xs text-muted-foreground truncate">
                          {country.aliases.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 