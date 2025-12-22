"use client";

/**
 * File: src/app/client-layout.tsx
 * Client-side layout component for ZacAi Atomic.
 * Handles theme state management, persistence, and application of styles.
 */

import { ReactNode, useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationWrapper } from "@/components/navigation/NavigationWrapper";
import { ChatSettingsProvider } from "@/context/ChatSettingsContext";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(theme === "light" ? "dark" : "light")
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeProvider attribute="class" defaultTheme={theme}>
      <ChatSettingsProvider>
        <NavigationWrapper>{children}</NavigationWrapper>
      </ChatSettingsProvider>
    </ThemeProvider>
  );
}
