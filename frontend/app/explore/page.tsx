"use client"

import { getCountries } from "@/lib/server-api"
import { CountryCard } from "@/components/country-card"
import { ExploreFilters } from "@/components/explore-filters"
import { useState, useEffect } from "react"

export default function ExplorePage() {
  const [countries, setCountries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<any>(null)

  const fetchCountries = async (filters: any) => {
    setIsLoading(true)
    try {
      // Construct query parameters
      const params = new URLSearchParams()
      
      if (filters?.search) {
        params.append('search', filters.search)
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
    <div>
      <ExploreFilters onFiltersChange={handleFiltersChange} />
      
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground mb-6">
          Found {countries.length} candidate bases
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      </div>
    </div>
  )
} 