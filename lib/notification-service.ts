/**
 * Service for sending alert notifications
 */

interface AlertNotificationRequest {
  user_id: string
  user_email: string
  user_name: string
  emergency_contact_email: string
  alert_type: string
  content?: string
  latitude?: number
  longitude?: number
  alert_id?: string
}

interface AlertNotificationResponse {
  success: boolean
  message?: string
  data?: any
  error?: any
}

/**
 * Send alert notifications to emergency contact via email
 */
export async function sendAlertNotifications(alertData: AlertNotificationRequest): Promise<AlertNotificationResponse> {
  try {
    // Make sure we have all required fields
    if (!alertData.emergency_contact_email || !alertData.user_name) {
      return {
        success: false,
        message: "Missing required fields: emergency contact email or user name",
      }
    }

    // Make sure we're sending the request to our API endpoint with the correct path
    const response = await fetch("/api/send-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alertData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error response from send-alert API:", errorData)
      throw new Error(errorData.error || "Failed to send alert notifications")
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error sending alert notifications:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      error,
    }
  }
}

// Update the checkNotificationServiceHealth function to properly check Resend API status
export async function checkNotificationServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch("/api/health")
    if (!response.ok) {
      console.error("Notification service health check failed:", response.status, response.statusText)
      return false
    }

    const data = await response.json()

    // Check if Resend API is properly connected
    if (data.services?.resend !== "connected") {
      console.warn("Resend API is not properly configured:", data.services?.resend)
      return false
    }

    return data.status === "healthy"
  } catch (error) {
    console.error("Error checking notification service health:", error)
    return false
  }
}
