/**
 * File: src/app/ide/components/IDELayout.tsx
 * Purpose: Main IDE layout manager with resizable panels
 */

"use client";

import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PanelContainer } from './PanelContainer';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';
import { AIChatPanel } from './AIChatPanel';
import { IDEToolbar } from './IDEToolbar';
import { useLayoutStore } from '@/lib/ide/layoutStore';

export function IDELayout() {
  const layout = useLayoutStore((state) => ({
    files: state.files,
    editor: state.editor,
    preview: state.preview,
    terminal: state.terminal,
    aiChat: state.aiChat,
    currentLayout: state.currentLayout,
  }));

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <IDEToolbar />

      {/* Main IDE Area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Files Panel */}
          {layout.files.visible && (
            <>
              <ResizablePanel defaultSize={layout.files.size} minSize={10} maxSize={30}>
                <PanelContainer panelKey="files" title="Explorer" className="h-full">
                  <FileExplorer />
import { useIDELayoutStore } from '@/stores/ideLayoutStore';
import { PanelContainer } from './PanelContainer';
import { Button } from '@/components/ui/button';
import { Layout, Maximize, Code, Terminal, MessageSquare, FolderTree } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IDELayoutProps {
  fileExplorer?: React.ReactNode;
  editor?: React.ReactNode;
  preview?: React.ReactNode;
  terminal?: React.ReactNode;
  aiChat?: React.ReactNode;
}

export function IDELayout({
  fileExplorer,
  editor,
  preview,
  terminal,
  aiChat,
}: IDELayoutProps) {
  const {
    panels,
    activePreset,
    togglePanel,
    minimizePanel,
    maximizePanel,
    restorePanel,
    applyPreset,
  } = useIDELayoutStore();

  const handlePanelAction = (panelId: 'files' | 'editor' | 'preview' | 'terminal' | 'aiChat', action: 'minimize' | 'maximize' | 'close') => {
    if (action === 'minimize') {
      minimizePanel(panelId);
    } else if (action === 'maximize') {
      if (panels[panelId].maximized) {
        restorePanel(panelId);
      } else {
        maximizePanel(panelId);
      }
    } else if (action === 'close') {
      togglePanel(panelId);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-ide-bg">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ide-border bg-ide-sidebar-bg">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <span className="font-semibold">ZacAi IDE</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Layout preset selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Layout className="h-4 w-4 mr-2" />
                Layout: {activePreset}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Layout Presets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => applyPreset('default')}>
                Default - All Panels
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyPreset('focus')}>
                Focus - Editor Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyPreset('development')}>
                Development - Files + Editor + Terminal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyPreset('review')}>
                Review - Editor + Preview + AI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyPreset('fullIde')}>
                Full IDE - All Features
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Panel toggles */}
          <Button
            variant={panels.files.visible ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('files')}
          >
            <FolderTree className="h-4 w-4" />
          </Button>
          <Button
            variant={panels.preview.visible ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('preview')}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          <Button
            variant={panels.terminal.visible ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('terminal')}
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <Button
            variant={panels.aiChat.visible ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('aiChat')}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main IDE workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Files panel */}
          {panels.files.visible && (
            <>
              <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
                <PanelContainer
                  id="files-panel"
                  title="Files"
                  onMinimize={() => handlePanelAction('files', 'minimize')}
                  onMaximize={() => handlePanelAction('files', 'maximize')}
                  onClose={() => handlePanelAction('files', 'close')}
                  isMinimized={panels.files.minimized}
                  isMaximized={panels.files.maximized}
                  className="h-full"
                >
                  {fileExplorer || (
                    <div className="p-4 text-muted-foreground">
                      File explorer coming soon...
                    </div>
                  )}
                </PanelContainer>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Editor + Terminal Panel */}
          <ResizablePanel defaultSize={layout.editor.size} minSize={20}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <PanelContainer panelKey="editor" title="Editor" className="h-full">
                  <CodeEditor />
                </PanelContainer>
              </ResizablePanel>

              {/* Terminal */}
              {layout.terminal.visible && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                    <PanelContainer panelKey="terminal" title="Terminal" className="h-full">
                      <TerminalPanel />
                    </PanelContainer>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Preview Panel */}
          {layout.preview.visible && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={layout.preview.size} minSize={15} maxSize={50}>
                <PanelContainer panelKey="preview" title="Preview" className="h-full">
                  <PreviewPanel />
          {/* Editor + Terminal column */}
          <ResizablePanel defaultSize={panels.preview.visible || panels.aiChat.visible ? 45 : 85}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor panel */}
              {panels.editor.visible && (
                <>
                  <ResizablePanel defaultSize={panels.terminal.visible ? 70 : 100}>
                    <PanelContainer
                      id="editor-panel"
                      title="Editor"
                      onMinimize={() => handlePanelAction('editor', 'minimize')}
                      onMaximize={() => handlePanelAction('editor', 'maximize')}
                      onClose={() => handlePanelAction('editor', 'close')}
                      isMinimized={panels.editor.minimized}
                      isMaximized={panels.editor.maximized}
                      className="h-full"
                    >
                      {editor || (
                        <div className="p-4 text-muted-foreground">
                          Editor coming soon...
                        </div>
                      )}
                    </PanelContainer>
                  </ResizablePanel>
                  {panels.terminal.visible && <ResizableHandle />}
                </>
              )}

              {/* Terminal panel */}
              {panels.terminal.visible && (
                <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                  <PanelContainer
                    id="terminal-panel"
                    title="Terminal"
                    onMinimize={() => handlePanelAction('terminal', 'minimize')}
                    onMaximize={() => handlePanelAction('terminal', 'maximize')}
                    onClose={() => handlePanelAction('terminal', 'close')}
                    isMinimized={panels.terminal.minimized}
                    isMaximized={panels.terminal.maximized}
                    className="h-full"
                  >
                    {terminal || (
                      <div className="p-4 text-muted-foreground">
                        Terminal coming soon...
                      </div>
                    )}
                  </PanelContainer>
                </ResizablePanel>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Preview panel */}
          {panels.preview.visible && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <PanelContainer
                  id="preview-panel"
                  title="Preview"
                  onMinimize={() => handlePanelAction('preview', 'minimize')}
                  onMaximize={() => handlePanelAction('preview', 'maximize')}
                  onClose={() => handlePanelAction('preview', 'close')}
                  isMinimized={panels.preview.minimized}
                  isMaximized={panels.preview.maximized}
                  className="h-full"
                >
                  {preview || (
                    <div className="p-4 text-muted-foreground">
                      Preview coming soon...
                    </div>
                  )}
                </PanelContainer>
              </ResizablePanel>
            </>
          )}

          {/* AI Chat Panel */}
          {layout.aiChat.visible && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={layout.aiChat.size} minSize={15} maxSize={40}>
                <PanelContainer panelKey="aiChat" title="ZacAi Assistant" className="h-full">
                  <AIChatPanel />
          {/* AI Chat panel */}
          {panels.aiChat.visible && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <PanelContainer
                  id="ai-chat-panel"
                  title="AI Assistant"
                  onMinimize={() => handlePanelAction('aiChat', 'minimize')}
                  onMaximize={() => handlePanelAction('aiChat', 'maximize')}
                  onClose={() => handlePanelAction('aiChat', 'close')}
                  isMinimized={panels.aiChat.minimized}
                  isMaximized={panels.aiChat.maximized}
                  className="h-full"
                >
                  {aiChat || (
                    <div className="p-4 text-muted-foreground">
                      AI Chat coming soon...
                    </div>
                  )}
                </PanelContainer>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
