"use client"
/**
 * File: src/app/layout.tsx
 * Application root layout for ZacAi Atomic
 * Implements global styles, font loading, navigation, analytics,
 * and light/dark theme toggle with persistent storage.
 */

import React, { useState, useEffect, createContext, useContext } from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NavigationWrapper } from "@/components/navigation/NavigationWrapper"
import { Analytics } from "@vercel/analytics/next"
import ThemeToggle from "@/components/ui/ThemeToggle"
import "@/styles/globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZacAi Atomic - Hybrid Multi-Domain AI",
  description: "Modular AI Assistant with 19 Knowledge Domains",
  generator: "v0.app",
}

type Theme = "light" | "dark"

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      localStorage.setItem("theme", prefersDark ? "dark" : "light")
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(theme === "light" ? "dark" : "light")
    root.classList.add(theme)
  }, [theme])

  return (
    <html lang="en" className={geist.className}>
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
