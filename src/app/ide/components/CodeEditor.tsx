"use client";

import React, { useRef, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useEditorStore } from '@/ide/editorStore';
import { useFileSystem } from '@/ide/useFileSystem';
import { Button } from '@/components/ui/button';
import { X, Save, MoreVertical, Copy, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CodeEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const { 
    openFiles, 
    activeFileId, 
    closeFile, 
    setActiveFile, 
    updateFileContent,
    saveFile,
    getFileById 
  } = useEditorStore();
  const { fs } = useFileSystem();
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  const activeFile = getFileById(activeFileId);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Enhanced editor configuration
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      tabCompletion: 'on',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      parameterHints: {
        enabled: true,
      },
      bracketPairColorization: {
        enabled: true,
      },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      // Multi-cursor support
      multiCursorModifier: 'ctrlCmd',
      // Code folding
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      // Find/Replace
      find: {
        addExtraSpaceOnTop: true,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always',
      },
    });

    // Add keyboard shortcuts
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      handleSave();
    });

    // Add custom snippets
    registerCustomSnippets(monacoInstance);

    // Add hover providers for better IntelliSense
    setupHoverProviders(monacoInstance);
  };

  const registerCustomSnippets = (monacoInstance: typeof monaco) => {
    // Register common code snippets
    const languages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
    
    languages.forEach((lang) => {
      monacoInstance.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model, position) => {
          const suggestions = [
            {
              label: 'log',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: "console.log('${1}');",
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Console log',
            },
            {
              label: 'func',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Function declaration',
            },
            {
              label: 'arrow',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'const ${1:name} = (${2:params}) => {\n\t${3}\n};',
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Arrow function',
            },
            {
              label: 'async',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'async function ${1:name}(${2:params}) {\n\t${3}\n}',
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Async function',
            },
            {
              label: 'try',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'try {\n\t${1}\n} catch (error) {\n\t${2:console.error(error);}\n}',
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Try-catch block',
            },
          ];
          
          return { suggestions };
        },
      });
    });
  };

  const setupHoverProviders = (monacoInstance: typeof monaco) => {
    // Add hover documentation for common functions
    const languages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
    
    languages.forEach((lang) => {
      monacoInstance.languages.registerHoverProvider(lang, {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (!word) return null;

          // Custom hover documentation
          const docs: Record<string, string> = {
            'console': 'The console object provides access to the debugging console',
            'log': 'Outputs a message to the console',
            'async': 'The async keyword declares an asynchronous function',
            'await': 'The await operator waits for a Promise to resolve',
          };

          const documentation = docs[word.word];
          if (documentation) {
            return {
              range: new monacoInstance.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
              ),
              contents: [{ value: `**${word.word}**\n\n${documentation}` }],
            };
          }

          return null;
        },
      });
    });
  };

  const handleSave = async () => {
    if (activeFileId && fs) {
      await saveFile(activeFileId, fs);
    }
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined && activeFileId) {
      updateFileContent(activeFileId, value);
    }
  };

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(fileId);
  };

  // Update editor content when active file changes
  useEffect(() => {
    if (editorRef.current && activeFile) {
      const currentModel = editorRef.current.getModel();
      if (currentModel) {
        const currentValue = currentModel.getValue();
        if (currentValue !== activeFile.content) {
          editorRef.current.setValue(activeFile.content);
        }
      }

      // Update language
      if (monacoRef.current && currentModel) {
        monacoRef.current.editor.setModelLanguage(currentModel, activeFile.language);
      }
    }
  }, [activeFile?.id, activeFile?.content, activeFile?.language]);

  if (openFiles.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <FileCode className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <div>
            <h3 className="text-lg font-semibold">No files open</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Open a file from the explorer or create a new one to start coding
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex items-center bg-muted/30 border-b overflow-x-auto">
        {openFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-r cursor-pointer transition-colors group',
              file.id === activeFileId
                ? 'bg-background text-foreground'
                : 'hover:bg-muted/50 text-muted-foreground'
            )}
            onClick={() => setActiveFile(file.id)}
          >
            <span className="text-sm font-medium truncate max-w-[150px]">
              {file.path.split('/').pop()}
            </span>
            {file.isDirty && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded p-0.5"
              onClick={(e) => handleCloseTab(file.id, e)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile?.language || 'typescript'}
          value={activeFile?.content || ''}
          theme={theme}
          onMount={handleEditorDidMount}
          onChange={handleChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
          }}
        />

        {/* Status bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1 bg-muted/50 border-t text-xs">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {activeFile?.language.toUpperCase()}
            </span>
            <span className="text-muted-foreground">
              {activeFile?.path}
            </span>
            {activeFile?.isDirty && (
              <span className="text-yellow-600 dark:text-yellow-500">
                • Modified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            >
              {theme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
            </Button>
            <span className="text-green-600 dark:text-green-500">
              ✅ Phase 6 Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
