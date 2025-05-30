import { NextResponse } from "next/server"

const services = ["api-gateway", "user-service", "payment-service", "notification-service", "auth-service"]
const logLevels = ["info", "warning", "error"] as const
const logMessages = [
  "Request processed successfully",
  "Database connection established",
  "Cache miss for key: user_session_",
  "Authentication token validated",
  "Payment processing initiated",
  "Email notification sent",
  "Rate limit exceeded for IP",
  "Database query timeout",
  "Invalid request parameters",
  "Service health check passed",
  "Memory usage threshold exceeded",
  "Connection pool exhausted",
  "SSL certificate expires in 30 days",
  "Backup process completed",
  "Configuration reloaded",
]

function generateLogEntry(id: string): any {
  const timestamp = new Date(Date.now() - Math.random() * 3600000) // Within last hour
  const level = logLevels[Math.floor(Math.random() * logLevels.length)]
  const service = services[Math.floor(Math.random() * services.length)]
  const message = logMessages[Math.floor(Math.random() * logMessages.length)]

  return {
    id,
    timestamp: timestamp.toLocaleTimeString(),
    level,
    service,
    message: message + (Math.random() > 0.7 ? ` (${Math.floor(Math.random() * 1000)}ms)` : ""),
  }
}

export async function GET() {
  // Generate 50 log entries
  const logs = Array.from({ length: 50 }, (_, i) => generateLogEntry(`log-${i}`))

  // Sort by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json(logs)
}
