const VERSION = "v3";
const IMG_CACHE = `pocketstore-img-${VERSION}`;
const SHELL_CACHE = `pocketstore-shell-${VERSION}`;
const DATA_CACHE = `pocketstore-data-${VERSION}`;


const SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// INSTALL: precarga el App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE && k !== IMG_CACHE)
      )
    )
  );
  self.clients.claim();
});


self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

if (req.destination === "image" && url.hostname.endsWith("picsum.photos")) {
  event.respondWith(
    caches.open(IMG_CACHE).then((cache) =>
      cache.match(req).then(
        (cached) =>
          cached ||
          fetch(req)
            .then((res) => {
              cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached)
      )
    )
  );
  return;
}
 
  if (url.hostname === "jsonplaceholder.typicode.com") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(DATA_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

 
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).catch(() => {
          if (req.mode === "navigate") return caches.match("./index.html");
        })
    )
  );
});