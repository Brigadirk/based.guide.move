'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from 'react'
import { Profile } from '@/types/profile'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CountryFlag } from "@/components/features/country/CountryFlag"

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

  const getProfileSummary = (profile: Profile | null) => {
    if (!profile?.personalInformation) {
      return {
        country: 'Not set',
        nationality: 'Not set',
      }
    }
    const { currentResidency, nationalities } = profile.personalInformation
    return {
      country: currentResidency?.country || 'Not set',
      nationality: nationalities?.[0]?.country || 'Not set',
    }
  }

  const getInitials = (nickname: string | undefined) => {
    if (!nickname) return 'NA'
    return nickname.slice(0, 2).toUpperCase()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedProfile ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {selectedProfile.avatar ? (
                  <AvatarImage src={selectedProfile.avatar} alt={selectedProfile.nickname} />
                ) : (
                  <AvatarFallback>{getInitials(selectedProfile.nickname)}</AvatarFallback>
                )}
              </Avatar>
              <span>{selectedProfile.nickname}</span>
            </div>
          ) : (
            <span>Select a profile</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="max-h-[300px] overflow-auto">
          {profiles.map((profile) => {
            const summary = getProfileSummary(profile)
            return (
              <Button
                key={profile.id}
                onClick={() => {
                  onSelect(profile)
                  setOpen(false)
                }}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  selectedProfile?.id === profile.id && "bg-accent"
                )}
              >
                <Avatar className="h-6 w-6">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.nickname} />
                  ) : (
                    <AvatarFallback>{getInitials(profile.nickname)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col items-start">
                  <span>{profile.nickname}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {summary.nationality !== 'Not set' && (
                      <CountryFlag countryCode={summary.nationality} size="xs" />
                    )}
                    <span>{summary.nationality}</span>
                    {summary.country !== 'Not set' && (
                      <>
                        <span>→</span>
                        <CountryFlag countryCode={summary.country} size="xs" />
                        <span>{summary.country}</span>
                      </>
                    )}
                  </div>
                </div>
                {selectedProfile?.id === profile.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            )
          })}
        </div>
        <Button
          onClick={() => {
            onCreateNew()
            setOpen(false)
          }}
          variant="ghost"
          className="w-full justify-start gap-2 border-t rounded-none"
        >
          <Plus className="h-4 w-4" />
          Create New Profile
        </Button>
      </PopoverContent>
    </Popover>
  )
} 