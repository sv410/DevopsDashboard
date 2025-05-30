import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
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

      let logId = 0

      const generateLogEntry = () => {
        const timestamp = new Date().toISOString()
        const level = logLevels[Math.floor(Math.random() * logLevels.length)]
        const service = services[Math.floor(Math.random() * services.length)]
        const message = logMessages[Math.floor(Math.random() * logMessages.length)]

        return {
          id: `log-${logId++}`,
          timestamp,
          level,
          service,
          message: message + (Math.random() > 0.7 ? ` (${Math.floor(Math.random() * 1000)}ms)` : ""),
          requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
          userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : null,
        }
      }

      // Send initial batch of logs
      for (let i = 0; i < 10; i++) {
        const logEntry = generateLogEntry()
        const data = `data: ${JSON.stringify(logEntry)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      // Continue streaming logs every 2-5 seconds
      const interval = setInterval(
        () => {
          try {
            const logEntry = generateLogEntry()
            const data = `data: ${JSON.stringify(logEntry)}\n\n`
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error("Error generating log entry:", error)
            clearInterval(interval)
            controller.close()
          }
        },
        Math.random() * 3000 + 2000,
      ) // 2-5 seconds

      // Clean up after 5 minutes
      setTimeout(() => {
        clearInterval(interval)
        controller.close()
      }, 300000)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
