'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TestTube,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  Target,
  Activity
} from 'lucide-react'

interface TestResult {
  status: 'passed' | 'failed' | 'pending' | 'skipped'
  duration?: number
  error?: string
  timestamp?: string
}

interface ServerTestResults {
  health: { status: string; lastRun: string | null; results: TestResult[] }
  functionality: { status: string; lastRun: string | null; results: TestResult[] }
  stress: { status: string; lastRun: string | null; results: TestResult[] }
  integration: { status: string; lastRun: string | null; results: TestResult[] }
  security: { status: string; lastRun: string | null; results: TestResult[] }
}

interface TestingStatus {
  initialized: boolean
  running: boolean
  activeTests: string[]
  scheduledTests: string[]
  metrics: {
    totalTests: number
    passedTests: number
    failedTests: number
    averageResponseTime: number
    reliabilityScore: number
  }
}

interface AutoSyncTestingPanelProps {
  websocket: WebSocket | null
}

export function AutoSyncTestingPanel({ websocket }: AutoSyncTestingPanelProps) {
  const [testingStatus, setTestingStatus] = useState<TestingStatus | null>(null)
  const [testResults, setTestResults] = useState<Record<string, ServerTestResults>>({})
  const [isInitializing, setIsInitializing] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchTestingStatus()
    fetchTestResults()
    
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.type === 'testing_status') {
          setTestingStatus(data.status)
          setLastUpdate(new Date().toISOString())
        }
        if (data.type === 'test_results') {
          setTestResults(data.results)
          setLastUpdate(new Date().toISOString())
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => websocket.removeEventListener('message', handleMessage)
    }

    // Fallback polling if WebSocket unavailable
    const interval = setInterval(() => {
      fetchTestingStatus()
      fetchTestResults()
    }, 15000)
    return () => clearInterval(interval)
  }, [websocket])

  const fetchTestingStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/testing/status')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTestingStatus(data.status)
          setLastUpdate(new Date().toISOString())
        }
      }
    } catch (error) {
      console.error('Error fetching testing status:', error)
    }
  }

  const fetchTestResults = async () => {
    try {
      const response = await fetch('http://localhost:3002/testing/results')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTestResults(data.data.results)
          setLastUpdate(new Date().toISOString())
        }
      }
    } catch (error) {
      console.error('Error fetching test results:', error)
    }
  }

  const initializeTesting = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch('http://localhost:3002/testing/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchTestingStatus()
          console.log('Testing system initialized successfully')
        }
      }
    } catch (error) {
      console.error('Error initializing testing:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const startTesting = async () => {
    setIsStarting(true)
    try {
      const response = await fetch('http://localhost:3002/testing/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchTestingStatus()
          console.log('Auto-sync testing started')
        }
      }
    } catch (error) {
      console.error('Error starting testing:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const stopTesting = async () => {
    setIsStopping(true)
    try {
      const response = await fetch('http://localhost:3002/testing/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchTestingStatus()
          console.log('Auto-sync testing stopped')
        }
      }
    } catch (error) {
      console.error('Error stopping testing:', error)
    } finally {
      setIsStopping(false)
    }
  }

  const runTestSuite = async (testType: string) => {
    try {
      const response = await fetch(`http://localhost:3002/testing/run/${testType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log(`${testType} test suite started`)
          // Refresh status after a brief delay
          setTimeout(fetchTestingStatus, 1000)
        }
      }
    } catch (error) {
      console.error(`Error running ${testType} tests:`, error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'running': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className="space-y-6">
      {/* Testing Control Panel */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testingStatus?.initialized ? (testingStatus.running ? 'Running' : 'Ready') : 'Not Initialized'}
            </div>
            <p className="text-xs text-muted-foreground">
              {testingStatus?.activeTests.length || 0} active tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reliability Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testingStatus?.metrics?.reliabilityScore?.toFixed(1) || '0.0'}%
            </div>
            <Progress 
              value={testingStatus?.metrics?.reliabilityScore || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testingStatus?.metrics?.totalTests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {testingStatus?.metrics?.passedTests || 0} passed, {testingStatus?.metrics?.failedTests || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testingStatus?.metrics?.averageResponseTime 
                ? formatDuration(testingStatus.metrics.averageResponseTime)
                : '0ms'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Across all servers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Auto-Sync Testing Control
          </CardTitle>
          <CardDescription>
            Manage automated testing for all MCP servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {!testingStatus?.initialized && (
              <Button
                onClick={initializeTesting}
                disabled={isInitializing}
                className="gap-2"
              >
                {isInitializing && <RefreshCw className="h-4 w-4 animate-spin" />}
                Initialize Testing
              </Button>
            )}
            
            {testingStatus?.initialized && !testingStatus.running && (
              <Button
                onClick={startTesting}
                disabled={isStarting}
                className="gap-2"
              >
                {isStarting && <RefreshCw className="h-4 w-4 animate-spin" />}
                <Play className="h-4 w-4" />
                Start Auto-Sync
              </Button>
            )}
            
            {testingStatus?.running && (
              <Button
                onClick={stopTesting}
                disabled={isStopping}
                variant="destructive"
                className="gap-2"
              >
                {isStopping && <RefreshCw className="h-4 w-4 animate-spin" />}
                <Square className="h-4 w-4" />
                Stop Auto-Sync
              </Button>
            )}

            {testingStatus?.initialized && (
              <>
                <Button
                  onClick={() => runTestSuite('health')}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Health Check
                </Button>
                <Button
                  onClick={() => runTestSuite('functionality')}
                  variant="outline"
                  className="gap-2"
                >
                  <Target className="h-4 w-4" />
                  Functionality
                </Button>
                <Button
                  onClick={() => runTestSuite('security')}
                  variant="outline"
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Security
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testingStatus?.initialized && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Results by Server
            </CardTitle>
            <CardDescription>
              Detailed testing results for each MCP server
              {lastUpdate && <span className="ml-2 text-xs">Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="functionality">Functionality</TabsTrigger>
                <TabsTrigger value="stress">Stress</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4">
                  {Object.entries(testResults).map(([serverName, results]) => (
                    <Card key={serverName} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{serverName}</h4>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(results.health.status)}>
                            Health: {results.health.status}
                          </Badge>
                          <Badge className={getStatusColor(results.functionality.status)}>
                            Func: {results.functionality.status}
                          </Badge>
                          <Badge className={getStatusColor(results.security.status)}>
                            Security: {results.security.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        {Object.entries(results).map(([testType, testData]) => (
                          <div key={testType} className="flex items-center gap-1">
                            {getStatusIcon(testData.status)}
                            <span className="capitalize">{testType}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {['health', 'functionality', 'stress', 'security'].map(testType => (
                <TabsContent key={testType} value={testType} className="space-y-4">
                  <div className="grid gap-4">
                    {Object.entries(testResults).map(([serverName, results]) => {
                      const testData = results[testType as keyof ServerTestResults]
                      return (
                        <Card key={serverName} className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold capitalize">{serverName}</h4>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(testData.status)}
                              <Badge className={getStatusColor(testData.status)}>
                                {testData.status}
                              </Badge>
                              {testData.lastRun && (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(testData.lastRun).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {testData.results && testData.results.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Recent Results:</p>
                              {testData.results.slice(0, 3).map((result, index) => (
                                <div key={index} className="text-xs bg-muted p-2 rounded">
                                  <div className="flex justify-between items-center">
                                    <span className={`font-medium ${
                                      result.status === 'passed' ? 'text-green-600' : 
                                      result.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                      {result.status.toUpperCase()}
                                    </span>
                                    {result.duration && (
                                      <span>{formatDuration(result.duration)}</span>
                                    )}
                                  </div>
                                  {result.error && (
                                    <p className="text-red-600 mt-1">{result.error}</p>
                                  )}
                                  {result.timestamp && (
                                    <p className="text-muted-foreground mt-1">
                                      {new Date(result.timestamp).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}