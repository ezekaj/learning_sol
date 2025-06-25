// Service Worker for Solidity Learning Platform
// Provides offline functionality and intelligent caching

const CACHE_NAME = 'solidity-learn-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/learn',
  '/code',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/grid.svg',
  '/fonts/inter-var.woff2',
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/health',
  '/api/lessons',
  '/api/user/profile',
  '/api/progress',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Static assets - Cache First
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // API requests - Network First with fallback
    if (pathname.startsWith('/api/')) {
      return await handleAPIRequest(request);
    }
    
    // Pages - Stale While Revalidate
    if (isPageRequest(request)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Default - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Request handling error:', error);
    return await handleOffline(request);
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    throw error;
  }
}

// Network First strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start network request in background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Background network request failed:', error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  return await networkPromise;
}

// Handle API requests with intelligent caching
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Health check - always from network
  if (pathname === '/api/health') {
    return await fetch(request);
  }
  
  // Cacheable APIs - Network First with longer cache
  if (CACHEABLE_APIS.some(api => pathname.startsWith(api))) {
    return await networkFirstWithTTL(request, API_CACHE, 300000); // 5 minutes
  }
  
  // User-specific APIs - Network First with short cache
  if (pathname.includes('/user/') || pathname.includes('/progress/')) {
    return await networkFirstWithTTL(request, API_CACHE, 60000); // 1 minute
  }
  
  // Default - Network Only for APIs
  return await fetch(request);
}

// Network First with TTL
async function networkFirstWithTTL(request, cacheName, ttl) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp for TTL
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-ttl', ttl.toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check TTL
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const cacheTTL = cachedResponse.headers.get('sw-cache-ttl');
      
      if (cacheTimestamp && cacheTTL) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < parseInt(cacheTTL)) {
          return cachedResponse;
        }
      }
    }
    
    throw error;
  }
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url);
  
  // Try to find cached version
  const caches_to_check = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  for (const cacheName of caches_to_check) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Return offline page for navigation requests
  if (isPageRequest(request)) {
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // Return generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Please check your internet connection.',
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Utility functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  // Sync offline actions when back online
  try {
    // This would sync any offline actions stored in IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for offline action management
async function getOfflineActions() {
  // This would retrieve actions from IndexedDB
  return [];
}

async function removeOfflineAction(id) {
  // This would remove the action from IndexedDB
  console.log('Removing offline action:', id);
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data,
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle action clicks
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

console.log('Service Worker loaded successfully');
