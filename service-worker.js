// ==========================================
// SEOUL VIBE - Service Worker
// ==========================================
const CACHE_VERSION = 'v1.0.0';
const APP_SHELL_CACHE = `seoulvibe-app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `seoulvibe-runtime-${CACHE_VERSION}`;

// 首次安裝時預先快取的核心檔案（App Shell）
const APP_SHELL_FILES = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png'
];

// ------------------------------------------
// install：預先快取 App Shell
// ------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// ------------------------------------------
// activate：清除舊版本快取
// ------------------------------------------
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_SHELL_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// ------------------------------------------
// fetch：依請求類型採不同快取策略
// ------------------------------------------
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 僅處理 GET 請求，避免快取 POST（例如 Supabase 訂單寫入）
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 不快取 Supabase API 與 GA4 追蹤請求，一律走網路
  if (url.hostname.includes('supabase.co') || url.hostname.includes('google-analytics.com') || url.hostname.includes('googletagmanager.com')) {
    return;
  }

  // 頁面導覽請求：Network First，離線時回退到 offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./offline.html')))
    );
    return;
  }

  // 其他靜態資源（含跨網域字型 / CDN 資源）：Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
