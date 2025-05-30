import { NextResponse } from "next/server"

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

function generateServerMetrics() {
  return serverNames.map((name, index) => {
    const cpu = Math.floor(Math.random() * 100)
    const memory = Math.floor(Math.random() * 100)
    const disk = Math.floor(Math.random() * 100)
    const network = Math.floor(Math.random() * 1000)

    // Determine status based on metrics
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
      cpu,
      memory,
      disk,
      network,
    }
  })
}

export async function GET() {
  const servers = generateServerMetrics()
  return NextResponse.json(servers)
}
