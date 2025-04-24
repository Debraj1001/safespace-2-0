"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/lib/auth-helpers"
import { Mail } from "lucide-react"

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!email.trim()) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    const result = await resetPassword(email)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Clear the email field after successful submission
      setEmail("")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleResetPassword}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>
                If an account exists with this email, you will receive a password reset link shortly. Please check your
                inbox and spam folder.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
