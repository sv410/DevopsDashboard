import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  // Get notification settings and history
  const notifications = {
    settings: {
      email: {
        enabled: true,
        recipients: ["admin@company.com", "devops@company.com"],
        alertLevels: ["critical", "warning"],
      },
      slack: {
        enabled: true,
        webhook: "https://hooks.slack.com/services/...",
        channel: "#alerts",
        alertLevels: ["critical"],
      },
      sms: {
        enabled: false,
        numbers: ["+1234567890"],
        alertLevels: ["critical"],
      },
      webhook: {
        enabled: true,
        url: "https://api.company.com/webhooks/alerts",
        alertLevels: ["critical", "warning"],
      },
    },
    history: [
      {
        id: "notif-1",
        type: "email",
        alertId: "alert-1",
        recipient: "admin@company.com",
        subject: "Critical Alert: High CPU Usage",
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        status: "delivered",
      },
      {
        id: "notif-2",
        type: "slack",
        alertId: "alert-1",
        channel: "#alerts",
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        status: "delivered",
      },
      {
        id: "notif-3",
        type: "webhook",
        alertId: "alert-2",
        url: "https://api.company.com/webhooks/alerts",
        sentAt: new Date(Date.now() - 7200000).toISOString(),
        status: "failed",
        error: "Connection timeout",
      },
    ],
    stats: {
      total: 156,
      delivered: 142,
      failed: 14,
      pending: 0,
    },
  }

  return NextResponse.json(notifications)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, alertId, recipients, message } = body

    // Simulate sending notification
    const notification = {
      id: `notif-${Date.now()}`,
      type,
      alertId,
      recipients,
      message,
      sentAt: new Date().toISOString(),
      status: Math.random() > 0.1 ? "delivered" : "failed",
    }

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification sent successfully",
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
