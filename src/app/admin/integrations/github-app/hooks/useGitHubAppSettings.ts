"use client"

/**
 * app/admin/integrations/github-app/hooks/useGitHubAppSettings.ts
 * React hook for managing GitHub App settings in the admin UI.
 */

import { useState, useEffect } from "react"

export interface GitHubAppSettings {
  appId: string
  clientId: string
  webhookSecret: string
}

export function useGitHubAppSettings() {
  const [settings, setSettings] = useState<GitHubAppSettings>({
    appId: "",
    clientId: "",
    webhookSecret: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSettings() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/admin/integrations/github-app/settingsApi")
      if (!res.ok) throw new Error("Failed to load settings")
      const data = await res.json()
      setSettings(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings(newSettings: GitHubAppSettings) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/admin/integrations/github-app/settingsApi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) throw new Error("Failed to update settings")
      const data = await res.json()
      setSettings(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return { settings, loading, error, updateSettings }
}
