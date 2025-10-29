/**
 * File: components/navigation/AdminSidebar.tsx
 * Purpose: Sliding admin sidebar with icon-first expandable menu
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import type React from "react"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Database,
  Brain,
  Zap,
  Wrench,
  Users,
  Settings,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "knowledge-domains",
    label: "Knowledge Domains",
    icon: Database,
    children: [
      { id: "react", label: "React", icon: Database, path: "/admin/domains/react" },
      { id: "nextjs", label: "Next.js", icon: Database, path: "/admin/domains/nextjs" },
      { id: "programming", label: "Programming", icon: Database, path: "/admin/domains/programming" },
      { id: "typescript", label: "TypeScript", icon: Database, path: "/admin/domains/typescript" },
      { id: "english", label: "English", icon: Database, path: "/admin/domains/english" },
      { id: "mathematics", label: "Mathematics", icon: Database, path: "/admin/domains/mathematics" },
      { id: "internet-search", label: "Internet Search", icon: Database, path: "/admin/domains/internet-search" },
      { id: "grammar", label: "Grammar", icon: Database, path: "/admin/domains/grammar" },
      { id: "science", label: "Science", icon: Database, path: "/admin/domains/science" },
      { id: "code-review", label: "Code Review", icon: Database, path: "/admin/domains/code-review" },
      { id: "error-detection", label: "Error Detection", icon: Database, path: "/admin/domains/error-detection" },
      { id: "testing", label: "Testing", icon: Database, path: "/admin/domains/testing" },
      { id: "documentation", label: "Documentation", icon: Database, path: "/admin/domains/documentation" },
      { id: "security", label: "Security", icon: Database, path: "/admin/domains/security" },
      { id: "algorithms", label: "Algorithms", icon: Database, path: "/admin/domains/algorithms" },
      { id: "data-structures", label: "Data Structures", icon: Database, path: "/admin/domains/data-structures" },
      { id: "version-control", label: "Version Control", icon: Database, path: "/admin/domains/version-control" },
      { id: "environment", label: "Environment", icon: Database, path: "/admin/domains/environment" },
      { id: "general", label: "General", icon: Database, path: "/admin/domains/general" },
    ],
  },
  {
    id: "ai-models",
    label: "AI Models",
    icon: Brain,
    children: [{ id: "orchestrator", label: "Main Orchestrator", icon: Brain, path: "/admin/models/orchestrator" }],
  },
  {
    id: "training-pipelines",
    label: "Training Pipelines",
    icon: Zap,
    path: "/admin/training",
  },
  {
    id: "tools",
    label: "Tools Management",
    icon: Wrench,
    path: "/admin/tools",
  },
  {
    id: "users",
    label: "User Settings",
    icon: Users,
    path: "/admin/users",
  },
  {
    id: "system",
    label: "System Settings",
    icon: Settings,
    path: "/admin/system",
  },
  {
    id: "errors",
    label: "Error Detection",
    icon: AlertTriangle,
    path: "/admin/errors",
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  isExpanded: boolean
  onExpandToggle: () => void
}

export function AdminSidebar({ isOpen, isExpanded, onExpandToggle }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const router = useRouter()

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.id)
      if (!isExpanded) {
        onExpandToggle()
      }
    } else if (item.path) {
      router.push(item.path)
    }
  }

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const Icon = item.icon
    const isActive = pathname === item.path
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground font-medium",
            depth > 0 && "pl-8",
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          {isOpen && (
            <>
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {hasChildren && (
                <span className="flex-shrink-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">{item.children!.map((child) => renderMenuItem(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r transition-all duration-300 z-40",
        isOpen ? (isExpanded ? "w-64" : "w-16") : "w-0 -translate-x-full",
      )}
    >
      <div className="flex flex-col h-full pt-16 pb-4">
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">{menuItems.map((item) => renderMenuItem(item))}</nav>
        {isOpen && !isExpanded && (
          <button
            onClick={onExpandToggle}
            className="mx-2 p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Expand menu"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  )
}
