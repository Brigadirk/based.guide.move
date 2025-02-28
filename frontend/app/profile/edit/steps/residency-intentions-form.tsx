'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ResidencyIntentions } from "@/types/profile"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResidencyIntentionsFormProps {
  data: { residencyIntentions?: ResidencyIntentions }
  onUpdate: (data: { residencyIntentions: ResidencyIntentions }) => void
}

const COUNTRIES = ["United States", "Switzerland", "Portugal", "Spain", "Netherlands", "El Salvador"]
const MOVE_TYPES = ["Permanent", "Digital Nomad"]
const DURATIONS = ["6 months", "1 year", "Indefinite"]
const STAY_REQUIREMENTS = ["1 month", "3 months", "No requirement"]

export function ResidencyIntentionsForm({ data, onUpdate }: ResidencyIntentionsFormProps) {
  const [info, setInfo] = useState<ResidencyIntentions>(
    data.residencyIntentions || {
      moveType: "Digital Nomad",
      intendedCountry: "",
      durationOfStay: "1 year",
      preferredMaximumStayRequirement: "3 months",
      notes: ""
    }
  )

  const handleChange = (field: keyof ResidencyIntentions, value: any) => {
    const updatedInfo = { ...info, [field]: value }
    setInfo(updatedInfo)
    onUpdate({ residencyIntentions: updatedInfo })
    toast.success(`Updated ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Move Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Type of Move</Label>
            <Select
              value={info.moveType}
              onValueChange={(value: "Permanent" | "Digital Nomad") => handleChange("moveType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select move type" />
              </SelectTrigger>
              <SelectContent>
                {MOVE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Intended Country</Label>
            <Select
              value={info.intendedCountry}
              onValueChange={(value) => handleChange("intendedCountry", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duration of Stay</Label>
            <Select
              value={info.durationOfStay}
              onValueChange={(value: "6 months" | "1 year" | "Indefinite") => 
                handleChange("durationOfStay", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Maximum Stay Requirement</Label>
            <Select
              value={info.preferredMaximumStayRequirement}
              onValueChange={(value: "1 month" | "3 months" | "No requirement") => 
                handleChange("preferredMaximumStayRequirement", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select requirement" />
              </SelectTrigger>
              <SelectContent>
                {STAY_REQUIREMENTS.map((req) => (
                  <SelectItem key={req} value={req}>
                    {req}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={info.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any specific requirements or preferences..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 