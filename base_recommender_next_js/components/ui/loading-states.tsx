/**
 * Enhanced loading state components
 */

import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-6 h-6"
  }

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  )
}

interface SaveStatusProps {
  isSaving?: boolean
  lastSaved?: Date | null
  saveError?: string | null
  className?: string
}

export function SaveStatus({ isSaving, lastSaved, saveError, className }: SaveStatusProps) {
  if (isSaving) {
    return (
      <Badge variant="secondary" className={cn("bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", className)}>
        <LoadingSpinner size="sm" className="mr-1" />
        Saving...
      </Badge>
    )
  }

  if (saveError) {
    return (
      <Badge variant="destructive" className={className}>
        <XCircle className="w-3 h-3 mr-1" />
        Save failed
      </Badge>
    )
  }

  if (lastSaved) {
    return (
      <Badge variant="secondary" className={cn("bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", className)}>
        <CheckCircle className="w-3 h-3 mr-1" />
        Saved {formatTimeAgo(lastSaved)}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={className}>
      <Clock className="w-3 h-3 mr-1" />
      Not saved
    </Badge>
  )
}

interface FieldLoadingProps {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function FieldLoading({ 
  isLoading, 
  children, 
  loadingText = "Loading...", 
  className 
}: FieldLoadingProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <LoadingSpinner size="sm" />
        <span className="text-sm">{loadingText}</span>
      </div>
    )
  }

  return <>{children}</>
}

interface SubmitButtonLoadingProps {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function SubmitButtonLoading({
  isLoading,
  children,
  loadingText = "Processing...",
  disabled,
  className,
  onClick
}: SubmitButtonLoadingProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors",
        className
      )}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  )
}

interface ValidationLoadingProps {
  isValidating?: boolean
  validationResult?: 'valid' | 'invalid' | 'warning' | null
  className?: string
}

export function ValidationLoading({ 
  isValidating, 
  validationResult, 
  className 
}: ValidationLoadingProps) {
  if (isValidating) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <LoadingSpinner size="sm" />
        Validating...
      </div>
    )
  }

  if (validationResult === 'valid') {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-green-600", className)}>
        <CheckCircle className="w-3 h-3" />
        Valid
      </div>
    )
  }

  if (validationResult === 'invalid') {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-red-600", className)}>
        <XCircle className="w-3 h-3" />
        Invalid
      </div>
    )
  }

  return null
}

/**
 * Format time ago helper
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}
