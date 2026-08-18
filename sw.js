/* Leftover worker stub — unregisters itself so old ad-network SWs do not stick. */
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
