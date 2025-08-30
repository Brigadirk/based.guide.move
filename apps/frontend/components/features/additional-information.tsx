"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Trash2, 
  Pencil, 
  Plus, 
  Check, 
  X, 
  Lightbulb, 
  FileText,
  AlertTriangle
} from "lucide-react"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"
import { useSectionInfo } from "@/lib/hooks/use-section-info"

export function AdditionalInformation({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()

  const generalNotes = getFormData("additionalInformation.generalNotes") ?? ""
  const specialSections = getFormData("additionalInformation.specialSections") ?? []

  // Local state for adding a new section
  const [newTheme, setNewTheme] = useState("")
  const [newContent, setNewContent] = useState("")

  // Index of section currently being edited, or null
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editTheme, setEditTheme] = useState("")
  const [editContent, setEditContent] = useState("")

  const handleComplete = () => {
    markSectionComplete("additionalInformation")
    onComplete()
  }

  const addSpecialSection = () => {
    if (newTheme.trim() && newContent.trim()) {
      const newSection = {
        theme: newTheme.trim(),
        content: newContent.trim(),
        dateAdded: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      }
      const updated = [...specialSections, newSection]
      updateFormData("additionalInformation.specialSections", updated)
      setNewTheme("")
      setNewContent("")
    }
  }

  const removeSpecialSection = (index: number) => {
    const updated = specialSections.filter((_: any, i: number) => i !== index)
    updateFormData("additionalInformation.specialSections", updated)
  }

  const startEditing = (index: number) => {
    const section = specialSections[index]
    setEditingIdx(index)
    setEditTheme(section.theme)
    setEditContent(section.content)
  }

  const saveEdit = () => {
    if (editingIdx !== null && editTheme.trim() && editContent.trim()) {
      const updated = [...specialSections]
      updated[editingIdx] = {
        ...updated[editingIdx],
        theme: editTheme.trim(),
        content: editContent.trim(),
        dateUpdated: new Date().toISOString().split('T')[0]
      }
      updateFormData("additionalInformation.specialSections", updated)
      setEditingIdx(null)
      setEditTheme("")
      setEditContent("")
    }
  }

  const cancelEdit = () => {
    setEditingIdx(null)
    setEditTheme("")
    setEditContent("")
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-left pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">
          📝 Additional Information
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Any additional information that doesn't fit in other sections
        </p>
      </div>

      {/* Why is this section important */}
      <Card className="shadow-sm border-l-4 border-l-yellow-500">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Why is this section important?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Additional information helps:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Provide context for unique circumstances not covered in standard sections</li>
                  <li>Document special considerations for your international relocation</li>
                  <li>Highlight specific concerns that may affect your tax or immigration status</li>
                  <li>Record important details that immigration officials should know</li>
                  <li>Address potential complications in your application process</li>
                  <li>Ensure all relevant information is considered in your assessment</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Special Information Sections */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Special Information Sections
          </CardTitle>
          <p className="text-sm text-muted-foreground">Add any additional information that doesn't fit in other sections</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Add New Section Form */}
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Special Information Section
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme/Title</Label>
                  <Input
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="Enter a descriptive title for this information section"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Provide detailed information about this special circumstance"
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={addSpecialSection}
                  disabled={!newTheme.trim() || !newContent.trim()}
                  className="w-full"
                >
                  💾 Add Section
                </Button>
              </div>
            </div>

            {/* Display existing special sections */}
            {specialSections.length > 0 ? (
              <div className="space-y-4">
                {specialSections.map((section: any, idx: number) => (
                  <Card key={idx} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">Section {idx + 1}: {section.theme}</CardTitle>
                          {section.dateAdded && (
                            <p className="text-sm text-muted-foreground">
                              Added on: {section.dateAdded}
                            </p>
                          )}
                          {section.dateUpdated && (
                            <p className="text-sm text-muted-foreground">
                              Updated on: {section.dateUpdated}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(idx)}
                            disabled={editingIdx !== null}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSpecialSection(idx)}
                            disabled={editingIdx !== null}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {editingIdx === idx ? (
                        /* Edit Form */
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Update Theme/Title</Label>
                            <Input
                              value={editTheme}
                              onChange={(e) => setEditTheme(e.target.value)}
                              placeholder="Update theme/title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Update Content</Label>
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              placeholder="Update content"
                              rows={6}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={saveEdit}
                              disabled={!editTheme.trim() || !editContent.trim()}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={cancelEdit}
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Display Content */
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="whitespace-pre-wrap">{section.content}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ℹ️ No special information sections added yet.</p>
                <p className="text-sm">Use the form above to add important details.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* General Notes Section */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600" />
            General Notes
          </CardTitle>
          <p className="text-sm text-muted-foreground">Additional notes or comments</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Additional notes or comments</Label>
            <Textarea
              value={generalNotes}
              onChange={(e) => updateFormData("additionalInformation.generalNotes", e.target.value)}
              placeholder="Enter any general notes that don't require a separate section"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Use this space for any additional information that doesn't fit elsewhere
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              This section is optional. You can complete your profile even if you don't have additional information to provide.
            </div>

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("additional")}
              isCheckingInfo={isCheckingInfo}
              sectionId="additional"
              onContinue={handleComplete}
              canContinue={true}
              nextSectionName="Summary"
            />
          </div>
        </CardFooter>
      </Card>

      {/* Section Info Modal */}
      <SectionInfoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        story={currentStory}
        isLoading={isCheckingInfo}
        onExpandFullInfo={expandFullInformation}
        onBackToSection={backToSection}
        currentSection={currentSection}
        isFullView={isFullView}
        onGoToSection={goToSection}
        onNavigateToSection={navigateToSection}
      />
    </div>
  )
}