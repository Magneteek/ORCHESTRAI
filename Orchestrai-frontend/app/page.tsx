'use client'

import { useEffect, useState } from 'react'
import { Brain, Activity, Network, Database } from 'lucide-react'

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

  // Create stable hexagon pattern
  const hexagonPattern = [
    'bg-blue-400', 'bg-slate-700', 'bg-purple-400/50', 'bg-blue-400', 'bg-slate-700', 'bg-purple-400/50',
    'bg-slate-700', 'bg-purple-400/50', 'bg-blue-400', 'bg-slate-700', 'bg-blue-400', 'bg-purple-400/50',
    'bg-purple-400/50', 'bg-blue-400', 'bg-slate-700', 'bg-purple-400/50', 'bg-blue-400', 'bg-slate-700'
  ]

  // Fetch metrics from orchestrator
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

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setError('WebSocket connection failed')
        }

        ws.onclose = () => {
          setConnected(false)
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }
      } catch (err) {
        console.error('Failed to establish WebSocket connection:', err)
        setError('Failed to establish WebSocket connection')
      }
    }

    // Initial metrics fetch
    fetchMetrics()
    
    // Start WebSocket connection
    connectWebSocket()

    // Fallback: fetch metrics every 5 seconds if WebSocket fails
    const fallbackInterval = setInterval(() => {
      if (!connected) {
        fetchMetrics()
      }
    }, 5000)

    return () => {
      if (ws) {
        ws.close()
      }
      clearInterval(fallbackInterval)
    }
  }, [])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ORCHESTRAI
              </h1>
              <p className="text-slate-400 text-lg">Crystalline Memory Architecture Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-slate-400">
                {connected ? 'Connected' : error ? 'Disconnected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 crystalline-glow">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Memory Nodes</p>
                <p className="text-2xl font-bold text-blue-400">{metrics.memoryNodes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Active Agents</p>
                <p className="text-2xl font-bold text-green-400">{metrics.activeAgents}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-slate-400 text-sm">Pipeline Sharing</p>
                <p className="text-2xl font-bold text-purple-400">{metrics.pipelineSharing}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Database className={`w-8 h-8 ${
                metrics.redisStatus === 'Connected' ? 'text-green-400' :
                metrics.redisStatus === 'Error' ? 'text-red-400' : 
                'text-orange-400'
              }`} />
              <div>
                <p className="text-slate-400 text-sm">Redis Status</p>
                <p className={`text-2xl font-bold ${
                  metrics.redisStatus === 'Connected' ? 'text-green-400' :
                  metrics.redisStatus === 'Error' ? 'text-red-400' : 
                  'text-orange-400'
                }`}>{metrics.redisStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crystalline Memory Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 hexagon"></div>
              Crystalline Memory Lattice
            </h3>
            <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center">
              <div className="text-slate-400">
                <div className="grid grid-cols-6 gap-2">
                  {hexagonPattern.map((color, i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 hexagon ${color}`}
                    />
                  ))}
                </div>
                <p className="text-center mt-4">Hexagonal Memory Nodes</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Orchestrator Uptime</span>
                <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">{metrics.uptimeFormatted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Requests</span>
                <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">{metrics.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Pipeline Coordinator</span>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  metrics.pipelineSharing === 'Active' 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}>{metrics.pipelineSharing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Domain Agents</span>
                <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">{metrics.activeAgents} Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">WebSocket Connection</span>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  connected 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-red-900/50 text-red-400'
                }`}>{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Information */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Current Phase: Foundation Complete</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Crystalline Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Dashboard Visualization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Redis Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Clean Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}