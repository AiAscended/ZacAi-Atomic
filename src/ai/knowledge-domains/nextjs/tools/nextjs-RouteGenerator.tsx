/**
 * File: src/ai/data/nextjs/tools/nextjs-RouteGenerator.ts
 * Purpose: Generate Next.js App Router pages, layouts, and route handlers
 * Depends on: src/ai/shared/tools/shared-CodeFormatter.ts
 * Depended on by: src/ai/data/nextjs/nextjs_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Generates a Next.js App Router page component
 * @param pageName - Name of the page
 * @param isServerComponent - Whether it's a Server Component (default: true)
 * @param hasDynamicRoute - Whether it has dynamic route params
 * @returns Generated Next.js page code
 */
export function generateNextJSPage(pageName: string, isServerComponent = true, hasDynamicRoute = false): string {
  const useClient = !isServerComponent ? "'use client'\n\n" : ""
  const paramsType = hasDynamicRoute
    ? `\ninterface PageProps {\n  params: { id: string };\n  searchParams: { [key: string]: string | string[] | undefined };\n}\n\n`
    : ""
  const paramsArg = hasDynamicRoute ? "{ params, searchParams }: PageProps" : ""

  return `${useClient}${paramsType}export default ${isServerComponent ? "async " : ""}function ${pageName}Page(${paramsArg}) {
  ${hasDynamicRoute ? "const { id } = params;\n  " : ""}
  return (
    <div>
      <h1>${pageName}</h1>
      ${hasDynamicRoute ? "<p>ID: {id}</p>" : ""}
    </div>
  );
}
`
}

/**
 * Generates a Next.js API Route Handler
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param hasParams - Whether it has dynamic route params
 * @returns Generated route handler code
 */
export function generateNextJSRouteHandler(method = "GET", hasParams = false): string {
  const paramsType = hasParams ? `, { params }: { params: { id: string } }` : ""

  return `import { NextRequest, NextResponse } from 'next/server';

export async function ${method}(request: NextRequest${paramsType}) {
  try {
    ${hasParams ? "const { id } = params;\n    " : ""}${method === "POST" || method === "PUT" ? "const body = await request.json();\n    " : ""}
    // Your logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
`
}

/**
 * Generates a Next.js Server Action
 * @param actionName - Name of the server action
 * @returns Generated server action code
 */
export function generateNextJSServerAction(actionName: string): string {
  return `'use server'

import { revalidatePath } from 'next/cache';

export async function ${actionName}(formData: FormData) {
  try {
    // Extract form data
    const data = {
      // Add your fields here
    };

    // Your server-side logic here

    // Revalidate the page
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to process action' };
  }
}
`
}
