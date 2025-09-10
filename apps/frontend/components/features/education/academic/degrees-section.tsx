"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import type { Degree } from "../types"

type DegreesSectionProps = {
  degreesTab: string
  setDegreesTab: (value: string) => void
  hasPartnerSelected: boolean
  degrees: Degree[]
  setDegrees: (degrees: Degree[]) => void
  partnerDegrees: Degree[]
  setPartnerDegrees: (degrees: Degree[]) => void
}

export function DegreesSection({
  degreesTab,
  setDegreesTab,
  hasPartnerSelected,
  degrees,
  setDegrees,
  partnerDegrees,
  setPartnerDegrees
}: DegreesSectionProps) {
  const [degreeDraft, setDegreeDraft] = useState({
    degree: "", institution: "", start_date: "", end_date: "", in_progress: false
  })

  // Unified function - same for both You and Partner
  const addDegree = (isPartner: boolean = false) => {
    if (!degreeDraft.degree.trim() || !degreeDraft.institution.trim()) return
    
    const newDegree: Degree = {
      ...degreeDraft,
      degree: degreeDraft.degree.trim(),
      institution: degreeDraft.institution.trim(),
      field: "" // No field of study for anyone
    }
    
    if (isPartner) {
      setPartnerDegrees([...partnerDegrees, newDegree])
    } else {
      setDegrees([...degrees, newDegree])
    }
    
    setDegreeDraft({ degree: "", institution: "", start_date: "", end_date: "", in_progress: false })
  }

  const removeDegree = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerDegrees(partnerDegrees.filter((_, i) => i !== index))
    } else {
      setDegrees(degrees.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Degrees</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner degrees */}
          <div className="space-y-6">
            {/* Your Degrees */}
            {degrees.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your degrees</h4>
                <div className="grid gap-2">
                  {degrees.map((degree, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{degree.degree}</span>
                        <div className="flex gap-1">
                          {degree.in_progress && (
                            <Badge variant="outline" className="text-xs">In Progress</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{degree.institution}</div>
                          <div className="text-xs text-muted-foreground">
                            {degree.start_date} - {degree.in_progress ? "Present" : degree.end_date}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDegree(index, false)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner Degrees */}
            {partnerDegrees.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Partner's degrees</h4>
                <div className="grid gap-2">
                  {partnerDegrees.map((degree, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{degree.degree}</span>
                        <div className="flex gap-1">
                          {degree.in_progress && (
                            <Badge variant="outline" className="text-xs">In Progress</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{degree.institution}</div>
                          <div className="text-xs text-muted-foreground">
                            {degree.start_date} - {degree.in_progress ? "Present" : degree.end_date}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDegree(index, true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab-based form inputs */}
          <SectionTabs tabState={degreesTab} setTabState={setDegreesTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Your Degree</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="degree_name">Degree name *</Label>
                  <Input
                    id="degree_name"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    value={degreeDraft.degree}
                    onChange={(e) => setDegreeDraft(prev => ({ ...prev, degree: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    placeholder="e.g., University of Technology"
                    value={degreeDraft.institution}
                    onChange={(e) => setDegreeDraft(prev => ({ ...prev, institution: e.target.value }))}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={degreeDraft.start_date}
                      onChange={(e) => setDegreeDraft(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={degreeDraft.end_date}
                      onChange={(e) => setDegreeDraft(prev => ({ ...prev, end_date: e.target.value }))}
                      disabled={degreeDraft.in_progress}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="in_progress"
                    checked={degreeDraft.in_progress}
                    onCheckedChange={(checked) => setDegreeDraft(prev => ({ ...prev, in_progress: !!checked }))}
                  />
                  <Label htmlFor="in_progress">Currently in progress</Label>
                </div>
                
                <Button onClick={() => addDegree(false)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Degree
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Partner's Degree</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_degree_name">Degree name *</Label>
                  <Input
                    id="partner_degree_name"
                    placeholder="e.g., Master of Arts in Psychology"
                    value={degreeDraft.degree}
                    onChange={(e) => setDegreeDraft(prev => ({ ...prev, degree: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_institution">Institution *</Label>
                  <Input
                    id="partner_institution"
                    placeholder="e.g., State University"
                    value={degreeDraft.institution}
                    onChange={(e) => setDegreeDraft(prev => ({ ...prev, institution: e.target.value }))}
                  />
                </div>
                

                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner_start_date">Start date *</Label>
                    <Input
                      id="partner_start_date"
                      type="date"
                      value={degreeDraft.start_date}
                      onChange={(e) => setDegreeDraft(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partner_end_date">End date *</Label>
                    <Input
                      id="partner_end_date"
                      type="date"
                      value={degreeDraft.end_date}
                      onChange={(e) => setDegreeDraft(prev => ({ ...prev, end_date: e.target.value }))}
                      disabled={degreeDraft.in_progress}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="partner_in_progress"
                    checked={degreeDraft.in_progress}
                    onCheckedChange={(checked) => setDegreeDraft(prev => ({ ...prev, in_progress: !!checked }))}
                  />
                  <Label htmlFor="partner_in_progress">Currently in progress</Label>
                </div>
                
                <Button onClick={() => addDegree(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner's Degree
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Degrees */}
          {degrees.map((degree, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{degree.degree}</h4>
                  {degree.in_progress && <Badge variant="secondary">In Progress</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{degree.institution}</p>
                {degree.field && <p className="text-sm text-muted-foreground mb-1">Field: {degree.field}</p>}
                <p className="text-xs text-muted-foreground">
                  {degree.start_date} - {degree.in_progress ? "Present" : degree.end_date}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDegree(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h4 className="font-medium">Add Degree</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_degree_name">Degree name *</Label>
              <Input
                id="single_degree_name"
                placeholder="e.g., Bachelor of Science in Computer Science"
                value={degreeDraft.degree}
                onChange={(e) => setDegreeDraft(prev => ({ ...prev, degree: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_institution">Institution *</Label>
              <Input
                id="single_institution"
                placeholder="e.g., University of Technology"
                value={degreeDraft.institution}
                onChange={(e) => setDegreeDraft(prev => ({ ...prev, institution: e.target.value }))}
              />
            </div>
            

            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="single_start_date">Start date *</Label>
                <Input
                  id="single_start_date"
                  type="date"
                  value={degreeDraft.start_date}
                  onChange={(e) => setDegreeDraft(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="single_end_date">End date *</Label>
                <Input
                  id="single_end_date"
                  type="date"
                  value={degreeDraft.end_date}
                  onChange={(e) => setDegreeDraft(prev => ({ ...prev, end_date: e.target.value }))}
                  disabled={degreeDraft.in_progress}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="single_in_progress"
                checked={degreeDraft.in_progress}
                onCheckedChange={(checked) => setDegreeDraft(prev => ({ ...prev, in_progress: !!checked }))}
              />
              <Label htmlFor="single_in_progress">Currently in progress</Label>
            </div>
            
            <Button onClick={() => addDegree(false)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Degree
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
