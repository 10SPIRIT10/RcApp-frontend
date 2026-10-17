const CACHE_NAME = "getjob-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/style.css",
  "/app.js",
  "/dashboard.js",
  "/manifest.json",
];

// 1. Installation du Service Worker et mise en cache des fichiers
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Mise en cache des ressources PWA");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// 2. Activation et nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Suppression de l’ancien cache :", key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// 3. Interception des requêtes réseau (Stratégie Network First avec repli Cache)
self.addEventListener("fetch", (event) => {
  // On ne met pas en cache les requêtes vers l'API Backend (Render/Supabase)
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réseau réussit, on met à jour le cache dynamiquement
        return response;
      })
      .catch(() => {
        // Si le réseau échoue (hors-ligne), on sert le cache
        return caches.match(event.request);
      }),
  );
});

// 4. Gestion des Notifications Push (Optionnel / Prêt pour OneSignal ou Web Push)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Nouvelle Candidature ! 🇨🇲";
  const options = {
    body:
      data.body || "Un nouveau candidat vient de s’inscrire via votre lien.",
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
