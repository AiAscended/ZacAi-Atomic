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
  // Only render AdminSidebar in non-admin routes; admin panel manages its own sidebar state
  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  );
}
