// Service Worker for idiibi website
const CACHE_NAME = 'idiibi-cache-v2';
const OFFLINE_URL = '/offline.html';
const OFFLINE_IMG = '/images/offline-image.svg';
const OFFLINE_STYLE = '/css/offline.css';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/projects.html',
  '/contact.html',
  '/terms.html',
  '/anydesk-support.html',
  '/hostinger-promo.html',
  '/en/index.html',
  '/en/about.html',
  '/en/services.html',
  '/en/projects.html',
  '/en/contact.html',
  '/en/terms.html',
  '/en/anydesk-support.html',
  '/en/hostinger-promo.html',
  OFFLINE_URL,
  OFFLINE_IMG,
  OFFLINE_STYLE,
  '/manifest.json',
  '/css/style.css',
  '/css/new-header.css',
  '/css/new-footer.css',
  '/css/new-loading.css',
  '/css/arabic-fixes.css',
  '/css/mobile-fixes.css',
  '/css/notifications.css',
  '/css/circle-progress.css',
  '/css/scroll.css',
  '/css/browser-compatibility.css',
  '/css/connection-status.css',
  '/css/clients-dark.css',
  '/css/datetime-styles.css',
  '/css/homepage-redesign.css',
  '/css/multilingual.css',
  '/css/english-fixes.css',
  '/css/anydesk-support.css',
  '/js/new-loading.js',
  '/js/new-header.js',
  '/js/scroll-utils.js',
  '/js/circle-progress.js',
  '/js/datetime-utils.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-512x512.png',
  '/images/hero-image.svg',
  '/images/web-design-hero-new.svg',
  '/images/smart-management-hero-new.svg',
  '/images/digital-marketing-hero-new.svg',
  '/images/wordpress-hosting.svg',
  '/images/google-workspace-new.svg',
  '/images/domain-search-new.svg',
  '/images/horizons-service-new.svg',
  '/images/development-tools.svg',
  '/images/anydesk-logo.png',
  '/images/og.jpg'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch resources - Network first with cache fallback strategy for HTML
// Cache first with network fallback for assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML requests - network first, then cache, then offline page
  if (event.request.headers.get('accept') &&
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Try to get from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, serve offline page
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // For images - cache first, then network
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              // Cache the new image
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
              return response;
            })
            .catch(() => {
              // If offline and image not cached, return offline image
              if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
                return caches.match(OFFLINE_IMG);
              }
              return new Response('Image not available offline', { status: 404 });
            });
        })
    );
    return;
  }

  // For CSS, JS, and other assets - stale-while-revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update the cache
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch failed for asset:', error);
            // Return cached response if available
            return cachedResponse;
          });
        return cachedResponse || fetchPromise;
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'form-submission') {
    event.waitUntil(syncFormData());
  }
});

// Function to sync stored form data
async function syncFormData() {
  try {
    const db = await openDB();
    const pendingSubmissions = await db.getAll('formSubmissions');

    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch(submission.url, {
          method: submission.method,
          headers: submission.headers,
          body: submission.body
        });

        if (response.ok) {
          await db.delete('formSubmissions', submission.id);
        }
      } catch (error) {
        console.error('Failed to sync form submission:', error);
      }
    }
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('idiibiOfflineDB', 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('formSubmissions')) {
        db.createObjectStore('formSubmissions', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'فتح'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        const url = event.notification.data.url;

        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        // If no window/tab is open or URL doesn't match, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Periodic background sync for content updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-update') {
    event.waitUntil(updateContent());
  }
});

// Function to update cached content
async function updateContent() {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Update critical pages
    const criticalPages = [
      '/',
      '/index.html',
      '/services.html',
      '/en/index.html',
      '/en/services.html'
    ];

    for (const page of criticalPages) {
      try {
        const response = await fetch(page, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(page, response);
          console.log(`Updated cache for: ${page}`);
        }
      } catch (error) {
        console.error(`Failed to update cache for: ${page}`, error);
      }
    }
  } catch (error) {
    console.error('Error updating content:', error);
  }
}
