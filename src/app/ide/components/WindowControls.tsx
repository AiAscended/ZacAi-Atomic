"use client";

import React from 'react';
import { Minimize2, Maximize2, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onRestore?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
  title?: string;
}

export function WindowControls({
  onMinimize,
  onMaximize,
  onClose,
  onRestore,
  isMinimized,
  isMaximized,
  title,
}: WindowControlsProps) {
  return (
    <div className="flex items-center justify-between bg-muted/50 border-b px-3 py-1.5 h-10">
      <span className="text-sm font-medium text-foreground/70">{title}</span>
      <div className="flex items-center gap-1">
        {(isMaximized || isMinimized) && onRestore && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRestore}
            title="Restore"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        {!isMaximized && !isMinimized && onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMinimize}
            title="Minimize"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
        )}
        {!isMaximized && onMaximize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMaximize}
            title="Maximize"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onClose}
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
