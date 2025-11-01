"use client"

/**
 * File: src/app/client-layout.tsx
 * Client-side layout component for ZacAi Atomic.
 * Handles theme state management, persistence, and application of styles.
 */

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { NavigationWrapper } from "@/components/navigation/NavigationWrapper"
import { Analytics } from "@vercel/analytics/next"
import ThemeToggle from "@/components/ui/ThemeToggle"

type Theme = "light" | "dark"

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  const toggleTheme = () =>
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      localStorage.setItem("theme", next)
      return next
    })

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved) {
      setTheme(saved)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      localStorage.setItem("prefers-color-scheme", prefersDark ? "dark" : "light")
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(theme === "light" ? "dark" : "light")
    root.classList.add(theme)
  }, [theme])

  return (
    <html lang="en">
      <body className={`font-sans antialiased ${theme}`}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <NavigationWrapper />
          <ThemeToggle />
          {children}
          <Analytics />
        </ThemeContext.Provider>
      </body>
    </html>
  )
}
