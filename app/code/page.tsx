'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamically import CodeLab with SSR disabled to prevent build errors
const CodeLab = dynamic(() => import('@/components/code/CodeLab').then(mod => ({ default: mod.CodeLab })), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function CodePage() {
  // For static export, we don't use authentication
  // This allows the page to be pre-rendered successfully

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CodeLab />
        </Suspense>
      </div>
    </div>
  );
}
