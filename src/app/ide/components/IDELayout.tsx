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
                </PanelContainer>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
