"use client"

/**
 * File: src/app/client-layout.tsx
 * Purpose: Client-side layout component with theme management
 * Wraps the app content with ThemeProvider for light/dark mode
 * Note: ThemeToggle removed from fixed overlay - now in settings page
 */

import { ReactNode, useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationWrapper } from "@/components/navigation/NavigationWrapper"

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme)
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme={theme}>
      <NavigationWrapper>{children}</NavigationWrapper>
    </ThemeProvider>
  )
}
