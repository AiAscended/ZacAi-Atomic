/**
 * File: src/app/ide/page.tsx
 * Purpose: Main IDE page with all panels
 */

"use client";

import React, { useState, useEffect } from 'react';
import { IDELayout } from './components/IDELayout';
import { MonacoEditor, EditorFile } from './components/MonacoEditor';
import { FileExplorer, FileNode } from './components/FileExplorer';
import { Preview } from './components/Preview';
import { TerminalWrapper } from './components/TerminalWrapper';
import { AIChatPanel } from './components/AIChatPanel';
import { useVirtualFileSystem } from '@/hooks/useVirtualFileSystem';

// Sample files (fallback)
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
  const vfs = useVirtualFileSystem();
  const [fileTree, setFileTree] = useState<FileNode[]>(sampleFiles);
  const [editorFiles, setEditorFiles] = useState<EditorFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState('<h1>Preview</h1><p>Select an HTML file to preview</p>');
  const [previewCss, setPreviewCss] = useState('');
  const [previewJs, setPreviewJs] = useState('');

  // Initialize VFS and load file tree
  useEffect(() => {
    if (vfs.isReady) {
      loadFileTree();
      // Initialize sample project if empty
      vfs.initializeSampleProject().then(() => {
        loadFileTree();
      });
    }
  }, [vfs.isReady]);

  const loadFileTree = async () => {
    try {
      const tree = await vfs.getFileTree('/');
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
      setFileTree(sampleFiles); // Fallback to sample files
    }
  };

  const handleFileClick = async (file: FileNode) => {
    if (file.type === 'file') {
      // Check if file is already open
      const existingFile = editorFiles.find(f => f.id === file.id);
      if (existingFile) {
        setActiveFileId(file.id);
        return;
      }

      try {
        // Load file content from VFS
        const content = await vfs.readFile(file.path);
        
        const newFile: EditorFile = {
          id: file.id,
          name: file.name,
          path: file.path,
          language: getLanguageFromFileName(file.name),
          content,
        };

        setEditorFiles([...editorFiles, newFile]);
        setActiveFileId(file.id);
      } catch (error) {
        console.error('Failed to load file:', error);
        // Fallback to empty content
        const newFile: EditorFile = {
          id: file.id,
          name: file.name,
          path: file.path,
          language: getLanguageFromFileName(file.name),
          content: `// ${file.name}\n// Error loading file\n`,
        };
        setEditorFiles([...editorFiles, newFile]);
        setActiveFileId(file.id);
      }
    }
  };

  const handleFileChange = (fileId: string, content: string) => {
    setEditorFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, content } : f))
    );
  };

  const handleFileSave = async (fileId: string, content: string) => {
    const file = editorFiles.find(f => f.id === fileId);
    if (file) {
      try {
        await vfs.writeFile(file.path, content);
        console.log('File saved:', file.path);
      } catch (error) {
        console.error('Failed to save file:', error);
        alert('Failed to save file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
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

  const handleInsertCode = async (code: string, language: string) => {
    // Create a new file or insert into current file
    const fileName = `untitled-${Date.now()}.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language}`;
    const filePath = `/${fileName}`;
    
    try {
      await vfs.writeFile(filePath, code);
      await loadFileTree();
      
      const newFile: EditorFile = {
        id: Date.now().toString(),
        name: fileName,
        path: filePath,
        language,
        content: code,
      };
      setEditorFiles([...editorFiles, newFile]);
      setActiveFileId(newFile.id);
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const handlePreviewCode = (code: string, language: string) => {
    if (language === 'html') {
      setPreviewHtml(code);
    } else if (language === 'css') {
      setPreviewCss(code);
    } else if (language === 'javascript') {
      setPreviewJs(code);
    }
  };

  const getCurrentFile = () => {
    return editorFiles.find(f => f.id === activeFileId);
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
            files={fileTree}
            onFileClick={handleFileClick}
            onFileCreate={async () => {
              const fileName = prompt('Enter file name:');
              if (fileName) {
                try {
                  await vfs.writeFile(`/${fileName}`, '');
                  await loadFileTree();
                } catch (error) {
                  alert('Failed to create file: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
              }
            }}
            onFolderCreate={async () => {
              const folderName = prompt('Enter folder name:');
              if (folderName) {
                try {
                  await vfs.createDirectory(`/${folderName}`);
                  await loadFileTree();
                } catch (error) {
                  alert('Failed to create folder: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
              }
            }}
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
          <AIChatPanel
            currentFile={getCurrentFile()?.name}
            currentCode={getCurrentFile()?.content}
            projectContext="React TypeScript project with sample counter component"
            onInsertCode={handleInsertCode}
            onPreviewCode={handlePreviewCode}
          />
        }
      />
    </div>
  );
}
