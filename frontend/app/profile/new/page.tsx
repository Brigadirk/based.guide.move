'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createProfile } from "@/lib/api-client"
import { ProfileForm } from "@/components/features/profile/forms/profile-form"
import { Profile } from "@/types/profile"
import { useAuth } from "@/lib/auth/auth-context"

export default function NewProfilePage() {
  const router = useRouter()
  const { updateUserData } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (profile: Partial<Profile>) => {
    setIsSubmitting(true)
    try {
      await createProfile(profile)
      await updateUserData()
      toast.success("Profile created! Let's fill in your details.")
      router.push('/profile')
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error // Let the form handle the error display
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProfileForm
      onSubmit={handleSubmit}
      submitLabel="Create Profile"
      isSubmitting={isSubmitting}
    />
  )
} 