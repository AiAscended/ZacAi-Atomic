/**
 * File: src/app/admin/integrations/github-app/page.tsx
 * Purpose: Complete GitHub App integration admin UI
 * 
 * Features:
 * - Configure GitHub App credentials (App ID, Client ID)
 * - View installations and repositories
 * - Manage webhook settings
 * - Test connection status
 */

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface GitHubAppSettings {
  appId: string;
  clientId: string;
  installations: Installation[];
  webhookUrl?: string;
  enableAutoCommit: boolean;
  enablePRCreation: boolean;
  enableIssueSync: boolean;
  defaultBranch: string;
  commitMessagePrefix: string;
}

interface Installation {
  installationId: string;
  accountLogin: string;
  accountType: "User" | "Organization";
  installedAt: string;
  repositories: Repository[];
  permissions: Record<string, string>;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl?: string;
  description?: string;
}

export default function GitHubAppAdminPage() {
  const [settings, setSettings] = useState<GitHubAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/github-app/settings");
      
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.statusText}`);
      }
      
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
      setError(null);
      
      const response = await fetch("/api/admin/github-app/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }
      
      const updated = await response.json();
      setSettings(updated);
      alert("Settings saved successfully!");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      alert(`Failed to save: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  }

  async function loadInstallations() {
    try {
      setLoadingInstallations(true);
      setError(null);
      
      const response = await fetch("/api/admin/github-app/installations");
      
      if (!response.ok) {
        throw new Error(`Failed to load installations: ${response.statusText}`);
      }
      
      const data = await response.json();
      setInstallations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingInstallations(false);
    }
  }

  async function loadRepositories(installationId: string) {
    try {
      setError(null);
      setSelectedInstallation(installationId);
      
      const response = await fetch(`/api/admin/github-app/repositories?installationId=${installationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load repositories: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRepositories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const connectGitHubApp = () => {
    window.location.href = `/api/github-app/oauth/start`;
  };

  if (loading) {
    return <div className="p-6">Loading GitHub App settings...</div>;
  }

  if (!settings) {
    return <div className="p-6 text-red-600">Failed to load settings. Please check your configuration.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GitHub App Integration</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage your GitHub App integration
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="installations">Installations</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Credentials</CardTitle>
              <CardDescription>
                Configure your GitHub App credentials. Set GITHUB_APP_ID, GITHUB_APP_CLIENT_ID, 
                GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_WEBHOOK_SECRET as environment variables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appId">App ID</Label>
                <Input
                  id="appId"
                  value={settings.appId}
                  onChange={(e) => setSettings({ ...settings, appId: e.target.value })}
                  placeholder="123456"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={settings.clientId}
                  onChange={(e) => setSettings({ ...settings, clientId: e.target.value })}
                  placeholder="Iv1.abc123..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl || ""}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  placeholder="https://your-app.com/api/github-app/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultBranch">Default Branch</Label>
                <Input
                  id="defaultBranch"
                  value={settings.defaultBranch}
                  onChange={(e) => setSettings({ ...settings, defaultBranch: e.target.value })}
                  placeholder="main"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commitPrefix">Commit Message Prefix</Label>
                <Input
                  id="commitPrefix"
                  value={settings.commitMessagePrefix}
                  onChange={(e) => setSettings({ ...settings, commitMessagePrefix: e.target.value })}
                  placeholder="[AI]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
            <Button variant="outline" onClick={connectGitHubApp}>
              Connect GitHub App
            </Button>
          </div>
        </TabsContent>

        {/* Installations Tab */}
        <TabsContent value="installations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub App Installations</CardTitle>
              <CardDescription>
                View and manage where your GitHub App is installed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadInstallations} disabled={loadingInstallations}>
                {loadingInstallations ? "Loading..." : "Refresh Installations"}
              </Button>

              {installations.length === 0 && !loadingInstallations && (
                <p className="text-muted-foreground">No installations found. Connect your GitHub App first.</p>
              )}

              {installations.map((install) => (
                <Card key={install.installationId}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{install.accountLogin}</h3>
                          <Badge variant="outline">{install.accountType}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadRepositories(install.installationId)}
                        >
                          View Repositories
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Installed: {new Date(install.installedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedInstallation && repositories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Repositories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {repositories.map((repo) => (
                        <div key={repo.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{repo.fullName}</p>
                            {repo.description && (
                              <p className="text-sm text-muted-foreground">{repo.description}</p>
                            )}
                          </div>
                          <Badge variant={repo.private ? "secondary" : "outline"}>
                            {repo.private ? "Private" : "Public"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Features</CardTitle>
              <CardDescription>
                Enable or disable specific GitHub integration features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoCommit">Auto Commit</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically commit AI-generated changes
                  </p>
                </div>
                <Switch
                  id="autoCommit"
                  checked={settings.enableAutoCommit}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableAutoCommit: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prCreation">PR Creation</Label>
                  <p className="text-sm text-muted-foreground">
                    Create pull requests for changes
                  </p>
                </div>
                <Switch
                  id="prCreation"
                  checked={settings.enablePRCreation}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enablePRCreation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="issueSync">Issue Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Synchronize with GitHub Issues
                  </p>
                </div>
                <Switch
                  id="issueSync"
                  checked={settings.enableIssueSync}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableIssueSync: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Features"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
