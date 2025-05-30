"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Server, TrendingUp, Download } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface MetricData {
  timestamp: string
  value: number
  label?: string
}

interface Alert {
  id: string
  title: string
  severity: "critical" | "warning" | "info"
  timestamp: string
  service: string
  description: string
}

interface ServerMetrics {
  id: string
  name: string
  status: "healthy" | "warning" | "critical"
  cpu: number
  memory: number
  disk: number
  network: number
}

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error"
  service: string
  message: string
}

function ExportDialog({ timeRange, environment }: { timeRange: string; environment: string }) {
  const [exportType, setExportType] = useState("metrics")
  const [exportFormat, setExportFormat] = useState("json")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        type: exportType,
        timeRange,
        environment,
        format: exportFormat,
      }

      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Export failed")
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `export-${Date.now()}.${exportFormat}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Data Type</Label>
        <RadioGroup value={exportType} onValueChange={setExportType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="metrics" id="metrics" />
            <Label htmlFor="metrics">Performance Metrics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="alerts" id="alerts" />
            <Label htmlFor="alerts">Active Alerts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="logs" id="logs" />
            <Label htmlFor="logs">System Logs</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="servers" id="servers" />
            <Label htmlFor="servers">Server Metrics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="health" id="health" />
            <Label htmlFor="health">Health Report</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Format</Label>
        <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json">JSON</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv">CSV</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={handleExport} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700">
          {isExporting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function DevOpsMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState("1h")
  const [environment, setEnvironment] = useState("production")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // State for various metrics
  const [responseTimeData, setResponseTimeData] = useState<MetricData[]>([])
  const [errorRateData, setErrorRateData] = useState<MetricData[]>([])
  const [throughputData, setThroughputData] = useState<MetricData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [servers, setServers] = useState<ServerMetrics[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [systemHealth, setSystemHealth] = useState({
    overall: "healthy" as "healthy" | "warning" | "critical",
    uptime: 99.9,
    activeServices: 24,
    totalServices: 25,
  })

  // Fetch data from API
  const fetchData = async () => {
    try {
      const [metricsRes, alertsRes, serversRes, logsRes, healthRes] = await Promise.all([
        fetch(`/api/metrics?timeRange=${timeRange}&environment=${environment}`),
        fetch("/api/alerts"),
        fetch("/api/servers"),
        fetch("/api/logs"),
        fetch("/api/health"),
      ])

      const metrics = await metricsRes.json()
      const alertsData = await alertsRes.json()
      const serversData = await serversRes.json()
      const logsData = await logsRes.json()
      const healthData = await healthRes.json()

      setResponseTimeData(metrics.responseTime)
      setErrorRateData(metrics.errorRate)
      setThroughputData(metrics.throughput)
      setAlerts(alertsData)
      setServers(serversData)
      setLogs(logsData)
      setSystemHealth(healthData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, environment, autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">DevOps Monitoring Dashboard</h1>
          <p className="text-gray-400">Real-time application and infrastructure monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="1h">Last 1h</SelectItem>
              <SelectItem value="6h">Last 6h</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
            </SelectContent>
          </Select>

          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-36 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>Choose what data to export and in which format</DialogDescription>
              </DialogHeader>
              <ExportDialog timeRange={timeRange} environment={environment} />
            </DialogContent>
          </Dialog>

          <div className="text-sm text-gray-400">Last updated: {lastUpdate.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getStatusIcon(systemHealth.overall)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-gray-400">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.uptime}%</div>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.activeServices}/{systemHealth.totalServices}
            </div>
            <p className="text-xs text-gray-400">Services running</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter((a) => a.severity === "critical").length}</div>
            <p className="text-xs text-gray-400">Critical alerts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
                <CardDescription>Average response time over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                      labelStyle={{ color: "#F3F4F6" }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Error Rate</CardTitle>
                <CardDescription>Error percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={errorRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                      labelStyle={{ color: "#F3F4F6" }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Throughput</CardTitle>
                <CardDescription>Requests per second</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                      labelStyle={{ color: "#F3F4F6" }}
                    />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          {/* Server Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servers.map((server) => (
              <Card key={server.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{server.name}</CardTitle>
                  {getStatusIcon(server.status)}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU</span>
                      <span>{server.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${server.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory</span>
                      <span>{server.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${server.memory}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disk</span>
                      <span>{server.disk}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${server.disk}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Active Alerts</CardTitle>
              <CardDescription>Current system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "warning"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-gray-400">{alert.description}</p>
                        <p className="text-xs text-gray-500">
                          {alert.service} • {alert.timestamp}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Live Logs</CardTitle>
              <CardDescription>Real-time application logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 mb-2">
                    <span className="text-gray-500 text-xs">{log.timestamp}</span>
                    <Badge
                      variant={
                        log.level === "error" ? "destructive" : log.level === "warning" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-blue-400">[{log.service}]</span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
