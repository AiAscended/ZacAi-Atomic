/**
 * File: app/admin/system/page.tsx
 * Purpose: System-wide settings with persistence
 * Features: Location/timezone, save confirmation, last updated display
 */

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";

interface SystemSettings {
  systemName: string;
  timezone: string;
  location: string;
  maxConcurrentRequests: number;
  requestTimeout: number;
  enableLogging: boolean;
  logLevel: string;
  theme: string;
  updatedAt: string;
}

export default function SystemPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SystemSettings>({
    systemName: "ZacAi-Atomic",
    timezone: "America/New_York",
    location: "United States",
    maxConcurrentRequests: 10,
    requestTimeout: 30000,
    enableLogging: true,
    logLevel: "info",
    theme: "system",
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/settings/system");
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        // Sync theme with loaded settings
        if (result.data.theme && result.data.theme !== theme) {
          setTheme(result.data.theme);
        }
      } else {
        setError(result.error || "Failed to load settings");
      }
    } catch (err) {
      setError("Network error loading settings");
      console.error("[System Settings] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setShowSuccess(false);

      const response = await fetch("/api/admin/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          theme: theme || "system",
          updatedAt: new Date().toISOString(),
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
      console.error("[System Settings] Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      systemName: "ZacAi-Atomic",
      timezone: "America/New_York",
      location: "United States",
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      enableLogging: true,
      logLevel: "info",
      theme: "system",
      updatedAt: new Date().toISOString(),
    });
    setTheme("system");
  };

  const currentTheme = theme === "system" ? systemTheme : theme;

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Dubai",
    "Australia/Sydney",
    "UTC",
  ];

  const logLevels = ["debug", "info", "warn", "error"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Settings</h1>
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
            <p>Settings saved successfully!</p>
          </div>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="location">Location & Timezone</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) =>
                    setSettings({ ...settings, systemName: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Display name for your AI system
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Location & Timezone</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, California, USA"
                  value={settings.location}
                  onChange={(e) =>
                    setSettings({ ...settings, location: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Your location for time-based features and regional settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Current time:{" "}
                  {new Date().toLocaleString("en-US", {
                    timeZone: settings.timezone,
                  })}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Theme</h2>
            {mounted && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="w-full flex items-center gap-2"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="w-full flex items-center gap-2"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="w-full flex items-center gap-2"
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current theme:{" "}
                    <span className="font-medium capitalize">
                      {currentTheme || "dark"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxConcurrent">Max Concurrent Requests</Label>
                <Input
                  id="maxConcurrent"
                  type="number"
                  value={settings.maxConcurrentRequests}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxConcurrentRequests: parseInt(e.target.value) || 10,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of simultaneous AI requests (1-100)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Request Timeout (milliseconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={settings.requestTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requestTimeout: parseInt(e.target.value) || 30000,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How long to wait before timing out (5000-120000 ms)
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Monitoring & Logging</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableLogging">Enable Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log system events and requests
                  </p>
                </div>
                <Switch
                  id="enableLogging"
                  checked={settings.enableLogging}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableLogging: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <Select
                  value={settings.logLevel}
                  onValueChange={(value) =>
                    setSettings({ ...settings, logLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {logLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Minimum severity level to log
                </p>
              </div>
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
