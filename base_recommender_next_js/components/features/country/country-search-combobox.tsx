'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from 'react'
import { Country } from '@/types/api'
import Fuse from 'fuse.js'
import { CountryFlag } from "@/components/features/country/CountryFlag"
import axios from "axios"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setIsLoading(true)
        setError(null)
        const response = await axios.get('/api/countries')
        const fetchedCountries = response.data
        const enhancedCountries = fetchedCountries.map((country: Country) => ({
          ...country,
          aliases: COUNTRY_ALIASES[country.id] || []
        }))
        setCountries(enhancedCountries)
        setSearchResults(enhancedCountries)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
        setError('Failed to load countries. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndEnhanceCountries()
  }, [])

  // Update search results when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults(countries)
      return
    }

    const results = fuse.search(searchTerm)
    setSearchResults(results.map(result => result.item))
  }, [searchTerm, countries, fuse])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCountry ? selectedCountry.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search countries..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {isLoading && <CommandEmpty>Loading countries...</CommandEmpty>}
          {error && <CommandEmpty className="text-destructive">{error}</CommandEmpty>}
          {!isLoading && !error && searchResults.length === 0 && (
            <CommandEmpty>No countries found.</CommandEmpty>
          )}
          <CommandGroup>
            {searchResults.map((country) => (
              <CommandItem
                key={country.id}
                value={country.name}
                onSelect={() => {
                  setSelectedCountry(country)
                  onSelect(country)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCountry?.id === country.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2">
                  <CountryFlag countryCode={country.id} size="sm" />
                  {country.name}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 