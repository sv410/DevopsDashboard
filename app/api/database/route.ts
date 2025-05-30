import { NextResponse } from "next/server"

export async function GET() {
  // Simulate database metrics
  const databaseMetrics = {
    primary: {
      id: "db-primary",
      name: "PostgreSQL Primary",
      status: "healthy",
      version: "15.3",
      uptime: "45 days, 12 hours",
      metrics: {
        connections: {
          active: 45 + Math.floor(Math.random() * 20),
          idle: 15 + Math.floor(Math.random() * 10),
          max: 100,
          usage: 0,
        },
        performance: {
          queryTime: {
            avg: 50 + Math.random() * 100,
            p95: 150 + Math.random() * 200,
            p99: 300 + Math.random() * 300,
          },
          throughput: {
            reads: 1000 + Math.random() * 500,
            writes: 200 + Math.random() * 100,
            transactions: 800 + Math.random() * 300,
          },
        },
        storage: {
          size: "2.4TB",
          used: "1.8TB",
          available: "600GB",
          usage: 75,
        },
        replication: {
          lag: "0.5ms",
          status: "healthy",
          replicas: 2,
        },
      },
      slowQueries: [
        {
          id: "sq-1",
          query: "SELECT * FROM users WHERE created_at > ?",
          duration: 2500,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          database: "app_production",
        },
        {
          id: "sq-2",
          query: "UPDATE orders SET status = ? WHERE id IN (?)",
          duration: 1800,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          database: "app_production",
        },
      ],
    },
    replicas: [
      {
        id: "db-replica-01",
        name: "PostgreSQL Replica 1",
        status: "healthy",
        lag: "0.3ms",
        connections: 25 + Math.floor(Math.random() * 15),
        queryTime: 45 + Math.random() * 80,
      },
      {
        id: "db-replica-02",
        name: "PostgreSQL Replica 2",
        status: "healthy",
        lag: "0.7ms",
        connections: 30 + Math.floor(Math.random() * 20),
        queryTime: 55 + Math.random() * 90,
      },
    ],
    cache: {
      redis: {
        id: "redis-cluster",
        name: "Redis Cluster",
        status: "healthy",
        version: "7.0.11",
        nodes: 3,
        metrics: {
          hitRate: 85 + Math.random() * 10,
          memory: {
            used: "2.1GB",
            max: "4GB",
            usage: 52.5,
          },
          operations: {
            gets: 5000 + Math.random() * 2000,
            sets: 1000 + Math.random() * 500,
            deletes: 100 + Math.random() * 50,
          },
          connections: 150 + Math.floor(Math.random() * 50),
        },
      },
    },
  }

  // Calculate connection usage
  databaseMetrics.primary.metrics.connections.usage = Math.round(
    ((databaseMetrics.primary.metrics.connections.active + databaseMetrics.primary.metrics.connections.idle) /
      databaseMetrics.primary.metrics.connections.max) *
      100,
  )

  return NextResponse.json(databaseMetrics)
}
