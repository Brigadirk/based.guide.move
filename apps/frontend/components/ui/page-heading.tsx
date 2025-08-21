import * as React from "react"

interface PageHeadingProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeading({
  title,
  description,
  actions
}: PageHeadingProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-4 md:mt-0 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
} 