import { type NextRequest, NextResponse } from "next/server"

// Generate realistic time-series data
function generateTimeSeriesData(points: number, baseValue: number, variance: number) {
  const data = []
  const now = new Date()

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000) // 1 minute intervals
    const value = baseValue + (Math.random() - 0.5) * variance
    data.push({
      timestamp: timestamp.toLocaleTimeString(),
      value: Math.max(0, Math.round(value * 100) / 100),
    })
  }

  return data
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const timeRange = searchParams.get("timeRange") || "1h"
  const environment = searchParams.get("environment") || "production"

  // Determine number of data points based on time range
  const dataPoints =
    {
      "1h": 60,
      "6h": 72,
      "24h": 96,
      "7d": 168,
    }[timeRange] || 60

  // Generate different metrics based on environment
  const envMultiplier =
    {
      production: 1,
      staging: 0.7,
      development: 0.3,
    }[environment] || 1

  const metrics = {
    responseTime: generateTimeSeriesData(dataPoints, 150 * envMultiplier, 50),
    errorRate: generateTimeSeriesData(dataPoints, 2 * envMultiplier, 1),
    throughput: generateTimeSeriesData(dataPoints, 1000 * envMultiplier, 200),
    cpuUsage: generateTimeSeriesData(dataPoints, 65 * envMultiplier, 20),
    memoryUsage: generateTimeSeriesData(dataPoints, 70 * envMultiplier, 15),
    diskUsage: generateTimeSeriesData(dataPoints, 45 * envMultiplier, 10),
  }

  return NextResponse.json(metrics)
}
