"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"

interface CheckInfoButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function CheckInfoButton({ 
  onClick, 
  isLoading = false, 
  disabled = false,
  variant = "outline",
  size = "sm",
  className = ""
}: CheckInfoButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {isLoading ? "Generating..." : "Check My Information"}
    </Button>
  )
}
