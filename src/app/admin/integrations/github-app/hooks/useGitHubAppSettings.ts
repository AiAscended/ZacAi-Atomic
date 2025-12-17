"use client"

/**
 * app/admin/integrations/github-app/hooks/useGitHubAppSettings.ts
 * React hook for managing GitHub App settings in the admin UI.
 */

import { useState, useEffect, useCallback } from "react"

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

  const toMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    return typeof error === "string" ? error : "Unknown error"
  }

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/admin/integrations/github-app/settingsApi")
      if (!res.ok) throw new Error("Failed to load settings")
      const data = await res.json()
      setSettings(data)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false)
    }
  }, [])

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
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, loading, error, updateSettings }
}
