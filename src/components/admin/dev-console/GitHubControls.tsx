/**
 * File: src/components/admin/dev-console/GitHubControls.tsx
 * Purpose: GitHub branch management controls for dev console
 * 
 * Features:
 * - Create experimental branches
 * - Create backup branches
 * - List and manage branches
 * - Commit changes with reasoning
 * - Create pull requests
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GitHubControlsProps {
  currentFile?: string;
  fileContent?: string;
}

interface Branch {
  name: string;
  sha: string;
  protected: boolean;
}

export function GitHubControls({ currentFile, fileContent }: GitHubControlsProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Branch creation state
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");

  // Commit state
  const [commitBranch, setCommitBranch] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [reasoning, setReasoning] = useState("");

  // PR state
  const [prBranch, setPrBranch] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prReasoning, setPrReasoning] = useState("");

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dev-console/github/branch");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load branches");
      }

      const data = await response.json();
      setBranches(data.branches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createExperimentalBranch() {
    if (!featureName.trim()) {
      alert("Please enter a feature name");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dev-console/github/branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "experimental",
          featureName: featureName.trim().replace(/\s+/g, "-").toLowerCase(),
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create branch");
      }

      const data = await response.json();
      alert(`Created branch: ${data.branch}`);
      setFeatureName("");
      setDescription("");
      loadBranches();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createBackupBranch() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dev-console/github/branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "backup",
          version: version || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create backup");
      }

      const data = await response.json();
      alert(`Created backup: ${data.branch}`);
      setVersion("");
      loadBranches();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function commitChanges() {
    if (!commitBranch || !commitMessage) {
      alert("Branch and commit message are required");
      return;
    }

    if (!currentFile || !fileContent) {
      alert("No file is currently open to commit");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dev-console/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: commitBranch,
          message: commitMessage,
          files: [
            {
              path: currentFile,
              content: fileContent,
            },
          ],
          reasoning: reasoning || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to commit");
      }

      const data = await response.json();
      alert(`Committed successfully: ${data.sha}`);
      setCommitMessage("");
      setReasoning("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createPullRequest() {
    if (!prBranch || !prTitle || !prReasoning) {
      alert("Branch, title, and reasoning are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dev-console/github/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: prBranch,
          featureName: prTitle,
          reasoning: prReasoning,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create PR");
      }

      const data = await response.json();
      alert(`Created PR #${data.prNumber}: ${data.prUrl}`);
      setPrTitle("");
      setPrReasoning("");
      window.open(data.prUrl, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBranch(branchName: string) {
    if (!confirm(`Delete branch ${branchName}?`)) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/dev-console/github/branch?branch=${encodeURIComponent(branchName)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete branch");
      }

      alert(`Deleted branch: ${branchName}`);
      loadBranches();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GitHub Operations</CardTitle>
        <CardDescription>
          Manage experimental branches, commits, and pull requests for ZacAi self-learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <Tabs defaultValue="branches" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="commit">Commit</TabsTrigger>
            <TabsTrigger value="pr">Pull Request</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Feature name (e.g., optimize-inference)"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                />
                <Button onClick={createExperimentalBranch} disabled={loading}>
                  Create Experimental
                </Button>
              </div>
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Experimental Branches</h4>
                <Button variant="outline" size="sm" onClick={loadBranches} disabled={loading}>
                  Refresh
                </Button>
              </div>

              {branches.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">No experimental branches found</p>
              )}

              <div className="space-y-2">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">{branch.sha.slice(0, 7)}</p>
                    </div>
                    <div className="flex gap-2">
                      {branch.protected && <Badge variant="secondary">Protected</Badge>}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBranch(branch.name)}
                        disabled={loading || branch.protected}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Commit Tab */}
          <TabsContent value="commit" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Branch</Label>
                <Input
                  placeholder="Branch name (e.g., zacai-experiment-...)"
                  value={commitBranch}
                  onChange={(e) => setCommitBranch(e.target.value)}
                />
              </div>
              <div>
                <Label>Commit Message</Label>
                <Input
                  placeholder="Brief description of changes"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                />
              </div>
              <div>
                <Label>Reasoning (Optional)</Label>
                <Textarea
                  placeholder="Explain why these changes were made..."
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={4}
                />
              </div>
              {currentFile && (
                <p className="text-sm text-muted-foreground">
                  Will commit: <span className="font-mono">{currentFile}</span>
                </p>
              )}
              <Button onClick={commitChanges} disabled={loading || !currentFile}>
                Commit to Branch
              </Button>
            </div>
          </TabsContent>

          {/* PR Tab */}
          <TabsContent value="pr" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Branch</Label>
                <Input
                  placeholder="Branch to create PR from"
                  value={prBranch}
                  onChange={(e) => setPrBranch(e.target.value)}
                />
              </div>
              <div>
                <Label>Feature Title</Label>
                <Input
                  placeholder="Name of the feature"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Reasoning</Label>
                <Textarea
                  placeholder="Explain the purpose and benefits of this feature..."
                  value={prReasoning}
                  onChange={(e) => setPrReasoning(e.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={createPullRequest} disabled={loading}>
                Create Pull Request
              </Button>
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Version (Optional)</Label>
                <Input
                  placeholder="e.g., v0.0.5"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
              <Button onClick={createBackupBranch} disabled={loading}>
                Create Backup Branch
              </Button>
              <p className="text-sm text-muted-foreground">
                Creates a snapshot of the current main branch for rollback purposes.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
