import { NextResponse } from "next/server"

export async function GET() {
  // Simulate system health metrics
  const health = {
    overall: Math.random() > 0.1 ? "healthy" : Math.random() > 0.5 ? "warning" : "critical",
    uptime: 99.9 - Math.random() * 0.5, // 99.4% - 99.9%
    activeServices: 24 + Math.floor(Math.random() * 2), // 24-25
    totalServices: 25,
    responseTime: {
      avg: 150 + Math.random() * 100,
      p95: 300 + Math.random() * 200,
      p99: 500 + Math.random() * 300,
    },
    errorRate: Math.random() * 5, // 0-5%
    throughput: 1000 + Math.random() * 500, // 1000-1500 req/s
    database: {
      connections: 45 + Math.floor(Math.random() * 10),
      maxConnections: 100,
      queryTime: 50 + Math.random() * 100,
      size: "2.4TB",
    },
  }

  return NextResponse.json(health)
}
