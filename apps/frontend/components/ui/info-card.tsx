import { ReactNode } from "react"

interface InfoCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

export function InfoCard({ icon, title, description, className = "" }: InfoCardProps) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="bg-primary/10 p-3 rounded-lg">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
} 