'use client'

import { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Network, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  Download,
  Maximize2,
  Play,
  Pause
} from 'lucide-react'

interface WorkflowNode {
  id: string
  name: string
  type: 'mcp_server' | 'orchestrator' | 'memory' | 'client'
  status: 'active' | 'inactive' | 'error'
  connections: string[]
  metrics: {
    requests: number
    responseTime: number
    successRate: number
  }
}

interface CostData {
  timestamp: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
}

interface D3VisualizationsPanelProps {
  websocket: WebSocket | null
}

export function D3VisualizationsPanel({ websocket }: D3VisualizationsPanelProps) {
  const [workflowData, setWorkflowData] = useState<WorkflowNode[]>([])
  const [costData, setCostData] = useState<CostData[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedVisualization, setSelectedVisualization] = useState('workflow')
  
  // D3 refs
  const workflowRef = useRef<SVGSVGElement>(null)
  const costChartRef = useRef<SVGSVGElement>(null)
  const networkTopologyRef = useRef<SVGSVGElement>(null)
  const memoryLatticeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Generate sample data and initialize visualizations
    initializeData()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'system_metrics' || data.type === 'mcp_status') {
          updateVisualizationsWithRealData(data)
        }
        if (data.type === 'usage_analytics' || data.type === 'cost_tracking') {
          updateCostData(data)
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }
  }, [websocket])

  useEffect(() => {
    if (workflowData.length > 0) {
      createWorkflowDiagram()
    }
  }, [workflowData, isAnimating])

  useEffect(() => {
    if (costData.length > 0) {
      createCostOptimizationChart()
    }
  }, [costData])

  const initializeData = () => {
    // Initialize with sample workflow data
    const sampleWorkflow: WorkflowNode[] = [
      {
        id: 'orchestrator',
        name: 'ORCHESTRAI Master',
        type: 'orchestrator',
        status: 'active',
        connections: ['sequential-thinking', 'memory', 'ref-tools', 'notion'],
        metrics: { requests: 1543, responseTime: 45, successRate: 98.5 }
      },
      {
        id: 'sequential-thinking',
        name: 'Sequential Thinking',
        type: 'mcp_server',
        status: 'active',
        connections: ['orchestrator', 'memory'],
        metrics: { requests: 234, responseTime: 120, successRate: 96.2 }
      },
      {
        id: 'memory',
        name: 'Crystalline Memory',
        type: 'memory',
        status: 'active',
        connections: ['orchestrator', 'sequential-thinking', 'ref-tools', 'notion'],
        metrics: { requests: 892, responseTime: 25, successRate: 99.1 }
      },
      {
        id: 'ref-tools',
        name: 'Reference Tools',
        type: 'mcp_server',
        status: 'active',
        connections: ['orchestrator', 'memory'],
        metrics: { requests: 456, responseTime: 89, successRate: 97.8 }
      },
      {
        id: 'notion',
        name: 'Notion Sync',
        type: 'mcp_server',
        status: 'active',
        connections: ['orchestrator', 'memory'],
        metrics: { requests: 178, responseTime: 156, successRate: 94.3 }
      },
      {
        id: 'frontend',
        name: 'Dashboard',
        type: 'client',
        status: 'active',
        connections: ['orchestrator'],
        metrics: { requests: 78, responseTime: 34, successRate: 99.7 }
      }
    ]

    setWorkflowData(sampleWorkflow)

    // Initialize with sample cost data
    const sampleCosts: CostData[] = generateSampleCostData()
    setCostData(sampleCosts)
  }

  const generateSampleCostData = (): CostData[] => {
    const models = ['claude-sonnet-4', 'claude-3.5-sonnet', 'gpt-4-turbo']
    const data: CostData[] = []
    const now = Date.now()
    
    for (let i = 0; i < 24; i++) {
      models.forEach(model => {
        data.push({
          timestamp: new Date(now - (23 - i) * 60 * 60 * 1000).toISOString(),
          model,
          inputTokens: Math.floor(Math.random() * 5000) + 1000,
          outputTokens: Math.floor(Math.random() * 2000) + 500,
          cost: Math.random() * 0.5 + 0.1
        })
      })
    }
    
    return data
  }

  const updateVisualizationsWithRealData = (data: any) => {
    // Update workflow data based on real system data
    if (data.type === 'mcp_status' && data.data?.servers) {
      const updatedWorkflow = workflowData.map(node => {
        if (node.type === 'mcp_server') {
          const serverData = data.data.servers[node.id]
          if (serverData) {
            return {
              ...node,
              status: serverData.status === 'running' ? 'active' : 'inactive',
              metrics: {
                ...node.metrics,
                requests: serverData.totalCalls || node.metrics.requests
              }
            }
          }
        }
        return node
      })
      
      setWorkflowData(updatedWorkflow)
    }
  }

  const updateCostData = (data: any) => {
    if (data.type === 'cost_tracking' && data.data?.costs) {
      // Add new cost data points
      const newCostPoints: CostData[] = Object.entries(data.data.costs).map(([model, cost]: [string, any]) => ({
        timestamp: new Date().toISOString(),
        model,
        inputTokens: cost.inputTokens || 0,
        outputTokens: cost.outputTokens || 0,
        cost: cost.totalCost || 0
      }))
      
      setCostData(prev => [...prev.slice(-20), ...newCostPoints])
    }
  }

  const createWorkflowDiagram = () => {
    if (!workflowRef.current || workflowData.length === 0) return

    const svg = d3.select(workflowRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    // Create force simulation
    const simulation = d3.forceSimulation(workflowData as any)
      .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Create links data
    const links: any[] = []
    workflowData.forEach(node => {
      node.connections.forEach(targetId => {
        if (workflowData.find(n => n.id === targetId)) {
          links.push({
            source: node.id,
            target: targetId
          })
        }
      })
    })

    // Create link elements
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)

    // Create node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(workflowData)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')

    // Add circles for nodes
    node.append('circle')
      .attr('r', (d: WorkflowNode) => {
        switch (d.type) {
          case 'orchestrator': return 25
          case 'memory': return 20
          case 'mcp_server': return 18
          case 'client': return 15
          default: return 15
        }
      })
      .attr('fill', (d: WorkflowNode) => {
        if (d.status === 'active') {
          switch (d.type) {
            case 'orchestrator': return '#3b82f6'
            case 'memory': return '#8b5cf6'
            case 'mcp_server': return '#10b981'
            case 'client': return '#f59e0b'
            default: return '#6b7280'
          }
        } else if (d.status === 'error') {
          return '#ef4444'
        } else {
          return '#9ca3af'
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Add labels
    node.append('text')
      .text((d: WorkflowNode) => d.name)
      .attr('x', 0)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')

    // Add metrics text
    node.append('text')
      .text((d: WorkflowNode) => `${d.metrics.requests} req`)
      .attr('x', 0)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#6b7280')

    // Add success rate indicators
    node.append('text')
      .text((d: WorkflowNode) => `${d.metrics.successRate.toFixed(1)}%`)
      .attr('x', 0)
      .attr('y', 47)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', (d: WorkflowNode) => d.metrics.successRate > 95 ? '#10b981' : '#f59e0b')

    // Add drag behavior
    node.call(d3.drag<any, WorkflowNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }))

    // Add hover effects
    node.on('mouseover', function(event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', (d: WorkflowNode) => {
          switch (d.type) {
            case 'orchestrator': return 30
            case 'memory': return 25
            case 'mcp_server': return 23
            case 'client': return 20
            default: return 20
          }
        })
    })
    .on('mouseout', function(event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', (d: WorkflowNode) => {
          switch (d.type) {
            case 'orchestrator': return 25
            case 'memory': return 20
            case 'mcp_server': return 18
            case 'client': return 15
            default: return 15
          }
        })
    })

    // Animation for active data flow
    if (isAnimating) {
      const particles = svg.append('g').selectAll('circle')
        .data(links.filter(() => Math.random() > 0.7))
        .enter().append('circle')
        .attr('r', 3)
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.8)

      const animateParticles = () => {
        particles.each(function(d: any) {
          const particle = d3.select(this)
          const source = workflowData.find(n => n.id === d.source.id)
          const target = workflowData.find(n => n.id === d.target.id)
          
          if (source && target) {
            particle
              .attr('cx', source.x || 0)
              .attr('cy', source.y || 0)
              .transition()
              .duration(2000)
              .attr('cx', target.x || 0)
              .attr('cy', target.y || 0)
              .attr('opacity', 0)
              .on('end', () => {
                particle.attr('opacity', 0.8)
                animateParticles()
              })
          }
        })
      }

      setTimeout(animateParticles, 1000)
    }

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })
  }

  const createCostOptimizationChart = () => {
    if (!costChartRef.current || costData.length === 0) return

    const svg = d3.select(costChartRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 400
    const margin = { top: 20, right: 80, bottom: 40, left: 60 }

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    // Group data by model
    const groupedData = d3.group(costData, d => d.model)
    const models = Array.from(groupedData.keys())
    const colors = d3.scaleOrdinal(d3.schemeCategory10)

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(costData, d => new Date(d.timestamp)) as [Date, Date])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(costData, d => d.cost) as number])
      .range([height - margin.bottom, margin.top])

    // Create line generator
    const line = d3.line<CostData>()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(d.cost))
      .curve(d3.curveMonotoneX)

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M')))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`))

    // Add lines for each model
    models.forEach((model, i) => {
      const modelData = groupedData.get(model) || []
      
      svg.append('path')
        .datum(modelData)
        .attr('fill', 'none')
        .attr('stroke', colors(model))
        .attr('stroke-width', 2)
        .attr('d', line)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .delay(i * 200)
        .style('opacity', 1)

      // Add dots
      svg.selectAll(`.dot-${i}`)
        .data(modelData)
        .enter().append('circle')
        .attr('class', `dot-${i}`)
        .attr('cx', d => xScale(new Date(d.timestamp)))
        .attr('cy', d => yScale(d.cost))
        .attr('r', 3)
        .attr('fill', colors(model))
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .delay(i * 200)
        .style('opacity', 1)
    })

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, 30)`)

    models.forEach((model, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`)

      legendItem.append('circle')
        .attr('r', 5)
        .attr('fill', colors(model))

      legendItem.append('text')
        .attr('x', 12)
        .attr('y', 5)
        .text(model)
        .attr('font-size', '12px')
        .attr('fill', '#374151')
    })

    // Add title and labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Cost Optimization Over Time')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 20)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('Cost ($USD)')

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .text('Time')
  }

  const createNetworkTopology = () => {
    // Advanced network topology visualization
    // Implementation would show detailed network connections, bandwidth, latency
  }

  const createMemoryLattice = () => {
    // Crystalline memory lattice visualization
    // Implementation would show hexagonal structure, memory nodes, connections
  }

  const exportVisualization = (format: 'svg' | 'png') => {
    // Export functionality
    console.log(`Exporting visualization as ${format}`)
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced D3.js Visualizations
          </CardTitle>
          <CardDescription>
            Interactive real-time visualizations of system workflows, costs, and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={isAnimating ? "default" : "outline"}
              onClick={() => setIsAnimating(!isAnimating)}
              className="gap-2"
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isAnimating ? 'Pause' : 'Play'} Animation
            </Button>
            
            <Button
              variant="outline"
              onClick={() => createWorkflowDiagram()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            
            <Button
              variant="outline"
              onClick={() => exportVisualization('svg')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export SVG
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Tabs */}
      <Tabs value={selectedVisualization} onValueChange={setSelectedVisualization} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Workflow Diagram
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cost Optimization
          </TabsTrigger>
          <TabsTrigger value="topology" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Network Topology
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Memory Lattice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                System Workflow Diagram
              </CardTitle>
              <CardDescription>
                Real-time visualization of data flow between ORCHESTRAI components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <svg ref={workflowRef} className="w-full h-96 min-w-[800px]"></svg>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Orchestrator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span>Memory System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>MCP Servers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span>Clients</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cost Optimization Analytics
              </CardTitle>
              <CardDescription>
                Real-time cost tracking and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <svg ref={costChartRef} className="w-full h-96 min-w-[800px]"></svg>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${costData.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Cost (24h)</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(costData.reduce((sum, d) => sum + d.inputTokens + d.outputTokens, 0) / 1000).toFixed(1)}K
                  </div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {costData.length > 0 ? (costData.reduce((sum, d) => sum + d.cost, 0) / costData.length).toFixed(4) : '0.0000'}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Cost per Request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Network Topology
              </CardTitle>
              <CardDescription>
                Advanced network topology with bandwidth and latency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center">
                <svg ref={networkTopologyRef} className="w-full h-full">
                  <text x="50%" y="50%" textAnchor="middle" className="text-muted-foreground">
                    Advanced Network Topology Visualization
                    <tspan x="50%" dy="20">Coming in Phase 3</tspan>
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Crystalline Memory Lattice
              </CardTitle>
              <CardDescription>
                Hexagonal lattice structure of the crystalline memory system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center">
                <svg ref={memoryLatticeRef} className="w-full h-full">
                  <text x="50%" y="50%" textAnchor="middle" className="text-muted-foreground">
                    Crystalline Memory Lattice Visualization
                    <tspan x="50%" dy="20">Coming in Phase 3</tspan>
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}