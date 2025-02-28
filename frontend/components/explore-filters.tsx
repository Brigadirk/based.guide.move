import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

interface FilterValue {
  value: number | [number, number]
  isActive: boolean
}

interface Filters {
  search: string
  temperature: FilterValue & { value: [number, number] }
  livingCosts: FilterValue & { value: number }
  taxesMax: FilterValue & { value: number }
  gdpMin: FilterValue & { value: number }
  visaMin: FilterValue & { value: number }
  sortBy: string
}

const sortOptions = [
  { label: "Based Score", value: "based" },
  { label: "Visa Score", value: "visa" },
  { label: "Living Costs", value: "costs" },
  { label: "Temperature", value: "temp" },
  { label: "Taxes", value: "taxes" },
  { label: "GDP per Capita", value: "gdp" },
]

interface ExploreFiltersProps {
  onFiltersChange: (filters: Filters) => void
}

export function ExploreFilters({ onFiltersChange }: ExploreFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    temperature: { value: [10, 30], isActive: false },
    livingCosts: { value: 5000, isActive: false },
    taxesMax: { value: 40, isActive: false },
    gdpMin: { value: 20000, isActive: false },
    visaMin: { value: 50, isActive: false },
    sortBy: "based"
  })

  const handleFilterChange = (key: keyof Filters, value: Filters[keyof Filters]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleFilter = (key: keyof Omit<Filters, "search" | "sortBy">) => {
    const filter = filters[key] as FilterValue
    const newValue = {
      value: filter.value,
      isActive: !filter.isActive
    } as Filters[typeof key]
    handleFilterChange(key, newValue)
  }

  const formatValue = (key: keyof Filters, value: number | [number, number]) => {
    switch (key) {
      case "temperature":
        const [min, max] = value as [number, number]
        return `${min}°C - ${max}°C`
      case "livingCosts":
        return `$${value}/mo`
      case "taxesMax":
        return `${value}%`
      case "gdpMin":
        return `$${Math.round(value as number / 1000)}k`
      case "visaMin":
        return `${value}`
      default:
        return value.toString()
    }
  }

  return (
    <div className="sticky top-14 z-40 bg-background border-b">
      <div className="pb-4">
        <div className="space-y-4 container max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={filters.temperature.isActive ? "default" : "outline"}
                  onClick={() => toggleFilter("temperature")}
                  className="whitespace-nowrap"
                >
                  Temperature {filters.temperature.isActive && `(${formatValue("temperature", filters.temperature.value)})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="font-medium">Temperature Range</div>
                  <Slider
                    defaultValue={filters.temperature.value}
                    max={40}
                    min={-10}
                    step={1}
                    onValueChange={(value: [number, number]) => 
                      handleFilterChange("temperature", { value, isActive: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.temperature.value[0]}°C</span>
                    <span>{filters.temperature.value[1]}°C</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={filters.livingCosts.isActive ? "default" : "outline"}
                  onClick={() => toggleFilter("livingCosts")}
                  className="whitespace-nowrap"
                >
                  Living Costs {filters.livingCosts.isActive && `(${formatValue("livingCosts", filters.livingCosts.value)})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="font-medium">Maximum Monthly Cost</div>
                  <Slider
                    defaultValue={[filters.livingCosts.value]}
                    max={10000}
                    min={500}
                    step={100}
                    onValueChange={([value]) => 
                      handleFilterChange("livingCosts", { value, isActive: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${filters.livingCosts.value}/mo</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={filters.taxesMax.isActive ? "default" : "outline"}
                  onClick={() => toggleFilter("taxesMax")}
                  className="whitespace-nowrap"
                >
                  Taxes {filters.taxesMax.isActive && `(${formatValue("taxesMax", filters.taxesMax.value)})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="font-medium">Maximum Tax Rate</div>
                  <Slider
                    defaultValue={[filters.taxesMax.value]}
                    max={60}
                    min={0}
                    step={1}
                    onValueChange={([value]) => 
                      handleFilterChange("taxesMax", { value, isActive: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.taxesMax.value}%</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={filters.gdpMin.isActive ? "default" : "outline"}
                  onClick={() => toggleFilter("gdpMin")}
                  className="whitespace-nowrap"
                >
                  GDP {filters.gdpMin.isActive && `(${formatValue("gdpMin", filters.gdpMin.value)})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="font-medium">Minimum GDP per Capita</div>
                  <Slider
                    defaultValue={[filters.gdpMin.value]}
                    max={100000}
                    min={0}
                    step={1000}
                    onValueChange={([value]) => 
                      handleFilterChange("gdpMin", { value, isActive: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${Math.round(filters.gdpMin.value / 1000)}k</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={filters.visaMin.isActive ? "default" : "outline"}
                  onClick={() => toggleFilter("visaMin")}
                  className="whitespace-nowrap"
                >
                  Visa Score {filters.visaMin.isActive && `(${formatValue("visaMin", filters.visaMin.value)})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="font-medium">Minimum Visa Score</div>
                  <Slider
                    defaultValue={[filters.visaMin.value]}
                    max={100}
                    min={0}
                    step={5}
                    onValueChange={([value]) => 
                      handleFilterChange("visaMin", { value, isActive: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.visaMin.value}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
} 