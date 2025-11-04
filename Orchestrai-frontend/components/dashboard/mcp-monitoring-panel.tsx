'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Server,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface MCPServer {
  name: string
  status: 'running' | 'stopped' | 'error' | 'starting'
  description: string
  uptime: number
  totalCalls: number
  successRate: number
  avgResponseTime: number
  lastError?: string
  operations: { [key: string]: { count: number, successCount: number } }
}

interface MCPMonitoringPanelProps {
  websocket: WebSocket | null
}

export function MCPMonitoringPanel({ websocket }: MCPMonitoringPanelProps) {
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([])
  const [totalCalls, setTotalCalls] = useState(0)
  const [avgSuccessRate, setAvgSuccessRate] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchMCPStatus()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'mcp_status') {
          setMcpServers(data.servers)
          calculateAggregateMetrics(data.servers)
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    // Fallback polling if WebSocket unavailable
    const interval = setInterval(fetchMCPStatus, 10000)
    return () => clearInterval(interval)
  }, [websocket])

  const fetchMCPStatus = async () => {
    try {
      const response = await fetch('http://localhost:5501/mcp/status')
      if (response.ok) {
        const data = await response.json()
        // Transform the API response to match our interface
        const transformedServers: MCPServer[] = Object.entries(data.servers || {}).map(([name, serverData]: [string, any]) => ({
          name,
          status: serverData.status === 'running' ? 'running' : 'stopped',
          description: serverData.config?.description || 'MCP Server',
          uptime: Math.floor((serverData.uptime || 0) / 1000), // Convert ms to seconds
          totalCalls: Math.floor(Math.random() * 1000) + 50, // TODO: Add real metrics
          successRate: 98.5 + Math.random() * 1.5, // TODO: Add real success rate
          avgResponseTime: 100 + Math.random() * 200, // TODO: Add real response time
          operations: {
            'list_tools': { count: Math.floor(Math.random() * 50) + 10, successCount: Math.floor(Math.random() * 45) + 10 },
            'call_tool': { count: Math.floor(Math.random() * 200) + 50, successCount: Math.floor(Math.random() * 195) + 45 },
            'get_prompts': { count: Math.floor(Math.random() * 30) + 5, successCount: Math.floor(Math.random() * 28) + 5 }
          }
        }))
        setMcpServers(transformedServers)
        calculateAggregateMetrics(transformedServers)
      }
    } catch (error) {
      console.error('Error fetching MCP status:', error)
    }
  }

  const calculateAggregateMetrics = (servers: MCPServer[]) => {
    const totalCalls = servers.reduce((sum, server) => sum + server.totalCalls, 0)
    const avgSuccess = servers.length > 0 
      ? servers.reduce((sum, server) => sum + server.successRate, 0) / servers.length 
      : 0
    
    setTotalCalls(totalCalls)
    setAvgSuccessRate(avgSuccess)
  }

  const refreshMCPStatus = async () => {
    setIsRefreshing(true)
    await fetchMCPStatus()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'stopped': return <XCircle className="h-4 w-4 text-red-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'starting': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'stopped': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'starting': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* MCP Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mcpServers.filter(s => s.status === 'running').length}/{mcpServers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mcpServers.filter(s => s.status === 'running').length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MCP Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all servers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <Progress value={avgSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mcpServers.filter(s => s.status === 'running').length === mcpServers.length && mcpServers.length > 0
                ? 'Healthy' 
                : 'Issues'}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshMCPStatus}
              disabled={isRefreshing}
              className="mt-1"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MCP Server Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            MCP Server Status
          </CardTitle>
          <CardDescription>
            Monitor all Model Context Protocol servers and their operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {mcpServers.map((server) => (
                  <Card key={server.name} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(server.status)}
                        <div>
                          <h4 className="font-semibold capitalize">{server.name}</h4>
                          <p className="text-sm text-muted-foreground">{server.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(server.status)}>
                          {server.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatUptime(server.uptime)}
                        </span>
                      </div>
                    </div>
                    {server.lastError && (
                      <div className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <strong>Last Error:</strong> {server.lastError}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4">
                {mcpServers.map((server) => (
                  <Card key={server.name} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold capitalize">{server.name}</h4>
                      <Badge className={getStatusColor(server.status)}>
                        {server.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Calls</p>
                        <p className="font-semibold">{server.totalCalls.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold">{server.successRate.toFixed(1)}%</p>
                        <Progress value={server.successRate} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-semibold">{server.avgResponseTime.toFixed(0)}ms</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <div className="grid gap-4">
                {mcpServers.map((server) => (
                  <Card key={server.name} className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold capitalize">{server.name}</h4>
                      <Badge className={getStatusColor(server.status)}>
                        {server.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(server.operations).map(([operation, data]) => (
                        <div key={operation} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{operation}</span>
                          <div className="flex items-center space-x-2">
                            <span>{data.count} calls</span>
                            <Badge variant="outline" className="text-xs">
                              {data.count > 0 ? ((data.successCount / data.count) * 100).toFixed(0) : 0}% success
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {Object.keys(server.operations).length === 0 && (
                        <p className="text-sm text-muted-foreground">No operations recorded yet</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}