/**
 * File: src/ai/data/nextjs/tools/nextjs-RouteGenerator.ts
 * Purpose: Generate Next.js route files (App Router and Pages Router)
 * Depends on: None (standalone tool)
 * Depended on by: src/ai/data/nextjs/nextjs_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Generate a Next.js App Router page component
 * @param pageName - Name of the page
 * @param isDynamic - Whether this is a dynamic route
 * @param isServerComponent - Whether to use Server Component (default: true)
 * @returns Generated page.tsx code
 */
export function generateAppRouterPage(pageName: string, isDynamic = false, isServerComponent = true): string {
  const clientDirective = isServerComponent ? "" : "'use client';\n\n"
  const paramsType = isDynamic ? `{ params: { id: string } }` : ""

  return `${clientDirective}export default function ${pageName}Page(${paramsType}) {\n  return (\n    <div>\n      <h1>${pageName}</h1>\n    </div>\n  );\n}\n`
}

/**
 * Generate a Next.js API Route Handler
 * @param routeName - Name of the route
 * @param methods - HTTP methods to support
 * @returns Generated route.ts code
 */
export function generateRouteHandler(
  routeName: string,
  methods: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH"> = ["GET"],
): string {
  const handlers = methods
    .map((method) => {
      return `export async function ${method}(request: Request) {\n  return Response.json({ message: '${method} ${routeName}' });\n}\n`
    })
    .join("\n")

  return `import { NextRequest } from 'next/server';\n\n${handlers}`
}

/**
 * Generate a Next.js Server Action
 * @param actionName - Name of the action
 * @param params - Array of parameter names and types
 * @returns Generated server action code
 */
export function generateServerAction(actionName: string, params: Array<{ name: string; type: string }> = []): string {
  const paramsStr = params.map((p) => `${p.name}: ${p.type}`).join(", ")

  return `'use server';\n\nexport async function ${actionName}(${paramsStr}) {\n  // Server action implementation\n  return { success: true };\n}\n`
}

/**
 * Generate Next.js middleware
 * @param matcherPaths - Array of paths to match
 * @returns Generated middleware.ts code
 */
export function generateMiddleware(matcherPaths: string[] = ["/api/:path*"]): string {
  return `import { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  // Middleware logic\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ${JSON.stringify(matcherPaths)},\n};\n`
}
