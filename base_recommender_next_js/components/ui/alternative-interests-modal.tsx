"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Target, X } from "lucide-react"
import { useFormStore } from "@/lib/stores"

interface AlternativeInterestsModalProps {
  isOpen: boolean
  onClose: () => void
  destinationCountry: string
  onContinueToSummary: () => void
  onMistake: () => void
}

export function AlternativeInterestsModal({
  isOpen,
  onClose,
  destinationCountry,
  onContinueToSummary,
  onMistake
}: AlternativeInterestsModalProps) {
  const { getFormData, updateFormData } = useFormStore()

  const handleContinueToSummary = () => {
    onContinueToSummary()
    onClose()
  }

  const handleMistake = () => {
    onMistake()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            What Are You Looking For?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Explanation */}
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="pt-6">
              <p className="text-purple-800 dark:text-purple-200">
                <strong>Great news!</strong> You do not appear to be interested in taxation, nor do you or any of your family members need a visa to enter {destinationCountry}. 
                This means we can focus on what really matters to you.
              </p>
              <p className="text-purple-800 dark:text-purple-200 mt-3">
                <strong>Please tell us:</strong> What do you want to use this system for? What specific information would help with your move?
              </p>
            </CardContent>
          </Card>

          {/* Required Purpose Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What do you want to use this system for? <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Please describe what you want to know about moving to and living in this country. Be specific about your goals and what information would be most helpful. (e.g., 'I want to understand the healthcare system and how to register', 'I need to know about the housing market and buying process', 'I want practical information about daily life and cultural integration')"
                value={getFormData("alternativeInterests.purpose") || ""}
                onChange={(e) => updateFormData("alternativeInterests.purpose", e.target.value)}
                rows={6}
                className="w-full"
                required
              />
              <p className="text-sm text-muted-foreground mt-2">
                This information will help us provide you with a targeted summary focused on your specific needs.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleMistake}
              className="text-gray-600 hover:text-gray-800"
            >
              I made a mistake
            </Button>
            
            <Button 
              onClick={handleContinueToSummary}
              disabled={!getFormData("alternativeInterests.purpose")?.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
          
          {!getFormData("alternativeInterests.purpose")?.trim() && (
            <p className="text-sm text-red-500 text-center mt-2">
              Please describe what you want to use this system for before continuing.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
