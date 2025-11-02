import type React from "react"
/**
 * File: src/app/layout.tsx
 * Application root layout for ZacAi Atomic
 * Implements global styles, font loading, navigation, analytics,
 * and light/dark theme toggle with persistent storage.
 */

import type { Metadata } from "next"
import ClientLayout from "./client-layout"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "ZacAi Atomic - Hybrid Multi-Domain AI",
  description: "Modular AI Assistant with 19 Knowledge Domains",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
