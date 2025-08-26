'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Cpu,
  Download,
  Activity,
  Zap,
  Database,
  Globe
} from 'lucide-react'

interface TokenUsageByModel {
  model: string
  totalTokens: string
  calls: number
  avgTokensPerCall: number
  cost: string
}

interface APIEndpoint {
  endpoint: string
  calls: number
  avgResponseTime: string
  successRate: string
}

interface MCPServerUsage {
  server: string
  calls: number
  successRate: string
  avgResponseTime: string
}

interface UsageSummary {
  totalRequests: number
  totalTokens: number
  mcpCalls: number
  memoryOperations: number
  uptime: string
  errorRate: string
}

interface UsageAnalytics {
  summary: UsageSummary
  topEndpoints: APIEndpoint[]
  mcpServerUsage: MCPServerUsage[]
  tokenUsageByModel: TokenUsageByModel[]
  recentActivity: any[]
}

interface UsageAnalyticsPanelProps {
  websocket: WebSocket | null
}

export function UsageAnalyticsPanel({ websocket }: UsageAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'usage_analytics') {
          setAnalytics(data.analytics)
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    // Fallback polling if WebSocket unavailable
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [websocket, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/analytics/usage?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching usage analytics:', error)
    }
  }

  const exportData = async (format: string) => {
    setIsExporting(true)
    try {
      const response = await fetch(`http://localhost:3001/analytics/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orchestrai-analytics-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
    setIsExporting(false)
  }

  if (!analytics) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usage Analytics</h2>
          <p className="text-muted-foreground">System performance and usage metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('json')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              API endpoints + MCP calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Current session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.errorRate}</div>
            <Progress value={parseFloat(analytics.summary.errorRate)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive usage metrics and performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="endpoints" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
              <TabsTrigger value="tokens">Token Usage</TabsTrigger>
              <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
              <TabsTrigger value="memory">Memory Operations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="endpoints" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Top API Endpoints</h4>
                {analytics.topEndpoints.length > 0 ? analytics.topEndpoints.map((endpoint, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{endpoint.endpoint}</h5>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{endpoint.calls} calls</span>
                          <span>Avg: {endpoint.avgResponseTime}</span>
                          <Badge variant="outline" className="text-xs">
                            {endpoint.successRate} success
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <p className="text-sm text-muted-foreground">No API endpoint data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Token Usage by Model</h4>
                {analytics.tokenUsageByModel.length > 0 ? analytics.tokenUsageByModel.map((model, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium capitalize">{model.model}</h5>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{model.totalTokens} tokens</span>
                          <span>{model.calls} calls</span>
                          <span>Avg: {model.avgTokensPerCall} tokens/call</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{model.cost}</div>
                        <div className="text-xs text-muted-foreground">Cost</div>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <p className="text-sm text-muted-foreground">No token usage data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mcp" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">MCP Server Usage</h4>
                {analytics.mcpServerUsage.length > 0 ? analytics.mcpServerUsage.map((server, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium capitalize">{server.server}</h5>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{server.calls} calls</span>
                          <span>Avg: {server.avgResponseTime}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {server.successRate} success
                      </Badge>
                    </div>
                  </Card>
                )) : (
                  <p className="text-sm text-muted-foreground">No MCP server data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Crystalline Memory Operations</h4>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{analytics.summary.memoryOperations}</div>
                      <p className="text-sm text-muted-foreground">Total Operations</p>
                    </div>
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-muted-foreground mr-3" />
                      <div>
                        <p className="text-sm font-medium">Hexagonal Lattice</p>
                        <p className="text-xs text-muted-foreground">Active memory structure</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest system events and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentActivity.length > 0 ? analytics.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                  <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="text-muted-foreground">
                  Session: {activity.sessionId?.slice(-8) || 'unknown'}
                </span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}