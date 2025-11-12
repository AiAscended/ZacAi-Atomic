'use client';

/**
 * Admin Metrics Dashboard
 * 
 * Real-time system performance monitoring
 * Displays system health, domain metrics, model metrics
 */

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SystemMetrics {
  timestamp: string;
  system: {
    platform: string;
    memoryUsage: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
  };
  ai: {
    totalInferences: number;
    successfulInferences: number;
    failedInferences: number;
    averageConfidence: number;
    averageLatency: number;
    domainsActive: number;
  };
  performance: {
    requestsPerMinute: number;
    errorRate: number;
    p95Latency: number;
    p99Latency: number;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  recommendations: string[];
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch('/api/admin/metrics?type=system'),
        fetch('/api/admin/metrics?type=health'),
      ]);

      const metricsData = await metricsRes.json();
      const healthData = await healthRes.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (healthData.success) setHealth(healthData.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">System Metrics</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Metrics</h1>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </Button>
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Health</CardTitle>
              <Badge className={getStatusColor(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {health.issues.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-sm">Issues:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {health.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-red-600">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {health.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {health.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-blue-600">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {health.issues.length === 0 && (
              <p className="text-sm text-green-600">System is operating normally</p>
            )}
          </CardContent>
        </Card>
      )}

      {metrics && (
        <>
          {/* AI Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Inferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.ai.totalInferences}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Success: {metrics.ai.successfulInferences} | Failed: {metrics.ai.failedInferences}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(metrics.ai.averageConfidence * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">AI Certainty Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.ai.averageLatency.toFixed(0)}ms</div>
                <p className="text-xs text-gray-500 mt-1">Response Time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.ai.domainsActive}</div>
                <p className="text-xs text-gray-500 mt-1">Knowledge Domains</p>
              </CardContent>
            </Card>
          </div>

          {/* System Resources */}
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span className="font-mono">{metrics.system.memoryUsage.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${metrics.system.memoryUsage.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatBytes(metrics.system.memoryUsage.used)} / {formatBytes(metrics.system.memoryUsage.total)}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Error Rate</span>
                    <span className="font-mono">{metrics.performance.errorRate.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.performance.errorRate > 10 ? 'bg-red-600' :
                        metrics.performance.errorRate > 5 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(metrics.performance.errorRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Requests/Min</p>
                  <p className="text-2xl font-bold">{metrics.performance.requestsPerMinute}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">P95 Latency</p>
                  <p className="text-2xl font-bold">{metrics.performance.p95Latency.toFixed(0)}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">P99 Latency</p>
                  <p className="text-2xl font-bold">{metrics.performance.p99Latency.toFixed(0)}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Platform</p>
                  <p className="text-2xl font-bold">{metrics.system.platform}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
