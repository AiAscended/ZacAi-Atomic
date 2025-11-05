/**
 * File: src/app/ide/page.tsx
 * Purpose: Main IDE page with all panels
 */

"use client";

import React, { useState } from 'react';
import { IDELayout } from './components/IDELayout';
import { MonacoEditor, EditorFile } from './components/MonacoEditor';
import { FileExplorer, FileNode } from './components/FileExplorer';
import { Preview } from './components/Preview';
import { TerminalWrapper } from './components/TerminalWrapper';

// Sample files
const sampleFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'directory',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'index.tsx',
        type: 'file',
        path: '/src/index.tsx',
      },
      {
        id: '3',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
      },
      {
        id: '4',
        name: 'styles.css',
        type: 'file',
        path: '/src/styles.css',
      },
    ],
  },
  {
    id: '5',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
  },
  {
    id: '6',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
  },
];

const sampleEditorFiles: EditorFile[] = [
  {
    id: '2',
    name: 'index.tsx',
    path: '/src/index.tsx',
    language: 'typescript',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  {
    id: '3',
    name: 'App.tsx',
    path: '/src/App.tsx',
    language: 'typescript',
    content: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Welcome to ZacAi IDE</h1>
      <p>A modern, browser-based development environment</p>
      <div className="counter">
        <button onClick={() => setCount(count - 1)}>-</button>
        <span>Count: {count}</span>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
    </div>
  );
}

export default App;`,
  },
];

export default function IDEPage() {
  const [editorFiles, setEditorFiles] = useState<EditorFile[]>(sampleEditorFiles);
  const [activeFileId, setActiveFileId] = useState<string>(sampleEditorFiles[0]?.id || '');
  const [previewHtml, setPreviewHtml] = useState('<h1>Preview</h1><p>Select an HTML file to preview</p>');
  const [previewCss, setPreviewCss] = useState('');
  const [previewJs, setPreviewJs] = useState('');

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      // Check if file is already open
      const existingFile = editorFiles.find(f => f.id === file.id);
      if (existingFile) {
        setActiveFileId(file.id);
        return;
      }

      // Create new editor file with sample content
      const newFile: EditorFile = {
        id: file.id,
        name: file.name,
        path: file.path,
        language: getLanguageFromFileName(file.name),
        content: `// ${file.name}\n// Add your code here\n`,
      };

      setEditorFiles([...editorFiles, newFile]);
      setActiveFileId(file.id);
    }
  };

  const handleFileChange = (fileId: string, content: string) => {
    setEditorFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, content } : f))
    );
  };

  const handleFileSave = (fileId: string, content: string) => {
    console.log('Saving file:', fileId, content);
    // Implement actual save logic here
  };

  const handleFileClose = (fileId: string) => {
    setEditorFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId && editorFiles.length > 1) {
      const remainingFiles = editorFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles[0]?.id || '');
    }
  };

  const handleCommand = (command: string) => {
    console.log('Terminal command:', command);
    // Implement command execution logic
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  return (
    <div className="h-screen">
      <IDELayout
        fileExplorer={
          <FileExplorer
            files={sampleFiles}
            onFileClick={handleFileClick}
            onFileCreate={() => console.log('Create file')}
            onFolderCreate={() => console.log('Create folder')}
          />
        }
        editor={
          <MonacoEditor
            files={editorFiles}
            activeFileId={activeFileId}
            onFileChange={handleFileChange}
            onFileSave={handleFileSave}
            onFileClose={handleFileClose}
            onActiveFileChange={setActiveFileId}
          />
        }
        preview={
          <Preview
            html={previewHtml}
            css={previewCss}
            javascript={previewJs}
          />
        }
        terminal={
          <TerminalWrapper onCommand={handleCommand} />
        }
        aiChat={
          <div className="p-4 text-muted-foreground">
            AI Chat integration coming in Phase 5...
          </div>
        }
      />
    </div>
  );
}
