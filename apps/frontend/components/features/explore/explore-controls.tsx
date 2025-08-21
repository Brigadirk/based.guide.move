"use client"

import { useState } from "react"
import { Country } from "@/types/api"
import { CountryCombobox } from "@/components/features/country/country-combobox"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FilterValues {
  temperature?: {
    isActive: boolean
    value: [number, number]
  }
  livingCosts?: {
    isActive: boolean
    value: number
  }
  taxesMax?: {
    isActive: boolean
    value: number
  }
  gdpMin?: {
    isActive: boolean
    value: number
  }
  visaMin?: {
    isActive: boolean
    value: number
  }
  sortBy?: string
}

interface ExploreControlsProps {
  selectedCountry: Country | null
  onCountrySelect: (country: Country | null) => void
  activeFilters: FilterValues | null
  onFiltersChange: (filters: FilterValues) => void
}

export function ExploreControls({
  selectedCountry,
  onCountrySelect,
  activeFilters,
  onFiltersChange,
}: ExploreControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  function handleFilterChange(filterKey: "temperature", isActive: boolean, value: [number, number]): void;
  function handleFilterChange(filterKey: "livingCosts" | "taxesMax" | "gdpMin" | "visaMin", isActive: boolean, value: number): void;
  function handleFilterChange(filterKey: "sortBy", isActive: boolean, value: string): void;
  function handleFilterChange(
    filterKey: keyof FilterValues,
    isActive: boolean,
    value: number | [number, number] | string
  ) {
    const newFilters = {
      ...activeFilters,
      [filterKey]: {
        isActive,
        value,
      },
    } as FilterValues
    onFiltersChange(newFilters)
  }

  return (
    <Card className="rounded-none border-x-0">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-full max-w-sm">
              <CountryCombobox
                selectedCountry={selectedCountry}
                onSelect={onCountrySelect}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div
            className={cn(
              "grid gap-6 transition-all duration-200",
              isExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Temperature Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature Range (°C)</Label>
                    <Switch
                      id="temperature"
                      checked={activeFilters?.temperature?.isActive}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          "temperature",
                          checked,
                          activeFilters?.temperature?.value || [15, 25]
                        )
                      }
                    />
                  </div>
                  <Slider
                    id="temperature"
                    min={-10}
                    max={40}
                    step={1}
                    value={activeFilters?.temperature?.value || [15, 25]}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "temperature",
                        activeFilters?.temperature?.isActive || false,
                        value as [number, number]
                      )
                    }
                    disabled={!activeFilters?.temperature?.isActive}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {activeFilters?.temperature?.value?.[0] || 15}°C
                    </span>
                    <span>
                      {activeFilters?.temperature?.value?.[1] || 25}°C
                    </span>
                  </div>
                </div>

                {/* Living Costs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="living-costs">Max Living Costs</Label>
                    <Switch
                      id="living-costs"
                      checked={activeFilters?.livingCosts?.isActive}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          "livingCosts",
                          checked,
                          activeFilters?.livingCosts?.value || 2000
                        )
                      }
                    />
                  </div>
                  <Slider
                    id="living-costs"
                    min={500}
                    max={5000}
                    step={100}
                    value={[activeFilters?.livingCosts?.value || 2000]}
                    onValueChange={([value]) =>
                      handleFilterChange(
                        "livingCosts",
                        activeFilters?.livingCosts?.isActive || false,
                        value
                      )
                    }
                    disabled={!activeFilters?.livingCosts?.isActive}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$500</span>
                    <span>${activeFilters?.livingCosts?.value || 2000}</span>
                  </div>
                </div>

                {/* Taxes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxes">Max Tax Rate</Label>
                    <Switch
                      id="taxes"
                      checked={activeFilters?.taxesMax?.isActive}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          "taxesMax",
                          checked,
                          activeFilters?.taxesMax?.value || 30
                        )
                      }
                    />
                  </div>
                  <Slider
                    id="taxes"
                    min={0}
                    max={60}
                    step={1}
                    value={[activeFilters?.taxesMax?.value || 30]}
                    onValueChange={([value]) =>
                      handleFilterChange(
                        "taxesMax",
                        activeFilters?.taxesMax?.isActive || false,
                        value
                      )
                    }
                    disabled={!activeFilters?.taxesMax?.isActive}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{activeFilters?.taxesMax?.value || 30}%</span>
                  </div>
                </div>

                {/* GDP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gdp">Min GDP per Capita</Label>
                    <Switch
                      id="gdp"
                      checked={activeFilters?.gdpMin?.isActive}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          "gdpMin",
                          checked,
                          activeFilters?.gdpMin?.value || 20000
                        )
                      }
                    />
                  </div>
                  <Slider
                    id="gdp"
                    min={0}
                    max={100000}
                    step={1000}
                    value={[activeFilters?.gdpMin?.value || 20000]}
                    onValueChange={([value]) =>
                      handleFilterChange(
                        "gdpMin",
                        activeFilters?.gdpMin?.isActive || false,
                        value
                      )
                    }
                    disabled={!activeFilters?.gdpMin?.isActive}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>${activeFilters?.gdpMin?.value || 20000}</span>
                  </div>
                </div>

                {/* Visa Accessibility */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visa">Min Visa Accessibility</Label>
                    <Switch
                      id="visa"
                      checked={activeFilters?.visaMin?.isActive}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          "visaMin",
                          checked,
                          activeFilters?.visaMin?.value || 50
                        )
                      }
                    />
                  </div>
                  <Slider
                    id="visa"
                    min={0}
                    max={100}
                    step={1}
                    value={[activeFilters?.visaMin?.value || 50]}
                    onValueChange={([value]) =>
                      handleFilterChange(
                        "visaMin",
                        activeFilters?.visaMin?.isActive || false,
                        value
                      )
                    }
                    disabled={!activeFilters?.visaMin?.isActive}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{activeFilters?.visaMin?.value || 50}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 