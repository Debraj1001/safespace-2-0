"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mic, MicOff, Volume2, AlertTriangle, Shield, Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AudioMonitoringPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [threshold, setThreshold] = useState(70)
  const [autoAlert, setAutoAlert] = useState(true)
  const [detectedSounds, setDetectedSounds] = useState<string[]>([])
  const [alertTriggered, setAlertTriggered] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrame = useRef<number | null>(null)
  const supabase = createClient()

  // Get user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
      }
    }

    fetchUserId()

    return () => {
      // Clean up audio resources when component unmounts
      stopRecording()
    }
  }, [supabase])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Initialize audio context
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyser.current = audioContext.current.createAnalyser()
      analyser.current.fftSize = 256

      // Connect microphone to analyser
      microphone.current = audioContext.current.createMediaStreamSource(stream)
      microphone.current.connect(analyser.current)

      setIsRecording(true)
      setIsAnalyzing(true)

      // Start analyzing audio
      analyzeAudio()

      toast({
        title: "Audio monitoring started",
        description: "Listening for sounds of distress or danger",
      })
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }

    if (microphone.current) {
      microphone.current.disconnect()
      microphone.current = null
    }

    if (audioContext.current && audioContext.current.state !== "closed") {
      audioContext.current.close()
      audioContext.current = null
    }

    setIsRecording(false)
    setIsAnalyzing(false)
    setAudioLevel(0)
  }

  const analyzeAudio = () => {
    if (!analyser.current) return

    const dataArray = new Uint8Array(analyser.current.frequencyBinCount)

    const updateAnalysis = () => {
      if (!analyser.current) return

      analyser.current.getByteFrequencyData(dataArray)

      // Calculate average volume level (0-100)
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
      const normalizedLevel = Math.min(100, Math.round((average / 255) * 100))
      setAudioLevel(normalizedLevel)

      // Simple sound detection based on threshold
      if (normalizedLevel > threshold) {
        detectSound(dataArray, normalizedLevel)
      }

      animationFrame.current = requestAnimationFrame(updateAnalysis)
    }

    updateAnalysis()
  }

  // Simple sound classification (in a real app, this would use ML)
  const detectSound = (dataArray: Uint8Array, level: number) => {
    // Analyze frequency patterns (simplified)
    const bassEnergy = dataArray.slice(0, 10).reduce((sum, val) => sum + val, 0)
    const midEnergy = dataArray.slice(10, 30).reduce((sum, val) => sum + val, 0)
    const highEnergy = dataArray.slice(30, 50).reduce((sum, val) => sum + val, 0)

    let detectedSound = ""

    // Very simplified sound classification
    if (level > 85) {
      if (highEnergy > midEnergy && highEnergy > bassEnergy) {
        detectedSound = "Scream or high-pitched sound"
        triggerAlert("High-pitched sound detected", "scream")
      } else if (bassEnergy > midEnergy && level > 90) {
        detectedSound = "Loud impact or explosion"
        triggerAlert("Loud impact sound detected", "impact")
      } else {
        detectedSound = "Loud noise"
        if (level > 90) {
          triggerAlert("Very loud noise detected", "loud_noise")
        }
      }

      // Add to detected sounds list if not already present
      if (detectedSound && !detectedSounds.includes(detectedSound)) {
        setDetectedSounds((prev) => [detectedSound, ...prev].slice(0, 5))
      }
    }
  }

  const triggerAlert = async (message: string, soundType: string) => {
    // Prevent multiple alerts in quick succession
    if (alertTriggered || !autoAlert) return

    setAlertTriggered(true)

    // Create alert in database
    if (userId) {
      try {
        await supabase.from("alerts").insert({
          user_id: userId,
          alert_type: "audio_detection",
          content: message,
          is_resolved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        toast({
          title: "Alert Created",
          description: message,
          variant: "destructive",
        })

        // Record in analysis history
        await supabase.from("analysis_history").insert({
          user_id: userId,
          analysis_type: "audio",
          content: `Detected ${soundType}`,
          result: {
            sound_type: soundType,
            level: audioLevel,
            timestamp: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error creating alert:", error)
      }
    }

    // Reset alert trigger after delay
    setTimeout(() => {
      setAlertTriggered(false)
    }, 10000) // 10 seconds cooldown
  }

  const manualTriggerAlert = async () => {
    if (!userId) return

    try {
      await supabase.from("alerts").insert({
        user_id: userId,
        alert_type: "manual_audio_alert",
        content: "Manually triggered audio alert",
        is_resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "Emergency Alert Sent",
        description: "Your emergency contacts have been notified",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error creating manual alert:", error)
      toast({
        title: "Alert Error",
        description: "Failed to send emergency alert",
        variant: "destructive",
      })
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Audio Monitoring</h1>
            <p className="text-muted-foreground">Detect sounds of distress and potential dangers</p>
          </div>
          <Button variant="destructive" className="relative overflow-hidden group" onClick={manualTriggerAlert}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Trigger Emergency Alert</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Audio Monitor</CardTitle>
              <CardDescription>Listen for sounds of distress or danger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <motion.div
                  className="relative w-48 h-48 rounded-full flex items-center justify-center bg-muted"
                  animate={{
                    scale: isRecording ? [1, 1.05, 1] : 1,
                    boxShadow: isRecording
                      ? ["0 0 0 rgba(0, 0, 0, 0.1)", "0 0 20px rgba(0, 0, 0, 0.2)", "0 0 0 rgba(0, 0, 0, 0.1)"]
                      : "0 0 0 rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{
                    duration: 2,
                    repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "loop",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isRecording ? (
                      <motion.div
                        key="recording"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-full"
                      >
                        {/* Audio level visualization */}
                        {[...Array(5)].map((_, i) => {
                          const scale = 0.6 + i * 0.1
                          const opacity = audioLevel > (i + 1) * 20 ? 0.1 + i * 0.15 : 0

                          return (
                            <motion.div
                              key={`level-${i}`}
                              className="absolute inset-0 rounded-full border-2 border-primary"
                              style={{ scale, opacity }}
                              animate={{
                                scale: audioLevel > (i + 1) * 20 ? [scale, scale + 0.05, scale] : scale,
                                opacity,
                              }}
                              transition={{
                                duration: 1,
                                repeat: audioLevel > (i + 1) * 20 ? Number.POSITIVE_INFINITY : 0,
                                repeatType: "loop",
                              }}
                            />
                          )
                        })}

                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <Mic className="h-12 w-12 text-primary" />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="not-recording"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center"
                      >
                        <MicOff className="h-12 w-12 text-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Audio Level: {audioLevel}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Threshold: {threshold}%</span>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ width: `${audioLevel}%` }}
                    animate={{
                      backgroundColor:
                        audioLevel > threshold
                          ? ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--primary))"]
                          : "hsl(var(--primary))",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alert Threshold</Label>
                  <Slider
                    value={[threshold]}
                    min={10}
                    max={95}
                    step={5}
                    onValueChange={(value) => setThreshold(value[0])}
                    disabled={isRecording}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-alert" checked={autoAlert} onCheckedChange={setAutoAlert} />
                  <Label htmlFor="auto-alert">Automatic Alerts</Label>
                </div>

                <div className="flex justify-center space-x-4">
                  {isRecording ? (
                    <Button variant="destructive" onClick={stopRecording} className="relative overflow-hidden group">
                      <MicOff className="mr-2 h-4 w-4" />
                      <span>Stop Monitoring</span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    </Button>
                  ) : (
                    <Button onClick={startRecording} className="relative overflow-hidden group">
                      <Mic className="mr-2 h-4 w-4" />
                      <span>Start Monitoring</span>
                      <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detection History</CardTitle>
              <CardDescription>Recent sounds detected above threshold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>How it works</AlertTitle>
                  <AlertDescription>
                    The audio monitor listens for sounds that may indicate danger or distress, such as screams, loud
                    impacts, or unusual noises. When detected, it can automatically create alerts.
                  </AlertDescription>
                </Alert>

                {detectedSounds.length > 0 ? (
                  <div className="space-y-2">
                    {detectedSounds.map((sound, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                          <span>{sound}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Volume2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2">No sounds detected yet</p>
                      {!isRecording && <p className="text-sm">Start monitoring to detect sounds</p>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      <Toaster />
    </DashboardLayout>
  )
}
