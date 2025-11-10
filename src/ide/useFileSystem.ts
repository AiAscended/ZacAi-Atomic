import { useState, useEffect, useCallback } from 'react';
import { vfs, IDEFile } from './virtualFileSystem';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  expanded?: boolean;
}

export function useFileSystem() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildFileTree = useCallback((files: IDEFile[]): FileNode[] => {
    const nodeMap = new Map<string, FileNode>();
    const rootNodes: FileNode[] = [];

    // First pass: create all nodes
    files.forEach((file) => {
      const name = file.path.split('/').filter(Boolean).pop() || file.path;
      nodeMap.set(file.path, {
        name,
        path: file.path,
        type: file.type,
        children: file.type === 'directory' ? [] : undefined,
        expanded: false,
      });
    });

    // Second pass: build tree structure
    files.forEach((file) => {
      const node = nodeMap.get(file.path);
      if (!node) return;

      if (file.parent && file.parent !== file.path) {
        const parentNode = nodeMap.get(file.parent);
        if (parentNode && parentNode.children) {
          parentNode.children.push(node);
        }
      } else if (file.path !== '/') {
        rootNodes.push(node);
      }
    });

    // Sort: directories first, then files, alphabetically
    const sortNodes = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((node) => {
        if (node.children) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootNodes);
    return rootNodes;
  }, []);

  const loadFileTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const files = await vfs.getDirectoryTree('/');
      const tree = buildFileTree(files.filter((f) => f.path !== '/'));
      setFileTree(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [buildFileTree]);

  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  const createFile = useCallback(
    async (path: string, content: string = '') => {
      try {
        await vfs.createFile(path, content);
        await loadFileTree();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to create file'
        );
      }
    },
    [loadFileTree]
  );

  const createDirectory = useCallback(
    async (path: string) => {
      try {
        await vfs.createDirectory(path);
        await loadFileTree();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to create directory'
        );
      }
    },
    [loadFileTree]
  );

  const deleteFile = useCallback(
    async (path: string) => {
      try {
        await vfs.deleteFile(path);
        await loadFileTree();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to delete file'
        );
      }
    },
    [loadFileTree]
  );

  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      try {
        await vfs.renameFile(oldPath, newPath);
        await loadFileTree();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to rename file'
        );
      }
    },
    [loadFileTree]
  );

  const readFile = useCallback(async (path: string) => {
    try {
      return await vfs.readFile(path);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to read file'
      );
    }
  }, []);

  const writeFile = useCallback(
    async (path: string, content: string) => {
      try {
        await vfs.writeFile(path, content);
        await loadFileTree();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to write file'
        );
      }
    },
    [loadFileTree]
  );

  const searchFiles = useCallback(async (query: string) => {
    try {
      return await vfs.searchFiles(query);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to search files'
      );
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await vfs.clearAll();
      await loadFileTree();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to clear files'
      );
    }
  }, [loadFileTree]);

  return {
    fileTree,
    loading,
    error,
    refresh: loadFileTree,
    createFile,
    createDirectory,
    deleteFile,
    renameFile,
    readFile,
    writeFile,
    searchFiles,
    clearAll,
  };
}
