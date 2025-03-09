"use client"

import { ScrollableTabs } from "@/components/ui/scrollable-tabs"
import { CountrySearchCombobox } from "@/components/features/country/country-search-combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExploreFilters } from "./explore-filters"
import { Country } from "@/types/api"
import { ScrollableContainer } from "@/components/ui/scrollable-container"

interface ExploreTabsProps {
  selectedCountry: Country | null
  onCountrySelect: (country: Country | null) => void
  activeFilters: any
  onFiltersChange: (filters: any) => void
}

export function ExploreControls({
  selectedCountry,
  onCountrySelect,
  activeFilters,
  onFiltersChange
}: ExploreTabsProps) {
  return (
    <div className="sticky top-14 z-40 bg-background border-b">
      <div className="max-w-7xl mx-auto">
        <div className="px-4">
          <div className="py-2">
            <div className="flex items-center gap-4">
              <CountrySearchCombobox
                className="flex-1"
                onSelect={onCountrySelect}
                placeholder="Search countries..."
              />
              <Select
                value={activeFilters?.sortBy || "based"}
                onValueChange={(value) => onFiltersChange({ ...activeFilters, sortBy: value })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="based">Based Score</SelectItem>
                  <SelectItem value="visa">Visa Ease</SelectItem>
                  <SelectItem value="costs">Living Costs</SelectItem>
                  <SelectItem value="temp">Temperature</SelectItem>
                  <SelectItem value="taxes">Taxes</SelectItem>
                  <SelectItem value="gdp">GDP per Capita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <ScrollableContainer background>
        <div className="max-w-7xl mx-auto">
          <div className="px-4">
            <div className="flex gap-2 overflow-x-auto py-2">
              <ExploreFilters onFiltersChange={onFiltersChange} />
            </div>
          </div>
        </div>
      </ScrollableContainer>
    </div>
  )
} 