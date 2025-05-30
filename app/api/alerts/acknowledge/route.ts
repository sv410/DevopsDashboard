import { type NextRequest, NextResponse } from "next/server"

interface AcknowledgeRequest {
  alertIds: string[]
  acknowledgedBy: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AcknowledgeRequest = await request.json()
    const { alertIds, acknowledgedBy, notes } = body

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json({ error: "Alert IDs are required" }, { status: 400 })
    }

    if (!acknowledgedBy) {
      return NextResponse.json({ error: "Acknowledged by field is required" }, { status: 400 })
    }

    // Simulate acknowledgment processing
    const acknowledgedAlerts = alertIds.map((alertId) => ({
      id: alertId,
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy,
      notes: notes || null,
      status: "acknowledged",
    }))

    // In a real application, you would update the database here
    // await updateAlertsInDatabase(acknowledgedAlerts)

    return NextResponse.json({
      success: true,
      message: `Successfully acknowledged ${alertIds.length} alert(s)`,
      acknowledgedAlerts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error acknowledging alerts:", error)
    return NextResponse.json({ error: "Failed to acknowledge alerts" }, { status: 500 })
  }
}

export async function GET() {
  // Get acknowledgment history
  const acknowledgmentHistory = [
    {
      id: "ack-1",
      alertId: "alert-1",
      acknowledgedBy: "admin@company.com",
      acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
      notes: "Investigating high CPU usage",
      resolved: true,
      resolvedAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "ack-2",
      alertId: "alert-2",
      acknowledgedBy: "devops@company.com",
      acknowledgedAt: new Date(Date.now() - 7200000).toISOString(),
      notes: "Database maintenance scheduled",
      resolved: false,
      resolvedAt: null,
    },
  ]

  return NextResponse.json({
    acknowledgments: acknowledgmentHistory,
    total: acknowledgmentHistory.length,
    pending: acknowledgmentHistory.filter((ack) => !ack.resolved).length,
    resolved: acknowledgmentHistory.filter((ack) => ack.resolved).length,
  })
}
