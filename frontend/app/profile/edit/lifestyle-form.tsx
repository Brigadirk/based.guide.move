'use client'

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Profile } from "@/types/profile"

interface LifestyleFormProps {
  profile: Profile
  onUpdate: (profile: Profile) => void
}

export function LifestyleForm({ profile, onUpdate }: LifestyleFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="remoteWork">Remote Work</Label>
        <Switch
          id="remoteWork"
          checked={profile.lifestyle.remoteWork}
          onCheckedChange={(checked) => onUpdate({
            ...profile,
            lifestyle: {
              ...profile.lifestyle,
              remoteWork: checked
            }
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>Cost of Living Preference</Label>
        <Select
          value={profile.lifestyle.costOfLiving || ''}
          onValueChange={(value: any) => onUpdate({
            ...profile,
            lifestyle: {
              ...profile.lifestyle,
              costOfLiving: value
            }
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Climate Preference</Label>
        <Select
          value={profile.lifestyle.climatePreference || ''}
          onValueChange={(value: any) => onUpdate({
            ...profile,
            lifestyle: {
              ...profile.lifestyle,
              climatePreference: value
            }
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 