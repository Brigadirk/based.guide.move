import * as React from "react"

interface PageHeadingProps {
  title: string
  description?: string
  actions?: React.ReactNode
  gradient?: boolean
  icon?: React.ReactNode
}

export function PageHeading({
  title,
  description,
  actions,
  gradient = false,
  icon
}: PageHeadingProps) {
  if (gradient) {
    return (
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 mb-8">
        <div className="flex items-center gap-3 px-6">
          {icon}
          <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        </div>
        {description && (
          <p className="mt-2 px-6 text-white/90">{description}</p>
        )}
        {actions && (
          <div className="mt-4 px-6">
            {actions}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="text-left pb-4 border-b mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
      </div>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
      )}
      {actions && (
        <div className="mt-4">
          {actions}
        </div>
      )}
    </div>
  )
} 