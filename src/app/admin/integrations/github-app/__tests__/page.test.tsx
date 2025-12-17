import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GitHubAppAdminPage from '../page'

type MockSettings = {
  appId: string
  clientId: string
  webhookSecret?: string
  installations: any[]
  enableAutoCommit: boolean
  enablePRCreation: boolean
  enableIssueSync: boolean
  defaultBranch: string
  commitMessagePrefix: string
}

const baseSettings: MockSettings = {
  appId: '123',
  clientId: 'abc',
  webhookSecret: 'secret',
  installations: [],
  enableAutoCommit: true,
  enablePRCreation: true,
  enableIssueSync: true,
  defaultBranch: 'main',
  commitMessagePrefix: '[AI]',
}

describe('GitHubAppAdminPage', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    let currentSettings = { ...baseSettings }
    fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      if (typeof input === 'string' && input.includes('/api/admin/github-app/settings')) {
        if (init?.method === 'POST' && typeof init.body === 'string') {
          currentSettings = JSON.parse(init.body)
        }

        return {
          ok: true,
          json: async () => currentSettings,
        } as unknown as Response
      }

      return {
        ok: true,
        json: async () => ({}),
      } as unknown as Response
    })

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders and allows editing settings', async () => {
    render(<GitHubAppAdminPage />)

    const appIdInput = await screen.findByLabelText(/App ID/i)
    expect(appIdInput).toHaveValue('123')

    fireEvent.change(appIdInput, { target: { value: '456' } })

    fireEvent.click(screen.getByText(/Save Configuration/i))

    await waitFor(() => {
      expect(screen.getByLabelText(/App ID/i)).toHaveValue('456')
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/github-app/settings', expect.objectContaining({ method: 'POST' }))
  })
})
