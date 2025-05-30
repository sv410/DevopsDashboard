import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, timeRange, environment, format = "json" } = body

    let data: any = {}
    let filename = ""

    switch (type) {
      case "metrics":
        data = await generateMetricsExport(timeRange, environment)
        filename = `metrics-${environment}-${timeRange}-${Date.now()}.${format}`
        break
      case "alerts":
        data = await generateAlertsExport()
        filename = `alerts-${Date.now()}.${format}`
        break
      case "logs":
        data = await generateLogsExport(timeRange)
        filename = `logs-${timeRange}-${Date.now()}.${format}`
        break
      case "servers":
        data = await generateServersExport()
        filename = `servers-${Date.now()}.${format}`
        break
      case "health":
        data = await generateHealthExport()
        filename = `health-report-${Date.now()}.${format}`
        break
      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // Format data based on requested format
    let exportData: string
    let contentType: string

    if (format === "csv") {
      exportData = convertToCSV(data, type)
      contentType = "text/csv"
    } else {
      exportData = JSON.stringify(data, null, 2)
      contentType = "application/json"
    }

    // Create response with proper headers
    const response = new NextResponse(exportData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": exportData.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    return response
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Export failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

async function generateMetricsExport(timeRange: string, environment: string) {
  const dataPoints =
    {
      "1h": 60,
      "6h": 72,
      "24h": 96,
      "7d": 168,
    }[timeRange] || 60

  const envMultiplier =
    {
      production: 1,
      staging: 0.7,
      development: 0.3,
    }[environment] || 1

  return {
    metadata: {
      exportType: "metrics",
      timeRange,
      environment,
      exportedAt: new Date().toISOString(),
      dataPoints,
    },
    metrics: {
      responseTime: generateTimeSeriesData(dataPoints, 150 * envMultiplier, 50),
      errorRate: generateTimeSeriesData(dataPoints, 2 * envMultiplier, 1),
      throughput: generateTimeSeriesData(dataPoints, 1000 * envMultiplier, 200),
      cpuUsage: generateTimeSeriesData(dataPoints, 65 * envMultiplier, 20),
      memoryUsage: generateTimeSeriesData(dataPoints, 70 * envMultiplier, 15),
      diskUsage: generateTimeSeriesData(dataPoints, 45 * envMultiplier, 10),
    },
    summary: {
      avgResponseTime: 150 * envMultiplier,
      avgErrorRate: 2 * envMultiplier,
      avgThroughput: 1000 * envMultiplier,
      peakCpuUsage: 85 * envMultiplier,
      peakMemoryUsage: 85 * envMultiplier,
    },
  }
}

async function generateAlertsExport() {
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
  ]

  const alerts = alertTemplates.map((template, index) => ({
    id: `alert-${index}`,
    ...template,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    acknowledged: Math.random() > 0.5,
    acknowledgedBy: Math.random() > 0.5 ? "admin@company.com" : null,
    resolvedAt: Math.random() > 0.7 ? new Date().toISOString() : null,
  }))

  return {
    metadata: {
      exportType: "alerts",
      exportedAt: new Date().toISOString(),
      totalAlerts: alerts.length,
    },
    alerts,
    summary: {
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
      acknowledged: alerts.filter((a) => a.acknowledged).length,
      resolved: alerts.filter((a) => a.resolvedAt).length,
    },
  }
}

async function generateLogsExport(timeRange: string) {
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
  ]

  const numLogs =
    {
      "1h": 100,
      "6h": 500,
      "24h": 1000,
      "7d": 5000,
    }[timeRange] || 100

  const logs = Array.from({ length: numLogs }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.random() * 3600000)
    const level = logLevels[Math.floor(Math.random() * logLevels.length)]
    const service = services[Math.floor(Math.random() * services.length)]
    const message = logMessages[Math.floor(Math.random() * logMessages.length)]

    return {
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      level,
      service,
      message,
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
      userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : null,
      duration: level === "info" ? Math.floor(Math.random() * 1000) : null,
    }
  })

  return {
    metadata: {
      exportType: "logs",
      timeRange,
      exportedAt: new Date().toISOString(),
      totalLogs: logs.length,
    },
    logs,
    summary: {
      info: logs.filter((l) => l.level === "info").length,
      warning: logs.filter((l) => l.level === "warning").length,
      error: logs.filter((l) => l.level === "error").length,
      services: [...new Set(logs.map((l) => l.service))],
    },
  }
}

async function generateServersExport() {
  const serverNames = [
    "web-server-01",
    "web-server-02",
    "api-gateway-01",
    "api-gateway-02",
    "db-primary",
    "db-replica-01",
    "cache-redis-01",
    "worker-node-01",
    "worker-node-02",
    "load-balancer",
  ]

  const servers = serverNames.map((name, index) => {
    const cpu = Math.floor(Math.random() * 100)
    const memory = Math.floor(Math.random() * 100)
    const disk = Math.floor(Math.random() * 100)
    const network = Math.floor(Math.random() * 1000)

    let status: "healthy" | "warning" | "critical" = "healthy"
    if (cpu > 90 || memory > 90 || disk > 90) {
      status = "critical"
    } else if (cpu > 75 || memory > 75 || disk > 75) {
      status = "warning"
    }

    return {
      id: `server-${index}`,
      name,
      status,
      metrics: {
        cpu,
        memory,
        disk,
        network,
      },
      details: {
        uptime: Math.floor(Math.random() * 365) + " days",
        os: "Ubuntu 22.04 LTS",
        kernel: "5.15.0-72-generic",
        architecture: "x86_64",
        cores: Math.floor(Math.random() * 16) + 4,
        totalMemory: `${Math.floor(Math.random() * 64) + 16}GB`,
        totalDisk: `${Math.floor(Math.random() * 1000) + 100}GB`,
      },
      lastUpdated: new Date().toISOString(),
    }
  })

  return {
    metadata: {
      exportType: "servers",
      exportedAt: new Date().toISOString(),
      totalServers: servers.length,
    },
    servers,
    summary: {
      healthy: servers.filter((s) => s.status === "healthy").length,
      warning: servers.filter((s) => s.status === "warning").length,
      critical: servers.filter((s) => s.status === "critical").length,
      avgCpuUsage: servers.reduce((acc, s) => acc + s.metrics.cpu, 0) / servers.length,
      avgMemoryUsage: servers.reduce((acc, s) => acc + s.metrics.memory, 0) / servers.length,
      avgDiskUsage: servers.reduce((acc, s) => acc + s.metrics.disk, 0) / servers.length,
    },
  }
}

async function generateHealthExport() {
  return {
    metadata: {
      exportType: "health",
      exportedAt: new Date().toISOString(),
    },
    systemHealth: {
      overall: "healthy",
      uptime: 99.9,
      activeServices: 24,
      totalServices: 25,
      lastIncident: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    },
    performance: {
      responseTime: {
        avg: 150,
        p95: 300,
        p99: 500,
      },
      errorRate: 1.2,
      throughput: 1250,
    },
    infrastructure: {
      totalServers: 10,
      healthyServers: 9,
      warningServers: 1,
      criticalServers: 0,
    },
    database: {
      connections: 45,
      maxConnections: 100,
      queryTime: 75,
      size: "2.4TB",
      replicationLag: "0.5ms",
    },
    alerts: {
      total: 12,
      critical: 2,
      warning: 7,
      info: 3,
      acknowledged: 8,
    },
  }
}

function generateTimeSeriesData(points: number, baseValue: number, variance: number) {
  const data = []
  const now = new Date()

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000)
    const value = baseValue + (Math.random() - 0.5) * variance
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, Math.round(value * 100) / 100),
    })
  }

  return data
}

function convertToCSV(data: any, type: string): string {
  switch (type) {
    case "metrics":
      return convertMetricsToCSV(data)
    case "alerts":
      return convertAlertsToCSV(data)
    case "logs":
      return convertLogsToCSV(data)
    case "servers":
      return convertServersToCSV(data)
    case "health":
      return convertHealthToCSV(data)
    default:
      return JSON.stringify(data)
  }
}

function convertMetricsToCSV(data: any): string {
  const headers = ["timestamp", "responseTime", "errorRate", "throughput", "cpuUsage", "memoryUsage", "diskUsage"]
  const rows = [headers.join(",")]

  const maxLength = Math.max(
    data.metrics.responseTime?.length || 0,
    data.metrics.errorRate?.length || 0,
    data.metrics.throughput?.length || 0,
    data.metrics.cpuUsage?.length || 0,
    data.metrics.memoryUsage?.length || 0,
    data.metrics.diskUsage?.length || 0,
  )

  for (let i = 0; i < maxLength; i++) {
    const row = [
      data.metrics.responseTime?.[i]?.timestamp || "",
      data.metrics.responseTime?.[i]?.value || "",
      data.metrics.errorRate?.[i]?.value || "",
      data.metrics.throughput?.[i]?.value || "",
      data.metrics.cpuUsage?.[i]?.value || "",
      data.metrics.memoryUsage?.[i]?.value || "",
      data.metrics.diskUsage?.[i]?.value || "",
    ]
    rows.push(row.join(","))
  }

  return rows.join("\n")
}

function convertAlertsToCSV(data: any): string {
  const headers = ["id", "title", "severity", "service", "description", "timestamp", "acknowledged", "resolvedAt"]
  const rows = [headers.join(",")]

  data.alerts.forEach((alert: any) => {
    const row = [
      alert.id,
      `"${alert.title}"`,
      alert.severity,
      alert.service,
      `"${alert.description}"`,
      alert.timestamp,
      alert.acknowledged,
      alert.resolvedAt || "",
    ]
    rows.push(row.join(","))
  })

  return rows.join("\n")
}

function convertLogsToCSV(data: any): string {
  const headers = ["id", "timestamp", "level", "service", "message", "requestId", "userId", "duration"]
  const rows = [headers.join(",")]

  data.logs.forEach((log: any) => {
    const row = [
      log.id,
      log.timestamp,
      log.level,
      log.service,
      `"${log.message}"`,
      log.requestId,
      log.userId || "",
      log.duration || "",
    ]
    rows.push(row.join(","))
  })

  return rows.join("\n")
}

function convertServersToCSV(data: any): string {
  const headers = ["id", "name", "status", "cpu", "memory", "disk", "network", "uptime", "os", "cores", "totalMemory"]
  const rows = [headers.join(",")]

  data.servers.forEach((server: any) => {
    const row = [
      server.id,
      server.name,
      server.status,
      server.metrics.cpu,
      server.metrics.memory,
      server.metrics.disk,
      server.metrics.network,
      `"${server.details.uptime}"`,
      `"${server.details.os}"`,
      server.details.cores,
      server.details.totalMemory,
    ]
    rows.push(row.join(","))
  })

  return rows.join("\n")
}

function convertHealthToCSV(data: any): string {
  const headers = ["metric", "value", "category"]
  const rows = [headers.join(",")]

  // System Health
  rows.push(["overall_status", data.systemHealth.overall, "system"])
  rows.push(["uptime_percentage", data.systemHealth.uptime, "system"])
  rows.push(["active_services", data.systemHealth.activeServices, "system"])
  rows.push(["total_services", data.systemHealth.totalServices, "system"])

  // Performance
  rows.push(["avg_response_time", data.performance.responseTime.avg, "performance"])
  rows.push(["p95_response_time", data.performance.responseTime.p95, "performance"])
  rows.push(["p99_response_time", data.performance.responseTime.p99, "performance"])
  rows.push(["error_rate", data.performance.errorRate, "performance"])
  rows.push(["throughput", data.performance.throughput, "performance"])

  // Infrastructure
  rows.push(["total_servers", data.infrastructure.totalServers, "infrastructure"])
  rows.push(["healthy_servers", data.infrastructure.healthyServers, "infrastructure"])
  rows.push(["warning_servers", data.infrastructure.warningServers, "infrastructure"])
  rows.push(["critical_servers", data.infrastructure.criticalServers, "infrastructure"])

  return rows.join("\n")
}
