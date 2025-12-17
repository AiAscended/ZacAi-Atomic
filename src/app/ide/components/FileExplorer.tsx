"use client";

import React, { useState } from 'react';
import {
  FolderIcon,
  FolderOpen,
  FileIcon,
  FileCode,
  FileJson,
  Image,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  expanded?: boolean;
}

// Sample file tree structure
const sampleFileTree: FileNode[] = [
  {
    name: 'src',
    path: '/src',
    type: 'directory',
    expanded: true,
    children: [
      {
        name: 'components',
        path: '/src/components',
        type: 'directory',
        expanded: false,
        children: [
          { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file' },
          { name: 'Card.tsx', path: '/src/components/Card.tsx', type: 'file' },
        ],
      },
      { name: 'app.tsx', path: '/src/app.tsx', type: 'file' },
      { name: 'index.tsx', path: '/src/index.tsx', type: 'file' },
    ],
  },
  {
    name: 'public',
    path: '/public',
    type: 'directory',
    expanded: false,
    children: [
      { name: 'logo.png', path: '/public/logo.png', type: 'file' },
    ],
  },
  { name: 'package.json', path: '/package.json', type: 'file' },
  { name: 'tsconfig.json', path: '/tsconfig.json', type: 'file' },
  { name: 'README.md', path: '/README.md', type: 'file' },
];

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'tsx':
    case 'jsx':
    case 'ts':
    case 'js':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-400" />;
    case 'png':
    case 'jpg':
    case 'svg':
    case 'gif':
      return <Image className="w-4 h-4 text-purple-400" />;
    default:
      return <FileIcon className="w-4 h-4 text-gray-400" />;
  }
}

function FileTreeNode({
  node,
  level = 0,
  onToggle,
  onSelect,
  selectedPath,
}: {
  node: FileNode;
  level?: number;
  onToggle: (path: string) => void;
  onSelect: (node: FileNode) => void;
  selectedPath: string | null;
}) {
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      onToggle(node.path);
    } else {
      onSelect(node);
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
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] ${
              isSelected ? 'bg-[#37373d]' : ''
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
          >
            {node.type === 'directory' && (
              <span className="flex-shrink-0">
                {node.expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </span>
            )}
            <span className="flex-shrink-0 ml-1">
              {node.type === 'directory' ? (
                node.expanded ? (
                  <FolderOpen className="w-4 h-4 text-yellow-500" />
                ) : (
                  <FolderIcon className="w-4 h-4 text-yellow-500" />
                )
              ) : (
                getFileIcon(node.name)
              )}
            </span>
            <span className="ml-1 text-sm text-gray-200 truncate">{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>New File</ContextMenuItem>
          <ContextMenuItem>New Folder</ContextMenuItem>
          <ContextMenuItem>Rename</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
          <ContextMenuItem>Copy Path</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {node.type === 'directory' && node.expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedPath={selectedPath}
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

export function FileExplorer() {
  const [fileTree, setFileTree] = useState<FileNode[]>(sampleFileTree);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleNode = (path: string) => {
    const toggleInTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: toggleInTree(node.children) };
        }
        return node;
      });
    };
    setFileTree(toggleInTree(fileTree));
  };

  const handleSelect = (node: FileNode) => {
    setSelectedPath(node.path);
    // TODO: Open file in editor
    console.log('Selected file:', node.path);
  };

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-300 uppercase">Explorer</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[#3e3e42]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-[#3c3c3c] border-[#3e3e42] text-sm text-gray-200"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {fileTree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            onToggle={toggleNode}
            onSelect={handleSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#3e3e42] text-xs text-gray-500">
        <span>{fileTree.length} items</span>
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
