'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamically import UserProfile with SSR disabled
const UserProfile = dynamic(() => import('@/components/profile/UserProfile').then(mod => ({ default: mod.UserProfile })), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function Profile() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <UserProfile />
        </Suspense>
      </div>
    </div>
  );
}
