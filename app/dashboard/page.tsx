"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [safeZones, setSafeZones] = useState<any[]>([])
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAlerts, setActiveAlerts] = useState(0)
  const [totalAnalyses, setTotalAnalyses] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  // Create a memoized fetch function to avoid recreating it on every render
  const fetchData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const userId = session.user.id

      // Fetch user data
      const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single()

      setUser(userData)

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      setAlerts(alertsData || [])

      // Count active alerts
      const activeAlertsCount = alertsData ? alertsData.filter((alert) => !alert.is_resolved).length : 0
      setActiveAlerts(activeAlertsCount)

      // Fetch safe zones
      const { data: safeZonesData } = await supabase.from("safe_zones").select("*").eq("user_id", userId)

      setSafeZones(safeZonesData || [])

      // Fetch analysis history
      const { data: analysisData } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      setAnalysisHistory(analysisData || [])

      // Get total analysis count
      const { count: analysisCount } = await supabase
        .from("analysis_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      setTotalAnalyses(analysisCount || 0)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error loading dashboard",
        description: "Failed to load your dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchData()

    // Set up real-time subscriptions
    const alertsSubscription = supabase
      .channel("alerts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        fetchData()
      })
      .subscribe()

    const analysisSubscription = supabase
      .channel("analysis-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "analysis_history" }, () => {
        fetchData()
      })
      .subscribe()

    const safeZonesSubscription = supabase
      .channel("safe-zones-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "safe_zones" }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(alertsSubscription)
      supabase.removeChannel(analysisSubscription)
      supabase.removeChannel(safeZonesSubscription)
    }
  }, [supabase, fetchData])

  const createEmergencyAlert = async () => {
    if (!user) return

    try {
      const newAlert = {
        user_id: user.id,
        alert_type: "emergency",
        content: "Emergency alert triggered from dashboard",
        is_resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("alerts").insert(newAlert).select()

      if (error) throw error

      // If we have location, include it
      let latitude, longitude
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
        })
        latitude = position.coords.latitude
        longitude = position.coords.longitude
      } catch (locationError) {
        console.warn("Could not get location:", locationError)
      }

      // Send notification email
      if (user.emergency_contact_email) {
        const { sendAlertNotifications } = await import("@/lib/notification-service")

        await sendAlertNotifications({
          user_id: user.id,
          user_email: user.email,
          user_name: user.full_name || "SafeSpace User",
          emergency_contact_email: user.emergency_contact_email,
          alert_type: "emergency",
          content: "Emergency alert triggered from dashboard",
          latitude,
          longitude,
          alert_id: data?.[0]?.id,
        })
      }

      toast({
        title: "Emergency Alert Created",
        description: "Your emergency contacts have been notified",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error creating emergency alert:", error)
      toast({
        title: "Error",
        description: "Failed to create emergency alert",
        variant: "destructive",
      })
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
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.full_name || "User"}</p>
          </div>
          <Button onClick={createEmergencyAlert} className="relative overflow-hidden group">
            <Shield className="mr-2 h-4 w-4" />
            <span>Create Emergency Alert</span>
            <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Safe Zones</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeZones.length}</div>
              <p className="text-xs text-muted-foreground">Defined safe locations</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts}</div>
              <p className="text-xs text-muted-foreground">Unresolved safety alerts</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Analysis History</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">Total analyses performed</p>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Safety monitoring is enabled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 dashboard-card">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Your most recent safety alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.slice(0, 3).map((alert) => (
                    <Alert
                      key={alert.id}
                      variant={alert.is_resolved ? "default" : "destructive"}
                      className="alert-item"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{alert.alert_type}</AlertTitle>
                      <AlertDescription className="flex justify-between">
                        <span>{alert.content || "No details provided"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No alerts found</p>
              )}
              {alerts.length > 0 && (
                <Button variant="link" className="mt-4 w-full" onClick={() => router.push("/dashboard/alerts")}>
                  View all alerts
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 dashboard-card">
            <CardHeader>
              <CardTitle>Recent Analysis</CardTitle>
              <CardDescription>Your most recent safety analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisHistory.length > 0 ? (
                <div className="space-y-4">
                  {analysisHistory.slice(0, 3).map((analysis) => (
                    <div key={analysis.id} className="rounded-lg border p-3 alert-item">
                      <div className="flex justify-between">
                        <div className="font-medium capitalize">{analysis.analysis_type} Analysis</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {analysis.content || "No content provided"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No analysis history found</p>
              )}
              {analysisHistory.length > 0 && (
                <Button variant="link" className="mt-4 w-full" onClick={() => router.push("/dashboard/text-analysis")}>
                  View all analyses
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </DashboardLayout>
  )
}
