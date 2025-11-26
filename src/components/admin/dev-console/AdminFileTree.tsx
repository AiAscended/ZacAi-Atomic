/**
 * File: src/components/admin/dev-console/AdminFileTree.tsx
 * Purpose: File tree component for ZacAi dev console
 * Features: Expandable directories, file selection, lazy loading
 */

"use client"

import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  children?: FileItem[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

interface AdminFileTreeProps {
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  className?: string;
}

export function AdminFileTree({ onFileSelect, selectedPath, className }: AdminFileTreeProps) {
  const [root, setRoot] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDirectory('');
  }, []);

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/dev-console/files?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        throw new Error('Failed to load directory');
      }

      const data = await response.json();
      
      if (path === '') {
        // Root directory
        setRoot({
          name: 'ZacAi Project',
          path: '',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          children: data.items,
          isExpanded: true,
        });
      } else {
        // Update specific directory in tree
        updateDirectoryInTree(path, data.items);
      }
    } catch (error) {
      console.error('Error loading directory:', error);
      setError(error instanceof Error ? error.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const updateDirectoryInTree = (path: string, items: FileItem[]) => {
    setRoot((prevRoot) => {
      if (!prevRoot) return null;
      return updateNodeInTree(prevRoot, path, items);
    });
  };

  const updateNodeInTree = (node: FileItem, targetPath: string, items: FileItem[]): FileItem => {
    if (node.path === targetPath) {
      return {
        ...node,
        children: items,
        isExpanded: true,
        isLoading: false,
      };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) => updateNodeInTree(child, targetPath, items)),
      };
    }

    return node;
  };

  const handleDirectoryClick = async (item: FileItem) => {
    if (item.type !== 'directory') return;

    if (item.isExpanded) {
      // Collapse
      setRoot((prevRoot) => {
        if (!prevRoot) return null;
        return toggleNodeExpansion(prevRoot, item.path, false);
      });
    } else {
      // Expand and load if needed
      if (!item.children) {
        setRoot((prevRoot) => {
          if (!prevRoot) return null;
          return setNodeLoading(prevRoot, item.path, true);
        });

        await loadDirectory(item.path);
      } else {
        setRoot((prevRoot) => {
          if (!prevRoot) return null;
          return toggleNodeExpansion(prevRoot, item.path, true);
        });
      }
    }
  };

  const toggleNodeExpansion = (node: FileItem, targetPath: string, expanded: boolean): FileItem => {
    if (node.path === targetPath) {
      return { ...node, isExpanded: expanded };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) => toggleNodeExpansion(child, targetPath, expanded)),
      };
    }

    return node;
  };

  const setNodeLoading = (node: FileItem, targetPath: string, loading: boolean): FileItem => {
    if (node.path === targetPath) {
      return { ...node, isLoading: loading };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) => setNodeLoading(child, targetPath, loading)),
      };
    }

    return node;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'json':
        return FileJson;
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
      case 'py':
      case 'rs':
      case 'go':
        return FileCode;
      case 'md':
      case 'txt':
        return FileText;
      default:
        return File;
    }
  };

  const renderTreeNode = (item: FileItem, level: number = 0) => {
    const isDirectory = item.type === 'directory';
    const isSelected = item.path === selectedPath;
    const Icon = isDirectory
      ? item.isExpanded
        ? FolderOpen
        : Folder
      : getFileIcon(item.name);

    return (
      <div key={item.path}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded',
            isSelected && 'bg-blue-100 dark:bg-blue-900',
            'transition-colors'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (isDirectory) {
              handleDirectoryClick(item);
            } else {
              onFileSelect(item.path);
            }
          }}
        >
          {isDirectory && (
            <span className="w-4 h-4 flex items-center justify-center">
              {item.isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : item.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {!isDirectory && <span className="w-4" />}
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{item.name}</span>
        </div>

        {isDirectory && item.isExpanded && item.children && (
          <div>
            {item.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading && !root) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 text-red-600 dark:text-red-400', className)}>
        <p className="font-semibold">Error loading file tree</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!root) {
    return null;
  }

  return (
    <div className={cn('overflow-y-auto', className)}>
      {renderTreeNode(root)}
    </div>
  );
}
