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
  Info, 
  FileText, 
  Calendar
} from "lucide-react"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function AdditionalInformation({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormStore()

  const generalNotes = getFormData("additionalInformation.generalNotes") ?? ""
  const specialSections = getFormData("additionalInformation.specialSections") ?? []

  // Local state for adding a new section
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTheme, setNewTheme] = useState("")
  const [newContent, setNewContent] = useState("")

  // Index of section currently being edited, or null
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editTheme, setEditTheme] = useState("")
  const [editContent, setEditContent] = useState("")



  const handleAddSection = () => {
    if (newTheme.trim() === "" || newContent.trim() === "") return
    const updated = [
      ...specialSections,
      {
        theme: newTheme.trim(),
        content: newContent.trim(),
        dateAdded: new Date().toISOString(),
      },
    ]
    updateFormData("additionalInformation.specialSections", updated)
    setNewTheme("")
    setNewContent("")
    setShowAddForm(false)
  }

  const handleDelete = (idx: number) => {
    const updated = specialSections.filter((_: any, i: number) => i !== idx)
    updateFormData("additionalInformation.specialSections", updated)
  }

  const startEditing = (idx: number) => {
    setEditingIdx(idx)
    setEditTheme(specialSections[idx].theme)
    setEditContent(specialSections[idx].content)
  }

  const handleSaveEdit = () => {
    if (editingIdx === null) return
    const updated = [...specialSections]
    updated[editingIdx] = {
      ...updated[editingIdx],
      theme: editTheme,
      content: editContent,
      dateUpdated: new Date().toISOString(),
    }
    updateFormData("additionalInformation.specialSections", updated)
    setEditingIdx(null)
  }

  const cancelEdit = () => {
    setEditingIdx(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const canContinue = true // Always allow to continue - this is optional

  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Additional Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          <strong>Additional information helps:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Provide context for unique circumstances not covered in standard sections</li>
            <li>Document special considerations for your international relocation</li>
            <li>Highlight specific concerns that may affect your tax or immigration status</li>
            <li>Record important details that immigration officials should know</li>
            <li>Address potential complications in your application process</li>
            <li>Ensure all relevant information is considered in your assessment</li>
          </ul>
        </SectionHint>

        {/* Special Information Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              🔖 Special Information Sections
            </h3>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "Cancel" : "Add Section"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Add any additional information that doesn't fit in other sections
          </p>

          {/* Add new section form */}
          {showAddForm && (
            <Card className="border-dashed border-2">
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label>Theme/Title</Label>
                  <Input
                    placeholder="Enter a descriptive title for this information section"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Provide detailed information about this special circumstance"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button 
                  onClick={handleAddSection} 
                  disabled={newTheme.trim() === "" || newContent.trim() === ""}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  💾 Add Section
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Existing sections */}
          {specialSections.length > 0 ? (
            <div className="space-y-3">
              {specialSections.map((section: any, idx: number) => {
                const isCurrentEdit = editingIdx === idx
                return (
                  <Card key={idx} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        {isCurrentEdit ? (
                          <Input
                            value={editTheme}
                            onChange={(e) => setEditTheme(e.target.value)}
                            className="text-base font-medium"
                          />
                        ) : (
                          <div className="flex-1">
                            <CardTitle className="text-base font-medium mb-1">
                              Section {idx + 1}: {section.theme}
                            </CardTitle>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {section.dateAdded && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Added: {formatDate(section.dateAdded)}
                                </Badge>
                              )}
                              {section.dateUpdated && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Updated: {formatDate(section.dateUpdated)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-1 ml-3">
                          {isCurrentEdit ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveEdit}
                                disabled={editTheme.trim() === "" || editContent.trim() === ""}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(idx)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(idx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {isCurrentEdit ? (
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={5}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {section.content}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                ℹ️ No special information sections added yet. Use the form above to add important details.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* General Notes */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            📒 General Notes
          </h3>
          <div>
            <Label className="text-sm">
              Additional notes or comments
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Enter any general notes that don't require a separate section
            </p>
            <Textarea
              value={generalNotes}
              onChange={(e) =>
                updateFormData("additionalInformation.generalNotes", e.target.value)
              }
              rows={4}
              placeholder="Enter any additional notes, comments, or information that might be relevant to your situation..."
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onComplete}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 