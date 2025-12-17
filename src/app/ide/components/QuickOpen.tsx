"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileIcon, FileCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileSystem } from '@/lib/ide/useFileSystem';
import { useEditorStore } from '@/lib/ide/editorStore';
import type { IDEFile } from '@/lib/ide/virtualFileSystem';
interface QuickOpenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickOpen({ open, onOpenChange }: QuickOpenProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<IDEFile[]>([]);
  const { searchFiles } = useFileSystem();
  const { openFile } = useEditorStore();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      const files = await searchFiles(searchQuery);
      setResults(files.slice(0, 20)); // Limit to 20 results
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  }, [searchFiles]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectFile(results[selectedIndex]);
      }
    }
  };

  const handleSelectFile = async (file: IDEFile) => {
    try {
      const fileName = file.path.split('/').pop() || file.path;
      openFile(file.path, fileName, file.content, file.language);
      onOpenChange(false);
      setQuery('');
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const getFileIcon = (language: string) => {
    if (['typescript', 'javascript'].includes(language)) {
      return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    return <FileIcon className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#252526] border-[#3e3e42]">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Quick Open File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Type to search files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-[#3c3c3c] border-[#3e3e42] text-gray-200"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[400px] rounded-md border border-[#3e3e42]">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((file, index) => (
                  <div
                    key={file.path}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer ${
                      index === selectedIndex
                        ? 'bg-[#37373d]'
                        : 'hover:bg-[#2a2d2e]'
                    }`}
                    onClick={() => handleSelectFile(file)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {getFileIcon(file.language)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200 truncate">
                        {file.path.split('/').pop()}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {file.path}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No files found
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Start typing to search...
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Use ↑↓ to navigate, Enter to open, Esc to close</span>
            {results.length > 0 && (
              <span>{results.length} {results.length === 1 ? 'result' : 'results'}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
