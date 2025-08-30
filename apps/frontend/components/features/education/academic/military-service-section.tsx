"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Shield } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"

type MilitaryServiceSectionProps = {
  militaryTab: string
  setMilitaryTab: (value: string) => void
  hasPartnerSelected: boolean
  getFormData: (path: string) => any
  updateFormData: (path: string, value: any) => void
}

export function MilitaryServiceSection({
  militaryTab,
  setMilitaryTab,
  hasPartnerSelected,
  getFormData,
  updateFormData
}: MilitaryServiceSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold">Military Service</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner military service */}
          <div className="space-y-6">
            {/* Your Military Service */}
            {getFormData("education.militaryService.hasService") && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Your Military Service</h4>
                <div className="p-4 border rounded-lg bg-card">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div><strong>Country:</strong> {getFormData("education.militaryService.country") || "Not specified"}</div>
                    <div><strong>Branch:</strong> {getFormData("education.militaryService.branch") || "Not specified"}</div>
                    <div><strong>Start:</strong> {getFormData("education.militaryService.startDate") || "Not specified"}</div>
                    <div><strong>End:</strong> {getFormData("education.militaryService.currentlyServing") ? "Currently serving" : (getFormData("education.militaryService.endDate") || "Not specified")}</div>
                    <div><strong>Rank:</strong> {getFormData("education.militaryService.rank") || "Not specified"}</div>
                    <div><strong>Clearance:</strong> {getFormData("education.militaryService.securityClearance") || "None"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Partner Military Service */}
            {getFormData("education.partner.militaryService.hasService") && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Military Service</h4>
                <div className="p-4 border rounded-lg bg-card">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div><strong>Country:</strong> {getFormData("education.partner.militaryService.country") || "Not specified"}</div>
                    <div><strong>Branch:</strong> {getFormData("education.partner.militaryService.branch") || "Not specified"}</div>
                    <div><strong>Start:</strong> {getFormData("education.partner.militaryService.startDate") || "Not specified"}</div>
                    <div><strong>End:</strong> {getFormData("education.partner.militaryService.currentlyServing") ? "Currently serving" : (getFormData("education.partner.militaryService.endDate") || "Not specified")}</div>
                    <div><strong>Rank:</strong> {getFormData("education.partner.militaryService.rank") || "Not specified"}</div>
                    <div><strong>Clearance:</strong> {getFormData("education.partner.militaryService.securityClearance") || "None"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab-based form inputs */}
          <SectionTabs tabState={militaryTab} setTabState={setMilitaryTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              {/* Your Military Service Form */}
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                <Checkbox
                  id="has_military"
                  checked={getFormData("education.militaryService.hasService") ?? false}
                  onCheckedChange={(v) => updateFormData("education.militaryService.hasService", !!v)}
                />
                <Label htmlFor="has_military" className="text-base font-medium">
                  I have served in the military
                </Label>
              </div>

              {getFormData("education.militaryService.hasService") && (
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Military experience, skills, and security clearances can strengthen visa applications
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country of service</Label>
                      <Input
                        placeholder="e.g., United States"
                        value={getFormData("education.militaryService.country") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.country", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Branch of service</Label>
                      <Input
                        placeholder="e.g., Army, Navy, Air Force"
                        value={getFormData("education.militaryService.branch") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.branch", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={getFormData("education.militaryService.startDate") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={getFormData("education.militaryService.endDate") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.endDate", e.target.value)}
                        disabled={getFormData("education.militaryService.currentlyServing") ?? false}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="currently_serving"
                      checked={getFormData("education.militaryService.currentlyServing") ?? false}
                      onCheckedChange={(v) => updateFormData("education.militaryService.currentlyServing", !!v)}
                    />
                    <Label htmlFor="currently_serving">Currently serving</Label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rank achieved</Label>
                      <Input
                        placeholder="e.g., Sergeant, Lieutenant"
                        value={getFormData("education.militaryService.rank") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.rank", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Military occupation/specialization</Label>
                      <Input
                        placeholder="e.g., Intelligence Analyst, Combat Engineer"
                        value={getFormData("education.militaryService.occupation") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.occupation", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Security clearance level</Label>
                    <Select
                      value={getFormData("education.militaryService.securityClearance") ?? ""}
                      onValueChange={(v) => updateFormData("education.militaryService.securityClearance", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clearance level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Confidential">Confidential</SelectItem>
                        <SelectItem value="Secret">Secret</SelectItem>
                        <SelectItem value="Top Secret">Top Secret</SelectItem>
                        <SelectItem value="SCI">Sensitive Compartmented Information (SCI)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Languages used in service</Label>
                    <Textarea
                      placeholder="Languages you learned or used during military service..."
                      value={getFormData("education.militaryService.languages") ?? ""}
                      onChange={(e) => updateFormData("education.militaryService.languages", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Military certifications and training</Label>
                    <Textarea
                      placeholder="Special training, certifications, or skills acquired during service..."
                      value={getFormData("education.militaryService.certifications") ?? ""}
                      onChange={(e) => updateFormData("education.militaryService.certifications", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Leadership experience</Label>
                    <Textarea
                      placeholder="Leadership roles, team management, or command experience..."
                      value={getFormData("education.militaryService.leadership") ?? ""}
                      onChange={(e) => updateFormData("education.militaryService.leadership", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              {/* Partner Military Service Form */}
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                <Checkbox
                  id="partner_has_military"
                  checked={getFormData("education.partner.militaryService.hasService") ?? false}
                  onCheckedChange={(v) => updateFormData("education.partner.militaryService.hasService", !!v)}
                />
                <Label htmlFor="partner_has_military" className="text-base font-medium">
                  Partner has served in the military
                </Label>
              </div>

              {getFormData("education.partner.militaryService.hasService") && (
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Partner's military experience, skills, and security clearances can strengthen visa applications
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country of service</Label>
                      <Input
                        placeholder="e.g., Canada"
                        value={getFormData("education.partner.militaryService.country") ?? ""}
                        onChange={(e) => updateFormData("education.partner.militaryService.country", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Branch of service</Label>
                      <Input
                        placeholder="e.g., Army, Navy, Air Force"
                        value={getFormData("education.partner.militaryService.branch") ?? ""}
                        onChange={(e) => updateFormData("education.partner.militaryService.branch", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={getFormData("education.partner.militaryService.startDate") ?? ""}
                        onChange={(e) => updateFormData("education.partner.militaryService.startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={getFormData("education.partner.militaryService.endDate") ?? ""}
                        onChange={(e) => updateFormData("education.partner.militaryService.endDate", e.target.value)}
                        disabled={getFormData("education.partner.militaryService.currentlyServing") ?? false}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="partner_currently_serving"
                      checked={getFormData("education.partner.militaryService.currentlyServing") ?? false}
                      onCheckedChange={(v) => updateFormData("education.partner.militaryService.currentlyServing", !!v)}
                    />
                    <Label htmlFor="partner_currently_serving">Currently serving</Label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rank achieved</Label>
                      <Input
                        placeholder="e.g., Corporal, Captain"
                        value={getFormData("education.partner.militaryService.rank") ?? ""}
                        onChange={(e) => updateFormData("education.partner.militaryService.rank", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Military occupation/specialization</Label>
                      <Input
                        placeholder="e.g., Communications, Medical Corps"
                        value={getFormData("education.partner.militaryService.occupation") ?? ""}
                        onChange={(e) => updateFormData("education.partner.militaryService.occupation", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Security clearance level</Label>
                    <Select
                      value={getFormData("education.partner.militaryService.securityClearance") ?? ""}
                      onValueChange={(v) => updateFormData("education.partner.militaryService.securityClearance", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clearance level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Confidential">Confidential</SelectItem>
                        <SelectItem value="Secret">Secret</SelectItem>
                        <SelectItem value="Top Secret">Top Secret</SelectItem>
                        <SelectItem value="SCI">Sensitive Compartmented Information (SCI)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Languages used in service</Label>
                    <Textarea
                      placeholder="Languages partner learned or used during military service..."
                      value={getFormData("education.partner.militaryService.languages") ?? ""}
                      onChange={(e) => updateFormData("education.partner.militaryService.languages", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Military certifications and training</Label>
                    <Textarea
                      placeholder="Special training, certifications, or skills acquired during service..."
                      value={getFormData("education.partner.militaryService.certifications") ?? ""}
                      onChange={(e) => updateFormData("education.partner.militaryService.certifications", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Leadership experience</Label>
                    <Textarea
                      placeholder="Leadership roles, team management, or command experience..."
                      value={getFormData("education.partner.militaryService.leadership") ?? ""}
                      onChange={(e) => updateFormData("education.partner.militaryService.leadership", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Single User Mode - Military Service */}
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
            <Checkbox
              id="has_military_single"
              checked={getFormData("education.militaryService.hasService") ?? false}
              onCheckedChange={(v) => updateFormData("education.militaryService.hasService", !!v)}
            />
            <Label htmlFor="has_military_single" className="text-base font-medium">
              I have served in the military
            </Label>
          </div>

          {getFormData("education.militaryService.hasService") && (
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Military experience, skills, and security clearances can strengthen visa applications
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country of service</Label>
                  <Input
                    placeholder="e.g., United States"
                    value={getFormData("education.militaryService.country") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.country", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch of service</Label>
                  <Input
                    placeholder="e.g., Army, Navy, Air Force"
                    value={getFormData("education.militaryService.branch") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.branch", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={getFormData("education.militaryService.startDate") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={getFormData("education.militaryService.endDate") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.endDate", e.target.value)}
                    disabled={getFormData("education.militaryService.currentlyServing") ?? false}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="currently_serving_single"
                  checked={getFormData("education.militaryService.currentlyServing") ?? false}
                  onCheckedChange={(v) => updateFormData("education.militaryService.currentlyServing", !!v)}
                />
                <Label htmlFor="currently_serving_single">Currently serving</Label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rank achieved</Label>
                  <Input
                    placeholder="e.g., Sergeant, Lieutenant"
                    value={getFormData("education.militaryService.rank") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.rank", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Military occupation/specialization</Label>
                  <Input
                    placeholder="e.g., Intelligence Analyst, Combat Engineer"
                    value={getFormData("education.militaryService.occupation") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.occupation", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Security clearance level</Label>
                <Select
                  value={getFormData("education.militaryService.securityClearance") ?? ""}
                  onValueChange={(v) => updateFormData("education.militaryService.securityClearance", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clearance level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Confidential">Confidential</SelectItem>
                    <SelectItem value="Secret">Secret</SelectItem>
                    <SelectItem value="Top Secret">Top Secret</SelectItem>
                    <SelectItem value="SCI">Sensitive Compartmented Information (SCI)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Languages used in service</Label>
                <Textarea
                  placeholder="Languages you learned or used during military service..."
                  value={getFormData("education.militaryService.languages") ?? ""}
                  onChange={(e) => updateFormData("education.militaryService.languages", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Military certifications and training</Label>
                <Textarea
                  placeholder="Special training, certifications, or skills acquired during service..."
                  value={getFormData("education.militaryService.certifications") ?? ""}
                  onChange={(e) => updateFormData("education.militaryService.certifications", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Leadership experience</Label>
                <Textarea
                  placeholder="Leadership roles, team management, or command experience..."
                  value={getFormData("education.militaryService.leadership") ?? ""}
                  onChange={(e) => updateFormData("education.militaryService.leadership", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}