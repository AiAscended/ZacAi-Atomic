/**
 * test/githubAppIntegration.test.ts
 *
 * Integration tests for GitHub App utilities:
 * - authentication token generation
 * - repository listing and creation
 * - file read/write and commit operations
 * - repo search
 *
 * Usage:
 * - Set environment variables for GitHub App secrets and installation ID before running:
 *   GITHUB_APP_ID, GITHUB_APP_CLIENT_ID, GITHUB_APP_PRIVATE_KEY,
 *   GITHUB_APP_WEBHOOK_SECRET, TEST_GITHUB_INSTALLATION_ID
 * - Run with: npx jest test/githubAppIntegration.test.ts
 */

import { getInstallationAccessToken } from '../auth'
import { listRepos, createRepo } from '../repos'
import { readFile, writeFile, getFileSha } from '../files'
import { searchRepos } from '../search'

const installationId = Number(process.env.TEST_GITHUB_INSTALLATION_ID || 0)

describe('GitHub App Integration Tests', () => {
  if (!installationId) {
    test.skip('GitHub installation ID not set. Skipping all tests.', () => {})
    return
  }

  test('Generate installation access token', async () => {
    const token = await getInstallationAccessToken(installationId)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)
  })

  test('List repositories', async () => {
    const repos = await listRepos(installationId)
    expect(Array.isArray(repos)).toBe(true)
  })

  test('Read, write, and update a file in repo', async () => {
    const owner = process.env.GITHUB_USER || ''
    const repo = process.env.TEST_GITHUB_TEST_REPO || ''
    if (!owner || !repo) {
      throw new Error('Set GITHUB_USER and TEST_GITHUB_TEST_REPO env vars to run file tests')
    }

    const testPath = 'integration_test_file.txt'
    const commitMsg1 = 'Initial commit from integration test'
    const commitMsg2 = 'Update commit from integration test'
    const content1 = 'Hello from integration test.'
    const content2 = 'Updated content from integration test.'

    // Initial write
    const writeResult = await writeFile(installationId, owner, repo, testPath, commitMsg1, content1)
    expect(writeResult.content.path).toBe(testPath)

    // Read file
    const readContent = await readFile(installationId, owner, repo, testPath)
    expect(readContent).toBe(content1)

    // Update file
    const sha = await getFileSha(installationId, owner, repo, testPath)
    expect(sha).toBeDefined()

    if (sha) {
      const writeResult2 = await writeFile(installationId, owner, repo, testPath, commitMsg2, content2, sha)
      expect(writeResult2.content.path).toBe(testPath)

      const updatedContent = await readFile(installationId, owner, repo, testPath)
      expect(updatedContent).toBe(content2)
    }
  })

  test('Search repositories', async () => {
    const results = await searchRepos(installationId, 'test', 5, 1)
    expect(Array.isArray(results)).toBe(true)
  })
})
