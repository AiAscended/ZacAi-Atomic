/**
 * app/admin/pages/Integrations/github-app/page.tsx
 * Admin UI page for managing GitHub App integration settings.
 */

import React, { useState, useEffect } from "react";
import { useGitHubAppSettings, GitHubAppSettings } from "./hooks/useGitHubAppSettings";

export default function GitHubAppAdminPage() {
  const { settings, loading, error, updateSettings } = useGitHubAppSettings();

  const [form, setForm] = useState<GitHubAppSettings>({ appId: "", clientId: "", webhookSecret: "" });
  const [isEditing, setIsEditing] = useState(false);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-md shadow-md">
      <h1 className="text-xl font-semibold mb-4">GitHub App Integration Settings</h1>

      <div className="mb-4">
        <label htmlFor="appId" className="block text-sm font-medium mb-1">App ID</label>
        <input
          id="appId"
          name="appId"
          type="text"
          value={form.appId}
          disabled={!isEditing}
          onChange={onChange}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="clientId" className="block text-sm font-medium mb-1">Client ID</label>
        <input
          id="clientId"
          name="clientId"
          type="text"
          value={form.clientId}
          disabled={!isEditing}
          onChange={onChange}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="webhookSecret" className="block text-sm font-medium mb-1">Webhook Secret</label>
        <input
          id="webhookSecret"
          name="webhookSecret"
          type="password"
          value={form.webhookSecret}
          disabled={!isEditing}
          onChange={onChange}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      <div className="flex space-x-4">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
    </div>
  );
}
