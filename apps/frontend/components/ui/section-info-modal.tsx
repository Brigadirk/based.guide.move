"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, FileText, ArrowRight, MapPin, User, GraduationCap, Heart, DollarSign, Shield, Receipt, TrendingUp, Minimize2, Maximize2 } from "lucide-react"
import { toast } from "sonner"
import { PerplexityLoading } from "@/components/ui/perplexity-loading"

interface SectionInfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  story: string
  isLoading?: boolean
  onExpandFullInfo?: () => void
  onBackToSection?: () => void
  currentSection?: string
  isFullView?: boolean
  onGoToSection?: (section: string) => void
  onNavigateToSection?: (section: string) => void
  onNavigateToResults?: () => void
}

export function SectionInfoModal({ 
  isOpen, 
  onClose, 
  title, 
  story, 
  isLoading = false,
  onExpandFullInfo,
  onBackToSection,
  currentSection,
  isFullView = false,
  onGoToSection,
  onNavigateToSection,
  onNavigateToResults
}: SectionInfoModalProps) {
  
  // Helper function to get section display name
  const getSectionDisplayName = (section: string) => {
    const sectionNames: { [key: string]: string } = {
      "personal": "Personal Information",
      "education": "Education & Skills", 
      "residency": "Residency Intentions",
      "finance": "Financial Information",
      "social-security": "Social Security & Pensions",
      "tax-deductions": "Tax Deductions & Credits",
      "future-plans": "Future Financial Plans",
      "additional": "Additional Information",
      "summary": "Summary"
    }
    return sectionNames[section] || section
  }

  // List of all sections for navigation with icons (matching main app sections)
  const allSections = [
    { key: "personal", name: "Personal Information", icon: User },
    { key: "education", name: "Education", icon: GraduationCap },
    { key: "residency", name: "Residency Intentions", icon: Heart }, 
    { key: "finance", name: "Income and Assets", icon: DollarSign },
    { key: "social-security", name: "Social Security and Pensions", icon: Shield },
    { key: "tax-deductions", name: "Tax Deductions and Credits", icon: Receipt },
    { key: "future-plans", name: "Future Financial Plans", icon: TrendingUp },
    { key: "additional", name: "Additional Information", icon: FileText }
  ]

  // Helper function to get section icon
  const getSectionIcon = (sectionName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      "Personal Information": User,
      "Education & Skills": GraduationCap,
      "Residency Intentions": Heart,
      "Financial Information": DollarSign,
      "Social Security & Pensions": Shield,
      "Tax Deductions & Credits": Receipt,
      "Future Financial Plans": TrendingUp,
      "Additional Information": FileText,
      "Complete Summary": FileText
    }
    return iconMap[sectionName] || FileText
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription>
            Review how your information is interpreted and presented.
          </DialogDescription>
        </DialogHeader>
        
        {/* Section Navigation (only in full view) - Move to top */}
        {isFullView && onNavigateToSection && (
          <div className="flex-shrink-0 border-b bg-muted/50 p-4">
            <div className="text-sm font-medium mb-3">Go to Section (to edit):</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {allSections.map((section) => {
                const IconComponent = section.icon
                return (
                  <Button
                    key={section.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onNavigateToSection(section.key)
                      onClose() // Close modal when navigating
                    }}
                    className="justify-start h-auto p-2 text-xs"
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {section.name}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Fixed height scrollable content window */}
        <div className="flex-shrink-0 border rounded-md bg-background">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center p-4">
              <PerplexityLoading 
                isLoading={true} 
                loadingText="Generating your information story..."
                className="w-full max-w-md"
              />
            </div>
          ) : (
            <div className="h-96 overflow-y-auto p-4 border">
              {story ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {story.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') {
                      return <br key={index} />
                    }
                    
                    // Handle markdown headers (lines that start with # but not already rendered)
                    if (paragraph.trim().startsWith('#')) {
                      const level = paragraph.match(/^#+/)?.[0].length || 1
                      const text = paragraph.replace(/^#+\s*/, '')
                      const headerClass = level === 1 ? "text-2xl font-bold mt-4 mb-3 text-primary" :
                                         level === 2 ? "text-xl font-semibold mt-3 mb-2 text-primary flex items-center gap-2" :
                                         "text-lg font-medium mt-2 mb-1 text-primary"
                      
                      if (level === 2) {
                        const IconComponent = getSectionIcon(text)
                        return (
                          <div key={index} className={headerClass}>
                            <IconComponent className="w-5 h-5" />
                            {text}
                          </div>
                        )
                      }
                      
                      return (
                        <div key={index} className={headerClass}>
                          {text}
                        </div>
                      )
                    }
                    
                    // Skip section headers that end with : (these are duplicates of the markdown headers)
                    if (paragraph.trim().endsWith(':') && !paragraph.includes('.') && !paragraph.trim().startsWith('#')) {
                      return null
                    }
                    
                    // Handle bullet points (lines that start with -)
                    if (paragraph.trim().startsWith('- ')) {
                      return (
                        <li key={index} className="ml-4 mb-1">
                          {paragraph.trim().substring(2)}
                        </li>
                      )
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No information available for this section.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {!isFullView && onExpandFullInfo && (
              <Button 
                variant="default" 
                onClick={onExpandFullInfo}
                className="flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4 text-white" />
                Expand Full Information
              </Button>
            )}
            {isFullView && onBackToSection && currentSection && (
              <Button 
                variant="default" 
                onClick={onBackToSection}
                className="flex items-center gap-2"
              >
                <Minimize2 className="w-4 h-4 text-white" />
                Unexpand
              </Button>
            )}
            {isFullView && onNavigateToResults && (
              <Button 
                variant="default" 
                onClick={() => {
                  onNavigateToResults()
                  onClose()
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="w-4 h-4 text-white" />
                Go to Results
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
