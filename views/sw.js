self.addEventListener('install', e => {
    console.log('Service Worker installing...');
    e.waitUntil(
        caches.open('static').then(cache => {
            return cache.addAll(['/', '/stylesheets/style.css', '/app.js']);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
