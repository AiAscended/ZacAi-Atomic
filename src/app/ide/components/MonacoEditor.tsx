/**
 * File: src/app/ide/components/MonacoEditor.tsx
 * Purpose: Monaco Editor component with multi-file tab support
 */

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { X, Save, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty?: boolean;
}

interface MonacoEditorProps {
  files?: EditorFile[];
  activeFileId?: string;
  onFileChange?: (fileId: string, content: string) => void;
  onFileSave?: (fileId: string, content: string) => void;
  onFileClose?: (fileId: string) => void;
  onActiveFileChange?: (fileId: string) => void;
  className?: string;
}

export function MonacoEditor({
  files = [],
  activeFileId,
  onFileChange,
  onFileSave,
  onFileClose,
  onActiveFileChange,
  className,
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const [localFiles, setLocalFiles] = useState<EditorFile[]>(files);
  const [activeId, setActiveId] = useState<string>(activeFileId || files[0]?.id || '');
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    if (files.length > 0) {
      setLocalFiles(files);
      if (!activeId && files[0]) {
        setActiveId(files[0].id);
      }
    }
  }, [files, activeId]);

  const activeFile = localFiles.find(f => f.id === activeId);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    setEditorInstance(editor);

    // Configure Monaco editor settings
    monaco.editor.defineTheme('zacai-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editorCursor.foreground': '#007acc',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });

    monaco.editor.defineTheme('zacai-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f0f0f0',
        'editorCursor.foreground': '#007acc',
        'editor.selectionBackground': '#add6ff',
      },
    });

    // Set initial theme
    monaco.editor.setTheme(theme === 'dark' ? 'zacai-dark' : 'zacai-light');

    // Enable IntelliSense features
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Enable formatting
    monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      provideDocumentFormattingEdits(model) {
        return [];
      },
    });
  }, [theme]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && activeId) {
      setLocalFiles(prev =>
        prev.map(f =>
          f.id === activeId
            ? { ...f, content: value, isDirty: true }
            : f
        )
      );
      onFileChange?.(activeId, value);
    }
  }, [activeId, onFileChange]);

  const handleFileSave = useCallback((fileId: string) => {
    const file = localFiles.find(f => f.id === fileId);
    if (file) {
      setLocalFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, isDirty: false } : f
        )
      );
      onFileSave?.(fileId, file.content);
    }
  }, [localFiles, onFileSave]);

  const handleFileClose = useCallback((fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const file = localFiles.find(f => f.id === fileId);
    
    if (file?.isDirty) {
      const confirm = window.confirm(`${file.name} has unsaved changes. Close anyway?`);
      if (!confirm) return;
    }

    const newFiles = localFiles.filter(f => f.id !== fileId);
    setLocalFiles(newFiles);
    
    if (activeId === fileId && newFiles.length > 0) {
      setActiveId(newFiles[0].id);
      onActiveFileChange?.(newFiles[0].id);
    }
    
    onFileClose?.(fileId);
  }, [localFiles, activeId, onFileClose, onActiveFileChange]);

  const handleTabChange = useCallback((value: string) => {
    setActiveId(value);
    onActiveFileChange?.(value);
  }, [onActiveFileChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (activeId) {
          handleFileSave(activeId);
        }
      }
      // Cmd/Ctrl + W to close tab
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (activeId) {
          handleFileClose(activeId, e as any);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, handleFileSave, handleFileClose]);

  if (localFiles.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-ide-editor-bg', className)}>
        <div className="text-center text-muted-foreground">
          <FileCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No files open</p>
          <p className="text-sm mt-2">Open a file from the file explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-ide-editor-bg', className)}>
      {/* Tab bar */}
      <div className="flex items-center border-b border-ide-border bg-ide-sidebar-bg">
        <Tabs value={activeId} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="h-10 bg-transparent rounded-none border-0">
              {localFiles.map((file) => (
                <TabsTrigger
                  key={file.id}
                  value={file.id}
                  className={cn(
                    'relative rounded-none border-b-2 border-transparent',
                    'data-[state=active]:border-ide-accent',
                    'hover:bg-accent/50'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {file.name}
                    {file.isDirty && (
                      <span className="w-2 h-2 rounded-full bg-ide-warning" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-accent"
                      onClick={(e) => handleFileClose(file.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {activeFile?.isDirty && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => activeId && handleFileSave(activeId)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </Tabs>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeFile && (
          <Editor
            height="100%"
            defaultLanguage={activeFile.language}
            language={activeFile.language}
            value={activeFile.content}
            theme={theme === 'dark' ? 'zacai-dark' : 'zacai-light'}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
              minimap: { enabled: true },
              lineNumbers: 'on',
              rulers: [80, 120],
              wordWrap: 'off',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
              folding: true,
              foldingHighlight: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              bracketPairColorization: { enabled: true },
            }}
          />
        )}
      </div>
    </div>
  );
}
