'use client';

import { Suspense } from 'react';
import { CollaborationHub } from '@/components/collaboration/CollaborationHub';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CollaboratePage() {
  // For static export, we don't use authentication
  // This allows the page to be pre-rendered successfully

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CollaborationHub />
        </Suspense>
      </div>
    </div>
  );
}
