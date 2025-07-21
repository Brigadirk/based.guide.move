"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormData } from "@/lib/hooks/use-form-data";
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
  CheckCircle 
} from "lucide-react";

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
  const { formData } = useFormData()
  const destCountry = formData.destination?.country ?? ""
  const destRegion = formData.destination?.region ?? ""
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