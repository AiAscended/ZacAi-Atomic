/**
 * test/githubAppIntegration.test.ts
 *
 * Integration tests for GitHub App utilities.
 * 
 * Instructions:
 * - Set environment variables for GITHUB_APP_ID, GITHUB_APP_CLIENT_ID,
 *   GITHUB_APP_PRIVATE_KEY, GITHUB_APP_WEBHOOK_SECRET before running.
 * - Provide a valid GitHub installation ID for your app.
 * - Run with `npx jest test/githubAppIntegration.test.ts` or via `npm test`.
 */

import { getInstallationAccessToken } from '../src/ai/utils/github-app/auth'
import { listRepos, createRepo } from '../src/ai/utils/github-app/repos'
import { readFile, writeFile, getFileSha } from '../src/ai/utils/github-app/files'
import { searchRepos } from '../src/ai/utils/github-app/search'

const installationId = Number(process.env.TEST_GITHUB_INSTALLATION_ID || 0)
if (!installationId) {
  console.warn('Set TEST_GITHUB_INSTALLATION_ID env var to a valid installation ID before running tests')
}

describe('GitHub App Integration Tests', () => {
  it('should generate a valid installation access token', async () => {
    const token = await getInstallationAccessToken(installationId)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)
  })

  it('should list repositories', async () => {
    const repos = await listRepos(installationId)
    expect(Array.isArray(repos)).toBe(true)
  })

  it('should create, read, update, and commit a file', async () => {
    const repoName = `test-repo-${Date.now()}`
    // Create repo first (optional)
    // Comment out repo creation if you want to test only file ops on existing repo
    //const repo = await createRepo(installationId, repoName)
    const repo = { name: repoName } // Use an existing repo for safety

    const owner = process.env.GITHUB_USER || '' // repo owner username
    const path = 'testfile.md'
    const branch = 'main'
    const commitMsg1 = 'First commit from integration test'
    const commitMsg2 = 'Update commit from integration test'
    const content1 = 'Hello from integration test.'
    const content2 = 'Updated content from integration test.'

    // Write file first time
    const writeRes1 = await writeFile(installationId, owner, repo.name, path, commitMsg1, content1, undefined, branch)
    expect(writeRes1.content.path).toBe(path)

    // Read file content
    const readContent = await readFile(installationId, owner, repo.name, path, branch)
    expect(readContent).toBe(content1)

    // Get file sha
    const sha = await getFileSha(installationId, owner, repo.name, path, branch)
    expect(typeof sha).toBe('string')
    
    // Update file with sha
    const writeRes2 = await writeFile(installationId, owner, repo.name, path, commitMsg2, content2, sha, branch)
    expect(writeRes2.content.path).toBe(path)

    // Read updated content
    const updatedContent = await readFile(installationId, owner, repo.name, path, branch)
    expect(updatedContent).toBe(content2)
  })

  it('should search repositories', async () => {
    const query = 'test'
    const results = await searchRepos(installationId, query, 5, 1)
    expect(Array.isArray(results)).toBe(true)
  })
})
