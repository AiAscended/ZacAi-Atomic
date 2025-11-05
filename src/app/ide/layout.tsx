/**
 * File: src/app/ide/layout.tsx
 * Purpose: Layout wrapper for IDE pages (no admin sidebar)
 */

import React from 'react';

export default function IDELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
