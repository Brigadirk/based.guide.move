"use client";

/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, Shield, Target, Zap } from "lucide-react";

interface DisclaimerProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
  getFormData: (path: string) => any;
}

export function Disclaimer({ formData, updateFormData, getFormData }: DisclaimerProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ⚠️ Disclaimer & Introduction
        </h1>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Test Version Notice */}
      <Card className="border-border bg-muted">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            <span className="font-semibold">TEST VERSION</span>
          </div>
          <p className="text-muted-foreground mt-2">
            We do not store your data in any way. Feel free to use your real financial information.
          </p>
        </CardContent>
      </Card>

      {/* Main Disclaimer */}
      <Card className="border-border bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5" />
            AI-Powered Guidance Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            This tool uses artificial intelligence to provide personalized guidance for international tax and immigration planning. 
            While we strive for accuracy and comprehensive analysis, please understand that:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm font-medium">AI systems may occasionally provide incorrect or outdated information</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm font-medium">Tax and immigration laws change frequently across jurisdictions</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm font-medium">This analysis is for informational purposes only, not legal advice</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm font-medium">Always verify information with qualified professionals before making decisions</span>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border rounded-lg p-4">
            <p className="text-muted-foreground font-medium flex items-center gap-2">
               By proceeding, you acknowledge these limitations and agree to use this tool for informational purposes only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Purpose Explanation */}
      <Card className="border-border bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            🎯 What This Assessment Provides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We'll analyze your personal situation to help you understand:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-primary bg-card">
              <CardContent className="pt-4">
                <p className="text-foreground font-medium flex items-center gap-2">
                   Tax obligations in your destination country
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-primary bg-card">
              <CardContent className="pt-4">
                <p className="text-foreground font-medium flex items-center gap-2">
                  🛂 Visa eligibility and residency requirements
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-primary bg-card">
              <CardContent className="pt-4">
                <p className="text-foreground font-medium flex items-center gap-2">
                  📊 Financial implications of your international move
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-primary bg-card">
              <CardContent className="pt-4">
                <p className="text-foreground font-medium flex items-center gap-2">
                  🗺️ Recommended next steps for your specific circumstances
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-border bg-muted text-center">
        <CardContent className="pt-8 pb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">🚀 Ready to Get Started?</h3>
          <p className="text-muted-foreground">
            Select your destination country and begin your personalized assessment
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 