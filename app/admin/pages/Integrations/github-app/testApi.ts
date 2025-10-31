/**
 * app/admin/pages/Integrations/github-app/testApi.ts
 * API route to trigger GitHub App integration tests.
 * Runs the integration test script, returning results.
 * 
 * Dependents:
 * - test/githubAppIntegration.test.ts (integration test script)
 *
 * Note:
 * - This runs a shell command and outputs JSON string response.
 * - Ensure environment is configured with GitHub secrets and installation ID before running.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    exec("npx jest test/githubAppIntegration.test.ts --json --silent", (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message, stderr });
      }
      res.status(200).json({ output: stdout || "Test executed successfully" });
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
