'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  error?: string
  className?: string
  toDate?: Date
}

export function DatePicker({ date, onSelect, error, className, toDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Default to 30 years ago for better UX when selecting birth dates
  const currentYear = new Date().getFullYear()
  const defaultYear = currentYear - 30
  const [month, setMonth] = React.useState<Date>(date || new Date(defaultYear, 0, 1))

  // Generate years from 1900 to current year, but prioritize years around the default (30 years ago)
  // This puts the most likely birth years at the top of the dropdown
  const allYears = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i)
  const years = [
    // Recent years (current to 10 years ago)
    ...allYears.slice(-10).reverse(),
    // Common adult ages (11 to 80 years ago)  
    ...allYears.slice(-80, -10).reverse(),
    // Older ages (81+ years ago)
    ...allYears.slice(0, -80).reverse()
  ]

  // Month names for the select
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleYearSelect = (year: string) => {
    setMonth(new Date(parseInt(year), month.getMonth()))
  }

  const handleMonthSelect = (monthIndex: string) => {
    setMonth(new Date(month.getFullYear(), parseInt(monthIndex)))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMMM d, yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-2 p-3 border-b">
          <Select
            value={month.getMonth().toString()}
            onValueChange={handleMonthSelect}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={month.getFullYear().toString()}
            onValueChange={handleYearSelect}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onSelect(date)
            setIsOpen(false)
          }}
          month={month}
          onMonthChange={setMonth}
          toDate={toDate}
          initialFocus
          className="rounded-md"
          showOutsideDays={false}
        />
      </PopoverContent>
    </Popover>
  )
} 