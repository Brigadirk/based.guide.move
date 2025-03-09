"use client"

import { getCountries } from "@/lib/server-api"
import { CountryCard } from "@/components/features/country/country-card"
import { useState, useEffect } from "react"
import { Country } from "@/types/api"
import { ExploreControls } from "@/components/features/explore/explore-controls"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollableContainer } from "@/components/ui/scrollable-container"

export default function ExplorePage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<any>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const fetchCountries = async (filters: any) => {
    setIsLoading(true)
    try {
      // Construct query parameters
      const params = new URLSearchParams()
      
      if (selectedCountry) {
        params.append('search', selectedCountry.name)
      }
      
      if (filters?.temperature?.isActive) {
        params.append('min_temperature', filters.temperature.value[0].toString())
        params.append('max_temperature', filters.temperature.value[1].toString())
      }
      
      if (filters?.livingCosts?.isActive) {
        params.append('max_living_cost', filters.livingCosts.value.toString())
      }
      
      if (filters?.taxesMax?.isActive) {
        params.append('max_tax_score', (100 - filters.taxesMax.value).toString())
      }
      
      if (filters?.gdpMin?.isActive) {
        params.append('min_gdp', filters.gdpMin.value.toString())
      }
      
      if (filters?.visaMin?.isActive) {
        params.append('min_visa_accessibility', filters.visaMin.value.toString())
      }

      // Add sorting
      if (filters?.sortBy) {
        params.append('sort_by', filters.sortBy)
        params.append('sort_order', 'desc')  // Default to descending order
      }

      const data = await getCountries(params)
      setCountries(data || [])
    } catch (err) {
      console.error('Failed to fetch countries:', err)
      setError('Error loading countries. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (filters: any) => {
    setActiveFilters(filters)
    fetchCountries(filters)
  }

  // Effect to refetch when selected country changes
  useEffect(() => {
    if (activeFilters) {
      fetchCountries(activeFilters)
    }
  }, [selectedCountry])

  // Initial load
  useEffect(() => {
    fetchCountries(null)
  }, [])

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <p>{error}</p>
      </div>
    )
  }

  if (isLoading && !activeFilters) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-14 z-20 w-full bg-card border-b">
        <ExploreControls
          selectedCountry={selectedCountry}
          onCountrySelect={setSelectedCountry}
          activeFilters={activeFilters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {countries.length} candidate bases
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 