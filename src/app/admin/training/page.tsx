'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TrainingDashboard() {
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchData = async () => {
    try {
      const [statusRes, historyRes, settingsRes] = await Promise.all([
        fetch('/api/admin/training?view=status'),
        fetch('/api/admin/training?view=history'),
        fetch('/api/admin/training?view=settings'),
      ]);

      const statusData = await statusRes.json();
      const historyData = await historyRes.json();
      const settingsData = await settingsRes.json();

      if (statusData.success) setStatus(statusData.data);
      if (historyData.success) setHistory(historyData.data);
      if (settingsData.success) setSettings(settingsData.data);
    } catch (error) {
      console.error('Failed to fetch training data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerTraining = async (mode: string) => {
    setTriggering(true);
    try {
      const res = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', params: { mode } }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchData();
        alert(`Training ${mode} started successfully!`);
      } else {
        alert(`Failed to start training: ${data.error}`);
      }
    } catch (error) {
      console.error('Training trigger failed:', error);
      alert('Failed to trigger training');
    } finally {
      setTriggering(false);
    }
  };

  const stopTraining = async () => {
    try {
      const res = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchData();
        alert('Training stopped successfully!');
      }
    } catch (error) {
      console.error('Stop training failed:', error);
      alert('Failed to stop training');
    }
  };

  const updateSettings = async () => {
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/training', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Settings updated successfully!');
      } else {
        alert(`Failed to update settings: ${data.error}`);
      }
    } catch (error) {
      console.error('Update settings failed:', error);
      alert('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Training Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Training Management</h1>

      {status && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Status</CardTitle>
              <Badge className={status.isTraining ? 'bg-blue-500' : 'bg-gray-500'}>
                {status.isTraining ? 'TRAINING' : 'IDLE'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {status.isTraining && status.currentTraining ? (
              <div className="space-y-2">
                <p><span className="font-semibold">Mode:</span> {status.currentTraining.mode}</p>
                <p><span className="font-semibold">Started:</span> {new Date(status.currentTraining.timestamp).toLocaleString()}</p>
                <p><span className="font-semibold">Duration:</span> {(status.currentTraining.duration / 1000).toFixed(1)}s</p>
                <Button onClick={stopTraining} variant="destructive" size="sm" className="mt-2">
                  Stop Training
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No training in progress</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manual Training Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => triggerTraining('full')} disabled={triggering || status?.isTraining}>
              Full Training
            </Button>
            <Button onClick={() => triggerTraining('vocabulary')} disabled={triggering || status?.isTraining} variant="outline">
              Vocabulary Only
            </Button>
            <Button onClick={() => triggerTraining('seeds')} disabled={triggering || status?.isTraining} variant="outline">
              Seeds Only
            </Button>
            <Button onClick={() => triggerTraining('weights')} disabled={triggering || status?.isTraining} variant="outline">
              Weights Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Training Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule">Cron Schedule</Label>
                <Input id="schedule" value={settings.schedule} onChange={(e) => setSettings({ ...settings, schedule: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="confidence">Confidence Threshold</Label>
                <Input id="confidence" type="number" step="0.1" value={settings.confidenceThreshold} onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })} />
              </div>
            </div>
            <Button onClick={updateSettings}>Save Settings</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Training History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No training history available</p>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={item.status === 'completed' ? 'bg-green-500' : item.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}>
                      {item.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p><span className="font-semibold">Mode:</span> {item.mode}</p>
                  <p><span className="font-semibold">Duration:</span> {(item.duration / 1000).toFixed(1)}s</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
