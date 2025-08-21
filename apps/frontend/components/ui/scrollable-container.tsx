"use client"

import { cn } from "@/lib/utils"
import { useRef, useEffect } from "react"

interface ScrollableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: boolean
}

export function ScrollableContainer({
  children,
  className,
  background = false,
  ...props
}: ScrollableContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Prevent vertical scrolling if we can scroll horizontally
      if (
        Math.abs(e.deltaX) < Math.abs(e.deltaY) && 
        container.scrollWidth > container.clientWidth
      ) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true
      startX.current = e.touches[0].pageX - container.offsetLeft
      scrollLeft.current = container.scrollLeft
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const x = e.touches[0].pageX - container.offsetLeft
      const walk = (x - startX.current) * 2
      container.scrollLeft = scrollLeft.current - walk
    }

    const handleTouchEnd = () => {
      isDragging.current = false
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [])

  return (
    <div className={cn(background && "bg-muted/50")} {...props}>
      <div 
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto overscroll-x-contain touch-pan-x",
          "cursor-grab active:cursor-grabbing",
          "no-scrollbar",
          className
        )}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="container px-4 py-2">
          <div className="flex space-x-2 min-w-max">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 