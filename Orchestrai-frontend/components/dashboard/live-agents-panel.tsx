'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Activity, 
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  User,
  Brain,
  RefreshCw,
  FolderOpen,
  Timer,
  Target
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  domain: string
  status: 'active' | 'idle' | 'working' | 'error'
  currentTask?: string
  currentProject?: string
  currentClient?: string
  lastActivity: string
  tasksCompleted: number
  efficiency: number
  specialization: string[]
  connections: number
  memoryNodes: number
  coordinates?: { q: number, r: number }
}

interface ProjectActivity {
  projectId: string
  projectName: string
  clientName: string
  activeAgents: number
  totalTasks: number
  completedTasks: number
  startTime: string
  estimatedCompletion: string
  domains: string[]
}

interface LiveAgentsPanelProps {
  websocket: WebSocket | null
}

export function LiveAgentsPanel({ websocket }: LiveAgentsPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [projectActivities, setProjectActivities] = useState<ProjectActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    fetchAgentsData()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'agents_update' || data.type === 'task_update') {
          fetchAgentsData()
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    const interval = setInterval(fetchAgentsData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [websocket])

  const fetchAgentsData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5501/agents/live-status')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
        setProjectActivities(data.projects || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching agents data:', error)
      // Set mock data for development
      setMockData()
    }
    setIsLoading(false)
  }

  const setMockData = () => {
    const mockAgents: Agent[] = [
      {
        id: 'seo-keyword-research-001',
        name: 'SEO Keyword Research Agent',
        domain: 'seo',
        status: 'working',
        currentTask: 'Analyzing keyword opportunities for "AI-powered customer intelligence"',
        currentProject: 'QuartzIQ Homepage Optimization',
        currentClient: 'QuartzIQ',
        lastActivity: new Date(Date.now() - 120000).toISOString(),
        tasksCompleted: 24,
        efficiency: 95,
        specialization: ['keyword-research', 'competitor-analysis'],
        connections: 12,
        memoryNodes: 8,
        coordinates: { q: 0, r: 0 }
      },
      {
        id: 'content-writer-001',
        name: 'Content Writer Specialist',
        domain: 'content-enhanced',
        status: 'working',
        currentTask: 'Creating flagship article outline for customer intelligence platform',
        currentProject: 'QuartzIQ Content Strategy',
        currentClient: 'QuartzIQ',
        lastActivity: new Date(Date.now() - 45000).toISOString(),
        tasksCompleted: 18,
        efficiency: 87,
        specialization: ['content-creation', 'article-writing', 'outline-architecture'],
        connections: 15,
        memoryNodes: 12,
        coordinates: { q: 1, r: -2 }
      },
      {
        id: 'quality-validator-001',
        name: 'Content Quality Validator',
        domain: 'quality',
        status: 'active',
        currentTask: 'Quality assessment of multi-language content adaptations',
        currentProject: 'Global Content Quality Review',
        currentClient: 'Multiple Clients',
        lastActivity: new Date(Date.now() - 180000).toISOString(),
        tasksCompleted: 31,
        efficiency: 98,
        specialization: ['quality-assessment', 'content-validation', 'cross-domain-analysis'],
        connections: 8,
        memoryNodes: 6,
        coordinates: { q: -1, r: 2 }
      },
      {
        id: 'client-intel-001',
        name: 'Client ICP Analyst',
        domain: 'client-intelligence',
        status: 'working',
        currentTask: 'Building psychographic profile for B2B SaaS target audience',
        currentProject: 'QuartzIQ Market Analysis',
        currentClient: 'QuartzIQ',
        lastActivity: new Date(Date.now() - 90000).toISOString(),
        tasksCompleted: 12,
        efficiency: 92,
        specialization: ['icp-analysis', 'market-research', 'psychographic-mapping'],
        connections: 10,
        memoryNodes: 14,
        coordinates: { q: 1, r: 2 }
      },
      {
        id: 'web-quality-001',
        name: 'Technical SEO Auditor',
        domain: 'web-quality',
        status: 'idle',
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        tasksCompleted: 8,
        efficiency: 89,
        specialization: ['technical-seo', 'core-web-vitals', 'performance-analysis'],
        connections: 6,
        memoryNodes: 4,
        coordinates: { q: -1, r: -2 }
      },
      {
        id: 'seo-competitor-001',
        name: 'Competitor Analysis Agent',
        domain: 'seo',
        status: 'working',
        currentTask: 'SERP analysis for "customer intelligence software" keywords',
        currentProject: 'QuartzIQ Competitive Research',
        currentClient: 'QuartzIQ',
        lastActivity: new Date(Date.now() - 60000).toISOString(),
        tasksCompleted: 16,
        efficiency: 94,
        specialization: ['competitor-analysis', 'serp-analysis', 'market-intelligence'],
        connections: 11,
        memoryNodes: 7,
        coordinates: { q: 1, r: -1 }
      }
    ]

    const mockProjects: ProjectActivity[] = [
      {
        projectId: 'quartziq-EA511E99-BB89-4CD0-9C88-AE5584D2E010',
        projectName: 'QuartzIQ AI Platform Launch',
        clientName: 'QuartzIQ',
        activeAgents: 4,
        totalTasks: 28,
        completedTasks: 19,
        startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        estimatedCompletion: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        domains: ['seo', 'content-enhanced', 'client-intelligence']
      },
      {
        projectId: 'global-content-review-001',
        projectName: 'Global Content Quality Review',
        clientName: 'Multiple Clients',
        activeAgents: 2,
        totalTasks: 15,
        completedTasks: 12,
        startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        estimatedCompletion: new Date(Date.now() + 1800000).toISOString(), // 30 min from now
        domains: ['quality', 'content-enhanced']
      }
    ]

    setAgents(mockAgents)
    setProjectActivities(mockProjects)
    setLastUpdate(new Date())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'idle': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working': return <Zap className="h-4 w-4" />
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'idle': return <Clock className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      'seo': 'bg-orange-500',
      'quality': 'bg-purple-500',
      'content-enhanced': 'bg-blue-500',
      'client-intelligence': 'bg-red-500',
      'web-quality': 'bg-green-500'
    }
    return colors[domain] || 'bg-gray-500'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => a.status === 'working' || a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === 'working').length} working, {agents.filter(a => a.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              {projectActivities.reduce((sum, p) => sum + p.activeAgents, 0)} agents involved
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.reduce((sum, a) => sum + a.tasksCompleted, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Across all active agents
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System-wide performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Live Agent Activity
            </CardTitle>
            <CardDescription>
              Real-time view of all agents, their current tasks, and project assignments
              {lastUpdate && (
                <span className="block mt-1 text-xs">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAgentsData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="agents">Individual Agents</TabsTrigger>
              <TabsTrigger value="projects">Project Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-4">
              <div className="grid gap-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${getDomainColor(agent.domain)} text-white`}>
                            {agent.domain.replace(/-/g, ' ')}
                          </Badge>
                          <Badge className={getStatusColor(agent.status)}>
                            {getStatusIcon(agent.status)}
                            <span className="ml-1 capitalize">{agent.status}</span>
                          </Badge>
                          {agent.coordinates && (
                            <span className="text-xs text-muted-foreground">
                              ({agent.coordinates.q}, {agent.coordinates.r})
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-1">{agent.name}</h4>
                        
                        {agent.currentTask && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-green-600">Current Task:</span>
                            <p className="text-sm text-muted-foreground">{agent.currentTask}</p>
                          </div>
                        )}
                        
                        {agent.currentProject && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Project:</span>
                            <span className="text-sm ml-2">{agent.currentProject}</span>
                            {agent.currentClient && (
                              <span className="text-sm text-muted-foreground"> • {agent.currentClient}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Last active: {getTimeAgo(agent.lastActivity)}</span>
                          <span>Tasks: {agent.tasksCompleted}</span>
                          <span>Connections: {agent.connections}</span>
                          <span>Memory: {agent.memoryNodes} nodes</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.specialization.map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{agent.efficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                        <Progress value={agent.efficiency} className="w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4">
                {projectActivities.map((project) => (
                  <Card key={project.projectId} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{project.projectName}</h4>
                          <Badge variant="outline">{project.clientName}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium">Active Agents:</span>
                            <span className="text-sm ml-2">{project.activeAgents}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Progress:</span>
                            <span className="text-sm ml-2">{project.completedTasks}/{project.totalTasks} tasks</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Started:</span>
                            <span className="text-sm ml-2">{formatTime(project.startTime)}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Est. Completion:</span>
                            <span className="text-sm ml-2">{formatTime(project.estimatedCompletion)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.domains.map((domain) => (
                            <Badge key={domain} className={`${getDomainColor(domain)} text-white text-xs`}>
                              {domain.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {Math.round((project.completedTasks / project.totalTasks) * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                        <Progress 
                          value={(project.completedTasks / project.totalTasks) * 100} 
                          className="w-32" 
                        />
                      </div>
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