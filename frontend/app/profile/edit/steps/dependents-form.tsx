'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dependent } from "@/types/profile"
import { toast } from "sonner"
import { X, Plus, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DependentsFormProps {
  data: { dependents?: Dependent[] }
  onUpdate: (data: { dependents: Dependent[] }) => void
}

const RELATIONSHIPS = [
  "Child",
  "Spouse",
  "Parent",
  "Sibling",
  "Other"
]

export function DependentsForm({ data, onUpdate }: DependentsFormProps) {
  const [dependents, setDependents] = useState<Dependent[]>(
    data.dependents || []
  )

  const handleUpdate = (updatedDependents: Dependent[]) => {
    setDependents(updatedDependents)
    onUpdate({ dependents: updatedDependents })
  }

  const addDependent = () => {
    handleUpdate([
      ...dependents,
      { name: "", relationship: "", age: 0 }
    ])
    toast.success("Added new dependent")
  }

  const removeDependent = (index: number) => {
    const updated = dependents.filter((_, i) => i !== index)
    handleUpdate(updated)
    toast.success("Removed dependent")
  }

  const updateDependent = (index: number, field: keyof Dependent, value: any) => {
    const updated = [...dependents]
    updated[index] = { ...updated[index], [field]: value }
    handleUpdate(updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dependents
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDependent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dependents.map((dependent, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0">
              <div className="col-span-5">
                <Label>Name</Label>
                <Input
                  value={dependent.name}
                  onChange={(e) => updateDependent(index, "name", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="col-span-3">
                <Label>Relationship</Label>
                <Input
                  value={dependent.relationship}
                  onChange={(e) => updateDependent(index, "relationship", e.target.value)}
                  placeholder="e.g. Child"
                />
              </div>
              <div className="col-span-3">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={dependent.age}
                  onChange={(e) => updateDependent(index, "age", parseInt(e.target.value))}
                  min={0}
                  max={120}
                />
              </div>
              <div className="col-span-1 pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDependent(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {dependents.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No dependents added yet. Click the button above to add one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 