import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  let resendStatus = "unknown"

  // Check if Resend API key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      // Just ping the API to see if our key is valid
      await resend.domains.list()
      resendStatus = "connected"
    } catch (error) {
      console.error("Resend API check failed:", error)
      resendStatus = "error"
    }
  } else {
    resendStatus = "not_configured"
  }

  return NextResponse.json({
    status: "healthy",
    services: {
      resend: resendStatus,
    },
    timestamp: new Date().toISOString(),
  })
}
