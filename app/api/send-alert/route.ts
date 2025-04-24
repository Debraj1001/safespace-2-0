import { NextResponse } from "next/server"
import { Resend } from "resend"
import {
  generateEmergencyAlertEmail,
  generateTextThreatAlertEmail,
  generateAudioAlertEmail,
} from "@/lib/email-templates"

// Initialize Resend with API key
// const resend = new Resend(process.env.RESEND_API_KEY) // Initialize later after checking API key

export async function POST(request: Request) {
  try {
    const {
      user_id,
      user_email,
      user_name,
      emergency_contact_email,
      alert_type,
      content,
      latitude,
      longitude,
      alert_id,
    } = await request.json()

    // Validate required fields
    if (!emergency_contact_email || !user_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prepare location data if available
    const location = latitude && longitude ? { latitude, longitude } : undefined

    // Generate appropriate email HTML based on alert type
    let subject = "SafeSpace Alert"
    let html = ""

    switch (alert_type) {
      case "emergency":
        subject = "URGENT: SafeSpace Emergency Alert"
        html = generateEmergencyAlertEmail({
          userName: user_name,
          alertType: alert_type,
          content,
          location,
        })
        break
      case "text_threat":
        subject = "SafeSpace Text Threat Detection"
        html = generateTextThreatAlertEmail({
          userName: user_name,
          content,
          threatLevel: "high", // Default to high for now
        })
        break
      case "audio_detection":
      case "manual_audio_alert":
        subject = "SafeSpace Audio Alert Detection"
        html = generateAudioAlertEmail({
          userName: user_name,
          content,
          location,
        })
        break
      default:
        subject = `SafeSpace Alert: ${alert_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
        html = generateEmergencyAlertEmail({
          userName: user_name,
          alertType: alert_type,
          content,
          location,
        })
    }

    // Check if RESEND_API_KEY is available
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service not configured", details: "RESEND_API_KEY is missing" },
        { status: 500 },
      )
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "SafeSpace Alerts <alerts@safespace-app.com>",
      to: [emergency_contact_email],
      subject,
      html,
      cc: user_email ? [user_email] : undefined, // Send a copy to the user
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 })
    }

    // Log the successful email in database
    const { createClient } = require("@supabase/supabase-js")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role key for server operations
    )

    await supabase.from("email_logs").insert({
      user_id,
      alert_id,
      recipient_email: emergency_contact_email,
      subject,
      status: "sent",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in send-alert API route:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
