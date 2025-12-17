/**
 * File: src/app/api/admin/github-app/jwt/route.ts
 * Purpose: Generate GitHub App JWT for authentication
 *
 * POST - Create a JWT token signed with the app's private key
 */

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/github-app/jwt
 * Generate a GitHub App JWT token
 */
export async function POST() {
  try {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      return NextResponse.json(
        {
          error:
            "GitHub App credentials not configured. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY environment variables.",
        },
        { status: 500 },
      );
    }

    // Format private key (handle both raw and base64-encoded)
    let formattedKey = privateKey;
    if (!privateKey.includes("BEGIN RSA PRIVATE KEY")) {
      try {
        formattedKey = Buffer.from(privateKey, "base64").toString("utf8");
      } catch {
        // If not base64, assume it's already formatted
      }
    }

    // Create JWT (valid for 10 minutes)
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now - 60, // Issued 60 seconds in the past to account for clock drift
      exp: now + 600, // Expires in 10 minutes
      iss: appId,
    };

    const token = jwt.sign(payload, formattedKey, { algorithm: "RS256" });

    return NextResponse.json({ token, expiresAt: payload.exp });
  } catch (error) {
    console.error("Failed to generate JWT:", error);
    return NextResponse.json(
      { error: "Failed to generate JWT token" },
      { status: 500 },
    );
  }
}
