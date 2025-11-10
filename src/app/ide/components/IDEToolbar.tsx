"use client";

import React from 'react';
import { 
  Code2, 
  FileCode, 
  Eye, 
  Terminal, 
  MessageSquare, 
  Layout, 
  Settings,
  FolderOpen,
  Save,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLayoutStore } from '@/ide/layoutStore';
import Link from 'next/link';

export function IDEToolbar() {
  const togglePanel = useLayoutStore((state) => state.togglePanel);
  const setLayout = useLayoutStore((state) => state.setLayout);
  const currentLayout = useLayoutStore((state) => state.currentLayout);

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo & Quick Actions */}
        <div className="flex items-center gap-2">
          <Link href="/ide" className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">ZacAi IDE</span>
          </Link>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button variant="ghost" size="sm" title="Save All (Ctrl+S)">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <Button variant="ghost" size="sm" title="Run Code (Ctrl+Enter)">
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>

        {/* Center: Panel Toggles */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel('files')}
            title="Toggle Files (Ctrl+B)"
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            Files
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel('editor')}
            title="Toggle Editor"
          >
            <FileCode className="h-4 w-4 mr-1" />
            Editor
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel('preview')}
            title="Toggle Preview"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel('terminal')}
            title="Toggle Terminal (Ctrl+`)"
          >
            <Terminal className="h-4 w-4 mr-1" />
            Terminal
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel('aiChat')}
            title="Toggle AI Chat (Ctrl+I)"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            AI Chat
          </Button>
        </div>

        {/* Right: Layout & Settings */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Layout className="h-4 w-4 mr-1" />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setLayout('default')}
                className={currentLayout === 'default' ? 'bg-accent' : ''}
              >
                Default Layout
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('focus')}
                className={currentLayout === 'focus' ? 'bg-accent' : ''}
              >
                Focus Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('development')}
                className={currentLayout === 'development' ? 'bg-accent' : ''}
              >
                Development
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('review')}
                className={currentLayout === 'review' ? 'bg-accent' : ''}
              >
                Review Mode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => useLayoutStore.getState().resetLayout()}>
                Reset Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin/ide-settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
