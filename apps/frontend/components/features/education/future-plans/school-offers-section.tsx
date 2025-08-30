"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, School } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import type { SchoolOffer } from "../types"

type SchoolOffersSectionProps = {
  schoolOffersTab: string
  setSchoolOffersTab: (value: string) => void
  hasPartnerSelected: boolean
  schoolOffers: SchoolOffer[]
  setSchoolOffers: (offers: SchoolOffer[]) => void
  partnerSchoolOffers: SchoolOffer[]
  setPartnerSchoolOffers: (offers: SchoolOffer[]) => void
}

export function SchoolOffersSection({
  schoolOffersTab,
  setSchoolOffersTab,
  hasPartnerSelected,
  schoolOffers,
  setSchoolOffers,
  partnerSchoolOffers,
  setPartnerSchoolOffers
}: SchoolOffersSectionProps) {
  const [offerDraft, setOfferDraft] = useState({
    school: "", program: "", startDate: "", fundingStatus: ""
  })

  // Unified function - same for both You and Partner
  const addOffer = (isPartner: boolean = false) => {
    if (!offerDraft.school.trim() || !offerDraft.program.trim()) return
    
    const newOffer: SchoolOffer = {
      school: offerDraft.school.trim(),
      program: offerDraft.program.trim(),
      startDate: offerDraft.startDate,
      fundingStatus: offerDraft.fundingStatus
    }
    
    if (isPartner) {
      setPartnerSchoolOffers([...partnerSchoolOffers, newOffer])
    } else {
      setSchoolOffers([...schoolOffers, newOffer])
    }
    
    setOfferDraft({ school: "", program: "", startDate: "", fundingStatus: "" })
  }

  const removeOffer = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerSchoolOffers(partnerSchoolOffers.filter((_, i) => i !== index))
    } else {
      setSchoolOffers(schoolOffers.filter((_, i) => i !== index))
    }
  }

  const getFundingBadgeColor = (status: string) => {
    switch (status) {
      case "Full funding": return "bg-green-100 text-green-800"
      case "Partial funding": return "bg-yellow-100 text-yellow-800"
      case "Self-funded": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <School className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold">School Offers & Applications</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner school offers */}
          <div className="space-y-6">
            {/* Your School Offers */}
            {schoolOffers.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Your School Offers & Applications</h4>
                {schoolOffers.map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{offer.program}</h4>
                        {offer.fundingStatus && (
                          <Badge className={getFundingBadgeColor(offer.fundingStatus)}>
                            {offer.fundingStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{offer.school}</p>
                      {offer.startDate && (
                        <p className="text-xs text-muted-foreground">Start date: {offer.startDate}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOffer(index, false)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Partner School Offers */}
            {partnerSchoolOffers.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's School Offers & Applications</h4>
                {partnerSchoolOffers.map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{offer.program}</h4>
                        {offer.fundingStatus && (
                          <Badge className={getFundingBadgeColor(offer.fundingStatus)}>
                            {offer.fundingStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{offer.school}</p>
                      {offer.startDate && (
                        <p className="text-xs text-muted-foreground">Start date: {offer.startDate}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOffer(index, true)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tab-based form inputs */}
          <SectionTabs tabState={schoolOffersTab} setTabState={setSchoolOffersTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Your School Offer or Application</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school_name">School/Institution *</Label>
                  <Input
                    id="school_name"
                    placeholder="e.g., University of Oxford, MIT, Stanford University"
                    value={offerDraft.school}
                    onChange={(e) => setOfferDraft(prev => ({ ...prev, school: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="program_name">Program *</Label>
                  <Input
                    id="program_name"
                    placeholder="e.g., Master of Computer Science, PhD in Physics"
                    value={offerDraft.program}
                    onChange={(e) => setOfferDraft(prev => ({ ...prev, program: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={offerDraft.startDate}
                    onChange={(e) => setOfferDraft(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="funding_status">Funding status</Label>
                  <Select
                    value={offerDraft.fundingStatus}
                    onValueChange={(value) => setOfferDraft(prev => ({ ...prev, fundingStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full funding">Full funding (scholarship/assistantship)</SelectItem>
                      <SelectItem value="Partial funding">Partial funding</SelectItem>
                      <SelectItem value="Self-funded">Self-funded</SelectItem>
                      <SelectItem value="Applying for funding">Applying for funding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => addOffer(false)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your School Offer
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Partner's School Offer or Application</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_school_name">School/Institution *</Label>
                  <Input
                    id="partner_school_name"
                    placeholder="e.g., Cambridge University, Harvard, ETH Zurich"
                    value={offerDraft.school}
                    onChange={(e) => setOfferDraft(prev => ({ ...prev, school: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_program_name">Program *</Label>
                  <Input
                    id="partner_program_name"
                    placeholder="e.g., MBA, Master of Engineering, PhD in Biology"
                    value={offerDraft.program}
                    onChange={(e) => setOfferDraft(prev => ({ ...prev, program: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_start_date">Start date</Label>
                  <Input
                    id="partner_start_date"
                    type="date"
                    value={offerDraft.startDate}
                    onChange={(e) => setOfferDraft(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_funding_status">Funding status</Label>
                  <Select
                    value={offerDraft.fundingStatus}
                    onValueChange={(value) => setOfferDraft(prev => ({ ...prev, fundingStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full funding">Full funding (scholarship/assistantship)</SelectItem>
                      <SelectItem value="Partial funding">Partial funding</SelectItem>
                      <SelectItem value="Self-funded">Self-funded</SelectItem>
                      <SelectItem value="Applying for funding">Applying for funding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => addOffer(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner's School Offer
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your School Offers */}
          {schoolOffers.map((offer, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{offer.program}</h4>
                  {offer.fundingStatus && (
                    <Badge className={getFundingBadgeColor(offer.fundingStatus)}>
                      {offer.fundingStatus}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{offer.school}</p>
                {offer.startDate && (
                  <p className="text-xs text-muted-foreground">Start date: {offer.startDate}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOffer(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h4 className="font-medium">Add School Offer or Application</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_school_name">School/Institution *</Label>
              <Input
                id="single_school_name"
                placeholder="e.g., University of Oxford, MIT, Stanford University"
                value={offerDraft.school}
                onChange={(e) => setOfferDraft(prev => ({ ...prev, school: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_program_name">Program *</Label>
              <Input
                id="single_program_name"
                placeholder="e.g., Master of Computer Science, PhD in Physics"
                value={offerDraft.program}
                onChange={(e) => setOfferDraft(prev => ({ ...prev, program: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_start_date">Start date</Label>
              <Input
                id="single_start_date"
                type="date"
                value={offerDraft.startDate}
                onChange={(e) => setOfferDraft(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_funding_status">Funding status</Label>
              <Select
                value={offerDraft.fundingStatus}
                onValueChange={(value) => setOfferDraft(prev => ({ ...prev, fundingStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full funding">Full funding (scholarship/assistantship)</SelectItem>
                  <SelectItem value="Partial funding">Partial funding</SelectItem>
                  <SelectItem value="Self-funded">Self-funded</SelectItem>
                  <SelectItem value="Applying for funding">Applying for funding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => addOffer(false)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add School Offer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
