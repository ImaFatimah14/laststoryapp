// Web Push Notification: Event "push"
self.addEventListener('push', (event) => {
    console.log('Service worker pushing...');
    async function chainPromise() {
        const data = await event.data.json();
        await self.registration.showNotification(data.title, {
            body: data.options.body,
            icon: data.options.icon,
            badge: data.options.badge
        });
    }
    event.waitUntil(chainPromise());
});
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clientsClaim());

// Workbox dari CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precache manifest di-inject saat build
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Runtime cache untuk API
workbox.routing.registerRoute(
  ({url}) => url.origin.includes('storyapi') || url.pathname.startsWith('/api'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Runtime cache untuk gambar
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'image-cache',
  })
);
