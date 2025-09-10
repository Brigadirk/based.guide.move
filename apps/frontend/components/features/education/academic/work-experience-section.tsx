"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Briefcase } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import type { WorkExperience } from "../types"

type WorkExperienceSectionProps = {
  workExpTab: string
  setWorkExpTab: (value: string) => void
  hasPartnerSelected: boolean
  workExperience: WorkExperience[]
  setWorkExperience: (workExp: WorkExperience[]) => void
  partnerWorkExperience: WorkExperience[]
  setPartnerWorkExperience: (workExp: WorkExperience[]) => void
}

export function WorkExperienceSection({
  workExpTab,
  setWorkExpTab,
  hasPartnerSelected,
  workExperience,
  setWorkExperience,
  partnerWorkExperience,
  setPartnerWorkExperience
}: WorkExperienceSectionProps) {
  const [workExpDraft, setWorkExpDraft] = useState({
    jobTitle: "", company: "", country: "", startDate: "", endDate: "", current: false
  })

  // Unified function - same for both You and Partner
  const addWorkExperience = (isPartner: boolean = false) => {
    if (!workExpDraft.jobTitle.trim() || !workExpDraft.company.trim()) return
    
    const newWorkExp: WorkExperience = {
      jobTitle: workExpDraft.jobTitle.trim(),
      company: workExpDraft.company.trim(),
      country: workExpDraft.country.trim(),
      startDate: workExpDraft.startDate,
      endDate: workExpDraft.endDate,
      current: workExpDraft.current
    }
    
    if (isPartner) {
      setPartnerWorkExperience([...partnerWorkExperience, newWorkExp])
    } else {
      setWorkExperience([...workExperience, newWorkExp])
    }
    
    setWorkExpDraft({ jobTitle: "", company: "", country: "", startDate: "", endDate: "", current: false })
  }

  const removeWorkExperience = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerWorkExperience(partnerWorkExperience.filter((_, i) => i !== index))
    } else {
      setWorkExperience(workExperience.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">Work Experience</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner work experience */}
          <div className="space-y-6">
            {/* Your Work Experience */}
            {workExperience.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Your Work Experience</h4>
                {workExperience.map((work, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{work.jobTitle}</h4>
                        {work.current && <Badge variant="secondary">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{work.company}</p>
                      <p className="text-sm text-muted-foreground mb-1">{work.country}</p>
                      <p className="text-xs text-muted-foreground">
                        {work.startDate} - {work.current ? "Present" : work.endDate}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkExperience(index, false)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Partner Work Experience */}
            {partnerWorkExperience.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Work Experience</h4>
                {partnerWorkExperience.map((work, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{work.jobTitle}</h4>
                        {work.current && <Badge variant="secondary">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{work.company}</p>
                      <p className="text-sm text-muted-foreground mb-1">{work.country}</p>
                      <p className="text-xs text-muted-foreground">
                        {work.startDate} - {work.current ? "Present" : work.endDate}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkExperience(index, true)}
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
          <SectionTabs tabState={workExpTab} setTabState={setWorkExpTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Your Work Experience</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job title *</Label>
                  <Input
                    id="job_title"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={workExpDraft.jobTitle}
                    onChange={(e) => setWorkExpDraft(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Local Business"
                    value={workExpDraft.company}
                    onChange={(e) => setWorkExpDraft(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="work_country">Country</Label>
                  <Input
                    id="work_country"
                    placeholder="e.g., United States, Canada, Germany"
                    value={workExpDraft.country}
                    onChange={(e) => setWorkExpDraft(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work_start_date">Start date *</Label>
                    <Input
                      id="work_start_date"
                      type="date"
                      value={workExpDraft.startDate}
                      onChange={(e) => setWorkExpDraft(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_end_date">End date</Label>
                    <Input
                      id="work_end_date"
                      type="date"
                      value={workExpDraft.endDate}
                      onChange={(e) => setWorkExpDraft(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={workExpDraft.current}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="current_job"
                    checked={workExpDraft.current}
                    onCheckedChange={(checked) => setWorkExpDraft(prev => ({ ...prev, current: !!checked }))}
                  />
                  <Label htmlFor="current_job">This is my current job</Label>
                </div>
                
                <Button onClick={() => addWorkExperience(false)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Work Experience
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Partner's Work Experience</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_job_title">Job title *</Label>
                  <Input
                    id="partner_job_title"
                    placeholder="e.g., Data Analyst, Sales Representative"
                    value={workExpDraft.jobTitle}
                    onChange={(e) => setWorkExpDraft(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_company">Company *</Label>
                  <Input
                    id="partner_company"
                    placeholder="e.g., Apple, Amazon, Startup Inc"
                    value={workExpDraft.company}
                    onChange={(e) => setWorkExpDraft(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_work_country">Country</Label>
                  <Input
                    id="partner_work_country"
                    placeholder="e.g., United Kingdom, Australia, France"
                    value={workExpDraft.country}
                    onChange={(e) => setWorkExpDraft(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner_work_start_date">Start date *</Label>
                    <Input
                      id="partner_work_start_date"
                      type="date"
                      value={workExpDraft.startDate}
                      onChange={(e) => setWorkExpDraft(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partner_work_end_date">End date</Label>
                    <Input
                      id="partner_work_end_date"
                      type="date"
                      value={workExpDraft.endDate}
                      onChange={(e) => setWorkExpDraft(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={workExpDraft.current}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="partner_current_job"
                    checked={workExpDraft.current}
                    onCheckedChange={(checked) => setWorkExpDraft(prev => ({ ...prev, current: !!checked }))}
                  />
                  <Label htmlFor="partner_current_job">This is partner's current job</Label>
                </div>
                
                <Button onClick={() => addWorkExperience(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner's Work Experience
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Work Experience */}
          {workExperience.map((work, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{work.jobTitle}</h4>
                  {work.current && <Badge variant="secondary">Current</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{work.company}</p>
                <p className="text-sm text-muted-foreground mb-1">{work.country}</p>
                <p className="text-xs text-muted-foreground">
                  {work.startDate} - {work.current ? "Present" : work.endDate}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeWorkExperience(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h4 className="font-medium">Add Work Experience</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_job_title">Job title *</Label>
              <Input
                id="single_job_title"
                placeholder="e.g., Software Engineer, Marketing Manager"
                value={workExpDraft.jobTitle}
                onChange={(e) => setWorkExpDraft(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_company">Company *</Label>
              <Input
                id="single_company"
                placeholder="e.g., Google, Microsoft, Local Business"
                value={workExpDraft.company}
                onChange={(e) => setWorkExpDraft(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_work_country">Country</Label>
              <Input
                id="single_work_country"
                placeholder="e.g., United States, Canada, Germany"
                value={workExpDraft.country}
                onChange={(e) => setWorkExpDraft(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="single_work_start_date">Start date *</Label>
                <Input
                  id="single_work_start_date"
                  type="date"
                  value={workExpDraft.startDate}
                  onChange={(e) => setWorkExpDraft(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="single_work_end_date">End date</Label>
                <Input
                  id="single_work_end_date"
                  type="date"
                  value={workExpDraft.endDate}
                  onChange={(e) => setWorkExpDraft(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={workExpDraft.current}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="single_current_job"
                checked={workExpDraft.current}
                onCheckedChange={(checked) => setWorkExpDraft(prev => ({ ...prev, current: !!checked }))}
              />
              <Label htmlFor="single_current_job">This is my current job</Label>
            </div>
            
            <Button onClick={() => addWorkExperience(false)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Work Experience
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
