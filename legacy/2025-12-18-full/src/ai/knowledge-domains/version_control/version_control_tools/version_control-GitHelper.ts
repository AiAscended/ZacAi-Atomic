/**
 * Version Control Domain Tool: Git Helper
 * Assists with version control operations and best practices
 */

export class VersionControlGitHelper {
  suggest(context: string): {
    command: string;
    explanation: string;
    alternatives: string[];
  } {
    // Tiny heuristic so we actually use the context payload
    const normalized = context.trim().toLowerCase();
    let command = 'git status';
    let explanation = 'Show repository status to review pending work.';
    let alternatives = ['git add .', 'git commit -m "Describe change"'];

    if (normalized.includes('branch')) {
      command = 'git checkout -b feature/amazing-update';
      explanation = 'Create a feature branch for the described work.';
      alternatives = ['git switch -c feature/amazing-update'];
    } else if (normalized.includes('merge')) {
      command = 'git merge main';
      explanation = 'Merge the latest main branch into the current branch.';
      alternatives = ['git rebase main'];
    } else if (normalized.includes('push')) {
      command = 'git push origin HEAD';
      explanation = 'Push the current branch to origin as requested.';
      alternatives = ['git push --set-upstream origin feature/amazing-update'];
    }

    return {
      command: "",
      explanation: "",
      alternatives: [],
    };
  }
}

export default VersionControlGitHelper;
