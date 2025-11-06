"use client";

import React, { useState, useEffect } from 'react';
import { Github, Search, GitBranch, Star, GitFork, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { github } from '@/lib/ide/githubIntegration';
import { useToast } from '@/hooks/use-toast';

interface GitHubBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloneRepo?: (path: string) => void;
}

export function GitHubBrowser({ open, onOpenChange, onCloneRepo }: GitHubBrowserProps) {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (authenticated) {
      loadRepositories();
    }
  }, [authenticated]);

  const handleAuthenticate = () => {
    if (!token.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a GitHub token',
        variant: 'destructive',
      });
      return;
    }

    try {
      github.setToken(token);
      setAuthenticated(true);
      toast({
        title: 'Success',
        description: 'Authenticated with GitHub',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to authenticate',
        variant: 'destructive',
      });
    }
  };

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const data = await github.listRepositories();
      setRepos(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load repositories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRepositories();
      return;
    }

    setLoading(true);
    try {
      const data = await github.searchRepositories(searchQuery);
      setRepos(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Search failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (owner: string, repoName: string) => {
    setLoading(true);
    try {
      const path = await github.cloneRepositoryToVFS(owner, repoName);
      toast({
        title: 'Success',
        description: `Cloned ${owner}/${repoName} to ${path}`,
      });
      onCloneRepo?.(path);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to clone ${owner}/${repoName}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-[#252526] border-[#3e3e42]">
          <DialogHeader>
            <DialogTitle className="text-gray-200 flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Authentication
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your GitHub Personal Access Token to browse and clone repositories.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                className="bg-[#3c3c3c] border-[#3e3e42] text-gray-200"
              />
              <p className="text-xs text-gray-500 mt-2">
                Create a token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>

            <Button onClick={handleAuthenticate} className="w-full">
              <Github className="w-4 h-4 mr-2" />
              Authenticate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] bg-[#252526] border-[#3e3e42]">
        <DialogHeader>
          <DialogTitle className="text-gray-200 flex items-center gap-2">
            <Github className="w-5 h-5" />
            Browse GitHub Repositories
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-[#3c3c3c] border-[#3e3e42] text-gray-200"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <ScrollArea className="flex-1 rounded-md border border-[#3e3e42]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : repos.length > 0 ? (
              <div className="p-2 space-y-2">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-4 rounded bg-[#2a2d2e] hover:bg-[#37373d] border border-[#3e3e42]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-200 truncate">
                          {repo.fullName}
                        </h3>
                        {repo.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            {repo.forks}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClone(repo.owner, repo.name)}
                        disabled={loading}
                        className="ml-4"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Clone
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No repositories found
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
