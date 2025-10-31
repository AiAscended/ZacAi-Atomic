import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GitHubAppAdminPage from '../page'

jest.mock('../hooks/useGitHubAppSettings', () => ({
  useGitHubAppSettings: () => ({
    settings: { appId: '123', clientId: 'abc', webhookSecret: 'secret' },
    loading: false,
    error: null,
    updateSettings: jest.fn().mockResolvedValue(true),
  }),
}))

describe('GitHubAppAdminPage', () => {
  it('renders and allows editing settings', async () => {
    render(<GitHubAppAdminPage />)

    expect(screen.getByLabelText(/App ID/i)).toHaveValue('123')

    fireEvent.click(screen.getByText(/Edit/i))

    const appIdInput = screen.getByLabelText(/App ID/i)
    fireEvent.change(appIdInput, { target: { value: '456' } })

    fireEvent.click(screen.getByText(/Save/i))

    await waitFor(() => {
      expect(screen.getByLabelText(/App ID/i)).toHaveValue('456')
    })
  })
})
