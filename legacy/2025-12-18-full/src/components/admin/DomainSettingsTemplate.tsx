/**
 * Domain Settings Template
 * Usage: Individual configuration for each of the 23 knowledge domains
 * Location: /app/admin/domains/[domain]/page.tsx
 */

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, X } from "lucide-react";
import { useParams } from "next/navigation";

interface DomainSettings {
  enabled: boolean;
  confidenceThreshold: number;
  maxTokens: number;
  temperature: number;
  description: string;
  keywords: string[];
  priority: number;
  updatedAt: string;
}

const DOMAIN_INFO: Record<
  string,
  { title: string; description: string; defaultKeywords: string[] }
> = {
  react: {
    title: "React",
    description: "React library, hooks, components, JSX, state management",
    defaultKeywords: [
      "react",
      "jsx",
      "hooks",
      "components",
      "useState",
      "useEffect",
      "props",
    ],
  },
  nextjs: {
    title: "Next.js",
    description: "Next.js framework, app router, server components, API routes",
    defaultKeywords: [
      "nextjs",
      "app router",
      "server components",
      "metadata",
      "routing",
    ],
  },
  typescript: {
    title: "TypeScript",
    description: "TypeScript types, interfaces, generics, type safety",
    defaultKeywords: [
      "typescript",
      "types",
      "interfaces",
      "generics",
      "tsconfig",
    ],
  },
  javascript: {
    title: "JavaScript",
    description: "JavaScript language, ES6+, async/await, promises",
    defaultKeywords: ["javascript", "es6", "async", "promises", "closures"],
  },
  python: {
    title: "Python",
    description: "Python programming, data structures, libraries",
    defaultKeywords: [
      "python",
      "pip",
      "virtual environment",
      "pandas",
      "numpy",
    ],
  },
  atomic: {
    title: "Atomic AI",
    description: "Atomic modular AI architecture, domain orchestration",
    defaultKeywords: [
      "atomic",
      "modular",
      "orchestration",
      "domains",
      "routing",
    ],
  },
  inference: {
    title: "Inference",
    description: "Model inference, prediction, response generation",
    defaultKeywords: [
      "inference",
      "prediction",
      "generation",
      "latency",
      "optimization",
    ],
  },
  embeddings: {
    title: "Embeddings",
    description: "Vector embeddings, semantic search, similarity",
    defaultKeywords: [
      "embeddings",
      "vectors",
      "semantic",
      "similarity",
      "cosine",
    ],
  },
  monitoring: {
    title: "Monitoring",
    description: "System monitoring, metrics, observability",
    defaultKeywords: [
      "monitoring",
      "metrics",
      "observability",
      "logs",
      "alerts",
    ],
  },
  configuration: {
    title: "Configuration",
    description: "System configuration, settings, environment",
    defaultKeywords: [
      "config",
      "settings",
      "environment",
      "parameters",
      "options",
    ],
  },
  system: {
    title: "System",
    description: "System operations, architecture, infrastructure",
    defaultKeywords: [
      "system",
      "architecture",
      "infrastructure",
      "deployment",
      "scaling",
    ],
  },
  observability: {
    title: "Observability",
    description: "Logging, tracing, debugging, performance",
    defaultKeywords: [
      "observability",
      "logging",
      "tracing",
      "debugging",
      "performance",
    ],
  },
  "data-integrity": {
    title: "Data Integrity",
    description: "Data validation, consistency, quality checks",
    defaultKeywords: [
      "validation",
      "consistency",
      "integrity",
      "quality",
      "verification",
    ],
  },
  repair: {
    title: "Repair",
    description: "Error correction, recovery, self-healing",
    defaultKeywords: ["repair", "recovery", "healing", "correction", "fix"],
  },
  mathematics: {
    title: "Mathematics",
    description: "Mathematical operations, calculations, algorithms",
    defaultKeywords: [
      "mathematics",
      "calculus",
      "algebra",
      "statistics",
      "equations",
    ],
  },
  "internet-search": {
    title: "Internet Search",
    description: "Web search, information retrieval, APIs",
    defaultKeywords: ["search", "web", "api", "scraping", "retrieval"],
  },
  grammar: {
    title: "Grammar",
    description: "Grammar checking, language rules, correction",
    defaultKeywords: [
      "grammar",
      "syntax",
      "punctuation",
      "spelling",
      "correction",
    ],
  },
  english: {
    title: "English",
    description: "English language, writing, communication",
    defaultKeywords: [
      "english",
      "writing",
      "communication",
      "vocabulary",
      "composition",
    ],
  },
  science: {
    title: "Science",
    description: "Scientific knowledge, research, methodology",
    defaultKeywords: [
      "science",
      "research",
      "methodology",
      "experiments",
      "theory",
    ],
  },
  "code-review": {
    title: "Code Review",
    description: "Code analysis, best practices, quality",
    defaultKeywords: [
      "code review",
      "analysis",
      "quality",
      "best practices",
      "refactoring",
    ],
  },
  "error-detection": {
    title: "Error Detection",
    description: "Bug detection, error analysis, debugging",
    defaultKeywords: ["error", "bug", "debugging", "detection", "analysis"],
  },
  testing: {
    title: "Testing",
    description: "Unit tests, integration tests, test coverage",
    defaultKeywords: [
      "testing",
      "unit tests",
      "integration",
      "coverage",
      "jest",
    ],
  },
  documentation: {
    title: "Documentation",
    description: "Code documentation, API docs, comments",
    defaultKeywords: [
      "documentation",
      "comments",
      "api docs",
      "readme",
      "guides",
    ],
  },
  security: {
    title: "Security",
    description: "Security best practices, vulnerabilities, authentication",
    defaultKeywords: [
      "security",
      "authentication",
      "authorization",
      "vulnerabilities",
      "encryption",
    ],
  },
  algorithms: {
    title: "Algorithms",
    description: "Algorithm design, complexity, optimization",
    defaultKeywords: [
      "algorithms",
      "complexity",
      "optimization",
      "sorting",
      "searching",
    ],
  },
  "data-structures": {
    title: "Data Structures",
    description: "Arrays, trees, graphs, hash tables",
    defaultKeywords: [
      "data structures",
      "arrays",
      "trees",
      "graphs",
      "hash tables",
    ],
  },
  "version-control": {
    title: "Version Control",
    description: "Git, GitHub, branching, merging",
    defaultKeywords: [
      "git",
      "github",
      "version control",
      "branching",
      "commits",
    ],
  },
  environment: {
    title: "Environment",
    description: "Development environment, setup, configuration",
    defaultKeywords: [
      "environment",
      "setup",
      "configuration",
      "dependencies",
      "tools",
    ],
  },
  general: {
    title: "General",
    description: "General programming knowledge and concepts",
    defaultKeywords: [
      "programming",
      "development",
      "software",
      "coding",
      "general",
    ],
  },
};

export default function DomainSettingsPage() {
  const params = useParams();
  const domainName = params.domain as string;
  const domainInfo = DOMAIN_INFO[domainName] || {
    title: domainName,
    description: `Configuration for ${domainName} domain`,
    defaultKeywords: [domainName],
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState("");

  const [settings, setSettings] = useState<DomainSettings>({
    enabled: true,
    confidenceThreshold: 0.7,
    maxTokens: 2000,
    temperature: 0.7,
    description: domainInfo.description,
    keywords: domainInfo.defaultKeywords,
    priority: 5,
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    loadSettings();
  }, [domainName]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/settings/domains?name=${domainName}`,
      );
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || "Failed to load settings");
      }
    } catch (err) {
      setError("Network error loading settings");
      console.error("[Domain Settings] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setShowSuccess(false);

      const response = await fetch("/api/admin/settings/domains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName,
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
      console.error("[Domain Settings] Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      enabled: true,
      confidenceThreshold: 0.7,
      maxTokens: 2000,
      temperature: 0.7,
      description: domainInfo.description,
      keywords: domainInfo.defaultKeywords,
      priority: 5,
      updatedAt: new Date().toISOString(),
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !settings.keywords.includes(newKeyword.trim())) {
      setSettings({
        ...settings,
        keywords: [...settings.keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings({
      ...settings,
      keywords: settings.keywords.filter((k) => k !== keyword),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading domain settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{domainInfo.title} Domain</h1>
          <p className="text-muted-foreground mt-1">{domainInfo.description}</p>
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
            <p>Domain settings saved successfully!</p>
          </div>
        </Card>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Domain Status</Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable this domain
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={settings.description}
            onChange={(e) =>
              setSettings({ ...settings, description: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>
            Confidence Threshold: {settings.confidenceThreshold.toFixed(2)}
          </Label>
          <Slider
            value={[settings.confidenceThreshold]}
            onValueChange={([value]) =>
              setSettings({ ...settings, confidenceThreshold: value })
            }
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Minimum confidence score to route to this domain (0.0 - 1.0)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Temperature: {settings.temperature.toFixed(2)}</Label>
          <Slider
            value={[settings.temperature]}
            onValueChange={([value]) =>
              setSettings({ ...settings, temperature: value })
            }
            min={0}
            max={2}
            step={0.1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Response creativity (0.0 = focused, 2.0 = creative)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={settings.maxTokens}
            onChange={(e) =>
              setSettings({
                ...settings,
                maxTokens: parseInt(e.target.value) || 2000,
              })
            }
          />
          <p className="text-sm text-muted-foreground">
            Maximum response length (100 - 8000 tokens)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={settings.priority.toString()}
            onValueChange={(value) =>
              setSettings({ ...settings, priority: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((priority) => (
                <SelectItem key={priority} value={priority.toString()}>
                  Priority {priority}{" "}
                  {priority === 10
                    ? "(Highest)"
                    : priority === 1
                      ? "(Lowest)"
                      : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Domain priority for routing (1 = lowest, 10 = highest)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Keywords</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            />
            <Button onClick={addKeyword} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="px-3 py-1">
                {keyword}
                <X
                  className="h-3 w-3 ml-2 cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Keywords that trigger routing to this domain
          </p>
        </div>
      </Card>

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
