"use client";

/**
 * File: components/navigation/HamburgerMenu.tsx
 * Purpose: Hamburger menu toggle button
 * Updated: Moved to top-left to avoid overlap with other UI elements
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
      className="fixed top-4 left-4 z-50 h-10 w-10 hover:bg-accent"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );
}
