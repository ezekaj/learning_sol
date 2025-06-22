'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { CodeLab } from '@/components/code/CodeLab';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CodePage() {
  // For static export, useSession might not be available
  let status = 'loading';
  try {
    const session = useSession();
    status = session?.status || 'loading';
  } catch (error) {
    // useSession not available during static generation
    status = 'unauthenticated';
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // For static export, allow access without authentication
  // In production with API routes, you would redirect to signin
  // if (!session) {
  //   window.location.href = '/auth/signin?callbackUrl=/code';
  //   return null;
  // }

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
