'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Network, 
  Activity, 
  Database, 
  Zap,
  Clock,
  Hexagon,
  RefreshCw,
  Eye
} from 'lucide-react'

interface MemoryVisualizationData {
  latticeOverview: {
    totalNodes: number
    totalConnections: number
    efficiency: number
    health: string
    structure: string
  }
  nodeDetails: Array<{
    id: string
    domain: string
    type: string
    coordinates: { q: number, r: number }
    importance: number
    lastAccessed: number
    accessCount: number
    content: string
    connections: number
    strength: number
  }>
  memoryClusters: Array<{
    id: string
    domain: string
    nodeCount: number
    center: { q: number, r: number }
    radius: number
    efficiency: number
    lastActivity: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    timestamp: string
    coordinates: { q: number, r: number }
    domain: string
    action: string
  }>
  memoryTypes: Record<string, {
    count: number
    color: string
    description: string
  }>
  systemStats: {
    activeDomains: number
    totalMemoryPools: number
    averageNodeImportance: number
    connectionDensity: number
    memoryUtilization: number
  }
}

interface MemoryActivityPanelProps {
  websocket: WebSocket | null
}

export function MemoryActivityPanel({ websocket }: MemoryActivityPanelProps) {
  const [memoryData, setMemoryData] = useState<MemoryVisualizationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<any>(null)

  useEffect(() => {
    fetchMemoryData()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'memory_update') {
          fetchMemoryData() // Refresh on memory updates
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    const interval = setInterval(fetchMemoryData, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [websocket])

  const fetchMemoryData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5501/memory/visualization')
      if (response.ok) {
        const data = await response.json()
        setMemoryData(data)
      }
    } catch (error) {
      console.error('Error fetching memory data:', error)
    }
    setIsLoading(false)
  }

  const formatTimestamp = (timestamp: number | string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      default: return 'text-red-600'
    }
  }

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      'seo': 'bg-orange-500',
      'quality': 'bg-purple-500',
      'content': 'bg-blue-500',
      'client': 'bg-red-500',
      'web': 'bg-green-500'
    }
    
    for (const [key, color] of Object.entries(colors)) {
      if (domain.toLowerCase().includes(key)) return color
    }
    return 'bg-gray-500'
  }

  if (!memoryData) {
    return <div className="flex items-center justify-center h-64">Loading memory data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Memory Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Nodes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryData.latticeOverview.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              Active in hexagonal lattice
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryData.latticeOverview.totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              {memoryData.systemStats.connectionDensity.toFixed(1)} per node avg
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryData.latticeOverview.efficiency}%</div>
            <div className="mt-2">
              <Progress value={memoryData.latticeOverview.efficiency} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getHealthColor(memoryData.latticeOverview.health)}`}>
              {memoryData.latticeOverview.health}
            </div>
            <p className="text-xs text-muted-foreground">
              Lattice structure optimal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Memory Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crystalline Memory Analysis
            </CardTitle>
            <CardDescription>
              Live hexagonal lattice structure with {memoryData.systemStats.activeDomains} active memory domains
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMemoryData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nodes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="nodes">Memory Nodes</TabsTrigger>
              <TabsTrigger value="clusters">Domain Clusters</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="types">Memory Types</TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="space-y-4">
              <div className="grid gap-3">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(memoryData.nodeDetails.length, 10)} of {memoryData.nodeDetails.length} memory nodes
                </div>
                {memoryData.nodeDetails.slice(0, 10).map((node) => (
                  <Card key={node.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getDomainColor(node.domain)} text-white`}>
                            {node.domain.replace(/-/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({node.coordinates.q}, {node.coordinates.r})
                          </span>
                        </div>
                        <div className="text-sm">
                          <strong>Connections:</strong> {node.connections} • 
                          <strong> Strength:</strong> {(node.strength * 100).toFixed(0)}% •
                          <strong> Accessed:</strong> {formatTimestamp(node.lastAccessed)}
                        </div>
                        {selectedNode?.id === node.id && (
                          <div className="mt-3 p-3 bg-muted/50 rounded text-xs">
                            <strong>Content Preview:</strong>
                            <div className="mt-1 font-mono text-xs break-all">
                              {node.content.substring(0, 200)}{node.content.length > 200 ? '...' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Hexagon className="h-4 w-4 text-muted-foreground" />
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="clusters" className="space-y-4">
              <div className="grid gap-3">
                {memoryData.memoryClusters.map((cluster) => (
                  <Card key={cluster.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold capitalize">
                          {cluster.domain.replace(/-/g, ' ')} Cluster
                        </h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>{cluster.nodeCount}</strong> nodes at center ({cluster.center.q}, {cluster.center.r})
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last activity: {new Date(cluster.lastActivity).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{cluster.efficiency.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                        <Progress value={cluster.efficiency} className="w-20 mt-1" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Recent memory operations in the crystalline lattice
              </div>
              {memoryData.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {activity.action}
                    </Badge>
                    <span className="text-sm">{activity.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">
                      at ({activity.coordinates.q}, {activity.coordinates.r})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge className={`${getDomainColor(activity.domain)} text-white text-xs`}>
                      {activity.domain}
                    </Badge>
                    <Clock className="h-3 w-3" />
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="types" className="space-y-4">
              <div className="grid gap-3">
                {Object.entries(memoryData.memoryTypes).map(([type, info]) => (
                  <Card key={type} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: info.color }}
                        />
                        <div>
                          <h4 className="font-semibold capitalize">
                            {type.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{info.count}</div>
                        <div className="text-xs text-muted-foreground">Nodes</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Memory System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {memoryData.systemStats.activeDomains}
              </div>
              <p className="text-sm text-muted-foreground">Active Domains</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {memoryData.systemStats.averageNodeImportance.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Importance</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {memoryData.systemStats.connectionDensity.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Connection Density</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {memoryData.systemStats.memoryUtilization.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Memory Utilization</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {memoryData.systemStats.totalMemoryPools}
              </div>
              <p className="text-sm text-muted-foreground">Memory Pools</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}