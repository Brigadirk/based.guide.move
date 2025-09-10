"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Award } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import type { ProfessionalLicense } from "../types"

type ProfessionalLicensesSectionProps = {
  licensesTab: string
  setLicensesTab: (value: string) => void
  hasPartnerSelected: boolean
  professionalLicenses: ProfessionalLicense[]
  setProfessionalLicenses: (licenses: ProfessionalLicense[]) => void
  partnerProfessionalLicenses: ProfessionalLicense[]
  setPartnerProfessionalLicenses: (licenses: ProfessionalLicense[]) => void
}

export function ProfessionalLicensesSection({
  licensesTab,
  setLicensesTab,
  hasPartnerSelected,
  professionalLicenses,
  setProfessionalLicenses,
  partnerProfessionalLicenses,
  setPartnerProfessionalLicenses
}: ProfessionalLicensesSectionProps) {
  const [licenseDraft, setLicenseDraft] = useState({
    licenseType: "", licenseName: "", issuingBody: "", country: "", active: false
  })

  // Unified function - same for both You and Partner
  const addLicense = (isPartner: boolean = false) => {
    if (!licenseDraft.licenseType.trim() || !licenseDraft.licenseName.trim()) return
    
    const newLicense: ProfessionalLicense = {
      licenseType: licenseDraft.licenseType.trim(),
      licenseName: licenseDraft.licenseName.trim(),
      issuingBody: licenseDraft.issuingBody.trim(),
      country: licenseDraft.country.trim(),
      active: licenseDraft.active
    }
    
    if (isPartner) {
      setPartnerProfessionalLicenses([...partnerProfessionalLicenses, newLicense])
    } else {
      setProfessionalLicenses([...professionalLicenses, newLicense])
    }
    
    setLicenseDraft({ licenseType: "", licenseName: "", issuingBody: "", country: "", active: false })
  }

  const removeLicense = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerProfessionalLicenses(partnerProfessionalLicenses.filter((_, i) => i !== index))
    } else {
      setProfessionalLicenses(professionalLicenses.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Professional Licenses</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner licenses */}
          <div className="space-y-6">
            {/* Your Licenses */}
            {professionalLicenses.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Your Professional Licenses</h4>
                {professionalLicenses.map((license, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{license.licenseType}</h4>
                        {license.active && <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}
                        {!license.active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{license.licenseName}</p>
                      <p className="text-sm text-muted-foreground mb-1">Issued by: {license.issuingBody}</p>
                      <p className="text-xs text-muted-foreground">{license.country}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLicense(index, false)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Partner Licenses */}
            {partnerProfessionalLicenses.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Professional Licenses</h4>
                {partnerProfessionalLicenses.map((license, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{license.licenseType}</h4>
                        {license.active && <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}
                        {!license.active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{license.licenseName}</p>
                      <p className="text-sm text-muted-foreground mb-1">Issued by: {license.issuingBody}</p>
                      <p className="text-xs text-muted-foreground">{license.country}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLicense(index, true)}
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
          <SectionTabs tabState={licensesTab} setTabState={setLicensesTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Your Professional License</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_type">License type *</Label>
                  <Input
                    id="license_type"
                    placeholder="e.g., Medical License, Engineering License, Real Estate License"
                    value={licenseDraft.licenseType}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, licenseType: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_name">License name/number *</Label>
                  <Input
                    id="license_name"
                    placeholder="e.g., Professional Engineer License #12345"
                    value={licenseDraft.licenseName}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, licenseName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issuing_body">Issuing body</Label>
                  <Input
                    id="issuing_body"
                    placeholder="e.g., State Medical Board, Engineering Council"
                    value={licenseDraft.issuingBody}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, issuingBody: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_country">Country</Label>
                  <Input
                    id="license_country"
                    placeholder="e.g., United States, Canada, United Kingdom"
                    value={licenseDraft.country}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="license_active"
                    checked={licenseDraft.active}
                    onCheckedChange={(checked) => setLicenseDraft(prev => ({ ...prev, active: !!checked }))}
                  />
                  <Label htmlFor="license_active">License is currently active</Label>
                </div>
                
                <Button onClick={() => addLicense(false)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your License
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Partner's Professional License</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_license_type">License type *</Label>
                  <Input
                    id="partner_license_type"
                    placeholder="e.g., Nursing License, Teaching License, Legal License"
                    value={licenseDraft.licenseType}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, licenseType: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_license_name">License name/number *</Label>
                  <Input
                    id="partner_license_name"
                    placeholder="e.g., Registered Nurse License #67890"
                    value={licenseDraft.licenseName}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, licenseName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_issuing_body">Issuing body</Label>
                  <Input
                    id="partner_issuing_body"
                    placeholder="e.g., State Nursing Board, Department of Education"
                    value={licenseDraft.issuingBody}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, issuingBody: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_license_country">Country</Label>
                  <Input
                    id="partner_license_country"
                    placeholder="e.g., Australia, Germany, Japan"
                    value={licenseDraft.country}
                    onChange={(e) => setLicenseDraft(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="partner_license_active"
                    checked={licenseDraft.active}
                    onCheckedChange={(checked) => setLicenseDraft(prev => ({ ...prev, active: !!checked }))}
                  />
                  <Label htmlFor="partner_license_active">License is currently active</Label>
                </div>
                
                <Button onClick={() => addLicense(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner's License
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Professional Licenses */}
          {professionalLicenses.map((license, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{license.licenseType}</h4>
                  {license.active && <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}
                  {!license.active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{license.licenseName}</p>
                <p className="text-sm text-muted-foreground mb-1">Issued by: {license.issuingBody}</p>
                <p className="text-xs text-muted-foreground">{license.country}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLicense(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h4 className="font-medium">Add Professional License</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_license_type">License type *</Label>
              <Input
                id="single_license_type"
                placeholder="e.g., Medical License, Engineering License, Real Estate License"
                value={licenseDraft.licenseType}
                onChange={(e) => setLicenseDraft(prev => ({ ...prev, licenseType: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_license_name">License name/number *</Label>
              <Input
                id="single_license_name"
                placeholder="e.g., Professional Engineer License #12345"
                value={licenseDraft.licenseName}
                onChange={(e) => setLicenseDraft(prev => ({ ...prev, licenseName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_issuing_body">Issuing body</Label>
              <Input
                id="single_issuing_body"
                placeholder="e.g., State Medical Board, Engineering Council"
                value={licenseDraft.issuingBody}
                onChange={(e) => setLicenseDraft(prev => ({ ...prev, issuingBody: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_license_country">Country</Label>
              <Input
                id="single_license_country"
                placeholder="e.g., United States, Canada, United Kingdom"
                value={licenseDraft.country}
                onChange={(e) => setLicenseDraft(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="single_license_active"
                checked={licenseDraft.active}
                onCheckedChange={(checked) => setLicenseDraft(prev => ({ ...prev, active: !!checked }))}
              />
              <Label htmlFor="single_license_active">License is currently active</Label>
            </div>
            
            <Button onClick={() => addLicense(false)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add License
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
