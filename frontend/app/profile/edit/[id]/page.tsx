'use client'

import { useState, useEffect, use } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProfileForm } from "@/components/features/profile/forms/profile-form"
import { Profile } from "@/types/profile"

export default function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, updateProfile, updateUserData } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (user?.profiles) {
      console.log('[EditProfilePage] Current user profiles:', user.profiles)
      const foundProfile = user.profiles.find(p => p.id === id)
      if (foundProfile) {
        console.log('[EditProfilePage] Found profile to edit:', foundProfile)
        setProfile(foundProfile)
      } else {
        toast.error("Profile not found")
        router.push('/profile')
      }
    }
  }, [user?.profiles, id, router])

  const handleSubmit = async (updatedProfile: Partial<Profile>) => {
    console.log('[EditProfilePage] Starting profile update with data:', updatedProfile)
    setIsSubmitting(true)
    try {
      console.log('[EditProfilePage] Calling updateProfile with:', { ...updatedProfile, id })
      await updateProfile({ ...updatedProfile, id } as Profile)
      // Refresh user data to ensure we have the latest profiles
      console.log('[EditProfilePage] Profile updated, refreshing user data')
      await updateUserData()
      toast.success("Profile updated successfully!")
      router.push('/profile')
    } catch (error) {
      console.error('[EditProfilePage] Failed to update profile:', error)
      throw error // Let the form handle the error display
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!profile) {
    return null
  }

  return (
    <ProfileForm
      profile={profile}
      onSubmit={handleSubmit}
      submitLabel="Update Profile"
      isSubmitting={isSubmitting}
    />
  )
} 