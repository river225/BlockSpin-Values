(function () {
  "use strict";

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (_) {}

  function initHero() {
    var hero = document.querySelector(".sponsors-hero");
    if (!hero) return;
    var steps = hero.querySelectorAll(".sponsors-hero-anim[data-hero-step]");
    if (!steps.length) return;

    if (reduceMotion) {
      steps.forEach(function (el) {
        el.classList.add("is-shown");
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Stagger remaining hero elements only (logo → title → sub → CTA → PDF).
    // ~100ms apart; total under 800ms for the 5-step sequence.
    var stepGap = 100;
    var baseDelay = 80;
    hero.setAttribute("data-animate", "1");
    steps.forEach(function (el) {
      var step = Number(el.getAttribute("data-hero-step") || "0");
      el.style.setProperty("--hero-delay", String(baseDelay + step * stepGap));
      el.addEventListener(
        "animationend",
        function () {
          el.classList.add("is-shown");
          el.style.opacity = "1";
          el.style.transform = "none";
        },
        { once: true }
      );
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-ready");
        // Safety: last step delay is ~480ms + 500ms anim ≈ 980ms max.
        window.setTimeout(function () {
          steps.forEach(function (el) {
            el.classList.add("is-shown");
            el.style.opacity = "1";
            el.style.transform = "none";
          });
        }, 950);
      });
    });
  }

  function formatCount(n) {
    return n.toLocaleString("en-US");
  }

  function animateCount(el, target, suffix, duration) {
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.round(target * eased);
      el.textContent = formatCount(value) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initReveal() {
    var page = document.querySelector(".sponsors-page");
    var sections = document.querySelectorAll(".sponsors-reveal");
    if (!sections.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach(function (section) {
        section.classList.add("is-in");
        runCounts(section, true);
      });
      return;
    }

    if (page) page.setAttribute("data-reveal", "1");

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var section = entry.target;
          section.classList.add("is-in");
          runCounts(section, false);
          io.unobserve(section);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    sections.forEach(function (section) {
      if (section.classList.contains("is-hero")) {
        section.classList.add("is-in");
        return;
      }
      io.observe(section);
    });

    // Safety: if a section is already in the viewport on load, force reveal.
    requestAnimationFrame(function () {
      sections.forEach(function (section) {
        if (section.classList.contains("is-hero") || section.classList.contains("is-in")) return;
        var rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          section.classList.add("is-in");
          runCounts(section, false);
          io.unobserve(section);
        }
      });
    });
  }

  function runCounts(section, instant) {
    if (section.dataset.countsDone === "1") return;
    var nodes = section.querySelectorAll("[data-count]");
    if (!nodes.length) return;
    section.dataset.countsDone = "1";
    nodes.forEach(function (el) {
      var target = Number(el.getAttribute("data-count") || "0");
      var suffix = el.getAttribute("data-suffix") || "";
      if (instant || reduceMotion) {
        el.textContent = formatCount(target) + suffix;
        return;
      }
      animateCount(el, target, suffix, 1000);
    });
  }

  function initSmoothPricing() {
    document.querySelectorAll('a[href="#pricing"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var target = document.getElementById("pricing");
        if (!target) return;
        e.preventDefault();
        // Force reveal so layout height is correct before measuring.
        target.classList.add("is-in");
        var header = document.querySelector(".site-header-shell");
        var offset = header ? Math.ceil(header.getBoundingClientRect().height) + 12 : 88;
        var scrollRoot =
          document.body.scrollHeight > document.body.clientHeight + 50
            ? document.body
            : document.documentElement.scrollHeight > document.documentElement.clientHeight + 50
              ? document.documentElement
              : null;
        var current =
          scrollRoot === document.body
            ? document.body.scrollTop
            : scrollRoot === document.documentElement
              ? document.documentElement.scrollTop
              : window.scrollY || 0;
        var top = Math.max(0, current + target.getBoundingClientRect().top - offset);
        if (scrollRoot && typeof scrollRoot.scrollTo === "function") {
          scrollRoot.scrollTo({
            top: top,
            behavior: reduceMotion ? "auto" : "smooth"
          });
        } else {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
          });
        }
        if (history.replaceState) {
          history.replaceState(null, "", "#pricing");
        }
      });
    });
  }

  function boot() {
    initReveal();
    initSmoothPricing();
    initHero();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
