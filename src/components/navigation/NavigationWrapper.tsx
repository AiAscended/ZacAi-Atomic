"use client";

/**
 * File: components/navigation/NavigationWrapper.tsx
 * Purpose: Global navigation wrapper with hamburger menu and sidebar
 * Manages navigation state for both chat and admin views
 * Features: Auto-close menu on navigation, keyboard shortcuts
 */

import { useState, useEffect, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationWrapperProps {
  children: ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Keyboard shortcut: Escape to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sidebarWidth = isOpen ? (isExpanded ? 256 : 64) : 0;

  return (
    <>
      <HamburgerMenu isOpen={isOpen} onToggle={toggleOpen} />
      <AdminSidebar
        isOpen={isOpen}
        isExpanded={isExpanded}
        onExpandToggle={toggleExpanded}
        onNavigate={closeMenu}
        onClose={closeMenu}
      />
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: isOpen ? (isExpanded ? "256px" : "64px") : "0",
        }}
      >
        {children}
      </main>
    </div>
  );
}
