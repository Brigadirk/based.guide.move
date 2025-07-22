"use client"

import { useState } from "react"
import { Code, X } from "lucide-react"
import { useFormStore } from "@/lib/stores"
import { Button } from "@/components/ui/button"

export function DevStateViewer() {
  // Only show in non-production builds
  if (process.env.NODE_ENV === "production") {
    return null
  }

  const { formData } = useFormStore()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating toggle button */}
      <Button
        size="icon"
        variant="secondary"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Code className="w-5 h-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-md shadow-xl overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <pre className="text-xs p-4 whitespace-pre-wrap break-all">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  )
} 