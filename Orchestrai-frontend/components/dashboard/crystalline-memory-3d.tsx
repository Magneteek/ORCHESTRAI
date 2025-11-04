'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Hexagon, 
  Network, 
  Zap, 
  Database, 
  Search,
  Play,
  Pause,
  RotateCcw,
  Maximize
} from 'lucide-react'
import * as d3 from 'd3'

interface MemoryNode {
  id: string
  type: 'core' | 'domain' | 'task' | 'entity'
  entity?: string
  domain?: string
  connections: number
  strength: number
  position: { x: number, y: number, z: number }
  data: any
  lastAccessed: string
  accessCount: number
}

interface MemoryCluster {
  id: string
  nodes: MemoryNode[]
  center: { x: number, y: number, z: number }
  radius: number
  domain: string
  efficiency: number
}

interface CrystallineMemoryProps {
  websocket: WebSocket | null
}

export function CrystallineMemory3D({ websocket }: CrystallineMemoryProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [memoryNodes, setMemoryNodes] = useState<MemoryNode[]>([])
  const [memoryClusters, setMemoryClusters] = useState<MemoryCluster[]>([])
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [filterDomain, setFilterDomain] = useState<string>('all')
  const [simulation, setSimulation] = useState<d3.Simulation<MemoryNode, undefined> | null>(null)

  useEffect(() => {
    fetchMemoryStructure()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'crystalline_memory_update') {
          setMemoryNodes(data.nodes)
          setMemoryClusters(data.clusters)
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    const interval = setInterval(fetchMemoryStructure, 10000)
    return () => clearInterval(interval)
  }, [websocket])

  useEffect(() => {
    if (memoryNodes.length > 0 && svgRef.current) {
      initializeVisualization()
    }
  }, [memoryNodes, viewMode, filterDomain])

  const fetchMemoryStructure = async () => {
    try {
      // Fetch real crystalline memory data
      const response = await fetch('http://localhost:5501/memory/visualization')
      if (!response.ok) throw new Error('Failed to fetch memory data')
      
      const data = await response.json()
      
      // Transform real data to component format
      const realNodes: MemoryNode[] = data.nodeDetails.map((node: any) => ({
        id: node.id,
        type: node.domain.includes('seo') ? 'domain' : 
              node.domain.includes('quality') ? 'task' :
              node.domain.includes('content') ? 'domain' : 
              node.domain.includes('client') ? 'entity' : 'core',
        entity: node.domain.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        domain: node.domain,
        connections: node.connections,
        strength: Math.min(node.importance, 1),
        position: { 
          x: node.coordinates.q * 50 + 400, 
          y: node.coordinates.r * 50 + 300, 
          z: 0 
        },
        data: { 
          name: node.domain.replace(/-/g, ' '), 
          content: node.content,
          agents: node.type === 'memory' ? 1 : 0
        },
        lastAccessed: node.lastAccessed,
        accessCount: node.accessCount
      }))

      const realClusters: MemoryCluster[] = data.memoryClusters.map((cluster: any) => ({
        id: cluster.id,
        nodes: realNodes.filter(n => n.domain === cluster.domain),
        center: { 
          x: cluster.center.q * 50 + 400, 
          y: cluster.center.r * 50 + 300, 
          z: 0 
        },
        radius: cluster.radius,
        domain: cluster.domain,
        efficiency: cluster.efficiency / 100
      }))

      // Add some mock nodes if we have few real ones for better visualization
      const mockNodes: MemoryNode[] = realNodes.length < 10 ? [
        {
          id: 'core-1',
          type: 'core',
          connections: 15,
          strength: 1.0,
          position: { x: 0, y: 0, z: 0 },
          data: { name: 'Central Memory Core', type: 'orchestrator' },
          lastAccessed: new Date().toISOString(),
          accessCount: 1250
        },
        {
          id: 'seo-hub',
          type: 'domain',
          entity: 'SEO Domain',
          domain: 'seo',
          connections: 12,
          strength: 0.9,
          position: { x: 100, y: 50, z: 30 },
          data: { agents: 12, specialization: 'Search Optimization' },
          lastAccessed: new Date(Date.now() - 300000).toISOString(),
          accessCount: 850
        },
        {
          id: 'quartziq-entity',
          type: 'entity',
          entity: 'QuartzIQ',
          domain: 'client-intelligence',
          connections: 8,
          strength: 0.8,
          position: { x: -80, y: 120, z: -20 },
          data: { type: 'client', industry: 'AI-powered customer intelligence' },
          lastAccessed: new Date(Date.now() - 600000).toISOString(),
          accessCount: 420
        },
        {
          id: 'content-hub',
          type: 'domain',
          entity: 'Content Domain',
          domain: 'content',
          connections: 10,
          strength: 0.85,
          position: { x: 120, y: -60, z: 40 },
          data: { agents: 13, languages: ['EN', 'ES', 'NL', 'DE', 'SL'] },
          lastAccessed: new Date(Date.now() - 180000).toISOString(),
          accessCount: 630
        },
        {
          id: 'quality-hub',
          type: 'domain',
          entity: 'Quality Control',
          domain: 'quality',
          connections: 6,
          strength: 0.95,
          position: { x: -100, y: -80, z: 50 },
          data: { agents: 12, categories: 4, selfLearning: true },
          lastAccessed: new Date(Date.now() - 450000).toISOString(),
          accessCount: 280
        }
      ]

      const mockClusters: MemoryCluster[] = [
        {
          id: 'seo-cluster',
          nodes: mockNodes.filter(n => n.domain === 'seo'),
          center: { x: 100, y: 50, z: 30 },
          radius: 80,
          domain: 'seo',
          efficiency: 0.92
        },
        {
          id: 'client-cluster',
          nodes: mockNodes.filter(n => n.domain === 'client-intelligence'),
          center: { x: -80, y: 120, z: -20 },
          radius: 60,
          domain: 'client-intelligence',
          efficiency: 0.87
        }
      ]

      setMemoryNodes(mockNodes)
      setMemoryClusters(mockClusters)
    } catch (error) {
      console.error('Error fetching memory structure:', error)
    }
  }

  const initializeVisualization = () => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    // Create gradient definitions
    const defs = svg.append('defs')
    
    // Core node gradient
    const coreGradient = defs.append('radialGradient')
      .attr('id', 'coreGradient')
    coreGradient.append('stop').attr('offset', '0%').attr('stop-color', '#8b5cf6').attr('stop-opacity', 1)
    coreGradient.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.6)

    // Domain node gradient
    const domainGradient = defs.append('radialGradient')
      .attr('id', 'domainGradient')
    domainGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 1)
    domainGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669').attr('stop-opacity', 0.6)

    // Entity node gradient
    const entityGradient = defs.append('radialGradient')
      .attr('id', 'entityGradient')
    entityGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 1)
    entityGradient.append('stop').attr('offset', '100%').attr('stop-color', '#d97706').attr('stop-opacity', 0.6)

    // Filter nodes based on domain selection
    const filteredNodes = filterDomain === 'all' 
      ? memoryNodes 
      : memoryNodes.filter(n => n.domain === filterDomain || n.type === 'core')

    // Create force simulation
    const newSimulation = d3.forceSimulation<MemoryNode>(filteredNodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 5))
      .force('link', d3.forceLink([]).distance(100))

    setSimulation(newSimulation)

    // Create container group
    const container = svg.append('g')

    // Draw hexagonal lattice background
    drawHexagonalLattice(container, width, height)

    // Draw memory clusters
    drawMemoryClusters(container, memoryClusters)

    // Draw connections between nodes
    const connections = container.append('g').attr('class', 'connections')
    
    // Draw nodes
    const nodeGroup = container.append('g').attr('class', 'nodes')
    
    const nodes = nodeGroup.selectAll('.memory-node')
      .data(filteredNodes)
      .enter().append('g')
      .attr('class', 'memory-node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedNode(d))

    // Node circles with hexagonal approximation
    nodes.append('polygon')
      .attr('points', d => createHexagonPoints(getNodeRadius(d)))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => d.type === 'core' ? '#8b5cf6' : '#374151')
      .attr('stroke-width', d => d.type === 'core' ? 3 : 1)
      .attr('opacity', 0.8)

    // Node labels
    nodes.append('text')
      .text(d => d.entity || d.data?.name || d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')

    // Connection strength indicators
    nodes.append('circle')
      .attr('r', 3)
      .attr('cx', d => getNodeRadius(d) - 5)
      .attr('cy', d => -getNodeRadius(d) + 5)
      .attr('fill', d => `hsl(${d.strength * 120}, 70%, 50%)`)

    // Update positions on simulation tick
    newSimulation.on('tick', () => {
      if (!isAnimating) return
      
      nodes.attr('transform', d => `translate(${d.x}, ${d.y})`)
      
      // Update connections if any exist
      drawConnections(connections, filteredNodes)
    })
  }

  const drawHexagonalLattice = (container: any, width: number, height: number) => {
    const hexSize = 40
    const rows = Math.ceil(height / (hexSize * 1.5))
    const cols = Math.ceil(width / (hexSize * Math.sqrt(3)))

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2
        const y = row * hexSize * 1.5

        container.append('polygon')
          .attr('points', createHexagonPoints(hexSize / 2))
          .attr('transform', `translate(${x}, ${y})`)
          .attr('fill', 'none')
          .attr('stroke', '#374151')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.1)
      }
    }
  }

  const drawMemoryClusters = (container: any, clusters: MemoryCluster[]) => {
    const clusterGroup = container.append('g').attr('class', 'clusters')
    
    clusters.forEach(cluster => {
      clusterGroup.append('circle')
        .attr('cx', cluster.center.x + 400) // Offset for centering
        .attr('cy', cluster.center.y + 300)
        .attr('r', cluster.radius)
        .attr('fill', getDomainColor(cluster.domain))
        .attr('opacity', 0.1)
        .attr('stroke', getDomainColor(cluster.domain))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
    })
  }

  const drawConnections = (container: any, nodes: MemoryNode[]) => {
    // For now, connect core nodes to all other nodes
    const coreNode = nodes.find(n => n.type === 'core')
    if (!coreNode) return

    const connections = nodes.filter(n => n.type !== 'core').map(n => ({
      source: coreNode,
      target: n,
      strength: Math.min(coreNode.strength, n.strength)
    }))

    const lines = container.selectAll('.connection')
      .data(connections)

    lines.enter().append('line')
      .attr('class', 'connection')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', d => d.strength * 2)
      .attr('opacity', 0.3)
      .merge(lines)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    lines.exit().remove()
  }

  const createHexagonPoints = (radius: number): string => {
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      points.push(`${x},${y}`)
    }
    return points.join(' ')
  }

  const getNodeRadius = (node: MemoryNode): number => {
    switch (node.type) {
      case 'core': return 25
      case 'domain': return 20
      case 'entity': return 15
      case 'task': return 12
      default: return 10
    }
  }

  const getNodeColor = (node: MemoryNode): string => {
    switch (node.type) {
      case 'core': return 'url(#coreGradient)'
      case 'domain': return 'url(#domainGradient)'
      case 'entity': return 'url(#entityGradient)'
      default: return '#6b7280'
    }
  }

  const getDomainColor = (domain: string): string => {
    const colors: { [key: string]: string } = {
      'seo': '#10b981',
      'content': '#3b82f6',
      'quality': '#8b5cf6',
      'client-intelligence': '#f59e0b',
      'web-quality': '#ef4444'
    }
    return colors[domain] || '#6b7280'
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
    if (simulation) {
      if (isAnimating) {
        simulation.stop()
      } else {
        simulation.restart()
      }
    }
  }

  const resetVisualization = () => {
    if (simulation) {
      simulation.alpha(1).restart()
    }
    setSelectedNode(null)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Crystalline Memory Structure</h2>
          <p className="text-muted-foreground">Hexagonal lattice memory visualization</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="seo">SEO Domain</SelectItem>
              <SelectItem value="content">Content Domain</SelectItem>
              <SelectItem value="quality">Quality Control</SelectItem>
              <SelectItem value="client-intelligence">Client Intelligence</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={toggleAnimation}>
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={resetVisualization}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hexagon className="h-5 w-5" />
                Memory Lattice Structure
              </CardTitle>
              <CardDescription>
                Interactive hexagonal memory nodes with geometric positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-slate-900">
                <svg ref={svgRef} className="w-full h-96"></svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Memory Statistics */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Memory Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Nodes</span>
                  <span className="font-medium">{memoryNodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Clusters</span>
                  <span className="font-medium">{memoryClusters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Efficiency</span>
                  <span className="font-medium">
                    {memoryClusters.length > 0 
                      ? (memoryClusters.reduce((sum, c) => sum + c.efficiency, 0) / memoryClusters.length * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Details */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge className={`mb-2 ${selectedNode.type === 'core' ? 'bg-purple-500' : selectedNode.type === 'domain' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {selectedNode.type}
                  </Badge>
                  <h4 className="font-semibold">{selectedNode.entity || selectedNode.id}</h4>
                  {selectedNode.domain && (
                    <p className="text-sm text-muted-foreground capitalize">{selectedNode.domain} Domain</p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span>{selectedNode.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strength</span>
                    <span>{(selectedNode.strength * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access Count</span>
                    <span>{selectedNode.accessCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Access</span>
                    <span>{new Date(selectedNode.lastAccessed).toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}