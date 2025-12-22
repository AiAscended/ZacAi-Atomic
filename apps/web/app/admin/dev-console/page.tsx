/**
 * File: src/app/admin/dev-console/page.tsx
 * Purpose: ZacAi Internal Developer Console
 * Features: File tree, code editor, integrated terminal, GitHub operations
 */

"use client"

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AlertTriangle, Code2, Github, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DiagnosticsPanel } from '@/components/admin/dev-console/DiagnosticsPanel';
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { useEffect } from 'react';

// Dynamic imports for client-only components to avoid SSR issues
const AdminFileTree = dynamic(() => import('@/components/admin/dev-console/AdminFileTree').then(mod => ({ default: mod.AdminFileTree })), {
  ssr: false,
  loading: () => <div className="p-4">Loading file tree...</div>
});

const AdminCodeEditor = dynamic(() => import('@/components/admin/dev-console/AdminCodeEditor').then(mod => ({ default: mod.AdminCodeEditor })), {
  ssr: false,
  loading: () => <div className="p-4">Loading editor...</div>
});

const AdminTerminal = dynamic(() => import('@/components/admin/dev-console/AdminTerminal').then(mod => ({ default: mod.AdminTerminal })), {
  ssr: false,
  loading: () => <div className="p-4">Loading terminal...</div>
});

const GitHubControls = dynamic(() => import('@/components/admin/dev-console/GitHubControls').then(mod => ({ default: mod.GitHubControls })), {
  ssr: false,
  loading: () => <div className="p-4">Loading GitHub controls...</div>
});


export default function DevConsolePage() {
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | undefined>();
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [githubVisible, setGithubVisible] = useState(false);
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);

  const handleFileSelect = (path: string) => {
    // Open file if not already open
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    
    // Set as active file
    setActiveFile(path);
  };

  const handleFileClose = (path: string) => {
    const newFiles = openFiles.filter((f) => f !== path);
    setOpenFiles(newFiles);

    // If closing active file, switch to another tab
    if (path === activeFile) {
      const currentIndex = openFiles.indexOf(path);
      const nextFile = newFiles[currentIndex] || newFiles[currentIndex - 1] || newFiles[0];
      setActiveFile(nextFile);
    }
  };

  const handleEditorChange = (content: string) => {
    setActiveFileContent(content);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">ZacAi Internal Console</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTerminalVisible((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                {terminalVisible ? 'Hide' : 'Show'} Terminal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGithubVisible(!githubVisible)}
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                {githubVisible ? 'Hide' : 'Show'} GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiagnosticsVisible((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {diagnosticsVisible ? 'Hide' : 'Show'} Diagnostics
              </Button>
            </div>
          </div>
          <Alert variant="default" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin-Only Access</AlertTitle>
            <AlertDescription>
              System-level access. Changes here directly affect ZacAi&apos;s own codebase.
              All actions are logged and audited.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Main Content with PanelGroup (react-resizable-panels) */}
      <PanelGroup direction="horizontal" className="flex-1 h-full">
        {/* Left Sidebar - File Tree */}
        <Panel minSize={15} defaultSize={20} maxSize={30} className="h-full flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-sm font-semibold">Files</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AdminFileTree
              onFileSelect={handleFileSelect}
              selectedPath={activeFile}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-800 cursor-col-resize" />
        {/* Center/Right - Editor, Terminal, Diagnostics, GitHub */}
        <Panel minSize={40} defaultSize={60} className="h-full">
          <PanelGroup direction="vertical" className="h-full">
            {/* Editor + GitHub Controls */}
            <Panel minSize={30} defaultSize={60} className="flex h-full">
              <div className="flex-1 h-full">
                <AdminCodeEditor
                  openFiles={openFiles}
                  activeFile={activeFile}
                  onFileClose={handleFileClose}
                  onActiveFileChange={setActiveFile}
                  onEditorChange={handleEditorChange}
                  className="h-full"
                />
              </div>
              {githubVisible && (
                <div className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
                  <GitHubControls
                    currentFile={activeFile}
                    fileContent={activeFileContent}
                  />
                </div>
              )}
            </Panel>
            <PanelResizeHandle className="h-2 bg-gray-200 dark:bg-gray-800 cursor-row-resize" />
            {/* Terminal + Diagnostics */}
            <Panel minSize={20} defaultSize={40} className="flex h-full">
              {terminalVisible && (
                <div className={diagnosticsVisible ? 'w-2/3' : 'w-full'} style={{ minWidth: 0 }}>
                  <AdminTerminal className="h-full" />
                </div>
              )}
              {diagnosticsVisible && (
                <div className="w-1/3 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
                  <DiagnosticsPanel />
                </div>
              )}
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
