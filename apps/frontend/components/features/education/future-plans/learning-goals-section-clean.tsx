"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Target } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import type { LearningInterest } from "../types"

type LearningGoalsSectionProps = {
  learningGoalsTab: string
  setLearningGoalsTab: (value: string) => void
  hasPartnerSelected: boolean
  learningInterests: LearningInterest[]
  setLearningInterests: (interests: LearningInterest[]) => void
  partnerLearningInterests: LearningInterest[]
  setPartnerLearningInterests: (interests: LearningInterest[]) => void
}

export function LearningGoalsSection({
  learningGoalsTab,
  setLearningGoalsTab,
  hasPartnerSelected,
  learningInterests,
  setLearningInterests,
  partnerLearningInterests,
  setPartnerLearningInterests
}: LearningGoalsSectionProps) {
  const [interestDraft, setInterestDraft] = useState({
    skill: "", status: "planned" as "planned" | "open", institute: "", 
    months: 6, hoursPerWeek: 10, fundingStatus: ""
  })

  // Unified function - same for both You and Partner
  const addInterest = (isPartner: boolean = false) => {
    if (!interestDraft.skill.trim()) return
    
    const newInterest: LearningInterest = {
      skill: interestDraft.skill.trim(),
      status: interestDraft.status,
      institute: interestDraft.institute.trim(),
      months: interestDraft.months,
      hoursPerWeek: interestDraft.hoursPerWeek,
      fundingStatus: interestDraft.fundingStatus
    }
    
    if (isPartner) {
      setPartnerLearningInterests([...partnerLearningInterests, newInterest])
    } else {
      setLearningInterests([...learningInterests, newInterest])
    }
    
    setInterestDraft({ 
      skill: "", status: "planned", institute: "", 
      months: 6, hoursPerWeek: 10, fundingStatus: "" 
    })
  }

  const removeInterest = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerLearningInterests(partnerLearningInterests.filter((_, i) => i !== index))
    } else {
      setLearningInterests(learningInterests.filter((_, i) => i !== index))
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800"
      case "open": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Learning & Development Goals</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner learning goals */}
          <div className="space-y-6">
            {/* Your Learning Goals */}
            {learningInterests.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Your Learning & Development Goals</h4>
                {learningInterests.map((interest, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{interest.skill}</h4>
                        <Badge className={getStatusBadgeColor(interest.status)}>
                          {interest.status === "planned" ? "Planned" : "Open to learning"}
                        </Badge>
                      </div>
                      {interest.institute && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Institution: {interest.institute}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {interest.months} months</span>
                        <span>Time: {interest.hoursPerWeek}h/week</span>
                        {interest.fundingStatus && <span>Funding: {interest.fundingStatus}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterest(index, false)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Partner Learning Goals */}
            {partnerLearningInterests.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Learning & Development Goals</h4>
                {partnerLearningInterests.map((interest, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{interest.skill}</h4>
                        <Badge className={getStatusBadgeColor(interest.status)}>
                          {interest.status === "planned" ? "Planned" : "Open to learning"}
                        </Badge>
                      </div>
                      {interest.institute && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Institution: {interest.institute}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {interest.months} months</span>
                        <span>Time: {interest.hoursPerWeek}h/week</span>
                        {interest.fundingStatus && <span>Funding: {interest.fundingStatus}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterest(index, true)}
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
          <SectionTabs tabState={learningGoalsTab} setTabState={setLearningGoalsTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Your Learning Goal</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learning_skill">Skill or subject *</Label>
                  <Input
                    id="learning_skill"
                    placeholder="e.g., Data Science, Web Development, Language Learning"
                    value={interestDraft.skill}
                    onChange={(e) => setInterestDraft(prev => ({ ...prev, skill: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learning_status">Learning status</Label>
                  <Select
                    value={interestDraft.status}
                    onValueChange={(value: "planned" | "open") => setInterestDraft(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned (specific program/course)</SelectItem>
                      <SelectItem value="open">Open to learning (exploring options)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learning_institute">Institution/Platform (if known)</Label>
                  <Input
                    id="learning_institute"
                    placeholder="e.g., Coursera, University of X, Online Bootcamp"
                    value={interestDraft.institute}
                    onChange={(e) => setInterestDraft(prev => ({ ...prev, institute: e.target.value }))}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="learning_months">Expected duration (months)</Label>
                    <Input
                      id="learning_months"
                      type="number"
                      min="1"
                      max="60"
                      value={interestDraft.months}
                      onChange={(e) => setInterestDraft(prev => ({ ...prev, months: parseInt(e.target.value) || 6 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learning_hours">Hours per week</Label>
                    <Input
                      id="learning_hours"
                      type="number"
                      min="1"
                      max="80"
                      value={interestDraft.hoursPerWeek}
                      onChange={(e) => setInterestDraft(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learning_funding">Funding approach</Label>
                  <Select
                    value={interestDraft.fundingStatus}
                    onValueChange={(value) => setInterestDraft(prev => ({ ...prev, fundingStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding approach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self-funded">Self-funded</SelectItem>
                      <SelectItem value="Employer sponsored">Employer sponsored</SelectItem>
                      <SelectItem value="Scholarship">Scholarship/Grant</SelectItem>
                      <SelectItem value="Government funding">Government funding</SelectItem>
                      <SelectItem value="Free/Open source">Free/Open source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => addInterest(false)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Learning Goal
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Partner's Learning Goal</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_learning_skill">Skill or subject *</Label>
                  <Input
                    id="partner_learning_skill"
                    placeholder="e.g., Digital Marketing, Photography, Finance"
                    value={interestDraft.skill}
                    onChange={(e) => setInterestDraft(prev => ({ ...prev, skill: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_learning_status">Learning status</Label>
                  <Select
                    value={interestDraft.status}
                    onValueChange={(value: "planned" | "open") => setInterestDraft(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned (specific program/course)</SelectItem>
                      <SelectItem value="open">Open to learning (exploring options)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_learning_institute">Institution/Platform (if known)</Label>
                  <Input
                    id="partner_learning_institute"
                    placeholder="e.g., LinkedIn Learning, Local College, Udemy"
                    value={interestDraft.institute}
                    onChange={(e) => setInterestDraft(prev => ({ ...prev, institute: e.target.value }))}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner_learning_months">Expected duration (months)</Label>
                    <Input
                      id="partner_learning_months"
                      type="number"
                      min="1"
                      max="60"
                      value={interestDraft.months}
                      onChange={(e) => setInterestDraft(prev => ({ ...prev, months: parseInt(e.target.value) || 6 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partner_learning_hours">Hours per week</Label>
                    <Input
                      id="partner_learning_hours"
                      type="number"
                      min="1"
                      max="80"
                      value={interestDraft.hoursPerWeek}
                      onChange={(e) => setInterestDraft(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_learning_funding">Funding approach</Label>
                  <Select
                    value={interestDraft.fundingStatus}
                    onValueChange={(value) => setInterestDraft(prev => ({ ...prev, fundingStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding approach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self-funded">Self-funded</SelectItem>
                      <SelectItem value="Employer sponsored">Employer sponsored</SelectItem>
                      <SelectItem value="Scholarship">Scholarship/Grant</SelectItem>
                      <SelectItem value="Government funding">Government funding</SelectItem>
                      <SelectItem value="Free/Open source">Free/Open source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => addInterest(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner's Learning Goal
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Learning Goals */}
          {learningInterests.map((interest, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{interest.skill}</h4>
                  <Badge className={getStatusBadgeColor(interest.status)}>
                    {interest.status === "planned" ? "Planned" : "Open to learning"}
                  </Badge>
                </div>
                {interest.institute && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Institution: {interest.institute}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Duration: {interest.months} months</span>
                  <span>Time: {interest.hoursPerWeek}h/week</span>
                  {interest.fundingStatus && <span>Funding: {interest.fundingStatus}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeInterest(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h4 className="font-medium">Add Learning Goal</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_learning_skill">Skill or subject *</Label>
              <Input
                id="single_learning_skill"
                placeholder="e.g., Data Science, Web Development, Language Learning"
                value={interestDraft.skill}
                onChange={(e) => setInterestDraft(prev => ({ ...prev, skill: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_learning_status">Learning status</Label>
              <Select
                value={interestDraft.status}
                onValueChange={(value: "planned" | "open") => setInterestDraft(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned (specific program/course)</SelectItem>
                  <SelectItem value="open">Open to learning (exploring options)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_learning_institute">Institution/Platform (if known)</Label>
              <Input
                id="single_learning_institute"
                placeholder="e.g., Coursera, University of X, Online Bootcamp"
                value={interestDraft.institute}
                onChange={(e) => setInterestDraft(prev => ({ ...prev, institute: e.target.value }))}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="single_learning_months">Expected duration (months)</Label>
                <Input
                  id="single_learning_months"
                  type="number"
                  min="1"
                  max="60"
                  value={interestDraft.months}
                  onChange={(e) => setInterestDraft(prev => ({ ...prev, months: parseInt(e.target.value) || 6 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="single_learning_hours">Hours per week</Label>
                <Input
                  id="single_learning_hours"
                  type="number"
                  min="1"
                  max="80"
                  value={interestDraft.hoursPerWeek}
                  onChange={(e) => setInterestDraft(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) || 10 }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_learning_funding">Funding approach</Label>
              <Select
                value={interestDraft.fundingStatus}
                onValueChange={(value) => setInterestDraft(prev => ({ ...prev, fundingStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding approach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Self-funded">Self-funded</SelectItem>
                  <SelectItem value="Employer sponsored">Employer sponsored</SelectItem>
                  <SelectItem value="Scholarship">Scholarship/Grant</SelectItem>
                  <SelectItem value="Government funding">Government funding</SelectItem>
                  <SelectItem value="Free/Open source">Free/Open source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => addInterest(false)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Learning Goal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
