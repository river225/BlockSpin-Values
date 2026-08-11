/* Neutralized former Monetag Multitag worker. Unregisters itself. */
self.addEventListener("install", function () {
  self.skipWaiting();
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    self.registration.unregister().then(function () {
      return self.clients.matchAll({ type: "window" });
    })
  );
});
