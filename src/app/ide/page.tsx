/**
 * File: src/app/ide/page.tsx
 * Purpose: Main IDE page with all panels
 */

"use client";

import React from 'react';
import { IDELayout } from './components/IDELayout';

export default function IDEPage() {
  return (
    <div className="h-screen">
      <IDELayout />
    </div>
  );
}
