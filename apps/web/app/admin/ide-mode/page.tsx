/**
 * File: src/app/admin/ide-mode/page.tsx
 * Purpose: Admin page for IDE mode configuration
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IDEModeSettings } from "@/ai/shared/types/adminSettings";

export default function IDEModePage() {
  const [settings, setSettings] = useState<IDEModeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ide-mode");
      if (!response.ok) throw new Error("Failed to load settings");
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/ide-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      const updated = await response.json();
      setSettings(updated);
      alert("Settings saved successfully!");
    } catch (err) {
      alert(
        `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading IDE mode settings...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!settings) return <div className="p-6">No settings found</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IDE Mode Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure the integrated development environment experience
        </p>
      </div>

      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>IDE Mode</CardTitle>
          <CardDescription>
            Enable or disable the full IDE experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="ide-enabled">Enable IDE Mode</Label>
            <Switch
              id="ide-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>IDE Features</CardTitle>
          <CardDescription>
            Control which IDE features are available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Code Completion</Label>
            <Switch
              checked={settings.features.enableCodeCompletion}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: {
                    ...settings.features,
                    enableCodeCompletion: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Inline Chat</Label>
            <Switch
              checked={settings.features.enableInlineChat}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableInlineChat: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>File Tree</Label>
            <Switch
              checked={settings.features.enableFileTree}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableFileTree: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Terminal</Label>
            <Switch
              checked={settings.features.enableTerminal}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableTerminal: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Git Integration</Label>
            <Switch
              checked={settings.features.enableGitIntegration}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: {
                    ...settings.features,
                    enableGitIntegration: checked,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Editor Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.editor.theme}
              onValueChange={(value: "light" | "dark" | "auto") =>
                setSettings({
                  ...settings,
                  editor: { ...settings.editor, theme: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {settings.editor.fontSize}px</Label>
            <Slider
              value={[settings.editor.fontSize]}
              onValueChange={([value]) =>
                setSettings({
                  ...settings,
                  editor: { ...settings.editor, fontSize: value },
                })
              }
              min={8}
              max={32}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Tab Size: {settings.editor.tabSize}</Label>
            <Slider
              value={[settings.editor.tabSize]}
              onValueChange={([value]) =>
                setSettings({
                  ...settings,
                  editor: { ...settings.editor, tabSize: value },
                })
              }
              min={2}
              max={8}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Word Wrap</Label>
            <Switch
              checked={settings.editor.wordWrap}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  editor: { ...settings.editor, wordWrap: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Minimap</Label>
            <Switch
              checked={settings.editor.minimap}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  editor: { ...settings.editor, minimap: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assistance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Contextual Suggestions</Label>
            <Switch
              checked={settings.ai.enableContextualSuggestions}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  ai: { ...settings.ai, enableContextualSuggestions: checked },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Suggestion Delay: {settings.ai.suggestionDelay}ms</Label>
            <Slider
              value={[settings.ai.suggestionDelay]}
              onValueChange={([value]) =>
                setSettings({
                  ...settings,
                  ai: { ...settings.ai, suggestionDelay: value },
                })
              }
              min={0}
              max={2000}
              step={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Suggestions: {settings.ai.maxSuggestions}</Label>
            <Slider
              value={[settings.ai.maxSuggestions]}
              onValueChange={([value]) =>
                setSettings({
                  ...settings,
                  ai: { ...settings.ai, maxSuggestions: value },
                })
              }
              min={1}
              max={10}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={loadSettings} disabled={loading}>
          Reset
        </Button>
      </div>
    </div>
  );
}
