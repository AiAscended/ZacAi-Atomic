"use client";
import type React from "react";
/**
 * File: src/app/layout.tsx
 * Application root layout for ZacAi Atomic
 * Implements global styles, font loading, navigation, analytics,
 * and light/dark theme toggle with persistent storage.
 */

import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";
import { useState } from "react";
import { HamburgerMenu } from "@/components/navigation/HamburgerMenu";
import { AdminSidebar } from "@/components/navigation/AdminSidebar";




export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ClientLayout>
          {/* Hamburger menu for sidebar (left) */}
          <div className="fixed top-4 left-4 z-50">
            {!isSidebarOpen && (
              <HamburgerMenu
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(true)}
              />
            )}
          </div>
          <AdminSidebar
            isOpen={isSidebarOpen}
            isExpanded={isSidebarExpanded}
            onClose={() => setIsSidebarOpen(false)}
            onExpandToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
