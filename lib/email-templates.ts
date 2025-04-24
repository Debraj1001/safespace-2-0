/**
 * Email templates for SafeSpace alerts
 */

interface LocationData {
  latitude: number
  longitude: number
}

/**
 * Generate a Google Maps link from coordinates
 */
export function formatLocationLink(location?: LocationData): string {
  if (!location || !location.latitude || !location.longitude) {
    return ""
  }
  // Format the URL to open directly in Google Maps with a marker
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`
}

/**
 * Generate HTML for an emergency alert email
 */
export function generateEmergencyAlertEmail({
  userName,
  alertType,
  content,
  location,
}: {
  userName: string
  alertType: string
  content?: string
  location?: LocationData
}): string {
  // Format the alert type for display
  const alertTypeFormatted = alertType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Format the current time
  const currentTime = new Date().toLocaleString()

  // Generate location section if available
  const locationSection = location
    ? `<p><strong>Location:</strong> <a href="${formatLocationLink(location)}" style="color: #3182ce;">View on Google Maps</a></p>`
    : "<p><strong>Location:</strong> Not provided</p>"

  return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #e53e3e;
          margin: 0;
        }
        .header p {
          font-size: 18px;
          font-weight: bold;
        }
        .content {
          margin-bottom: 20px;
        }
        .warning {
          margin-top: 30px;
          padding: 15px;
          background-color: #fed7d7;
          border-left: 4px solid #e53e3e;
          border-radius: 3px;
        }
        .warning p {
          margin: 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EMERGENCY ALERT</h1>
          <p>${alertTypeFormatted}</p>
        </div>
        
        <div class="content">
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Alert Time:</strong> ${currentTime}</p>
          
          ${content ? `<p><strong>Message:</strong> ${content}</p>` : ""}
          
          ${locationSection}
        </div>
        
        <div class="warning">
          <p style="font-weight: bold;">This is an automated emergency alert from SafeSpace.</p>
          <p>Please contact the user immediately or notify appropriate emergency services if needed.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated message from SafeSpace. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for a text threat alert email
 */
export function generateTextThreatAlertEmail({
  userName,
  content,
  threatLevel,
}: {
  userName: string
  content?: string
  threatLevel: "low" | "medium" | "high"
}): string {
  // Map threat levels to colors
  const threatColors = {
    low: "#3182ce", // blue
    medium: "#dd6b20", // orange
    high: "#e53e3e", // red
  }

  const threatColor = threatColors[threatLevel]
  const currentTime = new Date().toLocaleString()

  return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: ${threatColor};
          margin: 0;
        }
        .header p {
          font-size: 18px;
          font-weight: bold;
        }
        .content {
          margin-bottom: 20px;
        }
        .threat-badge {
          display: inline-block;
          padding: 5px 10px;
          background-color: ${threatColor};
          color: white;
          border-radius: 3px;
          font-weight: bold;
        }
        .warning {
          margin-top: 30px;
          padding: 15px;
          background-color: #f8f8f8;
          border-left: 4px solid ${threatColor};
          border-radius: 3px;
        }
        .warning p {
          margin: 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TEXT THREAT ALERT</h1>
          <p>Potential threat detected in text</p>
        </div>
        
        <div class="content">
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Alert Time:</strong> ${currentTime}</p>
          <p><strong>Threat Level:</strong> <span class="threat-badge">${threatLevel.toUpperCase()}</span></p>
          
          ${content ? `<p><strong>Message Content:</strong> "${content}"</p>` : ""}
        </div>
        
        <div class="warning">
          <p style="font-weight: bold;">This is an automated threat detection alert from SafeSpace.</p>
          <p>Our AI has detected potentially concerning language in a text message. Please check on the user if appropriate.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated message from SafeSpace. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for an audio detection alert email
 */
export function generateAudioAlertEmail({
  userName,
  content,
  location,
}: {
  userName: string
  content?: string
  location?: LocationData
}): string {
  const currentTime = new Date().toLocaleString()

  // Generate location section if available
  const locationSection = location
    ? `<p><strong>Location:</strong> <a href="${formatLocationLink(location)}" style="color: #3182ce;">View on Google Maps</a></p>`
    : "<p><strong>Location:</strong> Not provided</p>"

  return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #dd6b20;
          margin: 0;
        }
        .header p {
          font-size: 18px;
          font-weight: bold;
        }
        .content {
          margin-bottom: 20px;
        }
        .warning {
          margin-top: 30px;
          padding: 15px;
          background-color: #feebc8;
          border-left: 4px solid #dd6b20;
          border-radius: 3px;
        }
        .warning p {
          margin: 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AUDIO DETECTION ALERT</h1>
          <p>Concerning sounds detected</p>
        </div>
        
        <div class="content">
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Alert Time:</strong> ${currentTime}</p>
          
          ${content ? `<p><strong>Details:</strong> ${content}</p>` : ""}
          
          ${locationSection}
        </div>
        
        <div class="warning">
          <p style="font-weight: bold;">This is an automated audio detection alert from SafeSpace.</p>
          <p>Our system has detected concerning sounds that may indicate distress. Please check on the user if appropriate.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated message from SafeSpace. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}
