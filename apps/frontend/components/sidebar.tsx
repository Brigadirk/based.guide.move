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
import { FinanceSkipToggle } from "@/components/features/finance-skip-toggle";

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
  const { formData, getFormData, updateFormData, markSectionComplete, isSectionMarkedComplete } = useFormStore()
  
  // Only show destination bulletin when destination section is completed
  const isDestinationComplete = isSectionMarkedComplete("destination")
  const destCountry = (formData.residencyIntentions?.destinationCountry as any)?.country ?? formData.destination?.country ?? ""
  const destRegion = (formData.residencyIntentions?.destinationCountry as any)?.region ?? formData.destination?.region ?? ""
  
  // Debug logging for destination bulletin
  console.log('Sidebar destination debug:', {
    isDestinationComplete,
    destCountry,
    destRegion,
    residencyDestData: formData.residencyIntentions?.destinationCountry,
    fallbackDestData: formData.destination
  })
  
  return (
    <div className="w-[26rem] bg-card border-r border-border p-4 h-screen overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Assessment Steps</h2>
        <p className="text-sm text-muted-foreground">Complete each section to generate your personalized analysis</p>
        {isDestinationComplete && destCountry && destCountry.trim() !== "" && (
          <p className="text-sm mt-3 text-accent-positive">
            Destination: {destCountry}{destRegion && destRegion.trim() !== "" && destRegion !== "I don't know yet / open to any" ? ` – ${destRegion}` : ""}
          </p>
        )}
      </div>

      {/* Finance Skip Toggle */}
      <FinanceSkipToggle variant="sidebar" onToggle={(checked) => {
        // This will be handled by the main app's handleFinanceSkipToggle
        const event = new CustomEvent('financeSkipToggle', { detail: { checked } })
        window.dispatchEvent(event)
      }} />

      <div className="space-y-2">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || FileText;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          // Sequential progression: only allow access to current, previous completed, or next incomplete section
          const canAccess = index <= currentStep || isCompleted;
          
          return (
            <Button
              key={step.id}
              variant={isCurrent ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-auto p-3 ${
                isCurrent ? "bg-primary text-primary-foreground" : 
                isCompleted ? "bg-muted text-foreground border-border" : 
                !canAccess ? "text-muted-foreground/40 cursor-not-allowed" :
                "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => canAccess && onStepChange(index)}
              disabled={!canAccess}
              title={!canAccess ? "Complete previous sections first" : undefined}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{step.title}</div>
                {isCompleted && (
                  <div className="text-xs opacity-75">Completed</div>
                )}
                {!canAccess && (
                  <div className="text-xs opacity-50">Locked</div>
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