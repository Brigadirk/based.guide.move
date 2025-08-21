"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CarouselProps {
  items: React.ReactNode[]
  className?: string
  itemClassName?: string
  showDots?: boolean
  showArrows?: boolean
  loop?: boolean
}

export function Carousel({
  items,
  className,
  itemClassName,
  showDots = true,
  showArrows = true,
  loop = false,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop,
    dragFree: false,
    containScroll: "trimSnaps",
    align: "start"
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className={cn("relative w-full max-w-full", className)}>
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex-[0_0_100%] min-w-0 px-4",
                itemClassName
              )}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-4">
        {showArrows && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="rounded-full"
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {showDots && (
          <div className="flex gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedIndex ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        )}

        {showArrows && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="rounded-full"
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
} 