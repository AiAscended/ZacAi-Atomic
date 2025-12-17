/**
 * File: app/admin/layout.tsx
 * Purpose: Admin layout wrapper
 * Note: Navigation is handled globally by NavigationWrapper
 */

import type React from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">{children}</main>
    </div>
  )
}
