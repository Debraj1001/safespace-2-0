"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPin, Plus, Trash2, Edit2, Save, X, Info, ExternalLink, Navigation } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader } from "@/components/ui/loader"

// Define types for safe zones
interface SafeZone {
  id: string
  user_id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  created_at: string
  updated_at: string
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export default function SafeZonesPage() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newZoneName, setNewZoneName] = useState("")
  const [newZoneRadius, setNewZoneRadius] = useState(100)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState<SafeZone | null>(null)
  const [mapDialogOpen, setMapDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const circlesRef = useRef<google.maps.Circle[]>([])
  const newMarkerRef = useRef<google.maps.Marker | null>(null)
  const newCircleRef = useRef<google.maps.Circle | null>(null)

  const supabase = createClient()

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }
  }, [])

  // Get user ID and fetch safe zones
  useEffect(() => {
    const fetchUserAndZones = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return

        setUserId(session.user.id)

        // Fetch user's safe zones
        const { data: zones, error } = await supabase
          .from("safe_zones")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setSafeZones(zones || [])
      } catch (error) {
        console.error("Error fetching safe zones:", error)
        toast({
          title: "Error",
          description: "Failed to load your safe zones",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndZones()
  }, [supabase])

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setMapCenter({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to a location if geolocation fails
          setCurrentLocation({ lat: 40.7128, lng: -74.006 }) // New York
          setMapCenter({ lat: 40.7128, lng: -74.006 })
        },
      )
    }
  }, [])

  // Initialize map when both map API and location are available
  useEffect(() => {
    if (mapLoaded && mapCenter && !mapRef.current) {
      initializeMap()
    }
  }, [mapLoaded, mapCenter])

  // Update map markers when safe zones change
  useEffect(() => {
    if (mapRef.current && safeZones.length > 0) {
      updateMapMarkers()
    }
  }, [safeZones, mapRef.current])

  const initializeMap = () => {
    if (!mapCenter || !window.google) return

    const mapOptions: google.maps.MapOptions = {
      center: mapCenter,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    }

    const mapElement = document.getElementById("map")
    if (!mapElement) return

    mapRef.current = new window.google.maps.Map(mapElement, mapOptions)

    // Add click listener for adding new safe zones
    mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (isCreating && e.latLng) {
        placeNewZoneMarker(e.latLng)
      }
    })

    // Add existing safe zones to map
    updateMapMarkers()
  }

  const updateMapMarkers = () => {
    if (!mapRef.current || !window.google) return

    // Clear existing markers and circles
    markersRef.current.forEach((marker) => marker.setMap(null))
    circlesRef.current.forEach((circle) => circle.setMap(null))
    markersRef.current = []
    circlesRef.current = []

    // Add markers and circles for each safe zone
    safeZones.forEach((zone) => {
      const position = { lat: zone.latitude, lng: zone.longitude }

      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: zone.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        className: "map-marker",
      })

      // Create circle to represent the safe zone radius
      const circle = new window.google.maps.Circle({
        map: mapRef.current,
        center: position,
        radius: zone.radius,
        fillColor: "#4CAF50",
        fillOpacity: 0.2,
        strokeColor: "#4CAF50",
        strokeOpacity: 0.8,
        strokeWeight: 2,
      })

      // Add click listener to marker
      marker.addListener("click", () => {
        setSelectedZone(zone)

        // Pan to the selected zone
        if (mapRef.current) {
          mapRef.current.panTo(position)
        }
      })

      markersRef.current.push(marker)
      circlesRef.current.push(circle)
    })
  }

  const placeNewZoneMarker = (latLng: google.maps.LatLng) => {
    if (!mapRef.current || !window.google) return

    // Remove existing new marker and circle if any
    if (newMarkerRef.current) {
      newMarkerRef.current.setMap(null)
      newMarkerRef.current = null
    }

    if (newCircleRef.current) {
      newCircleRef.current.setMap(null)
      newCircleRef.current = null
    }

    // Create new marker
    newMarkerRef.current = new window.google.maps.Marker({
      position: latLng,
      map: mapRef.current,
      animation: window.google.maps.Animation.DROP,
      draggable: true,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#2196F3",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
      className: "map-marker",
    })

    // Create circle for the new zone
    newCircleRef.current = new window.google.maps.Circle({
      map: mapRef.current,
      center: latLng,
      radius: newZoneRadius,
      fillColor: "#2196F3",
      fillOpacity: 0.2,
      strokeColor: "#2196F3",
      strokeOpacity: 0.8,
      strokeWeight: 2,
    })

    // Update circle when marker is dragged
    newMarkerRef.current.addListener("drag", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && newCircleRef.current) {
        newCircleRef.current.setCenter(e.latLng)
      }
    })
  }

  const startCreatingZone = () => {
    setIsCreating(true)
    setIsEditing(false)
    setSelectedZone(null)
    setNewZoneName("")
    setNewZoneRadius(100)

    toast({
      title: "Creating new safe zone",
      description: "Click on the map to place your safe zone",
    })
  }

  const cancelCreatingZone = () => {
    setIsCreating(false)

    // Remove new marker and circle
    if (newMarkerRef.current) {
      newMarkerRef.current.setMap(null)
      newMarkerRef.current = null
    }

    if (newCircleRef.current) {
      newCircleRef.current.setMap(null)
      newCircleRef.current = null
    }
  }

  const saveNewZone = async () => {
    if (!newMarkerRef.current || !userId) return

    const position = newMarkerRef.current.getPosition()
    if (!position) return

    try {
      const newZone = {
        user_id: userId,
        name: newZoneName || "New Safe Zone",
        latitude: position.lat(),
        longitude: position.lng(),
        radius: newZoneRadius,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("safe_zones").insert(newZone).select()

      if (error) throw error

      // Add new zone to state
      if (data && data[0]) {
        setSafeZones((prev) => [data[0], ...prev])

        toast({
          title: "Safe zone created",
          description: `"${newZoneName || "New Safe Zone"}" has been added to your safe zones`,
        })
      }

      // Clean up
      cancelCreatingZone()
    } catch (error) {
      console.error("Error creating safe zone:", error)
      toast({
        title: "Error",
        description: "Failed to create safe zone",
        variant: "destructive",
      })
    }
  }

  const startEditingZone = () => {
    if (!selectedZone) return

    setIsEditing(true)
    setIsCreating(false)
    setNewZoneName(selectedZone.name)
    setNewZoneRadius(selectedZone.radius)
  }

  const saveEditedZone = async () => {
    if (!selectedZone || !userId) return

    try {
      const updatedZone = {
        ...selectedZone,
        name: newZoneName || selectedZone.name,
        radius: newZoneRadius,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("safe_zones").update(updatedZone).eq("id", selectedZone.id)

      if (error) throw error

      // Update zone in state
      setSafeZones((prev) => prev.map((zone) => (zone.id === selectedZone.id ? updatedZone : zone)))

      toast({
        title: "Safe zone updated",
        description: `"${updatedZone.name}" has been updated`,
      })

      // Clean up
      setIsEditing(false)
      setSelectedZone(updatedZone)

      // Update map markers
      updateMapMarkers()
    } catch (error) {
      console.error("Error updating safe zone:", error)
      toast({
        title: "Error",
        description: "Failed to update safe zone",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteZone = (zone: SafeZone) => {
    setZoneToDelete(zone)
    setDialogOpen(true)
  }

  const deleteZone = async () => {
    if (!zoneToDelete) return

    try {
      const { error } = await supabase.from("safe_zones").delete().eq("id", zoneToDelete.id)

      if (error) throw error

      // Remove zone from state
      setSafeZones((prev) => prev.filter((zone) => zone.id !== zoneToDelete.id))

      toast({
        title: "Safe zone deleted",
        description: `"${zoneToDelete.name}" has been removed from your safe zones`,
      })

      // Clean up
      setDialogOpen(false)
      setZoneToDelete(null)
      setSelectedZone(null)

      // Update map markers
      updateMapMarkers()
    } catch (error) {
      console.error("Error deleting safe zone:", error)
      toast({
        title: "Error",
        description: "Failed to delete safe zone",
        variant: "destructive",
      })
    }
  }

  const updateNewZoneRadius = (value: number[]) => {
    const radius = value[0]
    setNewZoneRadius(radius)

    // Update circle radius
    if (newCircleRef.current) {
      newCircleRef.current.setRadius(radius)
    }

    // Update selected zone circle if editing
    if (isEditing && selectedZone) {
      const index = safeZones.findIndex((zone) => zone.id === selectedZone.id)
      if (index !== -1 && circlesRef.current[index]) {
        circlesRef.current[index].setRadius(radius)
      }
    }
  }

  const openInGoogleMaps = (latitude: number, longitude: number, name: string) => {
    // Create a properly formatted Google Maps URL with the coordinates
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    // Open in a new tab
    window.open(url, "_blank", "noopener,noreferrer")

    toast({
      title: "Opening Google Maps",
      description: `Viewing location: ${name}`,
    })
  }

  const showLocationDetails = (zone: SafeZone) => {
    setSelectedLocation({ lat: zone.latitude, lng: zone.longitude })
    setMapDialogOpen(true)
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Safe Zones</h1>
            <p className="text-muted-foreground">Create and manage your safe areas</p>
          </div>
          <div className="flex space-x-2">
            {!isCreating && (
              <Button
                variant="outline"
                onClick={() =>
                  currentLocation && openInGoogleMaps(currentLocation.lat, currentLocation.lng, "My Current Location")
                }
                className="mr-2 relative overflow-hidden group"
                disabled={!currentLocation}
              >
                <Navigation className="mr-2 h-4 w-4" />
                <span>View My Location</span>
                <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
            )}
            {isCreating ? (
              <>
                <Button variant="outline" onClick={cancelCreatingZone} className="relative overflow-hidden group">
                  <X className="mr-2 h-4 w-4" />
                  <span>Cancel</span>
                  <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Button>
                <Button
                  onClick={saveNewZone}
                  disabled={!newMarkerRef.current}
                  className="relative overflow-hidden group"
                >
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Zone</span>
                  <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Button>
              </>
            ) : (
              <Button onClick={startCreatingZone} className="relative overflow-hidden group">
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Safe Zone</span>
                <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="h-[600px] dashboard-card">
              <CardHeader>
                <CardTitle>Map</CardTitle>
                <CardDescription>
                  {isCreating ? "Click on the map to place your safe zone" : "View and manage your safe zones"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div id="map" className="h-[500px] w-full rounded-b-lg"></div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isCreating && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>New Safe Zone</CardTitle>
                  <CardDescription>Configure your new safe zone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zone-name">Zone Name</Label>
                    <Input
                      id="zone-name"
                      placeholder="Home, Work, School, etc."
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="zone-radius">Radius (meters)</Label>
                      <span className="text-sm text-muted-foreground">{newZoneRadius}m</span>
                    </div>
                    <Slider
                      id="zone-radius"
                      value={[newZoneRadius]}
                      min={50}
                      max={500}
                      step={10}
                      onValueChange={updateNewZoneRadius}
                    />
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Click on the map to place your safe zone, then adjust the radius and name.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {selectedZone && !isCreating && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>{isEditing ? "Edit Safe Zone" : "Selected Zone"}</CardTitle>
                  <CardDescription>{isEditing ? "Modify zone details" : selectedZone.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="edit-zone-name">Zone Name</Label>
                        <Input
                          id="edit-zone-name"
                          value={newZoneName}
                          onChange={(e) => setNewZoneName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="edit-zone-radius">Radius (meters)</Label>
                          <span className="text-sm text-muted-foreground">{newZoneRadius}m</span>
                        </div>
                        <Slider
                          id="edit-zone-radius"
                          value={[newZoneRadius]}
                          min={50}
                          max={500}
                          step={10}
                          onValueChange={updateNewZoneRadius}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Latitude: {selectedZone.latitude.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Longitude: {selectedZone.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span>Radius: {selectedZone.radius} meters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {new Date(selectedZone.created_at).toLocaleDateString()}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-2 flex items-center justify-center gap-2"
                        onClick={() =>
                          openInGoogleMaps(selectedZone.latitude, selectedZone.longitude, selectedZone.name)
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open in Google Maps</span>
                      </Button>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveEditedZone}>Save Changes</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setSelectedZone(null)}>
                        Close
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={startEditingZone}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" onClick={() => confirmDeleteZone(selectedZone)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </CardFooter>
              </Card>
            )}

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Your Safe Zones</CardTitle>
                <CardDescription>List of all your defined safe areas</CardDescription>
              </CardHeader>
              <CardContent>
                {safeZones.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {safeZones.map((zone) => (
                        <motion.div
                          key={zone.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors duration-200 location-card ${
                            selectedZone?.id === zone.id ? "bg-muted border-primary" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedZone(zone)}
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{zone.name}</div>
                              <div className="text-xs text-muted-foreground">Radius: {zone.radius}m</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                openInGoogleMaps(zone.latitude, zone.longitude, zone.name)
                              }}
                              className="h-8 w-8"
                            >
                              <Navigation className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                confirmDeleteZone(zone)
                              }}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex h-[100px] items-center justify-center text-center text-muted-foreground">
                    <div>
                      <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2">No safe zones defined yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Safe Zone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{zoneToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteZone}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Location Details</DialogTitle>
            <DialogDescription>View and navigate to this location</DialogDescription>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden h-[200px] relative">
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedLocation.lat},${selectedLocation.lng}&zoom=15&size=500x200&markers=color:red%7C${selectedLocation.lat},${selectedLocation.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`}
                  alt="Map location"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="font-medium">{selectedLocation.lat.toFixed(6)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="font-medium">{selectedLocation.lng.toFixed(6)}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setMapDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    openInGoogleMaps(selectedLocation.lat, selectedLocation.lng, "Selected Location")
                    setMapDialogOpen(false)
                  }}
                  className="gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate in Google Maps
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </DashboardLayout>
  )
}
