import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
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
import { ScrollableContainer } from "@/components/ui/scrollable-container"

interface FilterValue {
  value: number | [number, number]
  isActive: boolean
}

interface Filters {
  temperature: FilterValue & { value: [number, number] }
  livingCosts: FilterValue & { value: number }
  taxesMax: FilterValue & { value: number }
  gdpMin: FilterValue & { value: number }
  visaMin: FilterValue & { value: number }
  sortBy: string
}

const sortOptions = [
  { label: "Based Score", value: "based" },
  { label: "Visa Ease", value: "visa" },
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

  const toggleFilter = (key: keyof Omit<Filters, "sortBy">) => {
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
    <>
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
            Visa Ease {filters.visaMin.isActive && `(${formatValue("visaMin", filters.visaMin.value)})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="font-medium">Minimum Visa Ease</div>
            <Slider
              defaultValue={[filters.visaMin.value]}
              max={100}
              min={0}
              step={1}
              onValueChange={([value]) => 
                handleFilterChange("visaMin", { value, isActive: true })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.visaMin.value}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
} 