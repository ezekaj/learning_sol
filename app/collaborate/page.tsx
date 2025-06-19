import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { CollaborationHub } from '@/components/collaboration/CollaborationHub';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default async function CollaboratePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/collaborate');
  }

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
