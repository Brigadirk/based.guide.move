'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCallback, useEffect, useState } from 'react'
import { Profile } from '@/types/profile'
import { Building2, Globe } from 'lucide-react'

interface ProfileSelectorProps {
  profiles: Profile[]
  selectedProfile: Profile | null
  onSelect: (profile: Profile) => void
  onCreateNew: () => void
  className?: string
}

export function ProfileSelector({ 
  profiles, 
  selectedProfile, 
  onSelect,
  onCreateNew,
  className 
}: ProfileSelectorProps) {
  const [open, setOpen] = useState(false)

  const getProfileSummary = (profile: Profile) => {
    const personalInformation = profile.personalInformation || {}
    const { currentResidency, nationalities } = personalInformation
    return {
      country: currentResidency?.country || 'Not set',
      nationality: nationalities?.[0]?.country || 'Not set',
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            className
          )}
        >
          {selectedProfile ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Profile {profiles.indexOf(selectedProfile) + 1}</span>
                <span className="text-xs text-muted-foreground">
                  {getProfileSummary(selectedProfile).nationality} → {getProfileSummary(selectedProfile).country}
                </span>
              </div>
            </div>
          ) : (
            "Select a profile..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          {profiles.map((profile, index) => {
            const summary = getProfileSummary(profile)
            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 rounded-none",
                  selectedProfile === profile && "bg-accent"
                )}
                onClick={() => {
                  onSelect(profile)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    selectedProfile === profile ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Profile {index + 1}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{summary.nationality}</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{summary.country}</span>
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-none border-t"
            onClick={() => {
              onCreateNew()
              setOpen(false)
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Profile</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 