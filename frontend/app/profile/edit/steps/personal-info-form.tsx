'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PersonalInformation } from "@/types/profile"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"

interface PersonalInfoFormProps {
  data: { personalInformation?: PersonalInformation }
  onUpdate: (data: { personalInformation: PersonalInformation }) => void
}

const COUNTRIES = ["United States", "Switzerland", "Portugal", "Spain", "Netherlands", "El Salvador"]
const RESIDENCY_STATUSES = ["Citizen", "Permanent resident", "Temporary resident"]
const MARITAL_STATUSES = ["Single", "Married", "Divorced"]

export function PersonalInfoForm({ data, onUpdate }: PersonalInfoFormProps) {
  const [info, setInfo] = useState<PersonalInformation>(
    data.personalInformation || {
      dateOfBirth: "",
      nationalities: [{ country: "" }],
      maritalStatus: "Single",
      currentResidency: {
        country: "",
        status: "Citizen"
      }
    }
  )

  const handleChange = (field: keyof PersonalInformation, value: any) => {
    const updatedInfo = { ...info, [field]: value }
    setInfo(updatedInfo)
    onUpdate({ personalInformation: updatedInfo })
    toast.success(`Updated ${field}`)
  }

  const addNationality = () => {
    const updatedInfo = {
      ...info,
      nationalities: [...info.nationalities, { country: "" }]
    }
    setInfo(updatedInfo)
    onUpdate({ personalInformation: updatedInfo })
  }

  const removeNationality = (index: number) => {
    const updatedInfo = {
      ...info,
      nationalities: info.nationalities.filter((_, i) => i !== index)
    }
    setInfo(updatedInfo)
    onUpdate({ personalInformation: updatedInfo })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={info.dateOfBirth}
          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label>Nationalities</Label>
        {info.nationalities.map((nationality, index) => (
          <div key={index} className="flex gap-2">
            <Select
              value={nationality.country}
              onValueChange={(value) => {
                const updatedNationalities = [...info.nationalities]
                updatedNationalities[index] = { country: value }
                handleChange("nationalities", updatedNationalities)
              }}
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
            {index > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeNationality(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNationality}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Nationality
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Marital Status</Label>
        <Select
          value={info.maritalStatus}
          onValueChange={(value: any) => handleChange("maritalStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {MARITAL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Current Residency</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Country</Label>
            <Select
              value={info.currentResidency.country}
              onValueChange={(value) => {
                handleChange("currentResidency", {
                  ...info.currentResidency,
                  country: value
                })
              }}
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
          <div>
            <Label>Status</Label>
            <Select
              value={info.currentResidency.status}
              onValueChange={(value: any) => {
                handleChange("currentResidency", {
                  ...info.currentResidency,
                  status: value
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {RESIDENCY_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
} 