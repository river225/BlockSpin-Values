/**
 * BlockSpin Values — shared site config.
 * The ONE place the main values spreadsheet id lives. Loaded before script.js,
 * live-trading.js and every generated page, and read by tools/ at build time.
 */
(function (global) {
  global.BSV_CONFIG = Object.freeze({
    SPREADSHEET_ID: "1vAm9x7c5JPxpHxDHVcDgQifXsAvW9iW2wPVuQLENiYs"
  });
})(typeof window !== "undefined" ? window : globalThis);
