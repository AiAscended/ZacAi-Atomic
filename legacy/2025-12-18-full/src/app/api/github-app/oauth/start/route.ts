/**
 * File: src/app/api/github-app/oauth/start/route.ts
 * API route to start the GitHub App installation OAuth flow.
 *
 * Responsibilities:
 * - Redirect user to GitHub's official app installation page.
 *
 * Notes:
 * - Replace 'your-github-app-name' with your actual GitHub App slug.
 * - Future OAuth user login flows managed in separate API routes.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const redirectUrl = `https://github.com/apps/your-github-app-name/installations/new`;
  return NextResponse.redirect(redirectUrl);
}
