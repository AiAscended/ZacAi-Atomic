"use client";

import { Suspense } from 'react';
import { IDELayout } from './components/IDELayout';
import { IDELoadingState } from './components/IDELoadingState';

export default function IDEPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1e1e1e]">
      <Suspense fallback={<IDELoadingState />}>
        <IDELayout />
      </Suspense>
    </div>
  );
}
