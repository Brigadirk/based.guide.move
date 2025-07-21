import Image from "next/image"
import { Card } from "@/components/ui/card"

interface StepCardProps {
  title: string
  description: string
  illustration: string
  index: number
  className?: string
}

export function StepCard({ title, description, illustration, index, className = "" }: StepCardProps) {
  return (
    <Card className={`relative flex flex-col w-[300px] mx-auto shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="relative h-48 w-full">
        <Image
          src={illustration}
          alt={title}
          fill
          className="object-cover rounded-t-xl"
        />
        <span className="absolute top-4 left-4 text-2xl font-bold text-foreground leading-none bg-background/80 rounded-full w-10 h-10 flex items-center justify-center">
          {index + 1}
        </span>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
} 