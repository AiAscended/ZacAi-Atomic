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
/**
 * File: src/app/ide/components/PanelContainer.tsx
 * Purpose: Resizable panel container with window controls
 */

"use client";

import React from 'react';
import { WindowControls } from './WindowControls';
import { cn } from '@/lib/utils';

interface PanelContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
  headerActions?: React.ReactNode;
}

export function PanelContainer({
  id,
  title,
  children,
  className,
  onMinimize,
  onMaximize,
  onClose,
  isMinimized = false,
  isMaximized = false,
  headerActions,
}: PanelContainerProps) {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col bg-background border border-border rounded-md overflow-hidden',
        isMinimized && 'h-10',
        isMaximized && 'fixed inset-4 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {headerActions}
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          isMinimized={isMinimized}
          isMaximized={isMaximized}
        />
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      )}
    </div>
  );
}
