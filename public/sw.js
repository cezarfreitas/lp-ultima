const CACHE_NAME = 'ecko-cache-v1';
const IMAGE_CACHE = 'ecko-images-v1';
const API_CACHE = 'ecko-api-v1';

// Cache different types of resources with different strategies
const CACHE_STRATEGIES = {
  images: {
    name: IMAGE_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 100
  },
  api: {
    name: API_CACHE,
    maxAge: 10 * 60 * 1000, // 10 minutes
    maxEntries: 50
  },
  static: {
    name: CACHE_NAME,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 200
  }
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('Service Worker: Cache created');
      self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_STRATEGIES).some(s => s.name === cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle different resource types
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle images
  if (isImageRequest(event.request)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }

  // Handle API requests
  if (isApiRequest(event.request)) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticRequest(event.request));
    return;
  }
});

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
         url.pathname.includes('/uploads/') ||
         url.hostname.includes('unsplash.com') ||
         url.hostname.includes('images.');
}

// Check if request is for API
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('SW: Image cache HIT:', request.url);
    return cached;
  }
  
  console.log('SW: Image cache MISS:', request.url);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone before caching
      const responseClone = response.clone();
      cache.put(request, responseClone);
      
      // Clean old entries if cache is full
      cleanCache(IMAGE_CACHE, CACHE_STRATEGIES.images.maxEntries);
    }
    return response;
  } catch (error) {
    console.log('SW: Image fetch failed:', error);
    // Return a placeholder or cached version if available
    return cached || new Response('', { status: 404 });
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses
      const responseClone = response.clone();
      cache.put(request, responseClone);
      cleanCache(API_CACHE, CACHE_STRATEGIES.api.maxEntries);
    }
    return response;
  } catch (error) {
    console.log('SW: API fetch failed, checking cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      console.log('SW: API cache HIT (fallback):', request.url);
      return cached;
    }
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('SW: Static cache HIT:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
      cleanCache(CACHE_NAME, CACHE_STRATEGIES.static.maxEntries);
    }
    return response;
  } catch (error) {
    console.log('SW: Static fetch failed:', error);
    return cached || new Response('', { status: 404 });
  }
}

// Clean old cache entries
async function cleanCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    // Remove oldest entries (simple FIFO)
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map(key => cache.delete(key)));
    console.log(`SW: Cleaned ${toDelete.length} entries from ${cacheName}`);
  }
}
