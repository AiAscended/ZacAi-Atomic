/**
 * File: app/admin/models/response-aggregator/page.tsx
 * Purpose: Response Aggregator configuration for combining multi-domain outputs
 */

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export default function ResponseAggregatorPage() {
  const [settings, setSettings] = useState({
    strategy: "weighted",
    confidenceWeighting: 0.7,
    enableConflictResolution: true,
    enableDeduplication: true,
    minResponseQuality: 0.6,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Response Aggregator</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Aggregation Strategy</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Aggregation Strategy</Label>
            <Select
              value={settings.strategy}
              onValueChange={(value) =>
                setSettings({ ...settings, strategy: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weighted">Weighted Average</SelectItem>
                <SelectItem value="voting">Majority Voting</SelectItem>
                <SelectItem value="best">Best Response Only</SelectItem>
                <SelectItem value="concatenate">Concatenate All</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How to combine responses from multiple domains
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Confidence Weighting: {settings.confidenceWeighting.toFixed(2)}
            </Label>
            <Slider
              value={[settings.confidenceWeighting]}
              onValueChange={([value]) =>
                setSettings({ ...settings, confidenceWeighting: value })
              }
              min={0}
              max={1}
              step={0.1}
            />
            <p className="text-sm text-muted-foreground">
              Weight responses by domain confidence scores
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Min Response Quality: {settings.minResponseQuality.toFixed(2)}
            </Label>
            <Slider
              value={[settings.minResponseQuality]}
              onValueChange={([value]) =>
                setSettings({ ...settings, minResponseQuality: value })
              }
              min={0}
              max={1}
              step={0.05}
            />
            <p className="text-sm text-muted-foreground">
              Minimum quality threshold to include a response
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Conflict Resolution</Label>
              <p className="text-sm text-muted-foreground">
                Resolve contradictions between domain responses
              </p>
            </div>
            <Switch
              checked={settings.enableConflictResolution}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableConflictResolution: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Deduplication</Label>
              <p className="text-sm text-muted-foreground">
                Remove duplicate information across responses
              </p>
            </div>
            <Switch
              checked={settings.enableDeduplication}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableDeduplication: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Aggregation Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Avg Response Quality
            </div>
            <div className="text-2xl font-bold">87.3%</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Conflicts Resolved
            </div>
            <div className="text-2xl font-bold">234</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Avg Domains Used
            </div>
            <div className="text-2xl font-bold">2.4</div>
          </div>
        </div>
      </Card>

      <Button>Save Configuration</Button>
    </div>
  );
}
