'use client'

import { Country } from "@/types/api"
import { CountrySearch } from "./country-search"
import { AnalysisCtaButton } from "./analysis-cta-button"
import { useState } from "react"

interface CountrySearchBarProps {
  onCountrySelect?: (country: Country) => void
  className?: string
}

export function CountrySearchBar({ onCountrySelect, className = "" }: CountrySearchBarProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    onCountrySelect?.(country)
  }

  return (
    <div className={`flex gap-4 items-center ${className}`}>
      <div className="flex-1">
        <CountrySearch
          onSelect={handleCountrySelect}
          placeholder="Search for a country to analyze..."
        />
      </div>
      <div className="flex-shrink-0">
        <AnalysisCtaButton />
      </div>
    </div>
  )
} 