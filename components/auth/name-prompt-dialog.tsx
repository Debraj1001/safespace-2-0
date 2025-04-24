"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { User } from "lucide-react"

interface NamePromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  userId: string
}

export function NamePromptDialog({ open, onOpenChange, onComplete, userId }: NamePromptDialogProps) {
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your name has been saved successfully",
      })

      onComplete()
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message || "Failed to update your profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to SafeSpace!</DialogTitle>
          <DialogDescription>Please tell us your name so we can personalize your experience.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSaveName} disabled={loading} className="relative overflow-hidden group">
            <User className="mr-2 h-4 w-4" />
            <span className="relative z-10">{loading ? "Saving..." : "Continue"}</span>
            <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
