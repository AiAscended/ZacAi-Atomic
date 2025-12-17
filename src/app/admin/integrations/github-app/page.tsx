/**
 * File: src/app/admin/integrations/github-app/page.tsx
 * Admin UI page to connect GitHub App.
 *
 * Responsibilities:
 * - Render a simple button to start GitHub App installation.
 * - Redirect user to start OAuth/installation process.
 *
 * Future extension points:
 * - Add user OAuth login/logout UI components here.
 * - Display webhook status components here.
 */

"use client";

import React from "react";

export default function GitHubAppAdminPage() {
  // Redirect user to backend API which starts GitHub App installation OAuth.
  const connectGitHubApp = () => {
    window.location.href = `/api/github-app/oauth/start`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">GitHub App Connection</h1>
      <p className="mb-4">Connect your GitHub account to authorize your repositories.</p>
      <button
        onClick={connectGitHubApp}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Connect GitHub App
      </button>
      {/* Future OAuth and webhook UI components can be added here */}
    </div>
  );
}
