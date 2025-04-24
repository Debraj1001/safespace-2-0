"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Save, User, Mail } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyContactError, setEmergencyContactError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        setUserId(session.user.id)

        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setUser(userData)
        setFullName(userData.full_name || "")
        setEmail(userData.email || "")
        setEmergencyContact(userData.emergency_contact_email || "") // Use the correct field name
        setAvatarUrl(userData.avatar_url || null)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  // Update the emergency contact field to use email instead of phone number
  // Find the validatePhoneNumber function and replace it with validateEmail
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update the user's avatar_url in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(data.publicUrl)

      // Update local user state
      setUser({
        ...user,
        avatar_url: data.publicUrl,
      })

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Update the saveProfile function to ensure emergency_contact_email is properly saved
  const saveProfile = async () => {
    setSaving(true)
    setEmergencyContactError(null)

    // Validate emergency contact
    if (!emergencyContact) {
      setEmergencyContactError("Emergency contact email is required")
      setSaving(false)
      return
    }

    // Validate email format
    if (!validateEmail(emergencyContact)) {
      setEmergencyContactError("Please enter a valid email address")
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          emergency_contact_email: emergencyContact, // Make sure we're using the correct field name
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Update local user state
      setUser({
        ...user,
        full_name: fullName,
        emergency_contact_email: emergencyContact, // Update with correct field name
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24 relative">
                      {uploading && (
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      )}
                      <AvatarImage src={avatarUrl || user?.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" className="relative" disabled={uploading}>
                          {uploading ? "Uploading..." : "Change Avatar"}
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={uploadAvatar}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Full Name</span>
                        </div>
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="max-w-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                      </Label>
                      <Input id="email" value={email} disabled className="max-w-md bg-muted" />
                      <p className="text-sm text-muted-foreground">
                        Your email is managed through your authentication provider.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Update your emergency contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    This email will receive emergency alerts when you trigger them. Please ensure it's correct
                    and belongs to someone who can help in an emergency.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Emergency Contact Email</span>
                      <span className="text-destructive">*</span>
                    </div>
                  </Label>
                  <Input
                    id="emergencyContact"
                    type="email"
                    value={emergencyContact}
                    onChange={(e) => {
                      setEmergencyContact(e.target.value)
                      setEmergencyContactError(null)
                    }}
                    className={`max-w-md ${emergencyContactError ? "border-destructive" : ""}`}
                    placeholder="emergency@example.com"
                  />
                  {emergencyContactError && <p className="text-sm text-destructive">{emergencyContactError}</p>}
                  {user?.emergency_contact_email && (
                    <p className="text-xs text-muted-foreground">
                      Current emergency contact: {user.emergency_contact_email}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfile} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex items-center gap-2">
                    <Input type="password" value="••••••••••••" disabled className="max-w-md" />
                    <Button variant="outline" onClick={() => (window.location.href = "/reset-password")}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notification settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </DashboardLayout>
  )
}
