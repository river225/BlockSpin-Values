(function () {
  function removeWrongSiteBanner() {
    var el = document.getElementById("auth-wrong-site-banner");
    if (el) el.remove();
  }
  removeWrongSiteBanner();

  var OAUTH_RETURN_KEY = "bsv-oauth-return-to";
  var MAIN_SITE_ORIGINS = {
    "https://blockspinvalues.com": true,
    "https://www.blockspinvalues.com": true
  };

  function isTestSite() {
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (/\.github\.io$/i.test(host)) return true;
    if (document.documentElement && document.documentElement.dataset.bsvEnv === "test") return true;
    return !!document.querySelector('meta[name="bsv-env"][content="test"]');
  }

  function purgeStaleMainReturnUrl() {
    if (!isTestSite()) return;
    try {
      var stored = localStorage.getItem(OAUTH_RETURN_KEY);
      if (!stored) return;
      if (MAIN_SITE_ORIGINS[new URL(stored).origin]) {
        localStorage.removeItem(OAUTH_RETURN_KEY);
      }
    } catch (_) {}
  }

  function readSavedReturnTo() {
    try {
      var fromSession = sessionStorage.getItem(OAUTH_RETURN_KEY);
      if (fromSession) return fromSession;
      if (isTestSite()) return null;
      return localStorage.getItem(OAUTH_RETURN_KEY);
    } catch (_) {
      return null;
    }
  }

  function clearSavedReturnTo() {
    try {
      sessionStorage.removeItem(OAUTH_RETURN_KEY);
      localStorage.removeItem(OAUTH_RETURN_KEY);
    } catch (_) {}
  }

  function parseHashParams(hash) {
    var out = {};
    if (!hash || hash.charAt(0) !== "#") return out;
    hash.slice(1).split("&").forEach(function (part) {
      var eq = part.indexOf("=");
      if (eq <= 0) return;
      out[decodeURIComponent(part.slice(0, eq))] = decodeURIComponent(part.slice(eq + 1));
    });
    return out;
  }

  function stripAuthHash() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function bounceToSavedOrigin(hash) {
    var saved = readSavedReturnTo();
    if (!saved) return false;
    try {
      var target = saved.split("#")[0];
      var savedOrigin = new URL(target).origin;
      var currentOrigin = window.location.origin;
      if (savedOrigin !== currentOrigin) {
        window.location.replace(target + hash);
        return true;
      }
      if (isTestSite() && MAIN_SITE_ORIGINS[currentOrigin]) {
        window.location.replace(target + hash);
        return true;
      }
    } catch (_) {}
    return false;
  }

  purgeStaleMainReturnUrl();

  var hash = window.location.hash || "";
  var hashParams = parseHashParams(hash);
  var hasAuthToken = Object.prototype.hasOwnProperty.call(hashParams, "bsv_auth");
  var authError = hashParams.bsv_auth_error;

  if (authError) {
    if (bounceToSavedOrigin(hash)) return;
    clearSavedReturnTo();
    stripAuthHash();
    return;
  }

  if (hasAuthToken && bounceToSavedOrigin(hash)) return;

  var params = new URLSearchParams(window.location.search || "");
  if (params.get("bsv_auth_error")) {
    clearSavedReturnTo();
    params.delete("bsv_auth_error");
    var qs = params.toString();
    history.replaceState(null, "", qs ? window.location.pathname + "?" + qs : window.location.pathname);
  }
})();
