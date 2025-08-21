"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, CreditCard } from "lucide-react"
import { getCountries } from "@/lib/utils/country-utils"

export function FinanciallySupportedSection({ incomeSources, updateFormData, currencies }: any) {
  const countries = getCountries()
  
  const [stipendData, setStipendData] = useState({
    amount: 0,
    currency: "USD",
    country: "",
    source: "",
    sourceType: "Family",
    frequency: "Monthly",
    duration: "",
    notes: ""
  })

  // Check if there's already a support stipend in income sources
  const existingStipend = incomeSources.find((source: any) => source.category === "Financial Support")
  
  // Populate form with existing data
  useEffect(() => {
    if (existingStipend) {
      const monthlyAmount = existingStipend.fields?.frequency === "Monthly" 
        ? existingStipend.amount / 12 
        : existingStipend.amount;
      
      setStipendData({
        amount: monthlyAmount,
        currency: existingStipend.currency || "USD",
        country: existingStipend.country || "",
        source: existingStipend.fields?.source || "",
        sourceType: existingStipend.fields?.sourceType || "Family",
        frequency: existingStipend.fields?.frequency || "Monthly",
        duration: existingStipend.fields?.duration || "",
        notes: existingStipend.fields?.notes || ""
      });
    }
  }, [existingStipend]);
  
  const handleAddStipend = () => {
    if (stipendData.amount <= 0 || !stipendData.source || !stipendData.sourceType) return

    // Convert to annual amount for consistency with other income sources
    const annualAmount = stipendData.frequency === "Monthly" ? stipendData.amount * 12 : stipendData.amount
    
    const newStipend = {
      category: "Financial Support",
      amount: annualAmount,
      currency: stipendData.currency,
      country: stipendData.country || "Various", // Support can be from anywhere
      continueInDestination: true,
      fields: {
        sourceType: stipendData.sourceType,
        source: stipendData.source,
        frequency: stipendData.frequency,
        duration: stipendData.duration,
        notes: stipendData.notes
      }
    }

    const updatedSources = existingStipend 
      ? incomeSources.map((source: any) => 
          source.category === "Financial Support" ? newStipend : source
        )
      : [...incomeSources, newStipend]

    updateFormData("finance.incomeSources", updatedSources)
    
    // Reset form if adding new
    if (!existingStipend) {
      setStipendData({
        amount: 0,
        currency: "USD",
        country: "",
        source: "",
        sourceType: "Family",
        frequency: "Monthly",
        duration: "",
        notes: ""
      })
    }
  }

  const handleRemoveStipend = () => {
    const updatedSources = incomeSources.filter((source: any) => source.category !== "Financial Support")
    updateFormData("finance.incomeSources", updatedSources)
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-purple-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
        <CardTitle className="text-xl flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-purple-600" />
          Financial Support Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Document your stipend, allowance, or financial support for visa applications
        </p>
        <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>💜 Visa Perspective:</strong> Many visa categories accept financial support from family, 
            scholarships, or institutional funding. Document the source, amount, and duration to show 
            sustainable financial backing for your stay.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Existing Stipend Display */}
          {existingStipend && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-purple-800 dark:text-purple-200">Current Financial Support</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveStipend}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Amount</p>
                  <p className="text-lg font-bold text-purple-600">
                    {existingStipend.currency} {(existingStipend.amount / 12).toLocaleString()} / month
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({existingStipend.currency} {existingStipend.amount.toLocaleString()} / year)
                  </p>
                </div>
                <div>
                  <p className="font-medium">Source</p>
                  <p>{existingStipend.fields?.sourceType}: {existingStipend.fields?.source}</p>
                </div>
                <div>
                  <p className="font-medium">Duration</p>
                  <p>{existingStipend.fields?.duration || "Ongoing"}</p>
                </div>
              </div>
              {existingStipend.fields?.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{existingStipend.fields.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Stipend Form */}
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <h4 className="font-medium">{existingStipend ? "Update" : "Add"} Financial Support</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Amount and Currency */}
              <div className="space-y-2">
                <Label>Monthly Amount</Label>
                <div className="flex gap-2">
                  <Select 
                    value={stipendData.currency} 
                    onValueChange={(value) => setStipendData({...stipendData, currency: value})}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr: string) => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={stipendData.amount}
                    onChange={(e) => setStipendData({...stipendData, amount: parseFloat(e.target.value) || 0})}
                    placeholder="Amount per month"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Source Country */}
              <div className="space-y-2">
                <Label>Support Origin Country</Label>
                <Select 
                  value={stipendData.country} 
                  onValueChange={(value) => setStipendData({...stipendData, country: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Source Type */}
              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select 
                  value={stipendData.sourceType} 
                  onValueChange={(value) => setStipendData({...stipendData, sourceType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family">Family Support</SelectItem>
                    <SelectItem value="Partner">Partner/Spouse</SelectItem>
                    <SelectItem value="Scholarship">Scholarship</SelectItem>
                    <SelectItem value="Institution">Institution/Organization</SelectItem>
                    <SelectItem value="Government">Government Program</SelectItem>
                    <SelectItem value="Trust">Trust Fund</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Details */}
              <div className="space-y-2">
                <Label>Source Details</Label>
                <Input
                  value={stipendData.source}
                  onChange={(e) => setStipendData({...stipendData, source: e.target.value})}
                  placeholder="e.g., Parents, University of X, XYZ Foundation"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Expected Duration</Label>
                <Select 
                  value={stipendData.duration} 
                  onValueChange={(value) => setStipendData({...stipendData, duration: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                    <SelectItem value="4 years">4 years</SelectItem>
                    <SelectItem value="5+ years">5+ years</SelectItem>
                    <SelectItem value="Ongoing">Ongoing/Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={stipendData.notes}
                onChange={(e) => setStipendData({...stipendData, notes: e.target.value})}
                placeholder="Any additional details about the financial support..."
                rows={2}
              />
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleAddStipend}
              disabled={stipendData.amount <= 0 || !stipendData.source || !stipendData.sourceType}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {existingStipend ? "Update" : "Add"} Financial Support
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
