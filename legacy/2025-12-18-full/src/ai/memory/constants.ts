import path from "node:path"

const INTERNAL_MEMORY_ROOT = path.join(process.cwd(), "data", "internal-memory")

export const MEMORY_PATHS = {
  root: INTERNAL_MEMORY_ROOT,
  stable: path.join(INTERNAL_MEMORY_ROOT, "stable"),
  backup: path.join(INTERNAL_MEMORY_ROOT, "backup"),
  vector: path.join(INTERNAL_MEMORY_ROOT, "vector"),
} as const

export function getWorkspaceRelativePath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath)
}
