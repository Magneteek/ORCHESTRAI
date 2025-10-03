'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MCPMonitoringPanel } from '@/components/dashboard/mcp-monitoring-panel'
import { UsageAnalyticsPanel } from '@/components/dashboard/usage-analytics-panel'
import { AutoSyncTestingPanel } from '@/components/dashboard/auto-sync-testing-panel'
import { D3VisualizationsPanel } from '@/components/dashboard/d3-visualizations-panel'
import { DomainHubOrchestration } from '@/components/dashboard/domain-hub-orchestration'
import { LiveAgentsPanel } from '@/components/dashboard/live-agents-panel'
import { MemoryActivityPanel } from '@/components/dashboard/memory-activity-panel'
import { 
  Activity, 
  Database, 
  Zap, 
  Globe, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  BarChart3,
  Brain,
  Network,
  TestTube,
  TrendingUp
} from 'lucide-react'

interface SystemMetrics {
  memoryNodes: number
  activeAgents: number
  pipelineSharing: string
  redisStatus: string
  totalRequests: number
  uptime: number
  uptimeFormatted: string
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryNodes: 0,
    activeAgents: 0,
    pipelineSharing: 'Initializing',
    redisStatus: 'Connecting',
    totalRequests: 0,
    uptime: 0,
    uptimeFormatted: '0s'
  })
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)

  // Fetch system metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5501/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      
      const data = await response.json()
      setMetrics(data)
      setConnected(true)
      setError(null)
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError('Failed to connect to orchestrator')
      setConnected(false)
    }
  }

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:5501/ws')
        setWebsocket(ws)
        
        ws.onopen = () => {
          console.log('WebSocket connected to orchestrator')
          setConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            if (message.type === 'metrics_update') {
              setMetrics(message.data)
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setConnected(false)
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnected(false)
        }
      } catch (err) {
        console.error('WebSocket connection error:', err)
      }
    }

    // Initial metrics fetch
    fetchMetrics()
    
    // Setup WebSocket
    connectWebSocket()
    
    // Fallback polling every 5 seconds
    const interval = setInterval(fetchMetrics, 5000)

    return () => {
      clearInterval(interval)
      if (ws) {
        ws.close()
      }
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Disconnected':
      case 'Error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected':
      case 'Active':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'Disconnected':
      case 'Error':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ORCHESTRAI
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Advanced Multi-Agent System with Crystalline Memory Architecture
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(connected ? 'Connected' : 'Disconnected')} px-3 py-1`}>
              {getStatusIcon(connected ? 'Connected' : 'Disconnected')}
              <span className="ml-2">{connected ? 'Connected' : 'Disconnected'}</span>
            </Badge>
            {error && (
              <Badge variant="destructive" className="px-3 py-1">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </Badge>
            )}
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Nodes</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.memoryNodes}</div>
              <p className="text-xs text-muted-foreground">
                Hexagonal lattice structure
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                Domain specialists online
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                API + MCP calls processed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uptimeFormatted}</div>
              <p className="text-xs text-muted-foreground">
                Current session runtime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="domains" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Domain Hubs
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Live Agents
            </TabsTrigger>
            <TabsTrigger value="memory-activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Memory
            </TabsTrigger>
            <TabsTrigger value="mcp" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              D3.js Charts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Client Intel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Components Status */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    System Components
                  </CardTitle>
                  <CardDescription>
                    Status of core ORCHESTRAI components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Redis Connection</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metrics.redisStatus)}
                      <Badge className={getStatusColor(metrics.redisStatus)}>
                        {metrics.redisStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pipeline Sharing</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metrics.pipelineSharing)}
                      <Badge className={getStatusColor(metrics.pipelineSharing)}>
                        {metrics.pipelineSharing}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">WebSocket Connection</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connected ? 'Connected' : 'Disconnected')}
                      <Badge className={getStatusColor(connected ? 'Connected' : 'Disconnected')}>
                        {connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Metrics
                  </CardTitle>
                  <CardDescription>
                    Live system performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>System Load</span>
                      <span>{connected ? 'Normal' : 'Unknown'}</span>
                    </div>
                    <Progress value={connected ? 25 : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Efficiency</span>
                      <span>{metrics.memoryNodes > 0 ? 'High' : 'Initializing'}</span>
                    </div>
                    <Progress value={metrics.memoryNodes > 0 ? 85 : 10} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Agent Coordination</span>
                      <span>{metrics.activeAgents > 0 ? 'Optimal' : 'Standby'}</span>
                    </div>
                    <Progress value={metrics.activeAgents > 0 ? 92 : 5} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mcp">
            <MCPMonitoringPanel websocket={websocket} />
          </TabsContent>

          <TabsContent value="testing">
            <AutoSyncTestingPanel websocket={websocket} />
          </TabsContent>

          <TabsContent value="visualizations">
            <D3VisualizationsPanel websocket={websocket} />
          </TabsContent>

          <TabsContent value="analytics">
            <UsageAnalyticsPanel websocket={websocket} />
          </TabsContent>

          <TabsContent value="domains">
            <DomainHubOrchestration websocket={websocket} />
          </TabsContent>

          <TabsContent value="agents">
            <LiveAgentsPanel websocket={websocket} />
          </TabsContent>

          <TabsContent value="memory-activity">
            <MemoryActivityPanel websocket={websocket} />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Intelligence Hub
                </CardTitle>
                <CardDescription>
                  ICP analysis, psychographic mapping, and cross-domain context injection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Client Intelligence Dashboard - Coming Soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Will feature real-time ICP analysis, psychographic visualization, and cross-domain context flow monitoring
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}