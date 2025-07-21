"use client"

import { useState } from "react"
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
import { Country } from "@/types/api"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { CountryFlag } from "@/components/features/country/CountryFlag"

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

  const { data: countries = [], isLoading, isError, error } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      try {
        const response = await axios.get<Country[]>("/api/countries")
        if (!response.data || response.data.length === 0) {
          throw new Error('No countries found')
        }
        return response.data
      } catch (error) {
        console.error('Error fetching countries for combobox:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to load countries')
        }
        throw new Error('Failed to load countries')
      }
    },
  })

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
              <CountryFlag countryCode={selectedCountry.code} size="sm" />
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
                  <CountryFlag countryCode={country.code} size="sm" />
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