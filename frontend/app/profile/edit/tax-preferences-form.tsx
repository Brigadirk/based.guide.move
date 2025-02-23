'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Profile } from "@/types/profile"

interface TaxPreferencesFormProps {
  profile: Profile
  onUpdate: (profile: Profile) => void
}

export function TaxPreferencesForm({ profile, onUpdate }: TaxPreferencesFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="maxTaxRate">Maximum Acceptable Tax Rate (%)</Label>
        <Input
          id="maxTaxRate"
          type="number"
          value={profile.taxPreferences.maxTaxRate || ''}
          onChange={(e) => onUpdate({
            ...profile,
            taxPreferences: {
              ...profile.taxPreferences,
              maxTaxRate: e.target.value ? Number(e.target.value) : null
            }
          })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="corporateTax">Corporate Tax Important</Label>
        <Switch
          id="corporateTax"
          checked={profile.taxPreferences.corporateTaxImportant}
          onCheckedChange={(checked) => onUpdate({
            ...profile,
            taxPreferences: {
              ...profile.taxPreferences,
              corporateTaxImportant: checked
            }
          })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="vat">VAT Important</Label>
        <Switch
          id="vat"
          checked={profile.taxPreferences.vatImportant}
          onCheckedChange={(checked) => onUpdate({
            ...profile,
            taxPreferences: {
              ...profile.taxPreferences,
              vatImportant: checked
            }
          })}
        />
      </div>
    </div>
  )
} 