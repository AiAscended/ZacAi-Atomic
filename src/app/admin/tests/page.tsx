/**
 * File: app/admin/tests/page.tsx
 * Purpose: System Tests Dashboard - Run and view AI system tests
 * Features: Test execution, results display, diagnostics
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileCode,
  Layers,
  Brain,
  GitBranch,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TestSuite {
  id: string
  name: string
  description: string
  category: 'unit' | 'integration' | 'performance' | 'production'
  icon: React.ComponentType<{ className?: string }>
  status: 'idle' | 'running' | 'passed' | 'failed' | 'warning'
  duration?: number
  passed?: number
  failed?: number
  total?: number
}

const TEST_SUITES: TestSuite[] = [
  {
    id: 'orchestration',
    name: 'Orchestration Tests',
    description: 'Main orchestrator and prompt processing pipeline',
    category: 'production',
    icon: Brain,
    status: 'idle',
  },
  {
    id: 'inference',
    name: 'Inference Engine Tests',
    description: 'Neural network inference and forward passes',
    category: 'performance',
    icon: Zap,
    status: 'idle',
  },
  {
    id: 'domains',
    name: 'Domain Registry Tests',
    description: 'All 23 knowledge domains operational',
    category: 'production',
    icon: Layers,
    status: 'idle',
  },
  {
    id: 'models',
    name: 'Multi-Modal Model Tests',
    description: 'All AI model layers and cross-modal fusion',
    category: 'integration',
    icon: GitBranch,
    status: 'idle',
  },
  {
    id: 'integration',
    name: 'End-to-End Integration',
    description: 'Complete AI pipeline from input to output',
    category: 'integration',
    icon: FileCode,
    status: 'idle',
  },
]

export default function SystemTestsPage() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>(TEST_SUITES)
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [overallStatus, setOverallStatus] = useState<{
    total: number
    passed: number
    failed: number
    duration: number
  } | null>(null)

  const runTest = async (suiteId: string) => {
    setTestSuites(prev =>
      prev.map(suite =>
        suite.id === suiteId ? { ...suite, status: 'running' } : suite
      )
    )

    try {
      // Simulate running tests (in production, call actual test runner)
      const response = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite: suiteId }),
      })

      if (!response.ok) {
        throw new Error('Test execution failed')
      }

      const result = await response.json()

      setTestSuites(prev =>
        prev.map(suite =>
          suite.id === suiteId
            ? {
                ...suite,
                status: result.failed === 0 ? 'passed' : 'failed',
                duration: result.duration,
                passed: result.passed,
                failed: result.failed,
                total: result.total,
              }
            : suite
        )
      )
    } catch (error) {
      console.error('Error running test:', error)
      setTestSuites(prev =>
        prev.map(suite =>
          suite.id === suiteId ? { ...suite, status: 'failed' } : suite
        )
      )
    }
  }

  const runAllTests = async () => {
    setIsRunningAll(true)
    const startTime = Date.now()

    for (const suite of testSuites) {
      await runTest(suite.id)
    }

    const duration = Date.now() - startTime
    const results = testSuites.map(s => ({
      passed: s.passed || 0,
      failed: s.failed || 0,
    }))

    setOverallStatus({
      total: results.reduce((sum, r) => sum + r.passed + r.failed, 0),
      passed: results.reduce((sum, r) => sum + r.passed, 0),
      failed: results.reduce((sum, r) => sum + r.failed, 0),
      duration,
    })

    setIsRunningAll(false)
  }

  const getStatusIcon = (status: TestSuite['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getCategoryColor = (category: TestSuite['category']) => {
    switch (category) {
      case 'production':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'integration':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'performance':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Tests</h1>
          <p className="text-muted-foreground mt-1">
            Run comprehensive tests for all AI system components
          </p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={isRunningAll}
          size="lg"
        >
          {isRunningAll ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {overallStatus && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall Results</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {overallStatus.passed} passed, {overallStatus.failed} failed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-green-500">
                  {Math.round((overallStatus.passed / overallStatus.total) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {(overallStatus.duration / 1000).toFixed(2)}s
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {testSuites.map((suite) => (
          <Card key={suite.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={cn(
                  "p-3 rounded-lg",
                  suite.status === 'passed' && "bg-green-500/10",
                  suite.status === 'failed' && "bg-red-500/10",
                  suite.status === 'running' && "bg-blue-500/10",
                  suite.status === 'idle' && "bg-gray-500/10"
                )}>
                  <suite.icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{suite.name}</h3>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getCategoryColor(suite.category))}
                    >
                      {suite.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {suite.description}
                  </p>

                  {suite.status !== 'idle' && suite.total && (
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{suite.passed} passed</span>
                      </div>
                      {suite.failed! > 0 && (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>{suite.failed} failed</span>
                        </div>
                      )}
                      {suite.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{(suite.duration / 1000).toFixed(2)}s</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(suite.status)}
                <Button
                  onClick={() => runTest(suite.id)}
                  disabled={suite.status === 'running' || isRunningAll}
                  variant="outline"
                  size="sm"
                >
                  {suite.status === 'running' ? 'Running...' : 'Run Test'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">Test Coverage</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comprehensive testing across all critical AI system components
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold">23</div>
            <div className="text-xs text-muted-foreground">Domains Tested</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">13+</div>
            <div className="text-xs text-muted-foreground">Model Layers</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">100+</div>
            <div className="text-xs text-muted-foreground">Test Cases</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">Test Suites</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
