import { describe, it, expect } from 'vitest'
import { formatResponse } from '@/ai/orchestration/responseFormatter'

const sampleResponse = `Intro paragraph.

\`\`\`ts
const sum = (a: number, b: number) => {
  return a + b
}
\`\`\`

Closing remarks.`

describe('responseFormatter', () => {
  it('extracts code fences into structured code blocks', async () => {
    const formatted = await formatResponse(sampleResponse)

    expect(formatted.codeBlocks).toHaveLength(1)
    expect(formatted.codeBlocks[0].language).toBe('typescript')
    expect(formatted.codeBlocks[0].code).toContain('const sum')

    expect(formatted.textBlocks.length).toBeGreaterThan(0)
    expect(formatted.metadata.totalCodeBlocks).toBe(1)
    expect(formatted.metadata.languages).toContain('typescript')
  })

  it('falls back to plain text when no code fences are provided', async () => {
    const formatted = await formatResponse('Only narrative text here.')

    expect(formatted.codeBlocks).toHaveLength(0)
    expect(formatted.textBlocks).toHaveLength(1)
    expect(formatted.textBlocks[0].content).toContain('Only narrative text here.')
    expect(formatted.metadata.hasFormatting).toBe(false)
  })
})
