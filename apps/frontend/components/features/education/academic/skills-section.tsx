"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Award } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import type { Skill } from "../types"

type SkillsSectionProps = {
  skillsTab: string
  setSkillsTab: (value: string) => void
  hasPartnerSelected: boolean
  skills: Skill[]
  setSkills: (skills: Skill[]) => void
  partnerSkills: Skill[]
  setPartnerSkills: (skills: Skill[]) => void
}

export function SkillsSection({
  skillsTab,
  setSkillsTab,
  hasPartnerSelected,
  skills,
  setSkills,
  partnerSkills,
  setPartnerSkills
}: SkillsSectionProps) {
  const [skillDraft, setSkillDraft] = useState({
    skill: "", credentialName: "", credentialInstitute: ""
  })

  // Unified function with partner argument
  const addSkill = (isPartner: boolean = false) => {
    const draft = skillDraft
    if (!draft.skill.trim()) return
    
    const newSkill: Skill = {
      skill: draft.skill.trim(),
      credentialName: draft.credentialName.trim() || undefined,
      credentialInstitute: draft.credentialInstitute.trim() || undefined
    }
    
    if (isPartner) {
      setPartnerSkills([...partnerSkills, newSkill])
    } else {
      setSkills([...skills, newSkill])
    }
    
    setSkillDraft({ skill: "", credentialName: "", credentialInstitute: "" })
  }

  const removeSkill = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerSkills(partnerSkills.filter((_, i) => i !== index))
    } else {
      setSkills(skills.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Professional Skills & Credentials</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner skills */}
          <div className="space-y-6">
            {/* Your Skills */}
            {skills.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your skills & credentials</h4>
                <div className="grid gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex gap-1">
                          {skill.credentialName && (
                            <Badge variant="outline" className="text-xs">Certified</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          {skill.credentialName && (
                            <div className="text-sm font-medium">{skill.credentialName}</div>
                          )}
                          {skill.credentialInstitute && (
                            <div className="text-xs text-muted-foreground">{skill.credentialInstitute}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(index, false)}
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

            {/* Partner Skills */}
            {partnerSkills.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Skills & Credentials</h4>
                {partnerSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{skill.skill}</h4>
                        {skill.credentialName && <Badge variant="secondary">Certified</Badge>}
                      </div>
                      {skill.credentialName && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Credential: {skill.credentialName}
                        </p>
                      )}
                      {skill.credentialInstitute && (
                        <p className="text-xs text-muted-foreground">
                          Issued by: {skill.credentialInstitute}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index, true)}
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
          <SectionTabs tabState={skillsTab} setTabState={setSkillsTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Your Skill or Credential</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skill_name">Skill or credential name *</Label>
                  <Input
                    id="skill_name"
                    placeholder="e.g., Project Management, AWS Certified Solutions Architect"
                    value={skillDraft.skill}
                    onChange={(e) => setSkillDraft(prev => ({ ...prev, skill: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="credential_name">Official credential name (if applicable)</Label>
                  <Input
                    id="credential_name"
                    placeholder="e.g., PMP, AWS Solutions Architect - Associate"
                    value={skillDraft.credentialName}
                    onChange={(e) => setSkillDraft(prev => ({ ...prev, credentialName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="credential_institute">Issuing organization (if applicable)</Label>
                  <Input
                    id="credential_institute"
                    placeholder="e.g., Project Management Institute, Amazon Web Services"
                    value={skillDraft.credentialInstitute}
                    onChange={(e) => setSkillDraft(prev => ({ ...prev, credentialInstitute: e.target.value }))}
                  />
                </div>
                
                <Button onClick={() => addSkill(false)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Skill
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  <h4 className="font-medium">Add Partner's Skill or Credential</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_skill_name">Skill or credential name *</Label>
                  <Input
                    id="partner_skill_name"
                    placeholder="e.g., Digital Marketing, Google Analytics Certified"
                    value={skillDraft.skill}
                    onChange={(e) => setSkillDraft(prev => ({ ...prev, skill: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_credential_name">Official credential name (if applicable)</Label>
                  <Input
                    id="partner_credential_name"
                    placeholder="e.g., Google Analytics Individual Qualification"
                    value={skillDraft.credentialName}
                    onChange={(e) => setSkillDraft(prev => ({ ...prev, credentialName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_credential_institute">Issuing organization (if applicable)</Label>
                  <Input
                    id="partner_credential_institute"
                    placeholder="e.g., Google, Microsoft, Salesforce"
                    value={skillDraft.credentialInstitute}
                    onChange={(e) => setSkillDraft(prev => ({ ...prev, credentialInstitute: e.target.value }))}
                  />
                </div>
                
                <Button onClick={() => addSkill(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner's Skill
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Skills */}
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{skill.skill}</h4>
                  {skill.credentialName && <Badge variant="secondary">Certified</Badge>}
                </div>
                {skill.credentialName && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Credential: {skill.credentialName}
                  </p>
                )}
                {skill.credentialInstitute && (
                  <p className="text-xs text-muted-foreground">
                    Issued by: {skill.credentialInstitute}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h4 className="font-medium">Add Skill or Credential</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_skill_name">Skill or credential name *</Label>
              <Input
                id="single_skill_name"
                placeholder="e.g., Project Management, AWS Certified Solutions Architect"
                value={skillDraft.skill}
                onChange={(e) => setSkillDraft(prev => ({ ...prev, skill: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_credential_name">Official credential name (if applicable)</Label>
              <Input
                id="single_credential_name"
                placeholder="e.g., PMP, AWS Solutions Architect - Associate"
                value={skillDraft.credentialName}
                onChange={(e) => setSkillDraft(prev => ({ ...prev, credentialName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_credential_institute">Issuing organization (if applicable)</Label>
              <Input
                id="single_credential_institute"
                placeholder="e.g., Project Management Institute, Amazon Web Services"
                value={skillDraft.credentialInstitute}
                onChange={(e) => setSkillDraft(prev => ({ ...prev, credentialInstitute: e.target.value }))}
              />
            </div>
            
            <Button onClick={() => addSkill(false)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
