/**
 * File: app/admin/models/orchestrator/page.tsx
 * Purpose: Main orchestrator model settings and configuration
 * Creator: Vercel v0 Coding Assistant
 */

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function OrchestratorPage() {
  const [settings, setSettings] = useState({
    domainSelectionThreshold: 0.1,
    maxDomainsPerQuery: 3,
    enableParallelInference: true,
    enableContextEnhancement: true,
    enableKnowledgeRetrieval: true,
    responseAggregationStrategy: "weighted",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Main Orchestrator</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Orchestration Settings</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>
              Domain Selection Threshold:{" "}
              {settings.domainSelectionThreshold.toFixed(2)}
            </Label>
            <Slider
              value={[settings.domainSelectionThreshold]}
              onValueChange={([value]) =>
                setSettings({ ...settings, domainSelectionThreshold: value })
              }
              min={0}
              max={1}
              step={0.01}
            />
            <p className="text-sm text-muted-foreground">
              Minimum confidence required for a domain to be selected
            </p>
          </div>

          <div className="space-y-2">
            <Label>Max Domains Per Query: {settings.maxDomainsPerQuery}</Label>
            <Slider
              value={[settings.maxDomainsPerQuery]}
              onValueChange={([value]) =>
                setSettings({ ...settings, maxDomainsPerQuery: value })
              }
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Parallel Inference</Label>
              <p className="text-sm text-muted-foreground">
                Run multiple domains simultaneously
              </p>
            </div>
            <Switch
              checked={settings.enableParallelInference}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableParallelInference: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Context Enhancement</Label>
              <p className="text-sm text-muted-foreground">
                Enhance prompts with session context
              </p>
            </div>
            <Switch
              checked={settings.enableContextEnhancement}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableContextEnhancement: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Knowledge Retrieval</Label>
              <p className="text-sm text-muted-foreground">
                Use RAG for enhanced responses
              </p>
            </div>
            <Switch
              checked={settings.enableKnowledgeRetrieval}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableKnowledgeRetrieval: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Domain Status</h2>
        <div className="space-y-2">
          {[
            "React",
            "Next.js",
            "Programming",
            "TypeScript",
            "English",
            "Mathematics",
            "Internet Search",
          ].map((domain) => (
            <div
              key={domain}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span className="font-medium">{domain}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Active</span>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button>Save Configuration</Button>
    </div>
  );
}
