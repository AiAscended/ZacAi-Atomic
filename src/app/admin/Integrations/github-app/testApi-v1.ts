import type { NextApiRequest, NextApiResponse } from 'next'
import { exec } from 'child_process'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    exec('npx jest test/githubAppIntegration.test.ts --json', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message, stderr })
      }
      res.status(200).json({ output: stdout })
    })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
