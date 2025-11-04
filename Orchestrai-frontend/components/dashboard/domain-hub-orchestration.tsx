'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Network, 
  Brain, 
  Search, 
  Users, 
  FileText, 
  Shield,
  Activity,
  Zap,
  ArrowRight,
  Circle
} from 'lucide-react'

interface DomainHub {
  name: string
  type: 'claude-code' | 'nodejs' | 'hybrid'
  agentCount: number
  activeAgents: number
  status: 'active' | 'idle' | 'error'
  currentTasks: string[]
  performance: {
    avgResponseTime: number
    successRate: number
    throughput: number
  }
  subAgents: SubAgent[]
}

interface SubAgent {
  name: string
  specialization: string
  status: 'active' | 'idle' | 'busy'
  currentTask?: string
  performance: number
}

interface DomainHubOrchestrationProps {
  websocket: WebSocket | null
}

export function DomainHubOrchestration({ websocket }: DomainHubOrchestrationProps) {
  const [domainHubs, setDomainHubs] = useState<DomainHub[]>([])
  const [selectedHub, setSelectedHub] = useState<string | null>(null)
  const [crossDomainConnections, setCrossDomainConnections] = useState<any[]>([])

  useEffect(() => {
    fetchDomainHubStatus()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'domain_hub_status') {
          setDomainHubs(data.hubs)
          setCrossDomainConnections(data.connections)
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    const interval = setInterval(fetchDomainHubStatus, 5000)
    return () => clearInterval(interval)
  }, [websocket])

  const fetchDomainHubStatus = async () => {
    try {
      const response = await fetch('http://localhost:5501/domain-hubs/status')
      if (response.ok) {
        const data = await response.json()
        setDomainHubs([
          {
            name: 'SEO Domain Hub',
            type: 'claude-code',
            agentCount: 12,
            activeAgents: 8,
            status: 'active',
            currentTasks: ['Keyword Research', 'Competitor Analysis', 'Content Optimization'],
            performance: { avgResponseTime: 2.3, successRate: 98.5, throughput: 45 },
            subAgents: [
              { name: 'Keyword Researcher', specialization: 'Search Volume Analysis', status: 'active', performance: 95 },
              { name: 'Competitor Analyst', specialization: 'SERP Analysis', status: 'busy', currentTask: 'Analyzing QuartzIQ competitors', performance: 92 },
              { name: 'Content Optimizer', specialization: 'On-Page SEO', status: 'idle', performance: 97 }
            ]
          },
          {
            name: 'Quality Control Hub',
            type: 'hybrid',
            agentCount: 12,
            activeAgents: 6,
            status: 'active',
            currentTasks: ['Code Quality Check', 'Content Validation', 'Security Audit'],
            performance: { avgResponseTime: 1.8, successRate: 99.2, throughput: 32 },
            subAgents: [
              { name: 'Code Reviewer', specialization: 'Static Analysis', status: 'active', performance: 98 },
              { name: 'Security Auditor', specialization: 'Vulnerability Detection', status: 'busy', performance: 96 }
            ]
          },
          {
            name: 'Client Intelligence Hub',
            type: 'hybrid',
            agentCount: 10,
            activeAgents: 7,
            status: 'active',
            currentTasks: ['ICP Analysis', 'Psychographic Mapping', 'Cross-Domain Context'],
            performance: { avgResponseTime: 3.1, successRate: 97.8, throughput: 28 },
            subAgents: [
              { name: 'ICP Analyst', specialization: 'Customer Profiling', status: 'active', performance: 94 },
              { name: 'Psychographic Mapper', specialization: 'Behavioral Analysis', status: 'active', performance: 91 }
            ]
          },
          {
            name: 'Enhanced Content Hub',
            type: 'hybrid',
            agentCount: 13,
            activeAgents: 9,
            status: 'active',
            currentTasks: ['Multi-Language Content', 'Brand Voice', 'Content Strategy'],
            performance: { avgResponseTime: 2.7, successRate: 98.1, throughput: 38 },
            subAgents: [
              { name: 'Multi-Language Writer', specialization: 'EN/ES/NL/DE/SL', status: 'busy', performance: 93 },
              { name: 'Brand Voice Optimizer', specialization: 'Voice Consistency', status: 'active', performance: 96 }
            ]
          },
          {
            name: 'Web Quality Hub',
            type: 'claude-code',
            agentCount: 8,
            activeAgents: 5,
            status: 'active',
            currentTasks: ['Frontend QA', 'UX Validation', 'Performance Testing'],
            performance: { avgResponseTime: 1.9, successRate: 99.5, throughput: 25 },
            subAgents: [
              { name: 'Frontend QA', specialization: 'UI/UX Testing', status: 'active', performance: 99 },
              { name: 'Performance Tester', specialization: 'Core Web Vitals', status: 'idle', performance: 97 }
            ]
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching domain hub status:', error)
    }
  }

  const getHubIcon = (hubName: string) => {
    switch (hubName) {
      case 'SEO Domain Hub': return <Search className="h-5 w-5" />
      case 'Quality Control Hub': return <Shield className="h-5 w-5" />
      case 'Client Intelligence Hub': return <Users className="h-5 w-5" />
      case 'Enhanced Content Hub': return <FileText className="h-5 w-5" />
      case 'Web Quality Hub': return <Network className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'idle': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'busy': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'claude-code': return 'bg-purple-500/10 text-purple-500'
      case 'nodejs': return 'bg-green-500/10 text-green-500'
      case 'hybrid': return 'bg-blue-500/10 text-blue-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Domain Hubs Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {domainHubs.map((hub) => (
          <Card 
            key={hub.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedHub === hub.name ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedHub(selectedHub === hub.name ? null : hub.name)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {getHubIcon(hub.name)}
                <CardTitle className="text-sm font-medium truncate">
                  {hub.name.replace(' Hub', '')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className={getStatusColor(hub.status)}>
                    {hub.status}
                  </Badge>
                  <Badge className={getTypeColor(hub.type)} variant="outline">
                    {hub.type}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {hub.activeAgents}/{hub.agentCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active Agents
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Success</span>
                  <span className="font-medium">{hub.performance.successRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Hub Information */}
      {selectedHub && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHubIcon(selectedHub)}
              {selectedHub} - Detailed View
            </CardTitle>
            <CardDescription>
              Sub-agent status, performance metrics, and current tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="agents">Sub-Agents</TabsTrigger>
                <TabsTrigger value="tasks">Current Tasks</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="space-y-4">
                {domainHubs.find(h => h.name === selectedHub)?.subAgents.map((agent, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                        {agent.currentTask && (
                          <p className="text-sm text-blue-600 mt-1">
                            <Activity className="h-3 w-3 inline mr-1" />
                            {agent.currentTask}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                        <span className="text-sm font-medium">{agent.performance}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-3">
                {domainHubs.find(h => h.name === selectedHub)?.currentTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                    <span>{task}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                {(() => {
                  const hub = domainHubs.find(h => h.name === selectedHub)
                  return hub ? (
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {hub.performance.avgResponseTime}s
                          </div>
                          <p className="text-sm text-muted-foreground">Avg Response Time</p>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {hub.performance.successRate}%
                          </div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {hub.performance.throughput}
                          </div>
                          <p className="text-sm text-muted-foreground">Tasks/Hour</p>
                        </div>
                      </Card>
                    </div>
                  ) : null
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Cross-Domain Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Cross-Domain Communication
          </CardTitle>
          <CardDescription>
            Real-time communication flow between domain hubs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { from: 'SEO Hub', to: 'Content Hub', type: 'Keyword Data', active: true },
              { from: 'Client Intelligence', to: 'Content Hub', type: 'ICP Context', active: true },
              { from: 'Quality Control', to: 'Web Quality', type: 'Code Review', active: false },
              { from: 'Content Hub', to: 'Quality Control', type: 'Content Validation', active: true }
            ].map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{connection.from}</Badge>
                  <ArrowRight className="h-4 w-4" />
                  <Badge variant="outline">{connection.to}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{connection.type}</span>
                  <Circle className={`h-2 w-2 ${connection.active ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}