"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, Shield, MapPin, MessageSquare, Mic, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Loader } from "@/components/ui/loader"
import { sendAlertNotifications, checkNotificationServiceHealth } from "@/lib/notification-service"

// Define types for alerts
interface AlertType {
  id: string
  user_id: string
  alert_type: string
  content: string | null
  latitude: number | null
  longitude: number | null
  is_resolved: boolean
  created_at: string
  updated_at: string
}

interface UserData {
  id: string
  email: string
  full_name: string
  emergency_contact_email: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isCreatingAlert, setIsCreatingAlert] = useState(false)
  const [alertContent, setAlertContent] = useState("")
  const [includeLocation, setIncludeLocation] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [serviceAvailable, setServiceAvailable] = useState(true)
  const [emergencyContactMissing, setEmergencyContactMissing] = useState(false)
  const [emergencyContactDialog, setEmergencyContactDialog] = useState(false)
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyContactError, setEmergencyContactError] = useState<string | null>(null)

  const supabase = createClient()

  // Check notification service health
  useEffect(() => {
    const checkServiceHealth = async () => {
      const isHealthy = await checkNotificationServiceHealth()
      setServiceAvailable(isHealthy)

      if (!isHealthy) {
        toast({
          title: "Service Unavailable",
          description: "The notification service is currently unavailable. Emergency contacts may not receive alerts.",
          variant: "destructive",
        })
      }
    }

    checkServiceHealth()
  }, [])

  // Create a memoized fetch function to avoid recreating it on every render
  const fetchData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch user data
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, email, full_name, emergency_contact_email")
        .eq("id", session.user.id)
        .single()

      if (userError) throw userError

      setUserData(user)

      // Check if emergency contact is missing
      if (!user.emergency_contact_email) {
        setEmergencyContactMissing(true)
      }

      // Fetch user's alerts
      const { data: alertsData, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAlerts(alertsData || [])
    } catch (error) {
      console.error("Error fetching alerts:", error)
      toast({
        title: "Error",
        description: "Failed to load your alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Get user data and fetch alerts
  useEffect(() => {
    fetchData()

    // Set up real-time subscription for alerts
    const alertsSubscription = supabase
      .channel("alerts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(alertsSubscription)
    }
  }, [supabase, fetchData])

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location Error",
            description: "Could not access your location. Location will not be included in alerts.",
            variant: "destructive",
          })
          setIncludeLocation(false)
        },
      )
    } else {
      setIncludeLocation(false)
    }
  }, [])

  // Validate phone number format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const saveEmergencyContact = async () => {
    setEmergencyContactError(null)

    // Validate emergency contact
    if (!emergencyContact) {
      setEmergencyContactError("Emergency contact email is required")
      return
    }

    // Validate email format
    if (!validateEmail(emergencyContact)) {
      setEmergencyContactError("Please enter a valid email address")
      return
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          emergency_contact_email: emergencyContact,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData?.id)

      if (error) throw error

      toast({
        title: "Emergency Contact Updated",
        description: "Your emergency contact has been saved",
      })

      // Update local user state
      if (userData) {
        setUserData({
          ...userData,
          emergency_contact_email: emergencyContact,
        })
      }

      setEmergencyContactMissing(false)
      setEmergencyContactDialog(false)
    } catch (error) {
      console.error("Error updating emergency contact:", error)
      toast({
        title: "Error",
        description: "Failed to update your emergency contact",
        variant: "destructive",
      })
    }
  }

  // Update the createAlert function to ensure it properly sends notifications
  const createAlert = async () => {
    if (!userData) return

    // Check if emergency contact is missing
    if (!userData.emergency_contact_email) {
      setEmergencyContactDialog(true)
      return
    }

    setIsCreatingAlert(true)

    try {
      const newAlert = {
        user_id: userData.id,
        alert_type: "emergency",
        content: alertContent || "Emergency alert triggered",
        latitude: includeLocation && currentLocation ? currentLocation.lat : null,
        longitude: includeLocation && currentLocation ? currentLocation.lng : null,
        is_resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Insert alert into database
      const { data, error } = await supabase.from("alerts").insert(newAlert).select()

      if (error) throw error

      // Add new alert to state
      if (data && data[0]) {
        setAlerts((prev) => [data[0], ...prev])

        // Send notifications with all required data
        if (serviceAvailable) {
          const notificationResult = await sendAlertNotifications({
            user_id: userData.id,
            user_email: userData.email,
            user_name: userData.full_name || "SafeSpace User",
            emergency_contact_email: userData.emergency_contact_email,
            alert_type: "emergency",
            content: alertContent || "Emergency alert triggered",
            latitude: includeLocation && currentLocation ? currentLocation.lat : undefined,
            longitude: includeLocation && currentLocation ? currentLocation.lng : undefined,
            alert_id: data[0].id,
          })

          if (!notificationResult.success) {
            console.error("Notification error:", notificationResult.message)
            toast({
              title: "Notification Warning",
              description: "Alert created but there was an issue sending notifications: " + notificationResult.message,
              variant: "warning",
            })
          } else {
            toast({
              title: "Emergency Alert Created",
              description: "Your emergency contacts have been notified",
              variant: "destructive",
            })
          }
        }

        // Reset form
        setAlertContent("")
      }
    } catch (error) {
      console.error("Error creating alert:", error)
      toast({
        title: "Error",
        description: "Failed to create emergency alert",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAlert(false)
    }
  }

  const resolveAlert = async (alert: AlertType) => {
    try {
      const updatedAlert = {
        ...alert,
        is_resolved: true,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("alerts").update(updatedAlert).eq("id", alert.id)

      if (error) throw error

      // Update alert in state
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updatedAlert : a)))

      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved",
      })

      // Close dialog if open
      setDialogOpen(false)
      setSelectedAlert(null)
    } catch (error) {
      console.error("Error resolving alert:", error)
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      })
    }
  }

  const deleteAlert = async (alert: AlertType) => {
    try {
      const { error } = await supabase.from("alerts").delete().eq("id", alert.id)

      if (error) throw error

      // Remove alert from state
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id))

      toast({
        title: "Alert Deleted",
        description: "The alert has been deleted",
      })

      // Close dialog if open
      setDialogOpen(false)
      setSelectedAlert(null)
    } catch (error) {
      console.error("Error deleting alert:", error)
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      })
    }
  }

  const viewAlertDetails = (alert: AlertType) => {
    setSelectedAlert(alert)
    setDialogOpen(true)
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "emergency":
        return <Shield className="h-4 w-4 text-destructive" />
      case "text_threat":
        return <MessageSquare className="h-4 w-4 text-amber-500" />
      case "audio_detection":
        return <Mic className="h-4 w-4 text-amber-500" />
      case "safe_zone_exit":
        return <MapPin className="h-4 w-4 text-amber-500" />
      case "manual_audio_alert":
        return <Mic className="h-4 w-4 text-destructive" />
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
    }
  }

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case "emergency":
        return "Emergency Alert"
      case "text_threat":
        return "Text Threat Detection"
      case "audio_detection":
        return "Audio Detection"
      case "safe_zone_exit":
        return "Safe Zone Exit"
      case "manual_audio_alert":
        return "Manual Audio Alert"
      default:
        return "Alert"
    }
  }

  // Update the openInGoogleMaps function to properly open Google Maps in a new tab
  const openInGoogleMaps = (latitude: number, longitude: number) => {
    // Create a properly formatted Google Maps URL with the coordinates
    const url = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`
    // Open in a new tab
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return !alert.is_resolved
    if (activeTab === "resolved") return alert.is_resolved
    return true
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground">Manage your safety alerts and notifications</p>
          </div>
          <Button variant="destructive" className="relative overflow-hidden group" onClick={createAlert}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Create Emergency Alert</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Button>
        </div>

        {emergencyContactMissing && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Emergency Contact Missing</AlertTitle>
            <AlertDescription>
              You need to add an emergency contact to use the alert system.{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-white underline"
                onClick={() => setEmergencyContactDialog(true)}
              >
                Add emergency contact now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!serviceAvailable && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Notification Service Unavailable</AlertTitle>
            <AlertDescription>
              The notification service is currently unavailable. Your emergency contacts may not receive alerts.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="dashboard-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Alert History</CardTitle>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription>View and manage your safety alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAlerts.length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredAlerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`rounded-lg border p-4 cursor-pointer transition-all duration-200 alert-item ${
                            alert.is_resolved ? "bg-muted/50" : "hover:border-destructive"
                          }`}
                          onClick={() => viewAlertDetails(alert)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getAlertIcon(alert.alert_type)}
                              <span className="font-medium">{getAlertTypeLabel(alert.alert_type)}</span>
                              <Badge variant={alert.is_resolved ? "outline" : "destructive"}>
                                {alert.is_resolved ? "Resolved" : "Active"}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {alert.content || "No details provided"}
                          </p>
                          {alert.latitude && alert.longitude && (
                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>Location data available</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                    <div>
                      <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2">No alerts found</p>
                      <p className="text-sm">You're safe! No alerts have been triggered.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Emergency Alert</CardTitle>
                <CardDescription>Quickly send an alert to your emergency contacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your emergency situation (optional)"
                  className="min-h-[100px]"
                  value={alertContent}
                  onChange={(e) => setAlertContent(e.target.value)}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-location"
                    checked={includeLocation}
                    onCheckedChange={setIncludeLocation}
                    disabled={!currentLocation}
                  />
                  <Label htmlFor="include-location">Include my current location</Label>
                </div>
                <Button
                  variant="destructive"
                  className="w-full relative overflow-hidden group"
                  onClick={createAlert}
                  disabled={isCreatingAlert}
                >
                  {isCreatingAlert ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  <span>{isCreatingAlert ? "Sending Alert..." : "Send Emergency Alert"}</span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Alert Information</CardTitle>
                <CardDescription>How alerts work in SafeSpace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Emergency Alerts</AlertTitle>
                  <AlertDescription>
                    When you trigger an emergency alert, your emergency contacts will be notified immediately with your
                    information and location (if shared).
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span className="text-sm">Manual alerts are triggered by you</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Text analysis can detect threats in messages</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mic className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Audio monitoring detects sounds of distress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Safe zone exits trigger location-based alerts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Alert Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  {getAlertIcon(selectedAlert.alert_type)}
                  <DialogTitle>{getAlertTypeLabel(selectedAlert.alert_type)}</DialogTitle>
                  <Badge variant={selectedAlert.is_resolved ? "outline" : "destructive"}>
                    {selectedAlert.is_resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
                <DialogDescription>Created on {new Date(selectedAlert.created_at).toLocaleString()}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">Alert Details</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedAlert.content || "No details provided"}</p>
                </div>

                {selectedAlert.latitude && selectedAlert.longitude && (
                  <div className="rounded-lg border p-3">
                    <h4 className="text-sm font-medium">Location</h4>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <div>Latitude: {selectedAlert.latitude.toFixed(6)}</div>
                      <div>Longitude: {selectedAlert.longitude.toFixed(6)}</div>
                      <Button
                        variant="link"
                        className="p-0 h-auto mt-2"
                        onClick={() => {
                          openInGoogleMaps(selectedAlert.latitude!, selectedAlert.longitude!)
                        }}
                      >
                        View on Google Maps
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                {!selectedAlert.is_resolved && (
                  <Button variant="secondary" onClick={() => resolveAlert(selectedAlert)}>
                    Resolve Alert
                  </Button>
                )}
                <Button variant="destructive" onClick={() => deleteAlert(selectedAlert)}>
                  Delete Alert
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Emergency Contact Dialog */}
      <Dialog open={emergencyContactDialog} onOpenChange={setEmergencyContactDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>Please provide an emergency contact email to use the alert system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Email</Label>
            <Input
              id="emergencyContact"
              type="email"
              placeholder="emergency@example.com"
              value={emergencyContact}
              onChange={(e) => {
                setEmergencyContact(e.target.value)
                setEmergencyContactError(null)
              }}
              className={emergencyContactError ? "border-destructive" : ""}
            />
            {emergencyContactError && <p className="text-sm text-destructive">{emergencyContactError}</p>}
            <p className="text-xs text-muted-foreground">This email will receive alerts when you trigger them.</p>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="button" variant="secondary" onClick={() => setEmergencyContactDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEmergencyContact}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
