"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trash2, Plus, CreditCard } from "lucide-react"
import { getCountries } from "@/lib/utils/country-utils"

export function FinanciallySupportedSection({ incomeSources, partnerIncomeSources, updateFormData, currencies, hasPartnerSelected }: any) {
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

  const [partnerStipendData, setPartnerStipendData] = useState({
    amount: 0,
    currency: "USD",
    country: "",
    source: "",
    sourceType: "Family",
    frequency: "Monthly",
    duration: "",
    notes: ""
  })

  const [supportTab, setSupportTab] = useState("you")

  // Check if there's already a support stipend in income sources
  const existingStipend = incomeSources.find((source: any) => source.category === "Financial Support")
  const existingPartnerStipend = partnerIncomeSources?.find((source: any) => source.category === "Financial Support")
  
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

  // Populate partner form with existing data
  useEffect(() => {
    if (existingPartnerStipend) {
      const monthlyAmount = existingPartnerStipend.fields?.frequency === "Monthly" 
        ? existingPartnerStipend.amount / 12 
        : existingPartnerStipend.amount;
      
      setPartnerStipendData({
        amount: monthlyAmount,
        currency: existingPartnerStipend.currency || "USD",
        country: existingPartnerStipend.country || "",
        source: existingPartnerStipend.fields?.source || "",
        sourceType: existingPartnerStipend.fields?.sourceType || "Family",
        frequency: existingPartnerStipend.fields?.frequency || "Monthly",
        duration: existingPartnerStipend.fields?.duration || "",
        notes: existingPartnerStipend.fields?.notes || ""
      });
    }
  }, [existingPartnerStipend]);
  
  // Unified function for adding stipends
  const handleAddStipend = (isPartner: boolean = false) => {
    const data = isPartner ? partnerStipendData : stipendData
    const setData = isPartner ? setPartnerStipendData : setStipendData
    const sources = isPartner ? partnerIncomeSources : incomeSources
    const existing = isPartner ? existingPartnerStipend : existingStipend
    const dataPath = isPartner ? "finance.partner.incomeSources" : "finance.incomeSources"
    
    if (data.amount <= 0 || !data.source || !data.sourceType) return

    // Convert to annual amount for consistency with other income sources
    const annualAmount = data.frequency === "Monthly" ? data.amount * 12 : data.amount
    
    const newStipend = {
      category: "Financial Support",
      amount: annualAmount,
      currency: data.currency,
      country: data.country || "Various", // Support can be from anywhere
      continueInDestination: true,
      fields: {
        sourceType: data.sourceType,
        source: data.source,
        frequency: data.frequency,
        duration: data.duration,
        notes: data.notes
      }
    }

    const updatedSources = existing 
      ? sources.map((source: any) => 
          source.category === "Financial Support" ? newStipend : source
        )
      : [...(sources || []), newStipend]

    updateFormData(dataPath, updatedSources)
    
    // Reset form if adding new
    if (!existing) {
      setData({
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

  // Unified function for removing stipends
  const handleRemoveStipend = (isPartner: boolean = false) => {
    const sources = isPartner ? partnerIncomeSources : incomeSources
    const dataPath = isPartner ? "finance.partner.incomeSources" : "finance.incomeSources"
    
    const updatedSources = (sources || []).filter((source: any) => source.category !== "Financial Support")
    updateFormData(dataPath, updatedSources)
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
          {/* Display saved stipends for both You and Partner */}
          <div className="space-y-4">
            {/* Your Financial Support */}
            {existingStipend && (
              <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">Your Financial Support</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveStipend(false)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>{existingStipend.currency} {(existingStipend.amount / 12).toLocaleString()}/month</strong> from {existingStipend.fields?.sourceType}: {existingStipend.fields?.source}
                </div>
              </div>
            )}

            {/* Partner's Financial Support */}
            {hasPartnerSelected && existingPartnerStipend && (
              <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-green-500">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">Partner's Financial Support</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveStipend(true)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>{existingPartnerStipend.currency} {(existingPartnerStipend.amount / 12).toLocaleString()}/month</strong> from {existingPartnerStipend.fields?.sourceType}: {existingPartnerStipend.fields?.source}
                </div>
              </div>
            )}
          </div>

          {/* Tab-based form inputs */}
          {hasPartnerSelected ? (
            <Tabs value={supportTab} onValueChange={setSupportTab} className="w-full">
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
              
              <TabsContent value="you" className="mt-6 space-y-6">
                {/* Your Financial Support Form */}
                <FinancialSupportForm 
                  stipendData={stipendData}
                  setStipendData={setStipendData}
                  existingStipend={existingStipend}
                  currencies={currencies}
                  countries={countries}
                  onSave={() => handleAddStipend(false)}
                  isPartner={false}
                />
              </TabsContent>
              
              <TabsContent value="partner" className="mt-6 space-y-6">
                {/* Partner's Financial Support Form */}
                <FinancialSupportForm 
                  stipendData={partnerStipendData}
                  setStipendData={setPartnerStipendData}
                  existingStipend={existingPartnerStipend}
                  currencies={currencies}
                  countries={countries}
                  onSave={() => handleAddStipend(true)}
                  isPartner={true}
                />
              </TabsContent>
            </Tabs>
          ) : (
            /* Single user mode */
            <FinancialSupportForm 
              stipendData={stipendData}
              setStipendData={setStipendData}
              existingStipend={existingStipend}
              currencies={currencies}
              countries={countries}
              onSave={() => handleAddStipend(false)}
              isPartner={false}
            />
          )}


        </div>
      </CardContent>
    </Card>
  )
}

// Reusable form component for financial support
function FinancialSupportForm({ stipendData, setStipendData, existingStipend, currencies, countries, onSave, isPartner }: any) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h4 className="font-medium">{existingStipend ? "Update" : "Add"} {isPartner ? "Partner's" : "Your"} Financial Support</h4>
      
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
              {countries.map((country: string) => (
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
        onClick={onSave}
        disabled={stipendData.amount <= 0 || !stipendData.source || !stipendData.sourceType}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        {existingStipend ? "Update" : "Add"} {isPartner ? "Partner's" : "Your"} Financial Support
      </Button>
    </div>
  )
}
