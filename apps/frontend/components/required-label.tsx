'use client'

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RequiredLabelProps extends React.ComponentProps<typeof Label> {
  children: React.ReactNode
  required?: boolean
}

export function RequiredLabel({ children, required = true, className, ...props }: RequiredLabelProps) {
  return (
    <Label className={cn("flex items-center gap-1", className)} {...props}>
      {children}
      {required && (
        <span className="text-destructive text-sm" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  )
} 