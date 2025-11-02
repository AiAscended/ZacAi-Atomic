/**
 * File: components/navigation/AdminSidebar.tsx
 * Purpose: Sliding admin sidebar with icon-first expandable menu
 * Updated: Added auto-close on navigation, improved animations
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
  Plug,
  MessageSquare,
  X,
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
    id: "chat",
    label: "Chat Interface",
    icon: MessageSquare,
    path: "/",
  },
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
    path: "/admin/models",
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
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    children: [{ id: "github-app", label: "GitHub App", icon: Plug, path: "/admin/integrations/github-app" }],
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
  onNavigate?: () => void
  onClose: () => void
}

export function AdminSidebar({ isOpen, isExpanded, onExpandToggle, onNavigate, onClose }: AdminSidebarProps) {
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
      // Don't auto-close menu - let users navigate freely
    }
  }

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const Icon = item.icon
    const isActive = pathname === item.path
    const isItemExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground font-medium",
            depth > 0 && "pl-8",
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          {isExpanded && (
            <>
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {hasChildren && (
                <span className="flex-shrink-0 transition-transform duration-200">
                  {isItemExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              )}
            </>
          )}
        </button>
        {hasChildren && isItemExpanded && isExpanded && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-left-2 duration-200">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r transition-all duration-300 ease-in-out z-40",
        isOpen ? (isExpanded ? "w-64" : "w-16") : "w-0 -translate-x-full",
      )}
    >
      <div className="flex flex-col h-full pb-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-3 py-4 border-b">
          {isExpanded && <span className="font-semibold text-lg">Menu</span>}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors ml-auto"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 pt-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
        
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
