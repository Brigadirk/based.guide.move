import { cn } from "@/lib/utils"

interface ScrollableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: boolean
}

export function ScrollableContainer({
  children,
  className,
  background = false,
  ...props
}: ScrollableContainerProps) {
  return (
    <div className={cn(background && "bg-muted/50")} {...props}>
      <div className="overflow-x-auto">
        <div className="container px-4 py-2">
          <div className="flex space-x-2 min-w-max">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 