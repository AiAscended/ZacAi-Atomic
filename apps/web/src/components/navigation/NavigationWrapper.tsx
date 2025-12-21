"use client";

/**
 * File: components/navigation/NavigationWrapper.tsx
 * Purpose: Global navigation wrapper with sidebar
 * UX: Menu button only shows when closed, content resizes when menu opens
 */

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { cn } from "@/lib/utils";

interface NavigationWrapperProps {
  children: ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const isOpen = true;
  const sidebarWidth = isExpanded ? 256 : 64;

  return (
    <div className="relative min-h-screen">
      <AdminSidebar
        isOpen={isOpen}
        isExpanded={isExpanded}
        onExpandToggle={toggleExpanded}
        onClose={() => {}}
      />

      {/* Main content - pushed by sidebar, no overlap */}
      <main
        className={cn("transition-all duration-300 ease-in-out min-h-screen")}
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {children}
      </main>
    </div>
  );
}
