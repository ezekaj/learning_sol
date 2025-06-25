'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const ServiceWorkerManager: React.FC = () => {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    setSwState(prev => ({ ...prev, isSupported: true }));

    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => {
      setSwState(prev => ({ ...prev, isOnline: true }));
      toast.success('Back online! 🌐');
    };

    const handleOffline = () => {
      setSwState(prev => ({ ...prev, isOnline: false }));
      toast.error('You are offline. Some features may be limited. 📱');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online state
    setSwState(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);
      
      setSwState(prev => ({ 
        ...prev, 
        isRegistered: true, 
        registration 
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setSwState(prev => ({ ...prev, updateAvailable: true }));
            showUpdateNotification();
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Check for waiting service worker
      if (registration.waiting) {
        setSwState(prev => ({ ...prev, updateAvailable: true }));
        showUpdateNotification();
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast.error('Failed to enable offline features');
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;
      case 'OFFLINE_READY':
        toast.success('App is ready for offline use! 📱');
        break;
      case 'UPDATE_AVAILABLE':
        setSwState(prev => ({ ...prev, updateAvailable: true }));
        showUpdateNotification();
        break;
      default:
        console.log('Unknown service worker message:', event.data);
    }
  };

  const showUpdateNotification = () => {
    toast((t) => (
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <p className="font-medium">Update Available</p>
          <p className="text-sm text-gray-600">A new version is ready to install</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              updateServiceWorker();
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Update
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
          >
            Later
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'bottom-right',
    });
  };

  const updateServiceWorker = async () => {
    if (!swState.registration?.waiting) return;

    // Tell the waiting service worker to skip waiting
    swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to activate the new service worker
    window.location.reload();
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      toast.success('Cache cleared successfully');
      
      // Unregister and re-register service worker
      if (swState.registration) {
        await swState.registration.unregister();
        await registerServiceWorker();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const getCacheInfo = async (): Promise<{
    totalSize: number;
    cacheCount: number;
    caches: Array<{ name: string; size: number; count: number }>;
  }> => {
    try {
      const cacheNames = await caches.keys();
      const cacheInfos = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          
          let totalSize = 0;
          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
          
          return {
            name,
            size: totalSize,
            count: keys.length,
          };
        })
      );

      const totalSize = cacheInfos.reduce((sum, info) => sum + info.size, 0);
      
      return {
        totalSize,
        cacheCount: cacheNames.length,
        caches: cacheInfos,
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return { totalSize: 0, cacheCount: 0, caches: [] };
    }
  };

  // Development tools (only show in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="glass border border-white/10 rounded-lg p-4 max-w-sm">
          <h3 className="font-semibold text-white mb-2">Service Worker Status</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Supported:</span>
              <span className={swState.isSupported ? 'text-green-400' : 'text-red-400'}>
                {swState.isSupported ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Registered:</span>
              <span className={swState.isRegistered ? 'text-green-400' : 'text-red-400'}>
                {swState.isRegistered ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Online:</span>
              <span className={swState.isOnline ? 'text-green-400' : 'text-red-400'}>
                {swState.isOnline ? 'Yes' : 'No'}
              </span>
            </div>
            
            {swState.updateAvailable && (
              <div className="flex justify-between">
                <span>Update:</span>
                <button
                  onClick={updateServiceWorker}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Available
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-3 space-y-2">
            <button
              onClick={clearCache}
              className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
            >
              Clear Cache
            </button>
            
            <button
              onClick={async () => {
                const info = await getCacheInfo();
                console.log('Cache Info:', info);
                toast.success(`Cache: ${info.cacheCount} caches, ${(info.totalSize / 1024 / 1024).toFixed(2)} MB`);
              }}
              className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              Cache Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Hook for using service worker functionality
export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    // Check if app is offline ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineReady(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToOfflineQueue = async (action: {
    url: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
  }) => {
    // This would store the action in IndexedDB for later sync
    console.log('Adding to offline queue:', action);
  };

  return {
    isOnline,
    isOfflineReady,
    addToOfflineQueue,
  };
};

export default ServiceWorkerManager;
