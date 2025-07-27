"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/lib/stores";
import { 
  AlertTriangle, 
  Globe, 
  User, 
  GraduationCap, 
  Plane, 
  DollarSign, 
  Shield, 
  Calculator, 
  TrendingUp, 
  FileText, 
  CheckCircle,
  Zap
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Step {
  id: string;
  title: string;
  component: any;
}

interface SidebarProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

const stepIcons = [
  AlertTriangle, Globe, User, GraduationCap, Plane, 
  DollarSign, Shield, Calculator, TrendingUp, FileText, CheckCircle
];

export function Sidebar({ steps, currentStep, onStepChange }: SidebarProps) {
  const { formData, getFormData, updateFormData, markSectionComplete } = useFormStore()
  const destCountry = formData.destination?.country ?? ""
  const destRegion = formData.destination?.region ?? ""
  
  // Finance skip functionality
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false
  
  const handleFinanceSkipToggle = (checked: boolean) => {
    const wasAutoCompleted = getFormData("finance.autoCompletedSections") ?? false
    
    updateFormData("finance.skipDetails", checked)
    
    if (checked) {
      // Mark all finance-related sections as complete when skipping details
      markSectionComplete("finance")
      markSectionComplete("social-security") 
      markSectionComplete("tax-deductions")
      markSectionComplete("future-plans")
      
      // Store which sections were auto-completed so we can unmark them later
      updateFormData("finance.autoCompletedSections", [
        "finance", "social-security", "tax-deductions", "future-plans"
      ])
    } else if (wasAutoCompleted) {
      // When unchecking, unmark the sections that were auto-completed
      const autoCompletedSections = Array.isArray(wasAutoCompleted) 
        ? wasAutoCompleted 
        : ["finance", "social-security", "tax-deductions", "future-plans"]
      
      // Unmark each auto-completed section
      autoCompletedSections.forEach((sectionId: string) => {
        updateFormData(`completedSections.${sectionId}`, false)
      })
      
      // Clear the auto-completion flag
      updateFormData("finance.autoCompletedSections", false)
    }
  }
  return (
    <div className="w-80 bg-card border-r border-border p-4 h-screen overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Assessment Steps</h2>
        <p className="text-sm text-muted-foreground">Complete each section to generate your personalized analysis</p>
        {destCountry && (
          <p className="text-sm mt-3 text-accent-positive">
            Destination: {destCountry}{destRegion && ` – ${destRegion}`}
          </p>
        )}
      </div>

      {/* Finance Skip Toggle */}
      <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <Label htmlFor="finance-skip" className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Quick Finance Skip
                </Label>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Skip detailed finance sections
                </p>
              </div>
            </div>
            <Switch
              id="finance-skip"
              checked={skipFinanceDetails}
              onCheckedChange={handleFinanceSkipToggle}
            />
          </div>
          {skipFinanceDetails && (
            <div className="mt-3 p-2 rounded bg-green-100 dark:bg-green-900/30">
              <p className="text-xs text-green-800 dark:text-green-200">
                ✅ Finance sections auto-completed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || FileText;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <Button
              key={step.id}
              variant={isCurrent ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-auto p-3 ${
                isCurrent ? "bg-primary text-primary-foreground" : 
                isCompleted ? "bg-muted text-foreground border-border" : 
                "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onStepChange(index)}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{step.title}</div>
                {isCompleted && (
                  <div className="text-xs opacity-75">Completed</div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Progress</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {currentStep + 1} of {steps.length} steps completed
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 