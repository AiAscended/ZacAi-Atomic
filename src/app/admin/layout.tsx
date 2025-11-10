/**
 * File: app/admin/layout.tsx
 * Purpose: Admin layout with hamburger menu and sliding sidebar
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import type React from "react"

import { useState } from "react"
import { HamburgerMenu } from "@/components/navigation/HamburgerMenu"
import { AdminSidebar } from "@/components/navigation/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <AdminSidebar
        isOpen={isSidebarOpen}
        isExpanded={isSidebarExpanded}
        onClose={() => setIsSidebarOpen(false)}
        onExpandToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <main className="transition-all duration-300 p-6">{children}</main>
    </div>
  )
}
