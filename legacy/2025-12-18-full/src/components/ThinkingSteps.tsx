/**
 * File: src/ui/components/ThinkingSteps.tsx
 * React component to render detailed AI thinking process logs.
 *
 * Props:
 * - steps: Array of thinking steps from AI orchestration tracker
 *
 * Features:
 * - Collapsible UI block for each step with timestamp and optional data
 * - Syntax highlighting for JSON-like data blocks
 */
"use client";

import React, { useState } from "react";

interface ThinkingStep {
  step: string;
  description: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface ThinkingStepsProps {
  steps: ThinkingStep[];
}

export function ThinkingSteps({ steps }: ThinkingStepsProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 w-full text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-600"
      >
        {expanded
          ? "Hide AI Thinking Steps"
          : `Show AI Thinking Steps (${steps.length})`}
      </button>

      {expanded && (
        <div className="space-y-2 rounded border border-indigo-400 bg-indigo-50 p-3 dark:bg-indigo-900 dark:border-indigo-600 text-xs font-mono overflow-auto max-h-60">
          {steps.map((step, idx) => (
            <div key={idx} className="border-l-2 border-indigo-600 pl-2">
              <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                {step.description}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 opacity-70 text-xs">
                {step.timestamp}ms
              </div>
              {step.data && <pre>{JSON.stringify(step.data, null, 2)}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
