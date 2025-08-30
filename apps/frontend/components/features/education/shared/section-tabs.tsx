"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type SectionTabsProps = {
  children: React.ReactNode
  tabState: string
  setTabState: (value: string) => void
  className?: string
}

export function SectionTabs({ children, tabState, setTabState, className = "" }: SectionTabsProps) {
  return (
    <Tabs value={tabState} onValueChange={setTabState} className={`w-full ${className}`}>
      <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
        <TabsTrigger 
          value="you" 
          className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
        >
          You
        </TabsTrigger>
        <TabsTrigger 
          value="partner" 
          className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
        >
          Partner
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}

export { TabsContent }
