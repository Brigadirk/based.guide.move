"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHintProps {
  title?: string // defaults to "Why is this section important?"
  children: React.ReactNode
}

export function SectionHint({ title = "Why is this section important?", children }: SectionHintProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border rounded-md bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Info className="w-4 h-4" />
        <span>{title}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-muted-foreground">{children}</div>}
    </div>
  )
} 