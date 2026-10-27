/**
 * BlockSpin Values — shared site config.
 * The ONE place the main values spreadsheet id lives. Loaded before script.js,
 * live-trading.js and every generated page, and read by tools/ at build time.
 */
(function (global) {
  global.BSV_CONFIG = Object.freeze({
    SPREADSHEET_ID: "1vAm9x7c5JPxpHxDHVcDgQifXsAvW9iW2wPVuQLENiYs"
  });

  /**
   * Sheet data with a short browser cache: a visit within SHEET_CACHE_MS of the last one reuses
   * the saved copy (instant), otherwise it fetches fresh. Values are never more than a few
   * minutes old. Falls back to a normal fetch if storage is unavailable.
   */
  var SHEET_CACHE_MS = 3 * 60 * 1000;
  var PREFIX = "bsv-sheet-v1:";
  global.bsvFetchSheetText = function (url) {
    var key = PREFIX + url;
    try {
      var hit = JSON.parse(global.localStorage.getItem(key) || "null");
      if (hit && Date.now() - hit.t < SHEET_CACHE_MS && typeof hit.text === "string") {
        return Promise.resolve(hit.text);
      }
    } catch (_) {}
    return fetch(url).then(function (res) {
      return res.text().then(function (text) {
        if (res.ok && text.indexOf("setResponse") !== -1) {
          try {
            global.localStorage.setItem(key, JSON.stringify({ t: Date.now(), text: text }));
          } catch (_) {
            // Storage full: clear old sheet copies and carry on without caching.
            try {
              Object.keys(global.localStorage).forEach(function (k) {
                if (k.indexOf(PREFIX) === 0) global.localStorage.removeItem(k);
              });
            } catch (__) {}
          }
        }
        return text;
      });
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
