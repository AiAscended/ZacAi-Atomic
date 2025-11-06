"use client";

import React, { ReactNode } from 'react';
import { WindowControls } from './WindowControls';
import { useLayoutStore } from '@/lib/ide/layoutStore';
import { cn } from '@/lib/utils';

interface PanelContainerProps {
  panelKey: 'files' | 'editor' | 'preview' | 'terminal' | 'aiChat';
  title: string;
  children: ReactNode;
  className?: string;
}

export function PanelContainer({
  panelKey,
  title,
  children,
  className,
}: PanelContainerProps) {
  const panel = useLayoutStore((state) => state[panelKey]);
  const togglePanel = useLayoutStore((state) => state.togglePanel);
  const minimizePanel = useLayoutStore((state) => state.minimizePanel);
  const maximizePanel = useLayoutStore((state) => state.maximizePanel);
  const restorePanel = useLayoutStore((state) => state.restorePanel);

  if (!panel.visible) return null;

  return (
    <div
      className={cn(
        'flex flex-col bg-background border border-border rounded-md overflow-hidden',
        panel.maximized && 'fixed inset-4 z-50',
        panel.minimized && 'h-10',
        className
      )}
      style={{
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <WindowControls
        title={title}
        onMinimize={() => minimizePanel(panelKey)}
        onMaximize={() => maximizePanel(panelKey)}
        onClose={() => togglePanel(panelKey)}
        onRestore={() => restorePanel(panelKey)}
        isMinimized={panel.minimized}
        isMaximized={panel.maximized}
      />
      {!panel.minimized && (
        <div className="flex-1 overflow-hidden">{children}</div>
      )}
    </div>
  );
}
