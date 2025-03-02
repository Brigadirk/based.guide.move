'use client'

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useState } from "react"

interface InfoDrawerProps {
  title: string
  description: string
  aiContext?: string
}

export function InfoDrawer({ title, description, aiContext }: InfoDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Info className="h-4 w-4" />
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="mt-4">
              {description}
              {aiContext && (
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <p className="font-medium mb-2">Why Mr. Pro Bonobo needs this:</p>
                  <p className="text-muted-foreground">{aiContext}</p>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
} 