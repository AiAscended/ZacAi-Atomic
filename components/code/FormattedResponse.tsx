/**
 * File: components/code/FormattedResponse.tsx
 * Purpose: Renders formatted AI responses with code snippets and text sections
 * Depends on: components/code/CodeSnippet.tsx
 * Depended on by: app/page.tsx
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { CodeSnippet } from "./CodeSnippet"
import type { FormattedResponse } from "@/src/ai/orchestration/responseFormatter"

export interface FormattedResponseProps {
  response: FormattedResponse
  className?: string
}

export function FormattedResponseComponent({ response, className = "" }: FormattedResponseProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {response.sections.map((section, index) => {
        switch (section.type) {
          case "code":
            return (
              <CodeSnippet
                key={index}
                code={section.content}
                language={section.language || "text"}
                snippetId={section.metadata?.snippetId}
              />
            )

          case "heading": {
            const headingLevel = section.content.match(/^#{1,6}/)?.[0].length || 2
            const headingText = section.content.replace(/^#{1,6}\s+/, "")

            // Use a switch to render the correct heading level
            switch (headingLevel) {
              case 1:
                return (
                  <h1 key={index} className="text-3xl font-bold tracking-tight">
                    {headingText}
                  </h1>
                )
              case 2:
                return (
                  <h2 key={index} className="text-2xl font-semibold tracking-tight">
                    {headingText}
                  </h2>
                )
              case 3:
                return (
                  <h3 key={index} className="text-xl font-semibold tracking-tight">
                    {headingText}
                  </h3>
                )
              case 4:
                return (
                  <h4 key={index} className="text-lg font-semibold tracking-tight">
                    {headingText}
                  </h4>
                )
              case 5:
                return (
                  <h5 key={index} className="text-base font-semibold tracking-tight">
                    {headingText}
                  </h5>
                )
              case 6:
                return (
                  <h6 key={index} className="text-sm font-semibold tracking-tight">
                    {headingText}
                  </h6>
                )
              default:
                return (
                  <h2 key={index} className="text-2xl font-semibold tracking-tight">
                    {headingText}
                  </h2>
                )
            }
          }

          case "list": {
            const isOrdered = /^\d+\./.test(section.content)
            const listItems = section.content
              .split("\n")
              .filter(Boolean)
              .map((item) => item.replace(/^[-*+\d.]\s+/, ""))

            return isOrdered ? (
              <ol key={index} className="list-decimal list-inside space-y-1">
                {listItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="list-disc list-inside space-y-1">
                {listItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )
          }

          case "table":
            // Basic table rendering - can be enhanced
            return (
              <div key={index} className="overflow-x-auto">
                <pre className="text-sm">{section.content}</pre>
              </div>
            )

          case "text":
          default:
            return (
              <div key={index} className="prose prose-sm max-w-none">
                {section.content.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )
        }
      })}

      {/* Response metadata */}
      <div className="flex items-center gap-4 pt-4 border-t text-xs text-muted-foreground">
        <span>{response.wordCount} words</span>
        <span>•</span>
        <span>{response.codeBlockCount} code snippets</span>
        <span>•</span>
        <span>~{response.estimatedReadingTime} min read</span>
      </div>
    </div>
  )
}
