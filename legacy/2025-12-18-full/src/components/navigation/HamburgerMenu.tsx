"use client";

/**
 * File: components/navigation/HamburgerMenu.tsx
 * Purpose: Hamburger menu toggle button for admin navigation
 * Creator: Vercel v0 Coding Assistant
 */

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function HamburgerMenu({ isOpen, onToggle }: HamburgerMenuProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="fixed top-4 right-4 z-50 h-10 w-10"
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );
}
