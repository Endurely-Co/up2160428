const CACHE_NAME = 'express-pwa-v1';
const urlsToCache = ['/',
    '/stylesheets/styles.css',
    '/script.js',
    '/new-race',
   ' /dashboard',
    '/timer',
    '/race-board',
    '/record-race',
    '/race-records'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
