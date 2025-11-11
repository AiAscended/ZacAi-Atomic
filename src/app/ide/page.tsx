"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { IDELoadingState } from './components/IDELoadingState';

// Dynamically import IDELayout with no SSR to avoid xterm SSR issues
const IDELayout = dynamic(() => import('./components/IDELayout').then(mod => ({ default: mod.IDELayout })), {
  ssr: false,
  loading: () => <IDELoadingState />
});

export default function IDEPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1e1e1e]">
      <Suspense fallback={<IDELoadingState />}>
        <IDELayout />
      </Suspense>
    </div>
  );
}
