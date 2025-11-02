"use client"

/**
 * File: components/navigation/NavigationWrapper.tsx
 * Purpose: Global navigation wrapper with hamburger menu and sidebar
 * Manages navigation state for both chat and admin views
 * Features: Auto-close menu on navigation, keyboard shortcuts
 */

import { useState, useEffect, type ReactNode } from "react"
import { HamburgerMenu } from "./HamburgerMenu"
import { AdminSidebar } from "./AdminSidebar"

interface NavigationWrapperProps {
  children: ReactNode
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleOpen = () => setIsOpen(!isOpen)
  const toggleExpanded = () => setIsExpanded(!isExpanded)
  const closeMenu = () => setIsOpen(false)

  // Keyboard shortcut: Escape to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  return (
    <>
      <HamburgerMenu isOpen={isOpen} onToggle={toggleOpen} />
      <AdminSidebar
        isOpen={isOpen}
        isExpanded={isExpanded}
        onExpandToggle={toggleExpanded}
        onNavigate={closeMenu}
      />
      {children}
    </>
  )
}
