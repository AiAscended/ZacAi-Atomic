/**
 * File: src/app/ide/components/TerminalWrapper.tsx  
 * Purpose: Simple terminal wrapper for SSR compatibility
 */

"use client";

import React from 'react';

export function TerminalWrapper({ onCommand }: { onCommand?: (command: string) => void }) {
  return (
    <div className="flex flex-col h-full bg-ide-terminal-bg">
      <div className="flex-1 p-4 font-mono text-sm">
        <div className="text-green-500">$ Welcome to ZacAi Terminal</div>
        <div className="text-muted-foreground mt-2">
          Terminal coming soon with Xterm.js integration...
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Planned features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Full terminal emulation</li>
            <li>Command history (↑/↓)</li>
            <li>Multiple terminal tabs</li>
            <li>Command execution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
