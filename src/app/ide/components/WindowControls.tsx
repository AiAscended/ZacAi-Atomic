/**
 * File: src/app/ide/components/WindowControls.tsx
 * Purpose: Window control buttons (minimize, maximize, close)
 */

"use client";

import React from 'react';
import { Minimize2, Maximize2, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
}

export function WindowControls({
  onMinimize,
  onMaximize,
  onClose,
  isMinimized = false,
  isMaximized = false,
}: WindowControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {onMinimize && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-accent"
                onClick={onMinimize}
                aria-label="Minimize"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Minimize</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onMaximize && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-accent"
                onClick={onMaximize}
                aria-label={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMaximized ? 'Restore' : 'Maximize'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onClose && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
