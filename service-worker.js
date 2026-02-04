// --- VERSIE BEHEER ---
// HOOG DIT NUMMER OP BIJ ELKE UPDATE! (v7 -> v8)
const CACHE_NAME = "dutch-open-v2.2.4"; 

const urlsToCache = [
  "./",
  "./index.html",
  "./icon.png",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap"
];

// Installeren
self.addEventListener("install", event => {
  self.skipWaiting(); // Forceer directe activatie
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activeren en Oude Cache weggooien
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Neem direct controle over alle tabbladen
});

// Fetch Strategie: Netwerk eerst, dan Cache (voor live updates)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Luister naar berichten van de app
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
