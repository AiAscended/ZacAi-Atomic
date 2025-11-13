/**
 * File: src/app/ide/components/FileExplorer.tsx
 * Purpose: File explorer tree view component
 */

"use client";

import React, { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown, FilePlus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  onFileClick?: (file: FileNode) => void;
  onFileCreate?: () => void;
  onFolderCreate?: () => void;
  className?: string;
}

function TreeNode({ 
  node, 
  level = 0, 
  onFileClick 
}: { 
  node: FileNode; 
  level?: number; 
  onFileClick?: (file: FileNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = node.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick?.(node);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-accent rounded-sm',
          'text-sm'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isDirectory && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
        <span className="flex-shrink-0">
          {isDirectory ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  files,
  onFileClick,
  onFileCreate,
  onFolderCreate,
  className,
}: FileExplorerProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-ide-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onFileCreate}
          title="New File"
        >
          <FilePlus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onFolderCreate}
          title="New Folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tree view */}
      <div className="flex-1 overflow-auto p-2">
        {files.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No files yet</p>
            <p className="text-xs mt-1">Create a file to get started</p>
          </div>
        ) : (
          files.map((node) => (
            <TreeNode key={node.id} node={node} onFileClick={onFileClick} />
          ))
        )}
      </div>
    </div>
  );
}
