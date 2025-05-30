import { NextResponse } from "next/server"

export async function GET() {
  // Generate analytics data
  const analytics = {
    overview: {
      totalRequests: 1250000 + Math.floor(Math.random() * 100000),
      uniqueUsers: 45000 + Math.floor(Math.random() * 5000),
      avgResponseTime: 150 + Math.random() * 50,
      errorRate: Math.random() * 3,
      uptime: 99.9 - Math.random() * 0.5,
    },
    traffic: {
      byCountry: [
        { country: "United States", requests: 450000, percentage: 36 },
        { country: "United Kingdom", requests: 200000, percentage: 16 },
        { country: "Germany", requests: 150000, percentage: 12 },
        { country: "France", requests: 125000, percentage: 10 },
        { country: "Canada", requests: 100000, percentage: 8 },
        { country: "Others", requests: 225000, percentage: 18 },
      ],
      byDevice: [
        { device: "Desktop", requests: 750000, percentage: 60 },
        { device: "Mobile", requests: 375000, percentage: 30 },
        { device: "Tablet", requests: 125000, percentage: 10 },
      ],
      byBrowser: [
        { browser: "Chrome", requests: 625000, percentage: 50 },
        { browser: "Safari", requests: 250000, percentage: 20 },
        { browser: "Firefox", requests: 187500, percentage: 15 },
        { browser: "Edge", requests: 125000, percentage: 10 },
        { browser: "Others", requests: 62500, percentage: 5 },
      ],
    },
    performance: {
      endpoints: [
        {
          path: "/api/users",
          requests: 125000,
          avgResponseTime: 120,
          errorRate: 0.5,
          p95ResponseTime: 250,
        },
        {
          path: "/api/orders",
          requests: 87500,
          avgResponseTime: 180,
          errorRate: 1.2,
          p95ResponseTime: 350,
        },
        {
          path: "/api/products",
          requests: 200000,
          avgResponseTime: 95,
          errorRate: 0.3,
          p95ResponseTime: 180,
        },
        {
          path: "/api/auth",
          requests: 62500,
          avgResponseTime: 75,
          errorRate: 2.1,
          p95ResponseTime: 150,
        },
      ],
      slowestQueries: [
        {
          query: "SELECT * FROM orders JOIN users ON orders.user_id = users.id WHERE orders.created_at > ?",
          avgDuration: 2500,
          executions: 1250,
          database: "app_production",
        },
        {
          query: "UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?",
          avgDuration: 1800,
          executions: 3500,
          database: "app_production",
        },
      ],
    },
    errors: {
      byStatusCode: [
        { code: 500, count: 1250, percentage: 45 },
        { code: 404, count: 875, percentage: 31.5 },
        { code: 403, count: 437, percentage: 15.7 },
        { code: 502, count: 218, percentage: 7.8 },
      ],
      topErrors: [
        {
          message: "Database connection timeout",
          count: 456,
          lastOccurred: new Date(Date.now() - 300000).toISOString(),
          service: "user-service",
        },
        {
          message: "Invalid authentication token",
          count: 234,
          lastOccurred: new Date(Date.now() - 600000).toISOString(),
          service: "auth-service",
        },
        {
          message: "Rate limit exceeded",
          count: 189,
          lastOccurred: new Date(Date.now() - 900000).toISOString(),
          service: "api-gateway",
        },
      ],
    },
    security: {
      threats: {
        blocked: 1250,
        suspicious: 345,
        malicious: 89,
      },
      attacks: [
        {
          type: "SQL Injection",
          count: 45,
          blocked: 45,
          lastAttempt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          type: "XSS",
          count: 23,
          blocked: 23,
          lastAttempt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          type: "DDoS",
          count: 12,
          blocked: 12,
          lastAttempt: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    },
  }

  return NextResponse.json(analytics)
}
