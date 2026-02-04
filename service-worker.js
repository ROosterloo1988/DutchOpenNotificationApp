// --- VERSIE BEHEER ---
// VERANDER DIT NUMMER ALS JE EEN UPDATE PUSHT NAAR GITHUB! (Bijv: v1 -> v2)
const CACHE_NAME = "dutch-open-v2.1"; 

const urlsToCache = [
  "./",
  "./index.html",
  "./icon.png",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap",
  "https://cdn-icons-png.flaticon.com/512/3068/3068351.png"
];

// Installeren
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activeren (Oude cache opruimen)
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
});

// Fetch (Network First, then Cache)
// Dit zorgt ervoor dat hij altijd eerst probeert de nieuwste versie van internet te plukken
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Als we online zijn: stop de nieuwe versie ook direct in de cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // Als we offline zijn: pak de cache
  );
});

// Luister naar het bericht om direct te updaten (vanuit de knop in index.html)
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
