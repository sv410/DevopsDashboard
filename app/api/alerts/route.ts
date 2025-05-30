import { NextResponse } from "next/server"

const alertTemplates = [
  {
    title: "High CPU Usage",
    description: "CPU usage exceeded 90% threshold",
    service: "web-server-01",
    severity: "critical" as const,
  },
  {
    title: "Database Connection Pool Full",
    description: "All database connections are in use",
    service: "postgres-primary",
    severity: "warning" as const,
  },
  {
    title: "Disk Space Low",
    description: "Available disk space below 10%",
    service: "storage-node-03",
    severity: "warning" as const,
  },
  {
    title: "API Response Time High",
    description: "Average response time exceeded 2 seconds",
    service: "api-gateway",
    severity: "critical" as const,
  },
  {
    title: "Memory Usage High",
    description: "Memory usage exceeded 85% threshold",
    service: "app-server-02",
    severity: "warning" as const,
  },
  {
    title: "Service Health Check Failed",
    description: "Health check endpoint returning 500 errors",
    service: "user-service",
    severity: "critical" as const,
  },
  {
    title: "Cache Hit Rate Low",
    description: "Redis cache hit rate below 80%",
    service: "redis-cluster",
    severity: "info" as const,
  },
]

export async function GET() {
  // Generate random alerts
  const numAlerts = Math.floor(Math.random() * 5) + 3 // 3-7 alerts
  const alerts = []

  for (let i = 0; i < numAlerts; i++) {
    const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)]
    const timestamp = new Date(Date.now() - Math.random() * 3600000) // Within last hour

    alerts.push({
      id: `alert-${i}`,
      ...template,
      timestamp: timestamp.toLocaleString(),
    })
  }

  // Sort by severity (critical first)
  alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  return NextResponse.json(alerts)
}
