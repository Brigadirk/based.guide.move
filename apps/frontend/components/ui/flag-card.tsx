'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FlagCardProps {
  src: string
  alt: string
  children?: ReactNode
  className?: string
  rotation?: number
  style?: React.CSSProperties
  isBase?: boolean
  width: number // Only set width, height will adjust to natural aspect ratio
}

export function FlagCard({ 
  src, 
  alt, 
  children, 
  className,
  rotation = 0,
  style,
  width
}: FlagCardProps) {
  return (
    <div 
      className={cn(
        "relative",
        "drop-shadow-[6px_6px_0_rgba(0,0,0,0.4)]",
        "transform-gpu",
        className
      )}
      style={{
        width: `${width}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        ...style
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        className="w-full h-auto object-cover"
        style={{ display: 'block' }}
      />
      {children}
    </div>
  )
}

interface TextCardProps {
  children: ReactNode
  className?: string
}

export function TextCard({ children, className }: TextCardProps) {
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center",
      "bg-brand-background",
      "rounded-lg",
      "p-2 sm:p-3 md:p-4 lg:p-6",
      "m-8 sm:m-10 md:m-12",
      className
    )}>
      <div className="text-center w-full h-full flex flex-col justify-center" style={{
        fontSize: 'clamp(0.6rem, 2.5vw, 1rem)',
        lineHeight: 'clamp(0.8rem, 3vw, 1.4rem)'
      }}>
        <div className="[&_h3]:text-[clamp(0.8rem,3vw,1.2rem)] [&_h3]:leading-[clamp(1rem,3.5vw,1.5rem)] [&_h3]:font-bold [&_h4]:text-[clamp(0.7rem,2.5vw,1rem)] [&_h4]:leading-[clamp(0.9rem,3vw,1.3rem)] [&_h4]:font-semibold [&_li]:text-[clamp(0.6rem,2vw,0.9rem)] [&_li]:leading-[clamp(0.8rem,2.5vw,1.2rem)] [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  )
} 