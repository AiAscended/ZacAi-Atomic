"use client"

/**
 * File: components/navigation/NavigationWrapper.tsx
 * Purpose: Global navigation wrapper with sidebar
 * UX: Menu button only shows when closed, content resizes when menu opens
 */

import { useState, useEffect, type ReactNode } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationWrapperProps {
  children: ReactNode
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)
  const toggleExpanded = () => setIsExpanded(!isExpanded)

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

  const sidebarWidth = isOpen ? (isExpanded ? 256 : 64) : 0

  return (
    <div className="relative min-h-screen">
      {/* Menu button - only shows when sidebar closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={openMenu}
          className="fixed top-4 left-4 z-50 h-10 w-10"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isOpen}
        isExpanded={isExpanded}
        onExpandToggle={toggleExpanded}
        onClose={closeMenu}
      />

      {/* Main content - pushed by sidebar, no overlap */}
      <main
        className={cn("transition-all duration-300 ease-in-out min-h-screen")}
        style={{
          marginLeft: `${sidebarWidth}px`,
        }}
      >
        {children}
      </main>
    </div>
  )
}
