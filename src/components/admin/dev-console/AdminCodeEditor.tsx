/**
 * File: src/components/admin/dev-console/AdminCodeEditor.tsx
 * Purpose: Monaco-based code editor for ZacAi dev console
 * Features: Multiple tabs, syntax highlighting, save functionality, dirty state tracking
 */

"use client"

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EditorTab {
  path: string;
  content: string;
  originalContent: string;
  modified: string;
  isDirty: boolean;
  isLoading?: boolean;
}

interface AdminCodeEditorProps {
  openFiles: string[];
  activeFile?: string;
  onFileClose: (path: string) => void;
  onActiveFileChange: (path: string) => void;
  onEditorChange?: (content: string) => void;
  className?: string;
}

export function AdminCodeEditor({
  openFiles,
  activeFile,
  onFileClose,
  onActiveFileChange,
  onEditorChange,
  className,
}: AdminCodeEditorProps) {
  const [tabs, setTabs] = useState<Map<string, EditorTab>>(new Map());
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  // Load file content when new file is opened
  useEffect(() => {
    for (const path of openFiles) {
      if (!tabs.has(path)) {
        loadFile(path);
      }
    }

    // Remove tabs for closed files
    const newTabs = new Map(tabs);
    for (const path of tabs.keys()) {
      if (!openFiles.includes(path)) {
        newTabs.delete(path);
      }
    }
    setTabs(newTabs);
  }, [openFiles]);

  const loadFile = async (path: string) => {
    try {
      // Add loading tab
      setTabs((prev) => new Map(prev).set(path, {
        path,
        content: '',
        originalContent: '',
        modified: '',
        isDirty: false,
        isLoading: true,
      }));

      const response = await fetch(`/api/admin/dev-console/file?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      const data = await response.json();

      setTabs((prev) => new Map(prev).set(path, {
        path,
        content: data.content,
        originalContent: data.content,
        modified: data.modified,
        isDirty: false,
        isLoading: false,
      }));

      // Set as active if no active file
      if (!activeFile) {
        onActiveFileChange(path);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      
      toast({
        title: 'Failed to load file',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });

      // Remove failed tab
      setTabs((prev) => {
        const newTabs = new Map(prev);
        newTabs.delete(path);
        return newTabs;
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFile || value === undefined) return;

    setTabs((prev) => {
      const tab = prev.get(activeFile);
      if (!tab) return prev;

      const isDirty = value !== tab.originalContent;
      return new Map(prev).set(activeFile, {
        ...tab,
        content: value,
        isDirty,
      });
    });

    // Notify parent component of content change
    if (onEditorChange) {
      onEditorChange(value);
    }
  };

  const handleSave = async () => {
    if (!activeFile) return;

    const tab = tabs.get(activeFile);
    if (!tab || !tab.isDirty) return;

    try {
      setSaving(true);

      const response = await fetch('/api/admin/dev-console/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeFile,
          content: tab.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      const data = await response.json();

      // Update tab state
      setTabs((prev) => new Map(prev).set(activeFile, {
        ...tab,
        originalContent: tab.content,
        modified: data.modified,
        isDirty: false,
      }));

      toast({
        title: 'File saved',
        description: `Successfully saved ${getFileName(activeFile)}`,
      });
    } catch (error) {
      console.error('Error saving file:', error);
      
      toast({
        title: 'Failed to save file',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;

    // Add keyboard shortcut for save (Ctrl/Cmd + S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
      py: 'python',
      rs: 'rust',
      go: 'go',
      yaml: 'yaml',
      yml: 'yaml',
      toml: 'toml',
      xml: 'xml',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell',
    };

    return languageMap[ext || ''] || 'plaintext';
  };

  const currentTab = activeFile ? tabs.get(activeFile) : undefined;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
        {openFiles.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 text-gray-500 dark:text-gray-400">
            <FileCode className="w-4 h-4" />
            <span className="text-sm">No files open</span>
          </div>
        ) : (
          openFiles.map((path) => {
            const tab = tabs.get(path);
            const isActive = path === activeFile;
            
            return (
              <div
                key={path}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 border-r border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors',
                  isActive && 'bg-white dark:bg-gray-950 border-b-2 border-b-blue-500'
                )}
                onClick={() => onActiveFileChange(path)}
              >
                {tab?.isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                <span className="text-sm">
                  {tab?.isDirty && '● '}
                  {getFileName(path)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileClose(path);
                  }}
                  className="hover:bg-gray-300 dark:hover:bg-gray-700 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Toolbar */}
      {currentTab && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>{getLanguage(activeFile!)}</span>
            <span>•</span>
            <span>Modified: {new Date(currentTab.modified).toLocaleString()}</span>
          </div>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!currentTab.isDirty || saving}
            variant={currentTab.isDirty ? 'default' : 'outline'}
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 mr-2" />
                Save {currentTab.isDirty && '(Ctrl+S)'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {!currentTab ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <FileCode className="w-12 h-12 mb-4" />
            <p>Select a file to start editing</p>
          </div>
        ) : currentTab.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Editor
            value={currentTab.content}
            language={getLanguage(activeFile!)}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  );
}
