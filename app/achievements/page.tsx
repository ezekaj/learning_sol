'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamically import AchievementsPage with SSR disabled
const AchievementsPage = dynamic(() => import('@/components/achievements/AchievementsPage').then(mod => ({ default: mod.AchievementsPage })), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function Achievements() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <AchievementsPage />
        </Suspense>
      </div>
    </div>
  );
}
