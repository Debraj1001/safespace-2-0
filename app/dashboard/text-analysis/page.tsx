"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

export default function TextAnalysisPage() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClient()

  const analyzeText = async () => {
    if (!text.trim()) return

    setLoading(true)

    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to analyze text")
      }

      // Call the Groq AI API (this would be a server action in a real app)
      // For demo purposes, we'll simulate the response
      const simulatedResponse = simulateGroqAnalysis(text)

      // Store the analysis in the database
      const { data, error } = await supabase
        .from("analysis_history")
        .insert({
          user_id: session.user.id,
          analysis_type: "text",
          content: text,
          result: simulatedResponse,
        })
        .select()

      if (error) throw error

      // Check if we need to create an alert
      if (simulatedResponse.threat_level === "high") {
        await supabase.from("alerts").insert({
          user_id: session.user.id,
          alert_type: "text_threat",
          content: text,
          is_resolved: false,
        })
      }

      setResult(simulatedResponse)
    } catch (error) {
      console.error("Error analyzing text:", error)
    } finally {
      setLoading(false)
    }
  }

  // This function simulates the Groq AI analysis
  // In a real app, this would be a server-side API call
  const simulateGroqAnalysis = (text: string) => {
    const lowerText = text.toLowerCase()

    // Simple keyword-based analysis for demo purposes
    const negativeKeywords = ["scared", "afraid", "worried", "uncomfortable", "help", "danger", "threatened", "unsafe"]
    const positiveKeywords = ["happy", "excited", "looking forward", "great", "wonderful", "good", "safe"]
    const threatKeywords = ["knife", "gun", "weapon", "attack", "follow", "stalking", "threatened"]
    const distressKeywords = ["help", "emergency", "scared", "afraid", "please", "urgent"]

    // Count keyword matches
    const negativeCount = negativeKeywords.filter((word) => lowerText.includes(word)).length
    const positiveCount = positiveKeywords.filter((word) => lowerText.includes(word)).length
    const threatCount = threatKeywords.filter((word) => lowerText.includes(word)).length
    const distressCount = distressKeywords.filter((word) => lowerText.includes(word)).length

    // Determine sentiment
    let sentiment, sentimentScore
    if (positiveCount > negativeCount) {
      sentiment = "positive"
      sentimentScore = Math.min(0.9, 0.5 + positiveCount * 0.1)
    } else if (negativeCount > positiveCount) {
      sentiment = "negative"
      sentimentScore = Math.max(-0.9, -0.5 - negativeCount * 0.1)
    } else {
      sentiment = "neutral"
      sentimentScore = 0
    }

    // Determine threat level
    let threatLevel
    if (threatCount >= 2) {
      threatLevel = "high"
    } else if (threatCount === 1 || distressCount >= 2) {
      threatLevel = "medium"
    } else {
      threatLevel = "low"
    }

    // Collect threat indicators
    const threatIndicators = threatKeywords
      .filter((word) => lowerText.includes(word))
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))

    // Collect distress signals
    const distressSignals = distressKeywords
      .filter((word) => lowerText.includes(word))
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))

    // Generate recommendations
    let recommendations = []
    if (threatLevel === "high") {
      recommendations = [
        "Contact emergency services immediately",
        "Share your location with trusted contacts",
        "Move to a public area if possible",
        "Use the emergency alert feature in the app",
      ]
    } else if (threatLevel === "medium") {
      recommendations = [
        "Stay vigilant of your surroundings",
        "Consider contacting a friend or family member",
        "Move to a more populated area if possible",
        "Keep your phone accessible for emergency calls",
      ]
    } else {
      recommendations = [
        "Continue to monitor your surroundings",
        "Use the app's regular check-in feature",
        "No immediate action required",
      ]
    }

    // Generate explanation
    let explanation = ""
    if (threatLevel === "high") {
      explanation =
        "The text contains multiple indicators of potential danger or threat. Immediate action is recommended."
    } else if (threatLevel === "medium") {
      explanation =
        "The text contains some concerning language that suggests potential discomfort or risk. Increased vigilance is recommended."
    } else {
      explanation =
        "The text does not contain significant indicators of threat or danger. Normal precautions are sufficient."
    }

    return {
      sentiment,
      sentiment_score: sentimentScore,
      threat_level: threatLevel,
      threat_indicators: threatIndicators,
      distress_signals: distressSignals,
      recommendations,
      explanation,
    }
  }

  const getExampleText = (type: string) => {
    switch (type) {
      case "positive":
        return "I'm feeling happy today and looking forward to meeting my friends."
      case "concerning":
        return "I'm feeling scared and uncomfortable with this person following me."
      case "threat":
        return "Someone threatened me with a knife and I need help."
      default:
        return ""
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Text Analysis</h1>
          <p className="text-muted-foreground">Analyze text for potential threats or safety concerns</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Enter Text</CardTitle>
              <CardDescription>Type a message or use one of the examples below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setText(getExampleText("positive"))}
                  >
                    Positive Example
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setText(getExampleText("concerning"))}
                  >
                    Concerning Example
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setText(getExampleText("threat"))}
                  >
                    Threat Example
                  </Badge>
                </div>

                <Textarea
                  placeholder="Type a message here or click an example above..."
                  className="min-h-[150px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setText("")}>
                    Clear
                  </Button>
                  <Button onClick={analyzeText} disabled={loading || !text.trim()}>
                    {loading ? "Analyzing..." : "Analyze with Groq AI"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>Groq AI-powered text analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          result.threat_level === "low"
                            ? "outline"
                            : result.threat_level === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {result.threat_level === "low" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {result.threat_level === "medium" && <Info className="mr-1 h-3 w-3" />}
                        {result.threat_level === "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
                        Threat Level: {result.threat_level.charAt(0).toUpperCase() + result.threat_level.slice(1)}
                      </Badge>
                      <Badge
                        variant={
                          result.sentiment === "positive"
                            ? "default"
                            : result.sentiment === "negative"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        Sentiment: {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date().toLocaleString()}</div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <h4 className="font-medium">Analysis Explanation</h4>
                    <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  </div>

                  {(result.threat_indicators.length > 0 || result.distress_signals.length > 0) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {result.threat_indicators.length > 0 && (
                        <div className="rounded-lg border p-3">
                          <h4 className="font-medium">Threat Indicators</h4>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {result.threat_indicators.map((indicator: string, i: number) => (
                              <li key={i} className="flex items-center">
                                <AlertTriangle className="mr-2 h-3 w-3 text-destructive" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.distress_signals.length > 0 && (
                        <div className="rounded-lg border p-3">
                          <h4 className="font-medium">Distress Signals</h4>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {result.distress_signals.map((signal: string, i: number) => (
                              <li key={i} className="flex items-center">
                                <Info className="mr-2 h-3 w-3 text-amber-500" />
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div className="rounded-lg border p-3">
                      <h4 className="font-medium">Safety Recommendations</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {result.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-center">
                            <CheckCircle className="mr-2 h-3 w-3 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.threat_level === "high" && (
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="destructive">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Create Emergency Alert
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Info className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2">Enter text and click "Analyze" to see results</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
