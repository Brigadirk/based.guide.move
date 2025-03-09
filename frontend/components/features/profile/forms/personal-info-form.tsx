'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PersonalInformation } from "@/types/profile"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { InfoDrawer } from "@/components/ui/info-drawer"
import { validatePersonalInfo, ValidationError } from "@/lib/profile-validation"
import { cn } from "@/lib/utils"
import { RequiredLabel } from "@/components/required-label"
import { CountrySearchCombobox } from "@/components/features/country/country-search-combobox"
import { Country } from "@/types/api"

interface PersonalInfoFormProps {
  data: { personalInformation?: PersonalInformation }
  onUpdate: (data: { personalInformation: PersonalInformation }) => void
}

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

  const [validation, setValidation] = useState(() => validatePersonalInfo(info))
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setValidation(validatePersonalInfo(info))
  }, [info])

  const getFieldError = (field: string): ValidationError | undefined => {
    return touched[field] ? validation.errors.find(e => e.field === field) : undefined
  }

  const getFieldWarning = (field: string): ValidationError | undefined => {
    return touched[field] ? validation.warnings.find(e => e.field === field) : undefined
  }

  const handleChange = (field: keyof PersonalInformation, value: any) => {
    const updatedInfo = { ...info, [field]: value }
    setInfo(updatedInfo)
    onUpdate({ personalInformation: updatedInfo })
    setTouched(prev => ({ ...prev, [field]: true }))
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

  const handleNationalitySelect = (index: number, country: Country) => {
    const updatedNationalities = [...info.nationalities]
    updatedNationalities[index] = { country: country.name }
    handleChange("nationalities", updatedNationalities)
    setTouched(prev => ({ ...prev, [`nationalities.${index}`]: true }))
  }

  const handleResidencyCountrySelect = (country: Country) => {
    handleChange("currentResidency", {
      ...info.currentResidency,
      country: country.name
    })
    setTouched(prev => ({ ...prev, "currentResidency.country": true }))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <InfoDrawer
            title="Date of Birth"
            description="Your date of birth is used to determine eligibility for various visa programs and retirement options."
            aiContext="Many countries have age restrictions for different visa types. This helps me recommend the most suitable immigration pathways for you."
          />
        </div>
        <DatePicker
          date={info.dateOfBirth ? new Date(info.dateOfBirth) : undefined}
          onSelect={(date) => date && handleChange("dateOfBirth", date.toISOString().split('T')[0])}
          error={getFieldError("dateOfBirth")?.message}
        />
        {getFieldWarning("dateOfBirth") && (
          <p className="text-sm text-warning mt-1">{getFieldWarning("dateOfBirth")?.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <RequiredLabel>Nationalities</RequiredLabel>
          <InfoDrawer
            title="Nationalities"
            description="List all countries where you hold citizenship. This is important for determining your mobility rights and visa requirements."
            aiContext="Your citizenship(s) significantly impact your global mobility options and tax obligations. This helps me identify the most advantageous pathways for your situation."
          />
        </div>
        {info.nationalities.map((nationality, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <CountrySearchCombobox
                onSelect={(country) => handleNationalitySelect(index, country)}
                placeholder="Select country..."
                className={cn(
                  getFieldError(`nationalities.${index}`) && "border-destructive"
                )}
              />
              {getFieldError(`nationalities.${index}`) && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError(`nationalities.${index}`)?.message}
                </p>
              )}
            </div>
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
        {getFieldError("nationalities") && (
          <p className="text-sm text-destructive">{getFieldError("nationalities")?.message}</p>
        )}
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
        <div className="flex items-center gap-2">
          <Label>Current Residency</Label>
          <InfoDrawer
            title="Current Residency"
            description="Your current country of residence and residency status."
            aiContext="This helps me understand your current tax obligations and identify potential tax implications of moving to a new country."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel>Country</RequiredLabel>
            <CountrySearchCombobox
              onSelect={handleResidencyCountrySelect}
              placeholder="Select country..."
              className={cn(
                getFieldError("currentResidency.country") && "border-destructive"
              )}
            />
            {getFieldError("currentResidency.country") && (
              <p className="text-sm text-destructive mt-1">
                {getFieldError("currentResidency.country")?.message}
              </p>
            )}
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
                setTouched(prev => ({ ...prev, "currentResidency.status": true }))
              }}
            >
              <SelectTrigger className={cn(
                getFieldWarning("currentResidency.status") && "border-warning"
              )}>
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
            {getFieldWarning("currentResidency.status") && (
              <p className="text-sm text-warning mt-1">
                {getFieldWarning("currentResidency.status")?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 