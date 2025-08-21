/**
 * Auto-save hook for form data
 * Automatically saves form data after a delay when changes occur
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormStore } from '@/lib/stores'

export interface AutoSaveOptions {
  delay?: number // Delay in milliseconds before saving
  enabled?: boolean // Whether auto-save is enabled
  onSave?: () => void // Callback when data is saved
  onError?: (error: Error) => void // Callback when save fails
}

export function useAutoSave(
  data: any,
  path: string,
  options: AutoSaveOptions = {}
) {
  const {
    delay = 2000, // 2 second delay by default
    enabled = true,
    onSave,
    onError
  } = options

  const { updateFormData } = useFormStore()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<string>()
  
  const save = useCallback(async () => {
    try {
      updateFormData(path, data)
      onSave?.()
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Save failed'))
    }
  }, [data, path, updateFormData, onSave, onError])

  useEffect(() => {
    if (!enabled) return

    const currentDataString = JSON.stringify(data)
    
    // Only save if data has actually changed
    if (currentDataString === lastDataRef.current) return
    
    lastDataRef.current = currentDataString

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(save, delay)

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  // Manual save function
  const manualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    save()
  }, [save])

  return {
    manualSave,
    isAutoSaveEnabled: enabled
  }
}

/**
 * Auto-save status indicator hook
 */
export function useAutoSaveStatus() {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = useCallback(() => {
    setIsSaving(true)
    setSaveError(null)
    
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }, [])

  const handleError = useCallback((error: Error) => {
    setIsSaving(false)
    setSaveError(error.message)
  }, [])

  return {
    isSaving,
    lastSaved,
    saveError,
    handleSave,
    handleError
  }
}
