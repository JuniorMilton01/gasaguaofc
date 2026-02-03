const CACHE_NAME = 'gasagua-v1';
const urlsToCache = [
  './',
  './index.html',
  './index-BCooEiNa.css',
  './index-B_0g4mRk.js',
  './manifest.json',
  './conexao.js',
  './icone-192.png',
  './icone-512.png'
];

// Instalação - guarda arquivos no cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.log('Erro ao adicionar ao cache:', err);
      })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Fetch - estratégia Cache First para arquivos estáticos, Network para API
self.addEventListener('fetch', function(event) {
  // Não intercepta requisições de API (quando tiver backend)
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Se achou no cache, retorna
        if (response) {
          return response;
        }
        // Senão, busca na rede
        return fetch(event.request)
          .then(function(networkResponse) {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Atualiza o cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
      })
      .catch(function() {
        // Se falhou completamente, retorna página offline
        console.log('Falha ao carregar:', event.request.url);
      })
  );
});

// Ativação - limpa caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma controle de todas as abas imediatamente
  self.clients.claim();
});