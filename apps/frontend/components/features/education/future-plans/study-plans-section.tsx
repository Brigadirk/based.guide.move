"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"

type StudyPlansSectionProps = {
  studyPlansTab: string
  setStudyPlansTab: (value: string) => void
  hasPartnerSelected: boolean
  countryPhrase: string
  getFormData: (path: string) => any
  updateFormData: (path: string, value: any) => void
}

export function StudyPlansSection({
  studyPlansTab,
  setStudyPlansTab,
  hasPartnerSelected,
  countryPhrase,
  getFormData,
  updateFormData
}: StudyPlansSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">Study Plans in {countryPhrase}</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner study plans */}
          <div className="space-y-6">
            {/* Your Study Plans */}
            {getFormData("education.interestedInStudying") && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Your Study Plans</h4>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm">{getFormData("education.schoolInterestDetails") || "No details provided"}</p>
                </div>
              </div>
            )}

            {/* Partner Study Plans */}
            {getFormData("education.partner.interestedInStudying") && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Study Plans</h4>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm">{getFormData("education.partner.schoolInterestDetails") || "No details provided"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tab-based form inputs */}
          <SectionTabs tabState={studyPlansTab} setTabState={setStudyPlansTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="interested_in_study"
                    checked={getFormData("education.interestedInStudying") ?? false}
                    onCheckedChange={(v) => updateFormData("education.interestedInStudying", !!v)}
                  />
                  <Label htmlFor="interested_in_study" className="text-base font-medium">
                    I am interested in studying in {countryPhrase}
                  </Label>
                </div>

                {getFormData("education.interestedInStudying") && (
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Tell us about your study interests, preferred institutions, programs, and how you plan to fund your education
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="study_details">Study plans and interests</Label>
                      <Textarea
                        id="study_details"
                        placeholder={`Describe your study plans in ${countryPhrase}. Include programs of interest, preferred institutions, career goals, and funding plans...`}
                        value={getFormData("education.schoolInterestDetails") ?? ""}
                        onChange={(e) => updateFormData("education.schoolInterestDetails", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="partner_interested_in_study"
                    checked={getFormData("education.partner.interestedInStudying") ?? false}
                    onCheckedChange={(v) => updateFormData("education.partner.interestedInStudying", !!v)}
                  />
                  <Label htmlFor="partner_interested_in_study" className="text-base font-medium">
                    Partner is interested in studying in {countryPhrase}
                  </Label>
                </div>

                {getFormData("education.partner.interestedInStudying") && (
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Tell us about your partner's study interests, preferred institutions, programs, and how they plan to fund their education
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner_study_details">Partner's study plans and interests</Label>
                      <Textarea
                        id="partner_study_details"
                        placeholder={`Describe your partner's study plans in ${countryPhrase}. Include programs of interest, preferred institutions, career goals, and funding plans...`}
                        value={getFormData("education.partner.schoolInterestDetails") ?? ""}
                        onChange={(e) => updateFormData("education.partner.schoolInterestDetails", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Study Plans */}
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
            <Checkbox
              id="single_interested_in_study"
              checked={getFormData("education.interestedInStudying") ?? false}
              onCheckedChange={(v) => updateFormData("education.interestedInStudying", !!v)}
            />
            <Label htmlFor="single_interested_in_study" className="text-base font-medium">
              I am interested in studying in {countryPhrase}
            </Label>
          </div>

          {getFormData("education.interestedInStudying") && (
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Tell us about your study interests, preferred institutions, programs, and how you plan to fund your education
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="single_study_details">Study plans and interests</Label>
                <Textarea
                  id="single_study_details"
                  placeholder={`Describe your study plans in ${countryPhrase}. Include programs of interest, preferred institutions, career goals, and funding plans...`}
                  value={getFormData("education.schoolInterestDetails") ?? ""}
                  onChange={(e) => updateFormData("education.schoolInterestDetails", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
