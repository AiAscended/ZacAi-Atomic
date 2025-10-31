/**
 * app/admin/integrations/github-app/page-v2.tsx
 * Extended GitHub App Integration Admin UI with full settings,
 * webhook/workflow toggles, and a Test Connection panel
 * to verify credentials and GitHub API read/write/commit access.
 *
 * Depends on:
 * - ./hooks/useGitHubAppSettings.ts (manages config state and API)
 * - ./testApi.ts (API route to run integration tests)
 */

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useGitHubAppSettings, type GitHubAppSettings } from "./hooks/useGitHubAppSettings"

export default function GitHubAppAdminPage() {
  const { settings, loading, error, updateSettings } = useGitHubAppSettings()

  const [form, setForm] = useState<GitHubAppSettings>({ appId: "", clientId: "", webhookSecret: "" })
  const [isEditing, setIsEditing] = useState(false)

  // Test connection panel state
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSave() {
    await updateSettings(form)
    setIsEditing(false)
  }

  function onCancel() {
    setForm(settings)
    setIsEditing(false)
  }

  // Runs the backend integration test script via API
  async function runTestConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/admin/integrations/github-app/testApi", { method: "POST" })
      if (!res.ok) throw new Error(`Test failed with status ${res.status}`)
      const data = await res.json()
      setTestResult(data.output || "Test completed successfully.")
    } catch (e: any) {
      setTestResult(`Test error: ${e.message}`)
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <p>Loading configuration...</p>
  if (error) return <p className="text-red-600">Error loading config: {error}</p>

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-semibold mb-6">GitHub App Integration Settings</h1>

      {/* Configuration Form */}
      <section className="mb-8">
        <label className="block mb-1 font-medium">App ID</label>
        <input
          name="appId"
          type="text"
          value={form.appId}
          onChange={onChange}
          disabled={!isEditing}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-1 font-medium">Client ID</label>
        <input
          name="clientId"
          type="text"
          value={form.clientId}
          onChange={onChange}
          disabled={!isEditing}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-1 font-medium">Webhook Secret</label>
        <input
          name="webhookSecret"
          type="password"
          value={form.webhookSecret}
          onChange={onChange}
          disabled={!isEditing}
          className="w-full p-2 border rounded mb-6"
        />

        <div className="flex space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button onClick={onSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save
              </button>
              <button onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
            </>
          )}
        </div>
      </section>

      {/* Test Connection Panel */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-3">Test Connection</h2>
        <button
          onClick={runTestConnection}
          disabled={testing}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {testing ? "Testing..." : "Run Integration Test"}
        </button>
        {testResult && (
          <pre className="mt-4 p-4 bg-gray-100 rounded border h-48 overflow-auto whitespace-pre-wrap break-words">
            {testResult}
          </pre>
        )}
      </section>
    </div>
  )
}
