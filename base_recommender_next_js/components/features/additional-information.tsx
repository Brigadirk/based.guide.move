/* --------------------------------------------------------------------- *
 *  Additional Information page                                          *
 * --------------------------------------------------------------------- */

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
import { Trash2, Pencil, Plus, Check, X } from "lucide-react"
import { useFormData } from "@/lib/hooks/use-form-data"
import { SectionHint } from "@/components/ui/section-hint"

export function AdditionalInformation({
  onComplete,
}: {
  onComplete: () => void
}) {
  const { getFormData, updateFormData } = useFormData()

  const notes = getFormData("additionalInformation.notes") ?? ""
  const special = getFormData("additionalInformation.specialCircumstances") ?? ""

  // Special Sections array ( [] by default )
  const specialSections =
    getFormData("additionalInformation.specialSections") ?? []

  // Local state for adding a new section
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

  const canContinue =
    notes.trim() !== "" ||
    special.trim() !== "" ||
    specialSections.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          This section allows you to provide additional information about your
          situation. This can include medical, legal, or other relevant
          circumstances.
        </SectionHint>

        {/* General Notes */}
        <div className="space-y-1">
          <Label>
            Anything else we should know? (optional, but helps personalise your
            advice)
          </Label>
          <Textarea
            value={notes}
            onChange={(e) =>
              updateFormData("additionalInformation.notes", e.target.value)
            }
            rows={4}
          />
        </div>

        <div className="space-y-1">
          <Label>Special circumstances (medical, legal, etc.)</Label>
          <Textarea
            value={special}
            onChange={(e) =>
              updateFormData(
                "additionalInformation.specialCircumstances",
                e.target.value
              )
            }
            rows={4}
          />
        </div>

        {/* -------------------- Add New Special Section -------------------- */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Special Information Section
          </h3>
          <Input
            placeholder="Theme / Title"
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={handleAddSection} disabled={newTheme.trim()==="" || newContent.trim()===""}>
            Add Section
          </Button>
        </div>

        {/* -------------------- Existing Sections -------------------- */}
        {specialSections.length > 0 && (
          <div className="space-y-4">
            {specialSections.map((section: any, idx: number) => {
              const isCurrentEdit = editingIdx === idx
              return (
                <Card key={idx} className="border-gray-300">
                  <CardHeader className="flex flex-row justify-between items-start py-3">
                    {isCurrentEdit ? (
                      <Input
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                      />
                    ) : (
                      <CardTitle className="text-base font-medium">
                        {section.theme}
                      </CardTitle>
                    )}
                    <div className="flex gap-2">
                      {isCurrentEdit ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleSaveEdit}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={cancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditing(idx)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    {isCurrentEdit ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">
                        {section.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!canContinue} onClick={onComplete}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 