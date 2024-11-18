const CACHE_NAME = 'english-planner-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './js/app.js',
    './icons/logo.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
];

// Service Worker Kurulumu
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Aktif Olma
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
});

// İstekleri Yakalama
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match('./offline.html'));
        })
    );
});

// Push Notification İşleme
self.addEventListener('push', event => {
    const notificationBody = event.data ? event.data.text() : 'Yeni bir bildirim var!';
    const options = {
        body: notificationBody,
        icon: './icons/logo.png',
        badge: './icons/badge.png',
        vibrate: [100, 50, 100]
    };

    event.waitUntil(
        self.registration.showNotification('İngilizce Planlayıcı', options)
    );
});
