/**
 * File: src/hooks/useVirtualFileSystem.ts
 * Purpose: React hook for virtual file system operations
 */

import { useState, useEffect, useCallback } from 'react';
import { getVFS, VirtualFile } from '@/lib/ide/virtualFileSystem';
import type { FileNode } from '@/app/ide/components/FileExplorer';

export function useVirtualFileSystem() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize VFS
    getVFS()
      .then(() => setIsReady(true))
      .catch(err => {
        setError(err.message);
        console.error('Failed to initialize VFS:', err);
      });
  }, []);

  const readFile = useCallback(async (path: string): Promise<string> => {
    const vfs = await getVFS();
    return vfs.read(path);
  }, []);

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    const vfs = await getVFS();
    await vfs.write(path, content);
  }, []);

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    const vfs = await getVFS();
    await vfs.delete(path);
  }, []);

  const createDirectory = useCallback(async (path: string): Promise<void> => {
    const vfs = await getVFS();
    await vfs.mkdir(path);
  }, []);

  const listDirectory = useCallback(async (path: string): Promise<VirtualFile[]> => {
    const vfs = await getVFS();
    return vfs.list(path);
  }, []);

  const fileExists = useCallback(async (path: string): Promise<boolean> => {
    const vfs = await getVFS();
    return vfs.exists(path);
  }, []);

  const renameFile = useCallback(async (oldPath: string, newPath: string): Promise<void> => {
    const vfs = await getVFS();
    await vfs.rename(oldPath, newPath);
  }, []);

  const moveFile = useCallback(async (sourcePath: string, destPath: string): Promise<void> => {
    const vfs = await getVFS();
    await vfs.move(sourcePath, destPath);
  }, []);

  const searchFiles = useCallback(async (query: string): Promise<VirtualFile[]> => {
    const vfs = await getVFS();
    return vfs.search(query);
  }, []);

  const getFileTree = useCallback(async (rootPath: string = '/'): Promise<FileNode[]> => {
    const vfs = await getVFS();
    const files = await vfs.list(rootPath);
    
    const convertToFileNode = async (file: VirtualFile): Promise<FileNode> => {
      const node: FileNode = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type,
      };

      if (file.type === 'directory' && file.children && file.children.length > 0) {
        const childFiles = await vfs.list(file.path);
        node.children = await Promise.all(
          childFiles.map(child => convertToFileNode(child))
        );
      }

      return node;
    };

    return Promise.all(files.map(file => convertToFileNode(file)));
  }, []);

  const initializeSampleProject = useCallback(async () => {
    const vfs = await getVFS();
    
    // Check if already initialized
    const hasFiles = await vfs.exists('/package.json');
    if (hasFiles) {
      return; // Already initialized
    }

    // Create directory structure
    await vfs.mkdir('/src');
    await vfs.mkdir('/src/components');
    await vfs.mkdir('/src/utils');
    await vfs.mkdir('/public');

    // Create sample files
    await vfs.write('/package.json', JSON.stringify({
      name: 'my-project',
      version: '1.0.0',
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
    }, null, 2));

    await vfs.write('/README.md', '# My Project\n\nWelcome to your new project!\n');

    await vfs.write('/src/index.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

    await vfs.write('/src/App.tsx', `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Welcome to ZacAi IDE</h1>
      <p>Start editing to see changes!</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;
`);

    await vfs.write('/src/components/Button.tsx', `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}
`);

    await vfs.write('/src/utils/helpers.ts', `export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`);

    await vfs.write('/.gitignore', `node_modules/
dist/
build/
.env
.env.local
`);
  }, []);

  return {
    isReady,
    error,
    readFile,
    writeFile,
    deleteFile,
    createDirectory,
    listDirectory,
    fileExists,
    renameFile,
    moveFile,
    searchFiles,
    getFileTree,
    initializeSampleProject,
  };
}
