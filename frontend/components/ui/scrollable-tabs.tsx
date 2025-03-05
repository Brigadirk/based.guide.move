"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ScrollableTabsProps extends React.ComponentPropsWithoutRef<typeof Tabs> {
  tabs: {
    value: string
    label: string
    icon?: React.ReactNode
    content: React.ReactNode
  }[]
  variant?: "default" | "sticky" | "grid"
  stickyClassName?: string
  tabsListClassName?: string
  triggerClassName?: string
}

export function ScrollableTabs({
  tabs,
  variant = "default",
  stickyClassName,
  tabsListClassName,
  triggerClassName,
  className,
  ...props
}: ScrollableTabsProps) {
  const isSticky = variant === "sticky"
  const isGrid = variant === "grid"

  const tabsList = (
    <div className={cn("bg-card", isSticky && "border-b")}>
      <div className="overflow-x-auto">
        <div className="px-4 md:px-6">
          <TabsList 
            className={cn(
              "w-full",
              isGrid ? "grid grid-cols-2 lg:grid-cols-4" : "justify-start inline-flex",
              tabsListClassName
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  !isGrid && "flex-1 gap-2 py-2 sm:py-3",
                  triggerClassName
                )}
              >
                {tab.icon}
                {!isGrid && (
                  <>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </>
                )}
                {isGrid && tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
    </div>
  )

  return (
    <Tabs
      defaultValue={tabs[0].value}
      className={cn("w-full", className)}
      {...props}
    >
      {isSticky ? (
        <div className={cn("sticky top-14 bg-background z-40", stickyClassName)}>
          {tabsList}
        </div>
      ) : (
        tabsList
      )}
      <div className={cn(
        "max-w-[1400px] mx-auto px-4 md:px-6",
        isSticky ? "pt-6" : "mt-6",
        "space-y-8"
      )}>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
} 