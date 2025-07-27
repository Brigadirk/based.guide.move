"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Info } from "lucide-react"

interface SectionHintProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function SectionHint({ 
  title = "💡 Why is this section important?", 
  children, 
  className = "" 
}: SectionHintProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className={`border border-slate-200/60 rounded-lg bg-gradient-to-r from-slate-50/50 to-blue-50/30 transition-all duration-200 hover:shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors group"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="w-5 h-5 rounded-full bg-card flex items-center justify-center group-hover:bg-muted transition-colors">
            <Info className="w-3 h-3 text-slate-600" />
          </div>
          <span className="text-left">{title}</span>
        </div>
        <div className="text-slate-500 group-hover:text-slate-700 transition-colors">
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>
      
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/40 bg-gradient-to-r from-white/60 to-blue-50/20">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  )
} 