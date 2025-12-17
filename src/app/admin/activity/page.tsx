/**
 * System Activity Log Viewer
 * Real-time system activity monitoring for administrators
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Activity, Database, MessageSquare, Settings } from 'lucide-react';

type ActivityEventMetaValue = string | number | boolean | null | ActivityEventMeta;

interface ActivityEventMeta {
  [key: string]: ActivityEventMetaValue | ActivityEventMetaValue[];
}

interface ActivityEvent {
  ts: string;
  type: string;
  message: string;
  meta?: Record<string, unknown>;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/activity');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadEvents, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getEventIcon = (type: string) => {
    if (type.includes('chat')) return <MessageSquare className="h-4 w-4" />;
    if (type.includes('settings')) return <Settings className="h-4 w-4" />;
    if (type.includes('database') || type.includes('save')) return <Database className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getEventColor = (type: string) => {
    if (type.includes('create')) return 'bg-green-500/10 text-green-500';
    if (type.includes('delete')) return 'bg-red-500/10 text-red-500';
    if (type.includes('update') || type.includes('save')) return 'bg-blue-500/10 text-blue-500';
    return 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Activity</h1>
          <p className="text-muted-foreground">Real-time monitoring of system events</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button onClick={loadEvents} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Recent system events and user actions ({events.length} events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity events recorded yet
              </div>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.ts).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{event.message}</p>
                    {event.meta && Object.keys(event.meta).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground font-mono">
                        {JSON.stringify(event.meta, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
