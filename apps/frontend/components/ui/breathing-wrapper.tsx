'use client'

import { motion, useMotionValue, animate } from 'framer-motion'
import { useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BreathingWrapperProps {
  children: ReactNode
  
  // Breathing movement settings
  enabled?: boolean
  strength?: number
  speed?: number
  
  // Preset animations
  presetAnimation?: 'breathingScale' | 'pulse' | 'glow' | 'float'
  
  // Styling
  className?: string
  style?: React.CSSProperties
}

export function BreathingWrapper({
  children,
  enabled = true,
  strength = 0.05,
  speed = 5.6,
  presetAnimation = 'breathingScale',
  className,
  style
}: BreathingWrapperProps) {
  
  // Create motion values for breathing movement
  const breathingX = useMotionValue(0)
  const breathingY = useMotionValue(0)

  // Apply preset animations that respect strength and speed
  let animateProps = {}
  if (presetAnimation === 'breathingScale') {
    const scaleAmount = 1 + strength // strength affects scale amount
    animateProps = {
      scale: [1, scaleAmount, 1],
      transition: { duration: speed, repeat: Infinity }
    }
  } else if (presetAnimation === 'pulse') {
    const scaleAmount = 1 + strength
    const opacityRange = Math.max(0.3, 1 - strength)
    animateProps = {
      scale: [1, scaleAmount, 1],
      opacity: [opacityRange, 1, opacityRange],
      transition: { duration: speed, repeat: Infinity }
    }
  } else if (presetAnimation === 'glow') {
    const glowIntensity = Math.min(20, strength)
    animateProps = {
      filter: [
        "drop-shadow(0 0 0px rgba(255,255,255,0.5))",
        `drop-shadow(0 0 ${glowIntensity}px rgba(255,255,255,0.8))`,
        "drop-shadow(0 0 0px rgba(255,255,255,0.5))"
      ],
      transition: { duration: speed, repeat: Infinity }
    }
  } else if (presetAnimation === 'float') {
    const floatAmount = strength
    animateProps = {
      y: [0, -floatAmount, 0],
      transition: { duration: speed, repeat: Infinity }
    }
  }

  const motionStyle = {
    x: breathingX,
    y: breathingY,
    // Make the wrapper inherit parent dimensions and not interfere with layout
    width: '100%',
    height: '100%',
    // Don't interfere with child positioning
    position: 'relative' as const,
    ...style
  }

  return (
    <motion.div 
      className={cn("w-full h-full", className)}
      style={motionStyle}
      animate={animateProps}
    >
      {children}
    </motion.div>
  )
} 