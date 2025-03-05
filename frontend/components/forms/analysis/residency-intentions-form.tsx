'use client'

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ResidencyIntentions } from "@/types/profile"
import { CountrySearchCombobox } from "@/components/features/country/country-search-combobox"
import { Country } from "@/types/api"
import { Switch } from "@/components/ui/switch"
import { InfoDrawer } from "@/components/ui/info-drawer"

interface ResidencyIntentionsFormProps {
  data: { residencyIntentions?: ResidencyIntentions }
  onUpdate: (data: { residencyIntentions: ResidencyIntentions }) => void
}

const MOVE_TYPES = ["Permanent", "Digital Nomad"]
const DURATIONS = ["6 months", "1 year", "Indefinite"]
const STAY_REQUIREMENTS = ["1 month", "3 months", "No requirement"]

export function ResidencyIntentionsForm({ data, onUpdate }: ResidencyIntentionsFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
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
  }

  const handleCountrySelect = (country: Country) => {
    handleChange("intendedCountry", country.name)
  }

  return (
    <div className="space-y-6">
      {/* Basic Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Intended Country</Label>
            <InfoDrawer
              title="Intended Country"
              description="The country you're planning to move to or spend time in."
              aiContext="This helps me understand your destination to provide relevant visa and immigration options."
            />
          </div>
          <CountrySearchCombobox
            onSelect={handleCountrySelect}
            placeholder="Select destination country..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Type of Move</Label>
            <InfoDrawer
              title="Type of Move"
              description="Choose between a permanent relocation or a digital nomad lifestyle."
              aiContext="Different move types have different visa requirements and considerations that I'll analyze for you."
            />
          </div>
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
      </div>

      {/* Advanced Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
          id="advanced-mode"
        />
        <Label htmlFor="advanced-mode" className="text-sm text-muted-foreground cursor-pointer">
          Show advanced options
        </Label>
        <InfoDrawer
          title="Advanced Options"
          description="Additional preferences that help refine your move requirements."
          aiContext="These details help me provide more tailored recommendations about specific visa programs and requirements."
        />
      </div>

      {/* Advanced Section */}
      {showAdvanced && (
        <div className="space-y-6 border-t pt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Duration of Stay</Label>
              <InfoDrawer
                title="Duration of Stay"
                description="How long you plan to stay in your destination country."
                aiContext="This helps me identify visa programs that match your intended length of stay."
              />
            </div>
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
            <div className="flex items-center gap-2">
              <Label>Maximum Stay Requirement</Label>
              <InfoDrawer
                title="Maximum Stay Requirement"
                description="The maximum continuous stay you're willing to maintain in the country."
                aiContext="Some visas require you to leave the country periodically. This helps me suggest options that match your flexibility."
              />
            </div>
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
            <div className="flex items-center gap-2">
              <Label>Additional Notes</Label>
              <InfoDrawer
                title="Additional Notes"
                description="Any specific requirements, preferences, or circumstances you'd like to mention."
                aiContext="This helps me understand any unique situations or requirements that might affect your visa options."
              />
            </div>
            <Textarea
              value={info.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any specific requirements or preferences..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      )}
    </div>
  )
} 