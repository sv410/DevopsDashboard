import { NextResponse } from "next/server"

export async function GET() {
  // Simulate infrastructure metrics
  const infrastructure = {
    kubernetes: {
      cluster: {
        name: "production-cluster",
        version: "1.28.2",
        nodes: 12,
        status: "healthy",
        uptime: "99.9%",
      },
      namespaces: [
        {
          name: "default",
          pods: 24,
          services: 8,
          deployments: 6,
          status: "healthy",
        },
        {
          name: "monitoring",
          pods: 12,
          services: 4,
          deployments: 3,
          status: "healthy",
        },
        {
          name: "ingress-nginx",
          pods: 3,
          services: 2,
          deployments: 1,
          status: "healthy",
        },
      ],
      pods: generatePodMetrics(),
      services: generateServiceMetrics(),
    },
    loadBalancers: [
      {
        id: "lb-01",
        name: "Main Load Balancer",
        status: "healthy",
        type: "Application Load Balancer",
        targets: {
          healthy: 8,
          unhealthy: 0,
          total: 8,
        },
        metrics: {
          requests: 15000 + Math.random() * 5000,
          latency: 50 + Math.random() * 30,
          errorRate: Math.random() * 2,
        },
      },
    ],
    cdn: {
      provider: "CloudFlare",
      status: "healthy",
      metrics: {
        requests: 50000 + Math.random() * 20000,
        bandwidth: "2.5 TB",
        cacheHitRate: 85 + Math.random() * 10,
        edgeLocations: 200,
      },
    },
    networking: {
      vpc: {
        id: "vpc-12345",
        cidr: "10.0.0.0/16",
        subnets: 6,
        routeTables: 3,
        internetGateways: 1,
        natGateways: 2,
      },
      security: {
        securityGroups: 15,
        nacls: 3,
        wafRules: 25,
        ddosProtection: true,
      },
    },
  }

  return NextResponse.json(infrastructure)
}

function generatePodMetrics() {
  const podNames = [
    "api-gateway",
    "user-service",
    "payment-service",
    "notification-service",
    "auth-service",
    "frontend-app",
    "worker-queue",
    "scheduler",
  ]

  return podNames.map((name, index) => {
    const replicas = Math.floor(Math.random() * 3) + 2 // 2-4 replicas
    const readyReplicas = Math.floor(Math.random() * replicas) + Math.floor(replicas * 0.8)

    return {
      id: `pod-${index}`,
      name: `${name}-deployment`,
      namespace: "default",
      status: readyReplicas === replicas ? "Running" : "Pending",
      replicas: {
        desired: replicas,
        ready: readyReplicas,
        available: readyReplicas,
      },
      resources: {
        cpu: {
          request: "100m",
          limit: "500m",
          usage: Math.floor(Math.random() * 400) + 50,
        },
        memory: {
          request: "128Mi",
          limit: "512Mi",
          usage: Math.floor(Math.random() * 400) + 100,
        },
      },
      restarts: Math.floor(Math.random() * 5),
      age: `${Math.floor(Math.random() * 30) + 1}d`,
    }
  })
}

function generateServiceMetrics() {
  const serviceNames = ["api-gateway-svc", "user-service-svc", "payment-service-svc", "auth-service-svc"]

  return serviceNames.map((name, index) => ({
    id: `svc-${index}`,
    name,
    namespace: "default",
    type: "ClusterIP",
    clusterIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    ports: [
      {
        name: "http",
        port: 80,
        targetPort: 8080,
        protocol: "TCP",
      },
    ],
    endpoints: Math.floor(Math.random() * 4) + 2,
    status: "Active",
  }))
}
