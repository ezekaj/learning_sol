'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SocketProvider } from '@/lib/socket/SocketProvider';
import { LearningProvider } from '@/lib/context/LearningContext';
import { CollaborationProvider } from '@/lib/context/CollaborationContext';
import { Web3Provider } from '@/lib/blockchain/Web3Provider';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Web3Provider>
          <SocketProvider>
            <LearningProvider>
              <CollaborationProvider>
                {children}
              </CollaborationProvider>
            </LearningProvider>
          </SocketProvider>
        </Web3Provider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
