/**
 * Model Settings Page Component
 * Reusable component for all model configuration pages
 */

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, RotateCcw, Check, AlertCircle, Activity } from "lucide-react";

interface ModelSettings {
  enabled: boolean;
  type: string;
  parameters: Record<string, any>;
  performance: {
    maxLatency: number;
    cacheEnabled: boolean;
  };
  updatedAt: string;
}

interface ModelSettingsPageProps {
  modelName: string;
  modelTitle: string;
  modelDescription: string;
  defaultParameters: Record<string, any>;
}

export function ModelSettingsPage({
  modelName,
  modelTitle,
  modelDescription,
  defaultParameters,
}: ModelSettingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<ModelSettings>({
    enabled: true,
    type: modelName,
    parameters: defaultParameters,
    performance: {
      maxLatency: 5000,
      cacheEnabled: true,
    },
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    loadSettings();
  }, [modelName]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/settings/models?name=${modelName}`,
      );
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || "Failed to load settings");
      }
    } catch (err) {
      setError("Network error loading settings");
      console.error("[Model Settings] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setShowSuccess(false);

      const response = await fetch("/api/admin/settings/models", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName,
          settings: {
            ...settings,
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Network error saving settings");
      console.error("[Model Settings] Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      enabled: true,
      type: modelName,
      parameters: defaultParameters,
      performance: {
        maxLatency: 5000,
        cacheEnabled: true,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updateParameter = (key: string, value: unknown) => {
    setSettings({
      ...settings,
      parameters: {
        ...settings.parameters,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading model settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{modelTitle}</h1>
          <p className="text-muted-foreground mt-1">{modelDescription}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(settings.updatedAt).toLocaleString()}
        </div>
      </div>
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}
      {showSuccess && (
        <Card className="p-4 bg-green-500/10 border-green-500">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="h-5 w-5" />
            <p>Model settings saved successfully!</p>
          </div>
        </Card>
      )}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Model Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this model
                </p>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Model Type</Label>
              <Input
                id="type"
                value={settings.type}
                onChange={(e) =>
                  setSettings({ ...settings, type: e.target.value })
                }
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5" />
                <h3 className="font-semibold">Model Information</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Model ID:</span> {modelName}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {settings.enabled ? "✅ Active" : "❌ Disabled"}
                </p>
                <p>
                  <span className="font-medium">Parameters:</span>{" "}
                  {Object.keys(settings.parameters).length} configured
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Model Parameters</h2>
            <div className="space-y-4">
              {Object.entries(settings.parameters).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  {typeof value === "boolean" ? (
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        updateParameter(key, checked)
                      }
                    />
                  ) : typeof value === "number" ? (
                    <Input
                      id={key}
                      type="number"
                      value={value}
                      onChange={(e) =>
                        updateParameter(key, parseFloat(e.target.value) || 0)
                      }
                    />
                  ) : Array.isArray(value) ? (
                    <Textarea
                      id={key}
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          updateParameter(key, JSON.parse(e.target.value));
                        } catch {}
                      }}
                      className="font-mono text-sm"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={key}
                      value={String(value)}
                      onChange={(e) => updateParameter(key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Performance Settings</h2>

            <div className="space-y-2">
              <Label htmlFor="maxLatency">Max Latency (ms)</Label>
              <Input
                id="maxLatency"
                type="number"
                value={settings.performance.maxLatency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    performance: {
                      ...settings.performance,
                      maxLatency: parseInt(e.target.value) || 5000,
                    },
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Maximum allowed response time in milliseconds
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cacheEnabled">Enable Caching</Label>
                <p className="text-sm text-muted-foreground">
                  Cache responses for improved performance
                </p>
              </div>
              <Switch
                id="cacheEnabled"
                checked={settings.performance.cacheEnabled}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    performance: {
                      ...settings.performance,
                      cacheEnabled: checked,
                    },
                  })
                }
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex gap-3">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
