/**
 * File: app/admin/pages/Integrations/github-app/page.tsx
 * Extended Admin UI with Test Connection including output panel
 * showing real-time test results.
 *
 * Dependencies:
 * - ./hooks/useGitHubAppSettings.ts
 * - ./testApi.ts (POST API to trigger integration test)
 */

"use client";

import React, { useState, useEffect } from "react";
import { useGitHubAppSettings, GitHubAppSettings } from "./hooks/useGitHubAppSettings";

export default function GitHubAppAdminPage() {
  const { settings, loading, error, updateSettings } = useGitHubAppSettings();
  const [form, setForm] = useState<GitHubAppSettings>({ appId: "", clientId: "", webhookSecret: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Test connection states and logs
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSave() {
    await updateSettings(form);
    setIsEditing(false);
  }

  function onCancel() {
    setForm(settings);
    setIsEditing(false);
  }

  async function runTestConnection() {
    setTesting(true);
    setTestOutput(null);
    setTestError(null);
    try {
      const res = await fetch("/admin/pages/Integrations/github-app/testApi", { method: "POST" });
      if (!res.ok) throw new Error(`Test failed with status ${res.status}`);
      const data = await res.json();
      setTestOutput(data.output || "Test completed successfully.");
    } catch (e: any) {
      setTestError(`Test failed: ${e.message}`);
    } finally {
      setTesting(false);
    }
  }

  if (loading) return <p>Loading GitHub App settings...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6">GitHub App Integration Settings</h1>

      {/* Config Form */}
      <label className="block mb-2 font-medium">App ID</label>
      <input
        name="appId"
        type="text"
        value={form.appId}
        disabled={!isEditing}
        onChange={onChange}
        className="border p-2 rounded mb-4 w-full"
      />

      <label className="block mb-2 font-medium">Client ID</label>
      <input
        name="clientId"
        type="text"
        value={form.clientId}
        disabled={!isEditing}
        onChange={onChange}
        className="border p-2 rounded mb-4 w-full"
      />

      <label className="block mb-2 font-medium">Webhook Secret</label>
      <input
        name="webhookSecret"
        type="password"
        value={form.webhookSecret}
        disabled={!isEditing}
        onChange={onChange}
        className="border p-2 rounded mb-6 w-full"
      />

      <div className="flex space-x-4 mb-8">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={onSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Test Connection */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Test Connection</h2>
        <button
          onClick={runTestConnection}
          disabled={testing}
          className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 disabled:opacity-50"
        >
          {testing ? "Running Tests..." : "Run Integration Test"}
        </button>
        {testOutput && (
          <pre className="mt-4 p-4 bg-gray-100 rounded max-h-48 overflow-auto whitespace-pre-wrap break-words">
            {testOutput}
          </pre>
        )}
        {testError && <p className="mt-4 text-red-600 font-semibold">{testError}</p>}
      </section>
    </div>
  );
}
