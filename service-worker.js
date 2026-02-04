// --- VERSIE BEHEER ---
// Pas dit nummer aan als je een update doet! (v1 -> v2)
const CACHE_NAME = "dutch-open-lite-v1.1"; 

const urlsToCache = [
  "./",
  "./index.html",
  "./icon.png",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap"
];

// Installeren (Cache de basisbestanden)
self.addEventListener("install", event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activeren (Oude versies opruimen)
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
  return self.clients.claim();
});

// Fetch Strategie: NETWERK EERST, DAN CACHE
// Dit is belangrijk voor een schema-app: hij probeert altijd de nieuwste versie te halen.
// Lukt dat niet (geen internet)? Dan pakt hij de oude versie.
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

// Luister naar het bericht "Update Nu" vanuit de app
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
