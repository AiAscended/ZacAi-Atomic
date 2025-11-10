/**
 * Admin Settings Page
 * Global system configuration and management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCcw, Settings, Database, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  general: {
    systemName: string;
    version: string;
    environment: string;
    maintenanceMode: boolean;
  };
  ai: {
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    streamingEnabled: boolean;
  };
  security: {
    rateLimitEnabled: boolean;
    rateLimitPerMinute: number;
    corsEnabled: boolean;
    csrfProtection: boolean;
    healthCheckEnabled: boolean;
  };
  storage: {
    chatHistoryEnabled: boolean;
    chatHistoryRetentionDays: number;
    activityLogEnabled: boolean;
    activityLogRetentionDays: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const getDefaultSettings = function (): SystemSettings {
    return {
      general: {
        systemName: 'ZacAi-Atomic',
        version: '0.0.2',
        environment: 'production',
        maintenanceMode: false,
      },
      ai: {
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        streamingEnabled: true,
      },
      security: {
        rateLimitEnabled: true,
        rateLimitPerMinute: 60,
        corsEnabled: true,
        csrfProtection: true,
        healthCheckEnabled: true,
      },
      storage: {
        chatHistoryEnabled: true,
        chatHistoryRetentionDays: 90,
        activityLogEnabled: true,
        activityLogRetentionDays: 30,
      },
    };
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/system');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Use default settings if none exist
        setSettings(getDefaultSettings());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: 'Settings saved',
          description: 'System settings have been updated successfully.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('[System Settings] Save error', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: unknown) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure global system parameters</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Zap className="h-4 w-4 mr-2" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="h-4 w-4 mr-2" />
            Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={settings.general.systemName}
                    onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={settings.general.version}
                    onChange={(e) => updateSetting('general', 'version', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Badge variant={settings.general.environment === 'production' ? 'default' : 'secondary'}>
                  {settings.general.environment}
                </Badge>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="maintenance" className="flex flex-col space-y-1">
                  <span>Maintenance Mode</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Temporarily disable the system for maintenance
                  </span>
                </Label>
                <Switch
                  id="maintenance"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure AI model parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.ai.maxTokens}
                    onChange={(e) => updateSetting('ai', 'maxTokens', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={settings.ai.temperature}
                    onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topP">Top P</Label>
                  <Input
                    id="topP"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.ai.topP}
                    onChange={(e) => updateSetting('ai', 'topP', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                  <Input
                    id="frequencyPenalty"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={settings.ai.frequencyPenalty}
                    onChange={(e) => updateSetting('ai', 'frequencyPenalty', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="streaming" className="flex flex-col space-y-1">
                  <span>Streaming Enabled</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Stream responses in real-time
                  </span>
                </Label>
                <Switch
                  id="streaming"
                  checked={settings.ai.streamingEnabled}
                  onCheckedChange={(checked) => updateSetting('ai', 'streamingEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and protection features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="rateLimit" className="flex flex-col space-y-1">
                  <span>Rate Limiting</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Limit requests per minute
                  </span>
                </Label>
                <Switch
                  id="rateLimit"
                  checked={settings.security.rateLimitEnabled}
                  onCheckedChange={(checked) => updateSetting('security', 'rateLimitEnabled', checked)}
                />
              </div>
              {settings.security.rateLimitEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="rateLimitPerMinute">Requests Per Minute</Label>
                  <Input
                    id="rateLimitPerMinute"
                    type="number"
                    value={settings.security.rateLimitPerMinute}
                    onChange={(e) => updateSetting('security', 'rateLimitPerMinute', parseInt(e.target.value))}
                  />
                </div>
              )}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="cors" className="flex flex-col space-y-1">
                  <span>CORS Enabled</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Allow cross-origin requests
                  </span>
                </Label>
                <Switch
                  id="cors"
                  checked={settings.security.corsEnabled}
                  onCheckedChange={(checked) => updateSetting('security', 'corsEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="csrf" className="flex flex-col space-y-1">
                  <span>CSRF Protection</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Protect against cross-site request forgery
                  </span>
                </Label>
                <Switch
                  id="csrf"
                  checked={settings.security.csrfProtection}
                  onCheckedChange={(checked) => updateSetting('security', 'csrfProtection', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="healthCheck" className="flex flex-col space-y-1">
                  <span>Health Check Endpoint</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Enable /api/health endpoint
                  </span>
                </Label>
                <Switch
                  id="healthCheck"
                  checked={settings.security.healthCheckEnabled}
                  onCheckedChange={(checked) => updateSetting('security', 'healthCheckEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>Configure data storage and retention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="chatHistory" className="flex flex-col space-y-1">
                  <span>Chat History</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Save chat conversations
                  </span>
                </Label>
                <Switch
                  id="chatHistory"
                  checked={settings.storage.chatHistoryEnabled}
                  onCheckedChange={(checked) => updateSetting('storage', 'chatHistoryEnabled', checked)}
                />
              </div>
              {settings.storage.chatHistoryEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="chatRetention">Chat History Retention (days)</Label>
                  <Input
                    id="chatRetention"
                    type="number"
                    value={settings.storage.chatHistoryRetentionDays}
                    onChange={(e) => updateSetting('storage', 'chatHistoryRetentionDays', parseInt(e.target.value))}
                  />
                </div>
              )}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="activityLog" className="flex flex-col space-y-1">
                  <span>Activity Logging</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Track system activities
                  </span>
                </Label>
                <Switch
                  id="activityLog"
                  checked={settings.storage.activityLogEnabled}
                  onCheckedChange={(checked) => updateSetting('storage', 'activityLogEnabled', checked)}
                />
              </div>
              {settings.storage.activityLogEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="activityRetention">Activity Log Retention (days)</Label>
                  <Input
                    id="activityRetention"
                    type="number"
                    value={settings.storage.activityLogRetentionDays}
                    onChange={(e) => updateSetting('storage', 'activityLogRetentionDays', parseInt(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
