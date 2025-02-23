'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Profile } from "@/types/profile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BasicInfoFormProps {
  profile: Profile
  onUpdate: (profile: Profile) => void
}

const COUNTRIES = ["United States", "Switzerland", "Portugal", "Spain", "Netherlands", "El Salvador"]

export function BasicInfoForm({ profile, onUpdate }: BasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="income">Annual Income (USD)</Label>
        <Input
          id="income"
          type="number"
          value={profile.income || ''}
          onChange={(e) => onUpdate({
            ...profile,
            income: e.target.value ? Number(e.target.value) : null
          })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          value={profile.occupation}
          onChange={(e) => onUpdate({
            ...profile,
            occupation: e.target.value
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>Current Country</Label>
        <Select
          value={profile.currentCountry}
          onValueChange={(value) => onUpdate({
            ...profile,
            currentCountry: value
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
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
    </div>
  )
} 