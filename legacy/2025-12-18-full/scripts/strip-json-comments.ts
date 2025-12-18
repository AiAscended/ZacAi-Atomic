#!/usr/bin/env tsx

/**
 * Remove single-line (//) and multi-line (/* *\/) comments from JSON files.
 * Traverses the workspace recursively while skipping common build and dependency directories.
 */

import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
])

interface StripResult {
  changed: boolean
  content: string
}

const stripJsonComments = (content: string): StripResult => {
  let inString = false
  let inSingleLineComment = false
  let inMultiLineComment = false
  let stringDelimiter: '"' | "'" = '"'
  let escaped = false
  let changed = false
  let output = ''

  for (let index = 0; index < content.length; index++) {
    const char = content[index]
    const nextChar = content[index + 1]

    if (inSingleLineComment) {
      if (char === "\n") {
        inSingleLineComment = false
        output += char
      } else {
        changed = true
      }
      continue
    }

    if (inMultiLineComment) {
      if (char === "*" && nextChar === "/") {
        inMultiLineComment = false
        index++
      }
      changed = true
      continue
    }

    if (inString) {
      output += char
      if (escaped) {
        escaped = false
      } else if (char === "\\") {
        escaped = true
      } else if (char === stringDelimiter) {
        inString = false
      }
      continue
    }

    if (char === '/' && nextChar === '/') {
      inSingleLineComment = true
      changed = true
      index++
      continue
    }

    if (char === '/' && nextChar === '*') {
      inMultiLineComment = true
      changed = true
      index++
      continue
    }

    if (char === '"' || char === "'") {
      inString = true
      stringDelimiter = char
      output += char
      continue
    }

    output += char
  }

  return { changed, content: output }
}

const shouldIgnore = (dirPath: string): boolean => IGNORED_DIRECTORIES.has(path.basename(dirPath))

const collectJsonFiles = async (rootDir: string): Promise<string[]> => {
  const entries = await readdir(rootDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name)

    if (entry.isDirectory()) {
      if (shouldIgnore(entryPath)) continue
      files.push(...(await collectJsonFiles(entryPath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath)
    }
  }

  return files
}

const processFile = async (filePath: string): Promise<boolean> => {
  const original = await readFile(filePath, 'utf-8')
  const { changed, content } = stripJsonComments(original)

  if (!changed) return false

  // Double-check JSON validity before overwriting
  try {
    JSON.parse(content)
  } catch (error) {
    console.error(`Skipping ${filePath} due to JSON parse error after stripping:`, error)
    return false
  }

  await writeFile(filePath, content, 'utf-8')
  return true
}

const main = async () => {
  const root = process.cwd()
  const files = await collectJsonFiles(root)
  let updated = 0

  for (const file of files) {
    try {
      const changed = await processFile(file)
      if (changed) {
        updated++
        console.log(`Stripped comments from ${path.relative(root, file)}`)
      }
    } catch (error) {
      console.error(`Failed to process ${file}:`, error)
    }
  }

  console.log(`Processed ${files.length} JSON files. Updated ${updated} file(s).`)
}

main().catch((error) => {
  console.error('strip-json-comments failed:', error)
  process.exitCode = 1
})
