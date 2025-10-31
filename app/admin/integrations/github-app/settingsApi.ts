/**
 * app/admin/pages/Integrations/github-app/settingsApi.ts
 * API handler for GitHub app settings GET & POST operations.
 */

import type { NextApiRequest, NextApiResponse } from "next"

let storedSettings = {
  appId: process.env.GITHUB_APP_ID ?? "",
  clientId: process.env.GITHUB_APP_CLIENT_ID ?? "",
  webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET ?? "",
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(storedSettings)
  } else if (req.method === "POST") {
    const { appId, clientId, webhookSecret } = req.body

    if (!appId || !clientId || !webhookSecret) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    storedSettings = { appId, clientId, webhookSecret }
    // TODO: implement secure persistent storage in production

    res.status(200).json(storedSettings)
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
