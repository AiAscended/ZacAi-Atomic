import { Octokit } from '@octokit/rest';
import { vfs } from './virtualFileSystem';

interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
}

interface GitHubFile {
  path: string;
  content: string;
  sha: string;
  type: 'file' | 'dir';
}

type RepoContentItem = {
  path: string;
  sha: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string | null;
};

type RepoContentResponse = RepoContentItem | RepoContentItem[];

class GitHubIntegration {
  private octokit: Octokit | null = null;
  private currentRepo: GitHubRepo | null = null;

  constructor() {
    // Initialize without token - will be set when user authenticates
  }

  setToken(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  isAuthenticated(): boolean {
    return this.octokit !== null;
  }

  setCurrentRepo(owner: string, repo: string, branch: string = 'main') {
    this.currentRepo = { owner, repo, branch };
  }

  getCurrentRepo(): GitHubRepo | null {
    return this.currentRepo;
  }

  async getUserInfo() {
    if (!this.octokit) throw new Error('Not authenticated');
    const { data } = await this.octokit.users.getAuthenticated();
    return data;
  }

  async listRepositories(page: number = 1, perPage: number = 30) {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      page,
      per_page: perPage,
      sort: 'updated',
      direction: 'desc',
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      private: repo.private,
      language: repo.language,
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));
  }

  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = '',
    ref?: string
  ): Promise<GitHubFile[]> {
    if (!this.octokit) throw new Error('Not authenticated');

    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    const contentData = data as RepoContentResponse;

    if (!Array.isArray(contentData)) {
      // Single file
      return [
        {
          path: contentData.path,
          content: typeof contentData.content === 'string' ? atob(contentData.content) : '',
          sha: contentData.sha,
          type: contentData.type === 'dir' ? 'dir' : 'file',
        },
      ];
    }

    // Directory listing
    return contentData.map((item) => ({
      path: item.path,
      content: '',
      sha: item.sha,
      type: item.type === 'dir' ? 'dir' : 'file',
    }));
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string> {
    if (!this.octokit) throw new Error('Not authenticated');

    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    const contentData = data as RepoContentResponse;

    if (Array.isArray(contentData)) {
      throw new Error('Path is a directory, not a file');
    }

    if (typeof contentData.content !== 'string') {
      throw new Error('File has no content');
    }

    return atob(contentData.content);
  }

  async cloneRepositoryToVFS(owner: string, repo: string, branch: string = 'main') {
    if (!this.octokit) throw new Error('Not authenticated');

    this.setCurrentRepo(owner, repo, branch);

    // Get repository tree
    const { data: tree } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1',
    });

    // Clear existing VFS and create root directory
    await vfs.clearAll();
    await vfs.createDirectory(`/${repo}`);

    // Download and create all files
    for (const item of tree.tree) {
      if (item.type === 'tree') {
        // Directory
        await vfs.createDirectory(`/${repo}/${item.path}`);
      } else if (item.type === 'blob') {
        // File
        try {
          const content = await this.getFileContent(owner, repo, item.path!, branch);
          await vfs.createFile(`/${repo}/${item.path}`, content);
        } catch (error) {
          console.error(`Failed to download file: ${item.path}`, error);
        }
      }
    }

    return `/${repo}`;
  }

  async createFile(path: string, content: string, message: string) {
    if (!this.octokit) throw new Error('Not authenticated');
    if (!this.currentRepo) throw new Error('No repository selected');

    const { owner, repo, branch } = this.currentRepo;

    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: btoa(content),
      branch,
    });
  }

  async updateFile(path: string, content: string, message: string, sha: string) {
    if (!this.octokit) throw new Error('Not authenticated');
    if (!this.currentRepo) throw new Error('No repository selected');

    const { owner, repo, branch } = this.currentRepo;

    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: btoa(content),
      sha,
      branch,
    });
  }

  async deleteFile(path: string, message: string, sha: string) {
    if (!this.octokit) throw new Error('Not authenticated');
    if (!this.currentRepo) throw new Error('No repository selected');

    const { owner, repo, branch } = this.currentRepo;

    await this.octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      branch,
    });
  }

  async listBranches(owner: string, repo: string) {
    if (!this.octokit) throw new Error('Not authenticated');

    const { data } = await this.octokit.repos.listBranches({
      owner,
      repo,
    });

    return data.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
      commitSha: branch.commit.sha,
    }));
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string = 'main') {
    if (!this.octokit) throw new Error('Not authenticated');

    // Get the SHA of the source branch
    const { data: ref } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`,
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
  }

  async listCommits(owner: string, repo: string, branch?: string, page: number = 1) {
    if (!this.octokit) throw new Error('Not authenticated');

    const { data } = await this.octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      page,
      per_page: 20,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name,
      date: commit.commit.author?.date,
      url: commit.html_url,
    }));
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ) {
    if (!this.octokit) throw new Error('Not authenticated');

    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    });

    return {
      number: data.number,
      url: data.html_url,
      state: data.state,
    };
  }

  async searchRepositories(query: string, page: number = 1) {
    if (!this.octokit) throw new Error('Not authenticated');

    const { data } = await this.octokit.search.repos({
      q: query,
      page,
      per_page: 20,
      sort: 'stars',
      order: 'desc',
    });

    return data.items.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner?.login ?? 'unknown',
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));
  }
}

export const github = new GitHubIntegration();
export type { GitHubRepo, GitHubFile };
