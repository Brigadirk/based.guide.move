'use client'

import { motion, useTransform, useSpring, useMotionValue, MotionValue } from 'framer-motion'
import { useEffect, ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ParallaxLayerProps {
  // Image props
  src?: string
  alt?: string
  children?: ReactNode
  
  // Parallax behavior
  scrollSpeed?: number
  mouseStrength?: number
  clampBoundaries?: boolean
  containerHeight?: number // Dynamic container height (default: 100vh)
  
  // Smoothing
  smooth?: boolean
  stiffness?: number
  damping?: number
  mass?: number
  
  // Styling
  className?: string
  style?: React.CSSProperties
  scale?: number
  rotate?: string
  
  // Input source (passed from parent)
  inputSource: { x: number; y: number }
  scrollYProgress: MotionValue<number> // MotionValue from parent scroll container
}

// Simple clamping utility for scroll only
function clampMovement(
  movement: number,
  axis: 'x' | 'y',
  movementType: 'scroll' | 'mouse',
  scale: number,
  scrollProgress: number = 0
): number {
  if (typeof window === 'undefined') return movement
  
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Get viewport size for this axis
  const viewportSize = axis === 'y' ? viewportHeight : viewportWidth
  
  // Calculate extra space from scaling
  const extraSpace = (scale - 1) * viewportSize
  
  // Allow movement up to half the extra space
  const maxMovement = extraSpace / 2
  
  // Simple symmetric clamping
  return Math.max(-maxMovement, Math.min(maxMovement, movement))
}


export function ParallaxLayer({
  src,
  alt = '',
  children,
  scrollSpeed = 0,
  mouseStrength = 0,
  clampBoundaries = false,
  containerHeight,
  smooth = true,
  stiffness = 170,
  damping = 26,
  mass = 1,
  className,
  style,
  scale = 1.05,
  rotate,
  inputSource,
  scrollYProgress
}: ParallaxLayerProps) {
  
  // Create scroll transform with proper boundary calculation
  const scrollY = useTransform(scrollYProgress, (progress) => {
    const imageMovement = scrollSpeed * progress
    if (typeof window === 'undefined') return imageMovement
      
    // If boundary clamping is disabled, return raw movement
    if (!clampBoundaries) {
      return imageMovement
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const actualContainerHeight = containerHeight ? containerHeight * viewportHeight : viewportHeight
    
    // Calculate base available movement (static image boundaries)
    const imageSize = Math.max(viewportWidth, viewportHeight)
    const scaledImageSize = imageSize * scale
    const baseAvailableMovement = Math.max(0, (scaledImageSize - actualContainerHeight) / 2) * 1.1
    
    // Calculate how much the viewport has moved
    const viewportMovement = progress * actualContainerHeight
    
    // Calculate net movement: how much image moves relative to WORLD coordinates
    const netImageMovement = imageMovement + viewportMovement
    
    // Determine which boundary the image is moving toward
    let dynamicTopBound, dynamicBottomBound
    
    if (netImageMovement > 0) {
      // Image moving DOWN in world coordinates - approaches bottom boundary
      dynamicTopBound = baseAvailableMovement
      dynamicBottomBound = baseAvailableMovement + viewportMovement
    } else {
      // Image moving UP in world coordinates - approaches top boundary  
      dynamicTopBound = baseAvailableMovement + viewportMovement
      dynamicBottomBound = baseAvailableMovement
    }
    
    // Clamp the movement to stay within dynamic boundaries
    return Math.max(-dynamicTopBound, Math.min(dynamicBottomBound, imageMovement))
  })

  // Create motion values for mouse parallax
  const parallaxXTarget = useMotionValue(0)
  const parallaxYTarget = useMotionValue(0)
  
  // Create spring animations for smooth movement (if enabled)
  const springX = useSpring(parallaxXTarget, { stiffness, damping, mass })
  const parallaxX = smooth ? springX : parallaxXTarget
    
  const springY = useSpring(parallaxYTarget, { stiffness, damping, mass })
  const parallaxY = smooth ? springY : parallaxYTarget

  // Update target values with simple clamping
  useEffect(() => {
    const rawX = inputSource.x * mouseStrength
    const rawY = inputSource.y * mouseStrength
    
    if (clampBoundaries) {
      const clampedX = clampMovement(rawX, 'x', 'mouse', scale)
      const clampedY = clampMovement(rawY, 'y', 'mouse', scale)
      
      parallaxXTarget.set(clampedX)
      parallaxYTarget.set(clampedY)
    } else {
      parallaxXTarget.set(rawX)
      parallaxYTarget.set(rawY)
    }
  }, [inputSource.x, inputSource.y, mouseStrength, clampBoundaries, scale, parallaxXTarget, parallaxYTarget])

  // Check if custom dimensions are provided
  const hasCustomDimensions = style && (
    style.width !== undefined || 
    style.height !== undefined
  )

  const motionStyle = {
    y: scrollY,
    translateX: parallaxX,
    translateY: parallaxY,
    scale,
    rotate,
    ...style
  }

  return (
    <motion.div 
      className={cn( hasCustomDimensions ? "absolute" : "absolute inset-0", className)}
      style={motionStyle}
    >
      {src ? (
        hasCustomDimensions ? (
          // Use regular img for custom dimensions - preserves aspect ratio
          <img
            src={src}
            alt={alt}
            className={cn(
              "overflow-visible",
              alt.includes('text') ? "object-contain" : "object-cover"
            )}
            style={{
              width: style?.width || 'auto',
              height: style?.height || 'auto',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        ) : (
          // Use Image fill for full container coverage
          <Image
            src={src}
            alt={alt}
            fill
            className={alt.includes('text') ? "object-contain overflow-visible" : "object-cover overflow-visible"}
            priority
          />
        )
      ) : (
        children
      )}
    </motion.div>
  )
} 