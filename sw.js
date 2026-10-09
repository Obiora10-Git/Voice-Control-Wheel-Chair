self.addEventListener('install', function(e) {
  // Force the new service worker to take over immediately
  self.skipWaiting(); 
});

self.addEventListener('activate', function(e) {
  // Unregister itself and refresh the client pages
  self.registration.unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url));
    });
});