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
import { SystemAwarenessPanel } from '@/components/admin/dev-console/SystemAwarenessPanel';

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
            </div>
          </div>
          
          <Alert variant="default" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin-Only Access</AlertTitle>
            <AlertDescription>
              System-level access. Changes here directly affect ZacAi&rsquo;s own codebase.
              All actions are logged and audited.
            </AlertDescription>
          </Alert>
          <SystemAwarenessPanel />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Tree */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-sm font-semibold">Files</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AdminFileTree
              onFileSelect={handleFileSelect}
              selectedPath={activeFile}
            />
          </div>
        </div>

        {/* Center/Right - Editor and Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className={terminalVisible ? 'h-1/2' : 'flex-1'}>
            <AdminCodeEditor
              openFiles={openFiles}
              activeFile={activeFile}
              onFileClose={handleFileClose}
              onActiveFileChange={setActiveFile}
              onEditorChange={handleEditorChange}
              className="h-full"
            />
          </div>

          {/* Resizer */}
          {terminalVisible && (
            <div className="h-1 bg-gray-200 dark:bg-gray-800 cursor-row-resize hover:bg-blue-500 transition-colors" />
          )}

          {/* Terminal */}
          {terminalVisible && (
            <div className="h-1/2">
              <AdminTerminal className="h-full" />
            </div>
          )}
        </div>

        {/* Right Sidebar - GitHub Controls */}
        {githubVisible && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
            <GitHubControls
              currentFile={activeFile}
              fileContent={activeFileContent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
