"use client"

import React, { createContext, useContext, useState } from 'react'

interface DebugContextType {
  debugMode: boolean
  setDebugMode: (enabled: boolean) => void
  isDev: boolean
}

const DebugContext = createContext<DebugContextType | undefined>(undefined)

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugMode, setDebugMode] = useState(false)
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <DebugContext.Provider value={{ debugMode, setDebugMode, isDev }}>
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const context = useContext(DebugContext)
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider')
  }
  return context
}
