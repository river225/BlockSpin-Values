const SPREADSHEET_ID = "1vAm9x7c5JPxpHxDHVcDgQifXsAvW9iW2wPVuQLENiYs";
const SECTION_NAMES = typeof getSectionTitles === "function" ? getSectionTitles() : [];

const GA_MEASUREMENT_ID = "G-0T25993BCC";
const ACCESSORIES_SECTION_NAME = "Untradeable Items";
const RICHEST_SECTION_NAME = "💰 Richest Players";
const MONEY_GAME_GUIDE_SECTION = "Money & Game Guide";
const MONEY_GUIDE_SHEETS = {
  fishingItems: "Fishing Item",
  fishingTypes: "Fishing Types of fishing ",
  farming: "Farming"
};

const FARMING_PLOT_COUNT = 6;
const FARMING_POT_OPTIONS = ["Regular Pot", "Golden Pot", "Diamond Pot"];
const FARMING_SOIL_OPTIONS = ["Regular Soil", "Premium Soil"];
const FARMING_SEED_OPTIONS = [
  "Sunflower Seeds",
  "Corn Seeds",
  "Tomato Seeds",
  "Golden Tomato Seeds"
];
const FARMING_COMBO_ROWS = [
  { pot: "Regular Pot", soil: "Regular Soil", seed: "Sunflower Seeds", time: "10 minutes", money: 720, moneyPlus: 1080 },
  { pot: "Regular Pot", soil: "Regular Soil", seed: "Corn Seeds", time: "1 hour", money: 3250, moneyPlus: 4875 },
  { pot: "Regular Pot", soil: "Regular Soil", seed: "Tomato Seeds", time: "1 day", money: 13500, moneyPlus: 20250 },
  { pot: "Regular Pot", soil: "Regular Soil", seed: "Golden Tomato Seeds", time: "7 days", money: 45000, moneyPlus: 67500 },
  { pot: "Regular Pot", soil: "Premium Soil", seed: "Sunflower Seeds", time: "10 minutes", money: 720, moneyPlus: 1080 },
  { pot: "Regular Pot", soil: "Premium Soil", seed: "Corn Seeds", time: "1 hour", money: 3250, moneyPlus: 4875 },
  { pot: "Regular Pot", soil: "Premium Soil", seed: "Tomato Seeds", time: "1 day", money: 13500, moneyPlus: 20250 },
  { pot: "Regular Pot", soil: "Premium Soil", seed: "Golden Tomato Seeds", time: "7 days", money: 45000, moneyPlus: 67500 },
  { pot: "Golden Pot", soil: "Regular Soil", seed: "Sunflower Seeds", time: "10 minutes", money: 1008, moneyPlus: 1512 },
  { pot: "Golden Pot", soil: "Regular Soil", seed: "Corn Seeds", time: "1 hour", money: 4225, moneyPlus: 6825 },
  { pot: "Golden Pot", soil: "Regular Soil", seed: "Tomato Seeds", time: "1 day", money: 18900, moneyPlus: 28350 },
  { pot: "Golden Pot", soil: "Regular Soil", seed: "Golden Tomato Seeds", time: "7 days", money: 63000, moneyPlus: 94500 },
  { pot: "Golden Pot", soil: "Premium Soil", seed: "Sunflower Seeds", time: "10 minutes", money: 1008, moneyPlus: 1512 },
  { pot: "Golden Pot", soil: "Premium Soil", seed: "Corn Seeds", time: "1 hour", money: 4225, moneyPlus: 6825 },
  { pot: "Golden Pot", soil: "Premium Soil", seed: "Tomato Seeds", time: "1 day", money: 18900, moneyPlus: 28350 },
  { pot: "Golden Pot", soil: "Premium Soil", seed: "Golden Tomato Seeds", time: "7 days", money: 63000, moneyPlus: 94500 },
  { pot: "Diamond Pot", soil: "Regular Soil", seed: "Sunflower Seeds", time: "10 minutes", money: 1224, moneyPlus: 1836 },
  { pot: "Diamond Pot", soil: "Regular Soil", seed: "Corn Seeds", time: "1 hour", money: 5525, moneyPlus: 8288 },
  { pot: "Diamond Pot", soil: "Regular Soil", seed: "Tomato Seeds", time: "1 day", money: 22950, moneyPlus: 34425 },
  { pot: "Diamond Pot", soil: "Regular Soil", seed: "Golden Tomato Seeds", time: "7 days", money: 76500, moneyPlus: 114750 },
  { pot: "Diamond Pot", soil: "Premium Soil", seed: "Sunflower Seeds", time: "10 minutes", money: 1224, moneyPlus: 1836 },
  { pot: "Diamond Pot", soil: "Premium Soil", seed: "Corn Seeds", time: "1 hour", money: 5525, moneyPlus: 8288 },
  { pot: "Diamond Pot", soil: "Premium Soil", seed: "Tomato Seeds", time: "1 day", money: 22950, moneyPlus: 34425 },
  { pot: "Diamond Pot", soil: "Premium Soil", seed: "Golden Tomato Seeds", time: "7 days", money: 76500, moneyPlus: 114750 }
];
const FARMING_COMBO_LOOKUP = Object.fromEntries(
  FARMING_COMBO_ROWS.map(function (row) {
    return [row.pot + "|" + row.soil + "|" + row.seed, row];
  })
);
const FISH_WEIGHT_MAX = 3.6;
const FISH_WEIGHT_STEP = 0.1;

const GIVEAWAY_CAROUSEL_INTERVAL_MS = 10000;
const DISCORD_CARD_CAROUSEL_INTERVAL_MS = 9000;
const ROBUX_GIVEAWAY_IMAGE_URL = "https://i.ibb.co/7fC16qY/Screenshot-2026-05-06-at-02-28-05-removebg-preview.png";
const ROBUX_GIVEAWAY_DISCORD_URL = "https://discord.gg/GufVWmACAh";
const FISHING_GUIDE_FOOTER_IMAGE_URL = "https://i.ibb.co/pvBhZgf5/no-Filter-7-removebg-preview.png";
const FARMING_GUIDE_FOOTER_IMAGE_URL = "https://i.ibb.co/WWjndtxz/8b388c3c-7695-431b-8b2f-9350b0406615-removebg-preview.png";
const GUIDE_COMING_SOON_IMAGE_URL = "https://i.ibb.co/WpMkM9xS/Screenshot-2026-07-05-at-11-09-38-removebg-preview.png";
const BSV_DISCORD_GUILD_ID = "1402820361539817554";
const BSV_DISCORD_INVITE_URL = "https://discord.gg/QbapryYUUx";
const BSV_BOT_PUBLIC_BASE_DEFAULT = "https://bsv-bot-production.up.railway.app";

function normalizeApiBase(url) {
  return String(url || "")
    .trim()
    .replace(/\/+$/, "");
}

function resolveBsvBotPublicBase() {
  const fallback = normalizeApiBase(BSV_BOT_PUBLIC_BASE_DEFAULT);
  if (typeof window === "undefined") return fallback;
  const fromWindow = window.__BSV_BOT_PUBLIC_BASE__;
  if (fromWindow && String(fromWindow).trim()) return normalizeApiBase(fromWindow);
  if (typeof document !== "undefined" && document.querySelector) {
    const meta = document.querySelector('meta[name="bsv-bot-api-base"]');
    const content = meta && meta.getAttribute("content");
    if (content && String(content).trim()) return normalizeApiBase(content);
  }
  return fallback;
}

const BSV_BOT_PUBLIC_BASE = resolveBsvBotPublicBase();
const BOOSTERS_API_URL = `${BSV_BOT_PUBLIC_BASE}/api/boosters`;

if (typeof window !== "undefined") {
  window.BSV_BOT_PUBLIC_BASE = BSV_BOT_PUBLIC_BASE;
  window.bsvBotApiUrl = function (path) {
    const p = String(path || "").trim().replace(/^\/+/, "");
    return p ? `${BSV_BOT_PUBLIC_BASE}/${p}` : BSV_BOT_PUBLIC_BASE;
  };
}

const DISCORD_JOIN_NUDGE_DELAY_MS = 45000;
const DISCORD_JOIN_NUDGE_STORAGE_KEY = "bsv-discord-nudge-dismissed";
const ROBUX_GIVEAWAY_SECTION_TITLES = new Set(["Common / Uncommon", "Rare", "Epic", "Omega", "Misc"]);
const GIVEAWAY_CONFIG_SPREADSHEET_ID = "1hjj8Pd21KOhI9bjUz4-UupADhJzksATcVDJfo186GFk";
const GIVEAWAYS_SHEET_NAME = "Giveaways";
const BANNERS_SHEET_NAME = "banner";
const CONTENT_SHEET_NAME = "content";
const TRUE_REGEX = /^(yes|true|1|on|y)$/i;
const FALSE_REGEX = /^(no|false|0|off|n)$/i;
const giveawayItems = new Set();
const bannerVisibility = { anaconda: false, firework: false, legendary: true, humvee: false, robux: false };
const sectionContentEmbeds = new Map();
const CONTENT_SECTIONS = [
  "Common / Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Omega",
  "Misc",
  "Vehicles"
];

function isBsvTestEnvironment() {
  if (document.documentElement && document.documentElement.dataset.bsvEnv === "test") return true;
  return !!document.querySelector('meta[name="bsv-env"][content="test"]');
}

function i18n(key, vars) {
  if (window.bsvI18n && typeof window.bsvI18n.t === "function") {
    return window.bsvI18n.t(key, vars);
  }
  return key;
}

function i18nSection(title) {
  if (window.bsvI18n && typeof window.bsvI18n.tSection === "function") {
    return window.bsvI18n.tSection(title);
  }
  return title;
}

var _renderedSectionCache = [];
var _activeSectionName = "Home";

function shouldShowGiveawayCarousel() {
  return false;
}

function applyExternalBannerVisibility() {
  var anacondaEl = document.getElementById("omega-anaconda-banner");
  var fireworkEl = document.getElementById("epic-firework-banner");
  var legendaryEl = document.getElementById("legendary-daily-giveaway-banner");
  var carouselOn = shouldShowGiveawayCarousel() ? "block" : "none";
  if (anacondaEl) anacondaEl.style.display = bannerVisibility.anaconda ? "flex" : "none";
  if (fireworkEl) fireworkEl.style.display = bannerVisibility.firework ? "flex" : "none";
  if (legendaryEl) legendaryEl.style.display = bannerVisibility.legendary ? "flex" : "none";
  document.querySelectorAll(".giveaway-strip-carousel").forEach(function (el) {
    el.style.display = carouselOn;
  });
}

function applyStripGiveawayBannerVisibility() {
  applyExternalBannerVisibility();
}

function initGiveawayBannerCarousels() {
  if (typeof window !== "undefined" && window.__giveawayCarouselInit) return;
  if (typeof window !== "undefined") window.__giveawayCarouselInit = true;

  document.querySelectorAll(".giveaway-strip-carousel[data-rotate='1']").forEach(function (carousel) {
    if (carousel.dataset.carouselReady === "1") return;
    carousel.dataset.carouselReady = "1";
    var slides = carousel.querySelectorAll(".giveaway-strip-carousel__slide");
    if (slides.length < 2) return;
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove("is-active");
      slides[idx].setAttribute("aria-hidden", "true");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("is-active");
      slides[idx].setAttribute("aria-hidden", "false");
    }, GIVEAWAY_CAROUSEL_INTERVAL_MS);
  });
}

function buildGiveawayEndsSoonBadgeHtml() {
  return `<span class="giveaway-ends-soon-badge">Ends Soon!</span>`;
}

function buildRobuxStripSlideHtml() {
  var img = escapeAttr(ROBUX_GIVEAWAY_IMAGE_URL);
  var href = escapeAttr(ROBUX_GIVEAWAY_DISCORD_URL);
  return `
        ${buildGiveawayEndsSoonBadgeHtml()}
        <div class="robux-banner-figure">
          <img src="${img}" alt="5,000 Robux giveaway prize" class="robux-banner-prize-image" loading="lazy" decoding="async" />
        </div>
        <div class="robux-banner-body">
          <p class="legendary-banner-text humvee-banner-copy humvee-banner-copy--stack">
            <span class="humvee-banner-title">5,000 Robux Giveaway!</span>
          </p>
          <div class="legendary-banner-right humvee-banner-actions">
            <a href="${href}" target="_blank" rel="noopener" class="legendary-banner-btn humvee-banner-btn-holo robux-banner-btn-holo">Enter Giveaway</a>
          </div>
        </div>
        <div class="giveaway-strip-side-spacer" aria-hidden="true"></div>`;
}

function buildRotatingGiveawayCarouselHtml(bannerId) {
  var id = escapeAttr(bannerId);
  return `
      <div class="giveaway-strip-carousel" id="${id}" data-rotate="1" style="display: none;" aria-live="polite">
        <div class="giveaway-strip-carousel__viewport">
          <article class="giveaway-strip-carousel__slide legendary-banner giveaway-banner--robux giveaway-banner--robux-strip is-active" data-slide="robux" aria-hidden="false">
            ${buildRobuxStripSlideHtml()}
          </article>
        </div>
      </div>`;
}

function buildHumveeGiveawayBannerHtml(bannerId) {
  return "";
}

function getDiscordPromoSectionCopy(sectionTitle) {
  var map = {
    "Common / Uncommon": { tags: "Trading · Middleman · Giveaways" },
    "Rare": { tags: "Middleman · Trading · Giveaways" },
    "Epic": { tags: "Giveaways · Trading · Middleman" },
    "Legendary": { tags: "Giveaways · Middleman · Trading" },
    "Omega": { tags: "Trading · Giveaways · Middleman" },
    "Misc": { tags: "Middleman · Trading · Giveaways" },
    "Vehicles": { tags: "Giveaways · Trading · Middleman" },
    "Untradeable Items": { tags: "Trading · Community · Giveaways" }
  };
  return map[sectionTitle] || { tags: "Trading · Middleman · Giveaways" };
}

function buildMiddlemanShieldIconHtml(size) {
  var px = size || 26;
  return (
    '<svg class="middleman-shield-icon" viewBox="0 0 24 24" width="' + px + '" height="' + px + '" aria-hidden="true">' +
      '<path fill="#ffffff" stroke="#000000" stroke-width="1.65" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' +
      '<path fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 12.5l2 2.5 4.5-5"></path>' +
    '</svg>'
  );
}

function buildDiscordCardExplainerSlideHtml(kind) {
  var isGiveaways = kind === "giveaways";
  var modClass = isGiveaways ? "home-discord-promo__offer--giveaways" : "home-discord-promo__offer--middleman";
  var iconMarkup = isGiveaways
    ? '<span class="home-discord-promo__offer-emoji" aria-hidden="true">🎁</span>'
    : '<span class="home-discord-promo__offer-icon-wrap" aria-hidden="true">' + buildMiddlemanShieldIconHtml() + '</span>';
  var title = isGiveaways ? i18n("discord.card.giveawaysTitle") : i18n("discord.card.middlemanTitle");
  var text = isGiveaways ? i18n("discord.card.giveawaysDesc") : i18n("discord.card.middlemanDesc");
  var tags = isGiveaways
    ? [i18n("discord.card.giveawaysTag1"), i18n("discord.card.giveawaysTag2"), i18n("discord.card.giveawaysTag3")].join(" · ")
    : [i18n("discord.card.middlemanStep1"), i18n("discord.card.middlemanStep2"), i18n("discord.card.middlemanStep3")].join(" · ");
  var actions =
    '<div class="home-discord-promo__card-actions">' +
      '<a href="' + BSV_DISCORD_INVITE_URL + '" target="_blank" rel="noopener noreferrer" class="home-discord-promo__card-btn home-discord-promo__card-btn--join">' + escapeHtml(i18n("discord.card.joinNow")) + '</a>' +
      '<a href="blockspin-discord-server.html" class="home-discord-promo__card-btn home-discord-promo__card-btn--more">' + escapeHtml(i18n("discord.card.learnMore")) + '</a>' +
    '</div>';

  return (
    '<div class="home-discord-promo__offer ' + modClass + '">' +
      iconMarkup +
      '<p class="home-discord-promo__card-title home-discord-promo__offer-title">' + escapeHtml(title) + '</p>' +
      '<p class="home-discord-promo__offer-text">' + escapeHtml(text) + '</p>' +
      '<p class="home-discord-promo__card-tags home-discord-promo__offer-tags">' + escapeHtml(tags) + '</p>' +
      actions +
    '</div>'
  );
}

function buildDiscordPromoCardSlotHtml(sectionTitle) {
  var copy = getDiscordPromoSectionCopy(sectionTitle);
  var joinSlide =
    '<div class="home-discord-promo__carousel-slide is-active" data-slide="join" aria-hidden="false">' +
      '<img src="https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png" alt="" width="48" height="48" class="home-discord-promo__card-logo">' +
      '<p class="home-discord-promo__card-title">Join Our Discord Server</p>' +
      '<p class="home-discord-promo__card-stat"><span class="discord-member-count" data-home-stat="traders">0</span>+ traders</p>' +
      '<p class="home-discord-promo__card-tags">' + escapeHtml(copy.tags) + '</p>' +
      '<div class="home-discord-promo__card-actions">' +
        '<a href="' + BSV_DISCORD_INVITE_URL + '" target="_blank" rel="noopener noreferrer" class="home-discord-promo__card-btn home-discord-promo__card-btn--join">' + escapeHtml(i18n("discord.card.joinNow")) + '</a>' +
        '<button type="button" class="home-discord-promo__card-btn home-discord-promo__card-btn--more home-discord-promo__card-btn--show-offers">' + escapeHtml(i18n("discord.card.whatWeOffer")) + '</button>' +
      '</div>' +
    '</div>';

  return (
    '<div class="home-discord-promo home-discord-promo--card-slot" role="complementary" aria-label="Join BlockSpin Discord">' +
      '<div class="home-discord-promo__card-inner">' +
        '<div class="home-discord-promo__carousel" data-rotate="1" aria-live="polite">' +
          '<div class="home-discord-promo__carousel-viewport">' +
            joinSlide +
            '<div class="home-discord-promo__carousel-slide" data-slide="giveaways" aria-hidden="true">' +
              buildDiscordCardExplainerSlideHtml("giveaways") +
            '</div>' +
            '<div class="home-discord-promo__carousel-slide" data-slide="middleman" aria-hidden="true">' +
              buildDiscordCardExplainerSlideHtml("middleman") +
            '</div>' +
          '</div>' +
          '<div class="home-discord-promo__carousel-dots" aria-hidden="true">' +
            '<span class="home-discord-promo__carousel-dot is-active"></span>' +
            '<span class="home-discord-promo__carousel-dot"></span>' +
            '<span class="home-discord-promo__carousel-dot"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function goToDiscordCardCarouselSlide(carousel, targetIndex) {
  if (!carousel) return;
  var slides = carousel.querySelectorAll(".home-discord-promo__carousel-slide");
  if (!slides.length) return;
  var dots = carousel.querySelectorAll(".home-discord-promo__carousel-dot");
  var idx = Number(carousel.dataset.activeIndex || "0");
  if (idx >= 0 && idx < slides.length) {
    slides[idx].classList.remove("is-active");
    slides[idx].setAttribute("aria-hidden", "true");
    if (dots[idx]) dots[idx].classList.remove("is-active");
  }
  var next = ((targetIndex % slides.length) + slides.length) % slides.length;
  slides[next].classList.add("is-active");
  slides[next].setAttribute("aria-hidden", "false");
  if (dots[next]) dots[next].classList.add("is-active");
  carousel.dataset.activeIndex = String(next);
}

function initDiscordPromoCardCarousels(root) {
  var scope = root || document;
  scope.querySelectorAll(".home-discord-promo__carousel[data-rotate='1']").forEach(function (carousel) {
    if (carousel._discordCarouselTimer) {
      clearInterval(carousel._discordCarouselTimer);
      carousel._discordCarouselTimer = null;
    }
    var slides = carousel.querySelectorAll(".home-discord-promo__carousel-slide");
    if (slides.length < 2) return;

    var dots = carousel.querySelectorAll(".home-discord-promo__carousel-dot");
    var activeIdx = 0;
    slides.forEach(function (slide, i) {
      if (slide.classList.contains("is-active")) activeIdx = i;
    });
    carousel.dataset.activeIndex = String(activeIdx);

    function advance() {
      var idx = Number(carousel.dataset.activeIndex || "0");
      goToDiscordCardCarouselSlide(carousel, idx + 1);
    }

    dots.forEach(function (dot, i) {
      dot.onclick = function () {
        goToDiscordCardCarouselSlide(carousel, i);
      };
    });

    var card = carousel.closest(".home-discord-promo--card-slot");
    if (card) {
      card.querySelectorAll(".home-discord-promo__card-btn--show-offers").forEach(function (btn) {
        btn.onclick = function (e) {
          e.preventDefault();
          goToDiscordCardCarouselSlide(carousel, 1);
        };
      });
    }

    carousel._discordCarouselTimer = setInterval(advance, DISCORD_CARD_CAROUSEL_INTERVAL_MS);
  });
}

function buildHomeFlashPerkHtml(mod, icon, titleKey, tagKey) {
  return (
    '<div class="home-discord-promo__flash-perk home-discord-promo__flash-perk--' + mod + '">' +
      '<span class="home-discord-promo__flash-perk-icon" aria-hidden="true">' + icon + "</span>" +
      '<span class="home-discord-promo__flash-perk-title">' + escapeHtml(i18n(titleKey)) + "</span>" +
      '<span class="home-discord-promo__flash-perk-tag">' + escapeHtml(i18n(tagKey)) + "</span>" +
    "</div>"
  );
}

function buildDiscordPromoBannerHtml(inCards) {
  if (inCards) return buildDiscordPromoCardSlotHtml("");
  return (
    '<div class="home-discord-promo home-discord-promo--home home-discord-promo--home-flash" role="complementary" aria-label="Join BlockSpin Discord">' +
      '<div class="home-discord-promo__home-glow" aria-hidden="true"></div>' +
      '<div class="home-discord-promo__home-shimmer" aria-hidden="true"></div>' +
      '<span class="home-discord-promo__shape home-discord-promo__shape--1" aria-hidden="true"></span>' +
      '<span class="home-discord-promo__shape home-discord-promo__shape--2" aria-hidden="true"></span>' +
      '<span class="home-discord-promo__shape home-discord-promo__shape--3" aria-hidden="true"></span>' +
      '<div class="home-discord-promo__inner">' +
        '<div class="home-discord-promo__flash-badges">' +
          '<span class="home-discord-promo__flash-badge home-discord-promo__flash-badge--mm">' + escapeHtml(i18n("discord.home.badgeFreeMm")) + "</span>" +
          '<span class="home-discord-promo__flash-badge home-discord-promo__flash-badge--gw">' + escapeHtml(i18n("discord.home.badgeGiveaways")) + "</span>" +
          '<span class="home-discord-promo__flash-badge home-discord-promo__flash-badge--trade">' + escapeHtml(i18n("discord.home.badgeTrading")) + "</span>" +
        "</div>" +
        '<div class="home-discord-promo__flash-hero">' +
          '<img src="https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png" alt="" width="52" height="52" class="home-discord-promo__logo home-discord-promo__flash-logo">' +
          '<p class="home-discord-promo__title home-discord-promo__flash-title">' + escapeHtml(i18n("discord.home.title")) + "</p>" +
          '<p class="home-discord-promo__hook home-discord-promo__flash-hook">' + escapeHtml(i18n("discord.home.hook")) + "</p>" +
          '<p class="home-discord-promo__flash-stat">' +
            '<span class="home-discord-promo__flash-stat-num"><span class="discord-member-count" data-home-stat="traders">0</span>+</span>' +
            '<span class="home-discord-promo__flash-stat-label">' + escapeHtml(i18n("discord.home.statLabel")) + "</span>" +
          "</p>" +
        "</div>" +
        '<div class="home-discord-promo__flash-perks">' +
          buildHomeFlashPerkHtml("trading", "📊", "discord.card.tradingPerk", "discord.home.tradingTag1") +
          buildHomeFlashPerkHtml("middleman", buildMiddlemanShieldIconHtml(22), "discord.card.middlemanTitle", "discord.card.middlemanStep1") +
          buildHomeFlashPerkHtml("giveaways", "🎁", "discord.card.giveawaysTitle", "discord.card.giveawaysTag2") +
        "</div>" +
        '<div class="home-discord-promo__actions home-discord-promo__actions--home home-discord-promo__flash-actions">' +
          '<a href="' + BSV_DISCORD_INVITE_URL + '" target="_blank" rel="noopener noreferrer" class="home-discord-promo__btn home-discord-promo__btn--primary home-discord-promo__btn--flash-join">' +
            escapeHtml(i18n("discord.card.joinNow")) + ' <span aria-hidden="true">→</span>' +
          "</a>" +
          '<a href="blockspin-discord-server.html" class="home-discord-promo__btn home-discord-promo__btn--secondary">' + escapeHtml(i18n("discord.card.learnMore")) + "</a>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

function buildCardsHtmlWithDiscordPromo(items, cardBuilder, sectionTitle, minItemsForPromo) {
  if (!items || !items.length) return "";
  if (typeof sectionTitle === "number") {
    minItemsForPromo = sectionTitle;
    sectionTitle = "";
  }
  var buildCard = cardBuilder || createCard;
  var minItems = minItemsForPromo == null ? 1 : minItemsForPromo;
  if (items.length < minItems) {
    return items.map(buildCard).join("");
  }
  var insertAt = Math.floor(items.length / 2);
  var parts = [];
  for (var i = 0; i < items.length; i++) {
    if (i === insertAt) parts.push(buildDiscordPromoCardSlotHtml(sectionTitle));
    parts.push(buildCard(items[i]));
  }
  return parts.join("");
}

function mountHomeDiscordPromo() {
  var slot = document.getElementById("home-discord-promo-slot");
  if (!slot) return;
  slot.outerHTML =
    '<div class="home-hero-row">' +
      '<div class="home-hero-row__banner">' +
        '<div class="home-discord-promo-slot">' +
          buildDiscordPromoBannerHtml(false) +
        "</div>" +
      "</div>" +
      '<div class="home-hero-row__stats" id="home-site-stats-slot"></div>' +
    "</div>";
  mountHomeSiteStats();
}

function mountHomeSiteStats() {
  var slot = document.getElementById("home-site-stats-slot");
  if (slot) slot.innerHTML = buildHomeSiteStatsHtml("home-site-stats--beside");
}

var HOME_SITE_STATS_ICONS = {
  items:
    '<svg class="home-site-stats__icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>' +
    '</svg>',
  online:
    '<svg class="home-site-stats__icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">' +
      '<rect x="2" y="14" width="3" height="6" rx="0.75"/><rect x="7" y="10" width="3" height="10" rx="0.75"/><rect x="12" y="6" width="3" height="14" rx="0.75"/><rect x="17" y="2" width="3" height="18" rx="0.75"/>' +
    '</svg>'
};

function buildHomeSiteStatsHtml(extraClass) {
  var statsClass = "home-site-stats" + (extraClass ? " " + extraClass : "");
  return (
    '<aside class="' + statsClass + '" aria-label="' + escapeHtml(i18n("home.stats.aria")) + '">' +
      '<div class="home-site-stats__item">' +
        '<span class="home-site-stats__value" data-home-stat="items">0</span>' +
        '<span class="home-site-stats__label">' +
          '<span class="home-site-stats__icon">' + HOME_SITE_STATS_ICONS.items + '</span>' +
          escapeHtml(i18n("home.stats.itemsTracked")) +
        '</span>' +
      '</div>' +
      '<div class="home-site-stats__item">' +
        '<span class="home-site-stats__value" data-home-stat="online">0</span>' +
        '<span class="home-site-stats__label">' +
          '<span class="home-site-stats__icon">' + HOME_SITE_STATS_ICONS.online + '</span>' +
          escapeHtml(i18n("home.stats.onlineMembers")) +
        '</span>' +
      '</div>' +
    '</aside>'
  );
}

var homeStatAnimFrames = {};

function setHomeStatValue(key, value, animate) {
  if (typeof value !== "number" || isNaN(value)) return;
  if (animate) {
    animateHomeStatValue(key, value);
    return;
  }
  document.querySelectorAll('[data-home-stat="' + key + '"]').forEach(function (el) {
    el.textContent = value.toLocaleString();
  });
}

function animateHomeStatValue(key, targetValue, durationMs) {
  if (typeof targetValue !== "number" || isNaN(targetValue)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setHomeStatValue(key, targetValue, false);
    return;
  }

  durationMs = durationMs == null ? 1400 : durationMs;
  if (homeStatAnimFrames[key]) {
    cancelAnimationFrame(homeStatAnimFrames[key]);
    homeStatAnimFrames[key] = null;
  }

  var els = document.querySelectorAll('[data-home-stat="' + key + '"]');
  if (!els.length) return;

  var start = performance.now();
  function frame(now) {
    var progress = Math.min(1, (now - start) / durationMs);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(targetValue * eased);
    els.forEach(function (el) {
      el.textContent = current.toLocaleString();
    });
    if (progress < 1) {
      homeStatAnimFrames[key] = requestAnimationFrame(frame);
    } else {
      homeStatAnimFrames[key] = null;
      els.forEach(function (el) {
        el.textContent = targetValue.toLocaleString();
      });
    }
  }
  homeStatAnimFrames[key] = requestAnimationFrame(frame);
}

function filterValueChangeRows(rows) {
  if (!rows || !rows.length) return [];
  return rows.filter(function (r) {
    var name = (r.Title || r.Name || "").toString().trim();
    if (name === "Anaconda GW" || name === "Firework GW") return false;
    var t = (r.Title || r.Date || r.Text || "").toString().trim();
    return t.length > 0;
  });
}

function countNamedSheetItems(items) {
  return (items || []).reduce(function (total, item) {
    var name = item && (item.Name || item["Name"]);
    return name && String(name).trim() ? total + 1 : total;
  }, 0);
}

function countUntradableItemsFromResults(results) {
  var match = (results || []).find(function (result) {
    return result.section === ACCESSORIES_SECTION_NAME;
  });
  return countNamedSheetItems(match && match.items);
}

function countTrackedItemsFromResults(results) {
  var total = 0;
  var untradableCounted = false;
  (results || []).forEach(function (result) {
    var cfg = typeof getSectionConfig === "function" ? getSectionConfig(result.section) : null;
    if (cfg) {
      if (cfg.dataSource !== "sheet") return;
    } else if (result.section === "Home" || result.section === "\uD83D\uDCB0 Richest Players") {
      return;
    }
    if (result.section === ACCESSORIES_SECTION_NAME) {
      untradableCounted = true;
    }
    total += countNamedSheetItems(result.items);
  });
  if (!untradableCounted) {
    total += countUntradableItemsFromResults(results);
  }
  return total;
}

function countGuideSheetItems(items, nameKeys) {
  return (items || []).filter(function (item) {
    return guideField(item, nameKeys).length > 0;
  }).length;
}

async function countGuideTrackedItems() {
  const [fishingItemsResult, fishingTypesResult, farmingResult] = await Promise.all([
    fetchGuideSheetWithAliases(MONEY_GUIDE_SHEETS.fishingItems, "items"),
    fetchGuideSheetWithAliases(MONEY_GUIDE_SHEETS.fishingTypes, "types"),
    fetchGuideSheetWithAliases(MONEY_GUIDE_SHEETS.farming, "farming")
  ]);
  return (
    countGuideSheetItems(fishingItemsResult.items, ["Fishing Name", "Fishing Item", "Name", "Item Name"]) +
    countGuideSheetItems(fishingTypesResult.items, ["Fishing Item Name", "Item Name", "Name"]) +
    countGuideSheetItems(farmingResult.items, ["Farming Item", "Name", "Item Name"])
  );
}

async function updateHomeSiteStatsFromResults(results) {
  var total = countTrackedItemsFromResults(results);
  try {
    total += await countGuideTrackedItems();
  } catch (err) {
    console.warn("Failed to load guide item counts for home stats:", err);
  }
  setHomeStatValue("items", total, true);
}

function buildRobuxGiveawayBannerHtml(bannerId) {
  return "";
}

function initAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;
  if (typeof window.gtag === "function") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);

  var gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(gaScript);
}

function trackEvent(name, params) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params || {});
}

function setupDiscordClickTracking() {
  if (document.documentElement.dataset.discordTrackingInit === "1") return;
  document.documentElement.dataset.discordTrackingInit = "1";
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="discord.gg"], a[href*="discord.com/invite"]');
    if (!link) return;
    trackEvent("discord_click", {
      link_url: link.href,
      link_text: (link.textContent || "").trim().slice(0, 80),
      page_path: window.location.pathname
    });
  });
}

function initDiscordJoinNudge() {
  if (sessionStorage.getItem(DISCORD_JOIN_NUDGE_STORAGE_KEY) === "1") return;
  var path = (window.location.pathname || "").toLowerCase();
  if (path.indexOf("blockspin-discord") !== -1) return;

  setTimeout(function () {
    if (sessionStorage.getItem(DISCORD_JOIN_NUDGE_STORAGE_KEY) === "1") return;
    if (document.getElementById("discord-join-nudge")) return;

    var nudge = document.createElement("aside");
    nudge.id = "discord-join-nudge";
    nudge.className = "discord-join-nudge";
    nudge.setAttribute("role", "dialog");
    nudge.setAttribute("aria-label", "Join BlockSpin Discord");
    nudge.innerHTML =
      '<button type="button" class="discord-join-nudge__close" aria-label="Dismiss">&times;</button>' +
      '<img src="https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png" alt="" width="36" height="36" class="discord-join-nudge__icon">' +
      '<div class="discord-join-nudge__body">' +
        '<p class="discord-join-nudge__title">Join <span class="discord-member-count" data-home-stat="traders">0</span>+ BlockSpin traders</p>' +
        '<p class="discord-join-nudge__text">Free middleman · live values · giveaways</p>' +
      '</div>' +
      '<div class="discord-join-nudge__actions">' +
        '<a href="' + BSV_DISCORD_INVITE_URL + '" target="_blank" rel="noopener noreferrer" class="discord-join-nudge__btn discord-join-nudge__btn--join">Join now</a>' +
        '<a href="blockspin-discord-server.html" class="discord-join-nudge__btn discord-join-nudge__btn--more">Learn more</a>' +
      '</div>';

    document.body.appendChild(nudge);
    requestAnimationFrame(function () {
      nudge.classList.add("discord-join-nudge--visible");
    });
    fetchDiscordMemberCount();

    function dismissNudge() {
      sessionStorage.setItem(DISCORD_JOIN_NUDGE_STORAGE_KEY, "1");
      nudge.classList.remove("discord-join-nudge--visible");
      setTimeout(function () {
        if (nudge.parentNode) nudge.parentNode.removeChild(nudge);
      }, 280);
    }

    nudge.querySelector(".discord-join-nudge__close").addEventListener("click", dismissNudge);
    nudge.querySelector(".discord-join-nudge__btn--join").addEventListener("click", function () {
      trackEvent("discord_nudge_join", { page_path: window.location.pathname });
      dismissNudge();
    });
    nudge.querySelector(".discord-join-nudge__btn--more").addEventListener("click", function () {
      trackEvent("discord_nudge_learn_more", { page_path: window.location.pathname });
      dismissNudge();
    });
  }, DISCORD_JOIN_NUDGE_DELAY_MS);
}

const TAX_RECEIVE_RATIO = 29091 / 40000;
const TAX_MAX_DROP = 40000;
const TAX_RECEIVE_PER_40K = 29091;

function formatNetWorth(value) {
  const cleanValue = String(value).replace(/[$,]/g, '');
  const num = parseFloat(cleanValue);
  
  if (isNaN(num)) return '$0';
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toLocaleString()}`;
}

function getRankColor(rank) {
  if (rank === 1) return '#FFE566';
  if (rank === 2) return '#E8F0FF';
  if (rank === 3) return '#FFB060';
  if (rank >= 4 && rank <= 25) return '#8B5CF6';
  if (rank >= 26 && rank <= 100) return '#EC4899';
  if (rank >= 101 && rank <= 500) return '#48BB78';
  return '#A0A0A0';
}

function getRankSize(rank) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  if (rank >= 4 && rank <= 25) return 'rank-top25';
  return 'rank-default';
}

function getRankTierClass(rank) {
  if (rank === 1) return 'rank-tier-1';
  if (rank === 2) return 'rank-tier-2';
  if (rank === 3) return 'rank-tier-3';
  if (rank >= 4 && rank <= 25) return 'rank-tier-top25';
  if (rank >= 26 && rank <= 100) return 'rank-tier-top100';
  if (rank >= 101 && rank <= 500) return 'rank-tier-top500';
  return 'rank-tier-default';
}

function getRichestPlayerFields(player, index) {
  const rank = index + 1;
  const playerName = player["Roblox Username"] || player["Player Name"] || player.Name || "Unknown";
  return {
    rank: rank,
    rankColor: getRankColor(rank),
    rankSize: getRankSize(rank),
    rankTier: getRankTierClass(rank),
    rankClass: String(rank).length >= 3 ? "rank-long" : "",
    playerName: playerName,
    level: player["Level"] || "N/A",
    worth: formatNetWorth(player["Networth"] || player["Net Worth"] || 0),
    profileUrl: "https://www.roblox.com/search/users?keyword=" + encodeURIComponent(playerName)
  };
}

function buildRichestPlayerCard(player, index) {
  const p = getRichestPlayerFields(player, index);
  return (
    '<div class="richest-card richest-card--gold ' +
    p.rankSize +
    ' ' +
    p.rankTier +
    '" style="border-color: ' +
    p.rankColor +
    ';" data-player-name="' +
    escapeAttr(p.playerName) +
    '" data-rank="' +
    p.rank +
    '">' +
    '<div class="rank-badge ' +
    p.rankClass +
    '" style="background: ' +
    p.rankColor +
    ';">#' +
    p.rank +
    "</div>" +
    '<img class="player-avatar" alt="" width="56" height="56" decoding="async" />' +
    '<div class="player-info">' +
    '<div class="player-name">' +
    escapeHtml(p.playerName) +
    "</div>" +
    '<div class="player-level"><span class="player-level-label">' + escapeHtml(i18n("richest.level") + ": ") + '</span><span class="player-level-value">' +
    escapeHtml(p.level) +
    "</span></div>" +
    '<div class="player-worth"><span class="player-worth-label">' + escapeHtml(i18n("richest.netWorth") + ": ") + '</span>' +
    escapeHtml(p.worth) +
    "</div>" +
    '<a href="' +
    escapeAttr(p.profileUrl) +
    '" target="_blank" rel="noopener" class="profile-link">' + escapeHtml(i18n("richest.viewProfile")) + '</a>' +
    "</div></div>"
  );
}

function buildRichestCardsContainer(data) {
  return (
    '<div class="richest-container richest-container--gold">' +
    data.map(function (player, index) {
      return buildRichestPlayerCard(player, index);
    }).join("") +
    "</div>"
  );
}

function buildRichestNotListedFooterHtml() {
  return (
    '<p class="richest-not-listed">' +
    escapeHtml(i18n("richest.notListedPrompt")) +
    ' <a href="x-richest-not-listed.html" class="richest-not-listed__link">' +
    escapeHtml(i18n("richest.notListedLink")) +
    "</a></p>"
  );
}

function createRichestPlayersSection(data) {
  const notListedLink = buildRichestNotListedFooterHtml();

  if (!data || data.length === 0) {
    return (
      '<div class="richest-players-header">' +
      "<h2>" + escapeHtml(i18n("richest.title")) + "</h2>" +
      '<p class="richest-intro">' + escapeHtml(i18n("richest.intro")) + "</p>" +
      notListedLink +
      "</div>" +
      '<p style="text-align: center; color: #888;">' +
      escapeHtml(i18n("richest.noData")) +
      "</p>"
    );
  }

  return (
    '<div class="richest-players-header">' +
    "<h2>" + escapeHtml(i18n("richest.title")) + "</h2>" +
    '<p class="richest-intro">' + escapeHtml(i18n("richest.intro")) + "</p>" +
    notListedLink +
    '<div class="richest-search-bar">' +
    '<input type="text" class="richest-search" id="richest-search-input" placeholder="' + escapeAttr(i18n("richest.search")) + '" aria-label="' + escapeAttr(i18n("richest.search")) + '" />' +
    '<button type="button" class="search-reset-btn" id="richest-search-reset" hidden aria-label="' + escapeAttr(i18n("richest.searchResetAria")) + '" title="' + escapeAttr(i18n("richest.searchResetAria")) + '">' +
    '<svg class="search-reset-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
    '<path d="M3 3v5h5"/>' +
    '</svg></button></div>' +
    "</div>" +
    buildRichestCardsContainer(data)
  );
}

function filterRichestPlayers(query) {
  const searchTerm = query.toLowerCase().trim();
  const showAll = searchTerm.length === 0;
  const section = document.querySelector(".richest-players-section");
  if (!section) return;

  section.querySelectorAll(".richest-card").forEach(function (card) {
    const playerName = (card.dataset.playerName || "").toLowerCase();
    const match = showAll || playerName.includes(searchTerm);
    if (match) {
      card.style.removeProperty("display");
    } else {
      card.style.setProperty("display", "none", "important");
    }
  });
}

const RICHEST_AVATAR_BATCH_SIZE = 100;

async function loadRichestPlayerAvatars() {
  const section = document.querySelector(".richest-players-section");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll(".richest-card[data-player-name]"));
  if (!cards.length) return;

  const names = [];
  const seen = new Set();
  cards.forEach(function (card) {
    const name = String(card.dataset.playerName || "").trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return;
    seen.add(key);
    names.push(name);
  });

  const apiUrl =
    typeof window.bsvBotApiUrl === "function"
      ? window.bsvBotApiUrl("api/roblox-avatars")
      : `${BSV_BOT_PUBLIC_BASE}/api/roblox-avatars`;

  for (let i = 0; i < names.length; i += RICHEST_AVATAR_BATCH_SIZE) {
    const batch = names.slice(i, i + RICHEST_AVATAR_BATCH_SIZE);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: batch })
      });
      if (!res.ok) continue;
      const data = await res.json();
      const avatars = (data && data.avatars) || {};

      cards.forEach(function (card) {
        const name = String(card.dataset.playerName || "").trim();
        const entry = avatars[name.toLowerCase()];
        if (!entry || !entry.imageUrl) return;

        const img = card.querySelector(".player-avatar");
        if (img) {
          img.src = entry.imageUrl;
          img.alt = name;
        }
        if (entry.profileUrl) {
          const link = card.querySelector(".profile-link");
          if (link) link.href = entry.profileUrl;
        }
      });
    } catch (err) {
      console.warn("Failed to load richest player avatars:", err);
    }
  }
}

async function fetchSheet(sheetName) {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const cols = json.table.cols.map(c => c.label?.trim() || "");
    const rows = json.table.rows || [];
    const internalColIdx = cols.findIndex(l =>
      normalizeHeaderKey(l).includes("internalvalue")
    );

    const items = rows.map(r => {
      const obj = {};
      cols.forEach((label, i) => {
        const cell = r.c?.[i];
        obj[label] = getCellDisplayValue(cell);
      });
      if (internalColIdx >= 0) {
        obj["Internal Value"] = coerceInternalCell(r.c?.[internalColIdx]);
      }
      obj.__rowValues = (r.c || []).map(getCellDisplayValue);
      obj.__colLabels = cols.slice();
      return obj;
    });

    if (sheetName === "Website Configs") {
      return items;
    }

    return items.filter(x =>
      String(
        x["Name"] ||
        x["Header"] ||
        x["Roblox Name"] ||
        x["Player Name"] ||
        ""
      ).trim().length > 0
    );
  } catch (err) {
    console.error(`Failed to fetch sheet: ${sheetName}`, err);
    return [];
  }
}

async function fetchRichestPlayers() {
  try {
    const RICHEST_SPREADSHEET_ID = "1nfWrJcFkVCZ-Yr0mWmCCjQoQgUD3_-W2Qsy4XD4NT3k";
    const base = `https://docs.google.com/spreadsheets/d/${RICHEST_SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const cols = json.table.cols.map(c => c.label?.trim() || "");
    const rows = json.table.rows || [];
    const items = rows.map(r => {
      const obj = {};
      cols.forEach((label, i) => {
        const cell = r.c?.[i];
        obj[label] = getCellDisplayValue(cell);
      });
      obj.__rowValues = (r.c || []).map(getCellDisplayValue);
      obj.__colLabels = cols.slice();
      return obj;
    });

    const validItems = items.filter(x => String(x["Roblox Username"] || "").trim().length > 0);
    return validItems;
  } catch (err) {
    console.error('Failed to fetch Richest Players', err);
    return [];
  }
}

async function fetchExternalSheet(spreadsheetId, sheetName) {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
    const cols = json.table.cols.map((c) => c.label?.trim() || "");
    const rows = json.table.rows || [];
    return rows.map((r) => {
      const obj = {};
      cols.forEach((label, i) => {
        obj[label] = getCellDisplayValue(r.c?.[i]);
      });
      return obj;
    });
  } catch (err) {
    console.error(`Failed to fetch external sheet: ${sheetName}`, err);
    return [];
  }
}

function parseBooleanCell(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (TRUE_REGEX.test(raw)) return true;
  if (FALSE_REGEX.test(raw)) return false;
  return null;
}

function normalizeItemName(name) {
  return String(name || "").trim().toLowerCase();
}

function extractCellValueByIncludes(row, keyword) {
  const keys = Object.keys(row || {});
  for (const key of keys) {
    if (key.toLowerCase().includes(keyword)) return row[key];
  }
  return "";
}

function rowHasKeyword(row, keyword) {
  const needle = String(keyword || "").toLowerCase();
  if (!needle) return false;
  const keys = Object.keys(row || {});
  for (const key of keys) {
    const keyLower = String(key || "").toLowerCase();
    const valueLower = String(row[key] || "").toLowerCase();
    if (keyLower.includes(needle) || valueLower.includes(needle)) return true;
  }
  return false;
}

function parseBannerDecisionForKeyword(row, keyword) {
  const keys = Object.keys(row || {});
  const keywordLower = String(keyword || "").toLowerCase();
  if (!keywordLower) return null;

  // If a yes/no is directly under a keyword-like header (e.g. "Firework Launcher Giveawat")
  for (const key of keys) {
    const keyLower = String(key || "").toLowerCase();
    if (!keyLower.includes(keywordLower)) continue;
    const parsed = parseBooleanCell(row[key]);
    if (parsed !== null) return parsed;
  }

  // If keyword appears in a value cell and yes/no is in another cell on the same row.
  if (rowHasKeyword(row, keywordLower)) {
    for (const key of keys) {
      const parsed = parseBooleanCell(row[key]);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function normalizeContentSectionName(name) {
  const raw = String(name || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.includes("uncommon") || raw === "common") return "Common / Uncommon";
  if (raw.includes("rare")) return "Rare";
  if (raw.includes("epic")) return "Epic";
  if (raw.includes("legendary")) return "Legendary";
  if (raw.includes("omega")) return "Omega";
  if (raw.includes("misc")) return "Misc";
  if (raw.includes("vehicle")) return "Vehicles";
  return "";
}

function sectionFromVideoColumnHeader(header) {
  const compact = String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  const m = compact.match(/^video([crelomv])$/);
  if (!m) return "";
  const byLetter = {
    c: "Common / Uncommon",
    r: "Rare",
    e: "Epic",
    l: "Legendary",
    o: "Omega",
    m: "Misc",
    v: "Vehicles"
  };
  return byLetter[m[1]] || "";
}

function resolveContentSectionLabel(label) {
  return sectionFromVideoColumnHeader(label) || normalizeContentSectionName(label);
}

function extractVideoEmbedUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_) {
    return "";
  }
  const host = parsed.hostname.toLowerCase();
  if (host.includes("youtube.com")) {
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const maybeEmbed = parts[0] === "embed" && parts[1] ? parts[1] : "";
    if (maybeEmbed) return `https://www.youtube.com/embed/${encodeURIComponent(maybeEmbed)}`;
  }
  if (host.includes("youtu.be")) {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
  }
  if (host.includes("tiktok.com")) {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const videoIdx = parts.indexOf("video");
    if (videoIdx >= 0 && parts[videoIdx + 1]) {
      return `https://www.tiktok.com/embed/v2/${encodeURIComponent(parts[videoIdx + 1])}`;
    }
  }
  return "";
}

function extractSectionContentFields(row) {
  const sectionValue =
    row.Section ||
    row.section ||
    row["Section Name"] ||
    row["section name"] ||
    extractCellValueByIncludes(row, "section");
  const linkValue =
    row.Link ||
    row.link ||
    row.URL ||
    row.url ||
    row.Video ||
    row.video ||
    extractCellValueByIncludes(row, "http");

  return {
    section: String(sectionValue || "").trim(),
    link: String(linkValue || "").trim()
  };
}

async function loadSectionContentConfig() {
  sectionContentEmbeds.clear();
  const rows = await fetchExternalSheet(GIVEAWAY_CONFIG_SPREADSHEET_ID, CONTENT_SHEET_NAME);
  const grouped = new Map();

  function pushEmbed(sectionName, rawUrl) {
    const normalizedSection = resolveContentSectionLabel(sectionName);
    if (!normalizedSection) return;
    const embedUrl = extractVideoEmbedUrl(rawUrl);
    if (!embedUrl) return;
    if (!grouped.has(normalizedSection)) grouped.set(normalizedSection, []);
    grouped.get(normalizedSection).push(embedUrl);
  }

  // Format C (horizontal): Google GViz with headers=1 puts spreadsheet row 1 into **column keys**,
  // not into rows[0]. rows[] are data rows only — each object is keyed by section names.
  let usedColumnLayout = false;
  if (rows.length > 0) {
    const columnKeys = Object.keys(rows[0] || {});
    const sectionByColumnKey = new Map();
    columnKeys.forEach((colKey) => {
      const normalized = resolveContentSectionLabel(colKey);
      if (normalized) sectionByColumnKey.set(colKey, normalized);
    });
    if (sectionByColumnKey.size > 0) {
      usedColumnLayout = true;
      rows.forEach((row) => {
        sectionByColumnKey.forEach((sectionName, colKey) => {
          const cellValue = String((row && row[colKey]) || "").trim();
          if (!cellValue || !/^https?:\/\//i.test(cellValue)) return;
          pushEmbed(sectionName, cellValue);
        });
      });
    }
  }

  if (!usedColumnLayout) {
    // Format A support: headers like Section + Link (existing behavior).
    rows.forEach((row) => {
      const fields = extractSectionContentFields(row);
      if (!fields.section || !fields.link) return;
      pushEmbed(fields.section, fields.link);
    });

    // Format B support: section name rows, with links listed beneath.
    let activeSection = "";
    rows.forEach((row) => {
      const cells = Object.values(row || {})
        .map((v) => String(v || "").trim())
        .filter(Boolean);
      if (!cells.length) return;

      const detectedSection = cells
        .map((v) => resolveContentSectionLabel(v))
        .find(Boolean) || "";

      const rawUrls = cells.filter((v) => /^https?:\/\//i.test(v));

      if (detectedSection) {
        activeSection = detectedSection;
        if (rawUrls.length) {
          rawUrls.forEach((url) => pushEmbed(activeSection, url));
        }
        return;
      }

      if (activeSection && rawUrls.length) {
        rawUrls.forEach((url) => pushEmbed(activeSection, url));
      }
    });
  }

  grouped.forEach((links, section) => {
    if (!links.length) return;
    const unique = [...new Set(links)];
    const pool = unique.length ? unique : links;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    sectionContentEmbeds.set(section, selected);
  });
}

function embedUrlWithScrollAutoplay(embedUrl) {
  try {
    const u = new URL(String(embedUrl || "").trim(), "https://example.com");
    const host = u.hostname.toLowerCase();
    if (host.includes("youtube.com")) {
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("mute", "1");
      u.searchParams.set("playsinline", "1");
      u.searchParams.set("rel", "0");
      return u.toString();
    }
    if (host.includes("tiktok.com")) {
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("mute", "1");
      return u.toString();
    }
  } catch (_) {}
  return String(embedUrl || "").trim();
}

function setupSectionEmbedScrollAutoplay() {
  const boxes = document.querySelectorAll(".section-content-embed");
  if (!boxes.length || typeof IntersectionObserver === "undefined") return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const box = entry.target;
        if (!(box instanceof HTMLElement)) return;
        if (box.dataset.autoplayDone === "1") return;
        const iframe = box.querySelector("iframe");
        if (!(iframe instanceof HTMLIFrameElement)) return;
        const baseSrc = iframe.dataset.baseSrc || iframe.getAttribute("src") || "";
        if (!baseSrc) return;
        box.dataset.autoplayDone = "1";
        iframe.src = embedUrlWithScrollAutoplay(baseSrc);
        obs.unobserve(box);
      });
    },
    { threshold: 0.32, rootMargin: "0px 0px -8% 0px" }
  );

  boxes.forEach((box) => {
    const iframe = box.querySelector("iframe");
    if (iframe) {
      const src = iframe.getAttribute("src") || "";
      iframe.dataset.baseSrc = src;
    }
    obs.observe(box);
  });
}

function renderSectionContentEmbeds() {
  CONTENT_SECTIONS.forEach((sectionName) => {
    const embedUrl = sectionContentEmbeds.get(sectionName);
    if (!embedUrl) return;
    const sectionEl = document.getElementById(slugify(sectionName));
    if (!sectionEl) return;

    const existing = sectionEl.querySelector(".section-content-embed");
    if (existing) existing.remove();

    const isTikTok = /tiktok\.com/i.test(embedUrl);
    const embedKindClass = isTikTok ? "section-content-embed--tiktok" : "section-content-embed--youtube";
    const frameRatioClass = isTikTok
      ? "section-content-embed-frame-wrap--portrait"
      : "section-content-embed-frame-wrap--landscape";

    const wrapper = document.createElement("div");
    wrapper.className = `section-content-embed ${embedKindClass}`;
    wrapper.innerHTML = `
      <h3 class="section-content-embed-title">You might like this BlockSpin Video!</h3>
      <div class="section-content-embed-frame-wrap ${frameRatioClass}">
        <iframe
          src="${escapeAttr(embedUrl)}"
          data-base-src="${escapeAttr(embedUrl)}"
          title="${escapeAttr(sectionName)} featured video"
          loading="lazy"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">
        </iframe>
      </div>
    `;
    sectionEl.appendChild(wrapper);
  });
  setupSectionEmbedScrollAutoplay();
}

async function loadExternalGiveawayConfig() {
  giveawayItems.clear();
  bannerVisibility.anaconda = false;
  bannerVisibility.firework = false;
  bannerVisibility.legendary = true;
  bannerVisibility.humvee = false;
  bannerVisibility.robux = false;

  const [giveawayRows, bannerRows] = await Promise.all([
    fetchExternalSheet(GIVEAWAY_CONFIG_SPREADSHEET_ID, GIVEAWAYS_SHEET_NAME),
    fetchExternalSheet(GIVEAWAY_CONFIG_SPREADSHEET_ID, BANNERS_SHEET_NAME)
  ]);

  giveawayRows.forEach((row) => {
    const item = String(row.Item || row.item || extractCellValueByIncludes(row, "item") || "").trim();
    const giveawayValue = row.Giveaway || row.giveaway || extractCellValueByIncludes(row, "giveaway");
    if (!item) return;
    if (parseBooleanCell(giveawayValue) === true) {
      giveawayItems.add(normalizeItemName(item));
    }
  });

  bannerRows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      const keyLower = String(key || "").toLowerCase();
      const valueParsed = parseBooleanCell(row[key]);
      if (valueParsed === null) return;
      if (keyLower.includes("firework")) bannerVisibility.firework = valueParsed;
      if (keyLower.includes("legendary")) bannerVisibility.legendary = valueParsed;
    });

    const rawName = String(
      row.Name ||
      row.name ||
      row.Item ||
      row.item ||
      row.Title ||
      row.title ||
      extractCellValueByIncludes(row, "giveaway")
    ).trim();
    if (!rawName) return;
    const lowerName = rawName.toLowerCase();
    const rawValue = row.Enabled || row.enabled || row.Value || row.value || row.Show || row.show || extractCellValueByIncludes(row, "show");
    const parsed = parseBooleanCell(rawValue);
    if (parsed === null) return;
    if (lowerName.includes("firework")) bannerVisibility.firework = parsed;
    if (lowerName.includes("legendary")) bannerVisibility.legendary = parsed;
  });

  // Fallback parser: supports typos/alternate layouts like "Giveawat"/different columns.
  bannerRows.forEach((row) => {
    const fireworkDecision = parseBannerDecisionForKeyword(row, "firework");
    if (fireworkDecision !== null) bannerVisibility.firework = fireworkDecision;
    const legendaryDecision = parseBannerDecisionForKeyword(row, "legendary");
    if (legendaryDecision !== null) bannerVisibility.legendary = legendaryDecision;
  });

  applyExternalBannerVisibility();
}


function buildCardSaveButtonHtml() {
  return (
    '<button type="button" class="card-save-btn" aria-label="' + escapeAttr(i18n("savedCards.saveAria")) + '" title="' + escapeAttr(i18n("savedCards.saveTitle")) + '" aria-pressed="false">' +
      '<svg class="card-save-btn__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' +
      "</svg>" +
    "</button>"
  );
}

function isSheetYesValue(value) {
  return /^(yes|true|1|ticked|checked|on|y)$/i.test(String(value || "").trim());
}

function itemHasSheetFlag(item, flagName) {
  if (!item || !flagName) return false;
  var target = String(flagName).toLowerCase().replace(/\s+/g, "");
  return Object.keys(item).some(function (key) {
    if (key === "__sheet") return false;
    return key.toLowerCase().replace(/\s+/g, "") === target && isSheetYesValue(item[key]);
  });
}

function getItemExclusiveTier(item) {
  if (itemHasSheetFlag(item, "veryexclusive")) return "veryexclusive";
  if (itemHasSheetFlag(item, "exclusive")) return "exclusive";
  return null;
}

var _exclusiveBadgeIconSeq = 0;

function nextExclusiveBadgeIconId(suffix) {
  _exclusiveBadgeIconSeq += 1;
  return "bsvEx" + _exclusiveBadgeIconSeq + suffix;
}

function buildExclusiveBadgeIconSvg(tier) {
  if (tier === "veryexclusive") {
    var g = nextExclusiveBadgeIconId("Bd");
    return (
      '<svg class="card-exclusive-badge__icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
        "<defs>" +
          '<linearGradient id="' + g + '" x1="20%" y1="0%" x2="80%" y2="100%">' +
            '<stop offset="0%" stop-color="#fda4af"/>' +
            '<stop offset="40%" stop-color="#be123c"/>' +
            '<stop offset="100%" stop-color="#1a0510"/>' +
          "</linearGradient>" +
        "</defs>" +
        '<path fill="url(#' + g + ')" stroke="#4c0519" stroke-width="1" stroke-linejoin="round" d="M12 3 19.5 9 12 21 4.5 9z"/>' +
        '<path fill="none" stroke="#fecdd3" stroke-opacity="0.35" stroke-width="0.7" d="M4.5 9h15M12 3v18"/>' +
      "</svg>"
    );
  }

  var g = nextExclusiveBadgeIconId("Ss");
  return (
    '<svg class="card-exclusive-badge__icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
      "<defs>" +
        '<linearGradient id="' + g + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" stop-color="#fde68a"/>' +
          '<stop offset="100%" stop-color="#d97706"/>' +
        "</linearGradient>" +
      "</defs>" +
      '<path fill="url(#' + g + ')" stroke="#78350f" stroke-width="1" d="M12 2.5 20 7v7c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V7z"/>' +
      '<path fill="#fef3c7" stroke="#92400e" stroke-width="0.5" d="M12 8.5l1.3 2.6 2.9.4-2.1 2 .5 2.9L12 15l-2.6 1.4.5-2.9-2.1-2 2.9-.4z"/>' +
    "</svg>"
  );
}

function buildCardExclusiveBadgeHtml(tier) {
  if (!tier) return "";
  var isVery = tier === "veryexclusive";
  var modClass = isVery ? "card-exclusive-badge-wrapper--very" : "card-exclusive-badge-wrapper--standard";
  var tooltipKey = isVery ? "card.exclusiveVeryTooltip" : "card.exclusiveTooltip";
  var ariaKey = isVery ? "card.exclusiveVeryAria" : "card.exclusiveAria";
  return (
    '<div class="card-exclusive-badge-wrapper ' + modClass + '">' +
      '<div class="card-exclusive-badge" role="img" aria-label="' + escapeAttr(i18n(ariaKey)) + '">' +
        buildExclusiveBadgeIconSvg(tier) +
      '</div>' +
      '<div class="card-exclusive-badge-tooltip" role="tooltip">' + escapeHtml(i18n(tooltipKey)) + "</div>" +
    "</div>"
  );
}

function buildCardBottomActionsHtml(exclusiveTier) {
  return (
    '<div class="card-bottom-actions">' +
      buildCardSaveButtonHtml() +
      buildCardExclusiveBadgeHtml(exclusiveTier) +
    "</div>"
  );
}

function createCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"]);
  const demand = safe(item["Demand"]);
  const avg = safe(item["Average Value"]);
  const ranged = safe(item["Ranged Value"]);
  const sectionName = String(item.__sheet || "").trim().toLowerCase();
  const isMiscSection = sectionName.includes("misc");
  const durability = safe(item["Durability"]);
  const internalRawDirect = String(item["Internal Value"] || "").trim();
  const internalRaw = String(getInternalValueFromItem(item) ?? "").trim();
  const internalNum = parseInternalValue(internalRaw);
  const hasInternalValue =
    Number.isFinite(internalNum) && internalNum > 0;
  const internalValueForAttr = hasInternalValue
    ? String(internalNum)
    : internalRaw;
  const networthDisplay = hasInternalValue
    ? "$" + Math.round(internalNum).toLocaleString("en-US")
    : internalRaw !== ""
      ? internalRaw
      : "N/A";
  const giveawayFlag = safe(item["Giveaway"]);

  let imgTag = "";
  if (img) {
    imgTag = `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`;
  }

  let durabilityHTML = '';
  
  const durabilityInvisible = safe(item["Durability Invisible"]);
  const durabilityInvisibleNormalized = String(durabilityInvisible).trim().toLowerCase();
  const isDurabilityInvisible =
    /^(yes|true|1|ticked|checked|on|y)$/i.test(durabilityInvisibleNormalized);
  const invisibleStyle = isDurabilityInvisible ? 'style="opacity: 0;"' : '';
  const showPawn = !isMiscSection && durability && durability.includes('/') && hasInternalValue;
  const showRepair = showPawn && !isDurabilityInvisible;
  const showNetworth = !isMiscSection || (internalRawDirect !== "" && internalRawDirect !== "-");
  
  if (durability && durability.includes('/')) {
    const maxDurability = durability.split('/')[1] || "100";
    const currentDurability = durability.split('/')[0] || maxDurability;
    
    durabilityHTML = `
      <div class="durability-control" ${invisibleStyle}>
        <label>${escapeHtml(i18n("card.durability"))}:</label>
        <div class="durability-input-row">
          <input type="number" class="durability-input" 
                 value="${currentDurability}" 
                 max="${maxDurability}" 
                 min="0" 
                 oninput="enforceMaxDurability(this)"
                 onchange="updateCardValues(this)">
          <span class="durability-max">/${maxDurability}</span>
          <div class="durability-arrows">
            <button onmousedown="adjustDurability(this, 1, event)" ontouchstart="adjustDurability(this, 1, event)">▲</button>
            <button onmousedown="adjustDurability(this, -1, event)" ontouchstart="adjustDurability(this, -1, event)">▼</button>
          </div>
        </div>
      </div>
    `;
    
  }

let repairPrice = 0;
if (showPawn) {
  const [currentDurability, maxDurability] = durability.split('/').map(v => parseInt(v) || 0);
  const missingDurability = maxDurability - currentDurability;
  const internalVal = internalNum;

  const rawRepair = missingDurability * (internalVal / maxDurability / 1.43);
  repairPrice = Math.round(rawRepair);
}

let pawnAmount = 0;
if (showPawn) {
  const [currentDurability, maxDurability] = durability.split('/').map(v => parseInt(v) || 0);
  const internalVal = internalNum;

  const baseValue = internalVal * 0.3;
  const missingDurability = maxDurability - currentDurability;
  const deduction = missingDurability * ((internalVal * 0.3) / maxDurability / 1.43);
  
  const rawPawn = baseValue - deduction;
  pawnAmount = Math.round(rawPawn);

  pawnAmount = `$${pawnAmount.toLocaleString()}`;
}
  
  const hasGiveaway = (giveawayFlag && giveawayFlag.toString().trim().toLowerCase() === 'yes') || giveawayItems.has(normalizeItemName(name));
  const exclusiveTier = getItemExclusiveTier(item);
  const sectionLabel = safe(item.__sheet || "Unknown");
  
  return `
    <div class="card" data-name="${escapeAttr(name)}" 
         data-section="${escapeAttr(sectionLabel)}"
         data-image-url="${escapeAttr(img)}"
         data-demand="${escapeAttr(demand)}"
         data-durability="${escapeAttr(durability)}"
         data-card-type="weapon"
         data-save-card
         data-avg="${escapeAttr(avg)}" 
         data-ranged="${escapeAttr(ranged)}" 
         data-max-durability="${durability ? durability.split('/')[1] : '100'}"
         data-internal-value="${escapeAttr(internalValueForAttr)}">
      <div class="card-left">
        ${imgTag ? `<div class="card-item-image-wrap">${imgTag}</div>` : ""}
        ${durabilityHTML}
      </div>
      <div class="card-info">
        <h3>${name}</h3>
        ${demand ? `<span class="badge">${escapeHtml(i18n("card.demand"))}: ${escapeHtml(demand)}</span>` : ""}
        <div class="card-avg">${escapeHtml(i18n("card.avg"))}: <span class="avg-value">${avg}</span></div>
        <div class="card-ranged">${escapeHtml(i18n("card.ranged"))}: <span class="ranged-value">${ranged}</span></div>
        <div class="card-value-separator"></div>
        <div class="card-secondary-values">
          ${showNetworth ? `<div class="card-networth">${escapeHtml(i18n("card.networth"))}: <span class="networth-value">${escapeHtml(String(networthDisplay))}</span></div>` : ""}
          ${showPawn ? `<div class="card-pawn">${escapeHtml(i18n("card.pawn"))}: <span class="pawn-value">${pawnAmount}</span></div>` : ''}
          ${showRepair ? `
            <div class="card-repair">
              ${escapeHtml(i18n("card.repair"))}: <span class="repair-value">$${repairPrice.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      </div>
      ${hasGiveaway ? `
        <button class="card-giveaway-trigger" type="button" aria-label="${escapeAttr(i18n("card.giveawayAria"))}" data-item-name="${escapeAttr(name)}"></button>
      ` : ''}
      ${buildCardBottomActionsHtml(exclusiveTier)}
    </div>
  `;
}

function ensureGiveawayModal() {
  if (document.getElementById('giveaway-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'giveaway-modal';
  modal.className = 'giveaway-modal';
  modal.innerHTML = `
    <div class="giveaway-modal-backdrop" data-giveaway-close></div>
    <div class="giveaway-modal-content">
      <button class="giveaway-modal-close" type="button" aria-label="${escapeAttr(i18n("giveaway.close"))}" data-giveaway-close>&times;</button>
      <h2 class="giveaway-modal-title">${escapeHtml(i18n("giveaway.modalTitle"))}</h2>
      <p class="giveaway-modal-text">
        ${escapeHtml(i18n("giveaway.modalBody"))}
      </p>
      <a href="https://discord.gg/QbapryYUUx" target="_blank" rel="noopener" class="giveaway-modal-button">
        ${escapeHtml(i18n("giveaway.modalBtn"))}
      </a>
    </div>
  `;
  document.body.appendChild(modal);
}

function createCrewLogoCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image"]);
  const id = safe(item["ID"]);

  const imgTag = img
    ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`
    : "";
  return `
    <div class="card crew-logo-card" data-name="${escapeAttr(name)}">
      <div class="crew-card-content">
        <h3>${name}</h3>
        ${imgTag}
        <div class="crew-id-container">
          <div class="crew-id">${escapeHtml(i18n("card.id"))}: ${id}</div>
          <button class="copy-btn" onclick="copyToClipboard('${escapeAttr(id)}')" title="${escapeAttr(i18n("card.copyId"))}">📋</button>
        </div>
      </div>
    </div>
  `;
}

function createScammerCard(item) {
  const robloxName = safe(item["Roblox Name"]);
  const discordUser = safe(item["Discord User"]);
  const reason = safe(item["Reason"]);
    const reasonWithLinks = reason.replace(/https?:\/\/\S+/g, match => `<a href="${match}" target="_blank" rel="noopener" class="scammer-link">User Profile</a>`);
  const evidence = safe(item["Evidence"]);
  const submittedDate = item["Date"] || item["Submitted Date"] || "";

  let robloxNameHtml;
  if (robloxName.includes('http')) {
    const urlMatch = robloxName.match(/(.*?)(https?:\/\/\S+)/);
    if (urlMatch) {
      const textPart = urlMatch[1].trim();
      const urlPart = urlMatch[2];
      robloxNameHtml = `${textPart} <a href="${urlPart}" target="_blank" rel="noopener" class="scammer-link">User Profile</a>`;
    } else {
      robloxNameHtml = robloxName;
    }
  } else {
    robloxNameHtml = robloxName;
  }

  const evidenceLinks = evidence.split(",").map(link => link.trim()).filter(link => link.length > 0);
  let evidenceHtml = "";
  if (evidenceLinks.length > 0) {
    evidenceHtml = evidenceLinks.map((link, index) => 
      `<a href="${link}" target="_blank" rel="noopener" class="scammer-link">Evidence ${index + 1}</a>`
    ).join(" | ");
  }

  return `
    <div class="card scammer-card" data-name="${escapeAttr(robloxName)}">
      <div class="card-info">
        <div class="scammer-field"><strong>Roblox Name:</strong> ${robloxNameHtml}</div>
        <div class="scammer-field"><strong>Discord:</strong> ${discordUser}</div>
                <div class="scammer-field"><strong>Reason:</strong> ${reasonWithLinks}</div>
        ${evidenceHtml ? `<div class="scammer-field"><strong>Evidence:</strong> ${evidenceHtml}</div>` : ""}
        <div>Reported: ${submittedDate}</div>
      </div>
    </div>
  `;
}

function createAccessoryCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"] || item["Image"]);
  const rarity = safe(item["Rarity"]);
  const networthValue = safe(item["Networth Value"]);
  const crate = safe(item["Crate"]);
  const networthNum = parseInternalValue(networthValue);
  const networthDisplay = networthNum > 0
    ? "$" + Math.round(networthNum).toLocaleString("en-US")
    : "N/A";
  const pawnDisplay = networthNum > 0
    ? "$" + Math.round(networthNum * 0.3).toLocaleString("en-US")
    : "N/A";
  const rarityNorm = String(rarity || "").trim().toLowerCase();
  const rarityClass =
    rarityNorm === "omega" ? "rarity-omega" :
    rarityNorm === "legendary" ? "rarity-legendary" :
    rarityNorm === "epic" ? "rarity-epic" :
    rarityNorm === "rare" ? "rarity-rare" :
    rarityNorm === "uncommon" ? "rarity-uncommon" :
    rarityNorm === "common" ? "rarity-common" :
    "rarity-default";
  const imgTag = img
    ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`
    : "";
  const exclusiveTier = getItemExclusiveTier(item);

  return `
    <div class="card" data-name="${escapeAttr(name)}"
         data-section="${escapeAttr(safe(item.__sheet || "Accessories"))}"
         data-image-url="${escapeAttr(img)}"
         data-rarity="${escapeAttr(rarity)}"
         data-crate="${escapeAttr(crate)}"
         data-networth="${escapeAttr(networthDisplay)}"
         data-card-type="accessory"
         data-save-card>
      <div class="card-left">
        ${imgTag ? `<div class="card-item-image-wrap">${imgTag}</div>` : ""}
      </div>
      <div class="card-info">
        <h3>${escapeHtml(name)}</h3>
        ${rarity ? `<span class="badge accessory-rarity-badge ${rarityClass}">${escapeHtml(rarity)}</span>` : ""}
        <div class="card-value-separator"></div>
        <div class="card-secondary-values">
          <div class="card-networth">${escapeHtml(i18n("card.networth"))}: <span class="networth-value">${escapeHtml(networthDisplay)}</span></div>
          <div class="card-pawn">${escapeHtml(i18n("card.pawnValue"))}: <span class="pawn-value">${escapeHtml(pawnDisplay)}</span></div>
          <div class="card-ranged">${escapeHtml(i18n("card.crate"))}: <span>${escapeHtml(crate || i18n("card.na"))}</span></div>
        </div>
      </div>
      ${buildCardBottomActionsHtml(exclusiveTier)}
    </div>
  `;
}

function normalizeGuideHeader(label) {
  return String(label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isWeaponValueListHeaders(cols) {
  const keys = (cols || []).map(normalizeGuideHeader);
  return (
    keys.includes("name") &&
    keys.includes("imageurl") &&
    keys.includes("demand") &&
    keys.includes("averagevalue") &&
    keys.includes("durability")
  );
}

function isFishingItemsSheetHeaders(cols) {
  const keys = (cols || []).map(normalizeGuideHeader);
  if (isWeaponValueListHeaders(cols)) return false;
  const hasName = keys.some(function (k) { return k.includes("name"); });
  const hasImage = keys.some(function (k) { return k.includes("image"); });
  const hasDescription = keys.some(function (k) { return k.includes("description"); });
  const hasPrice = keys.some(function (k) { return k.includes("price"); });
  return hasName && hasImage && hasDescription && hasPrice;
}

function isFishingTypesSheetHeaders(cols) {
  const keys = (cols || []).map(normalizeGuideHeader);
  if (isWeaponValueListHeaders(cols)) return false;
  const hasName = keys.some(function (k) { return k.includes("name"); });
  const hasImage = keys.some(function (k) { return k.includes("image"); });
  const hasRarity = keys.some(function (k) { return k.includes("rarity"); });
  const hasSellAmount = keys.some(function (k) { return k.includes("sellamount"); });
  return hasName && hasImage && hasRarity && hasSellAmount;
}

function isFarmingItemsSheetHeaders(cols) {
  const keys = (cols || []).map(normalizeGuideHeader);
  if (isWeaponValueListHeaders(cols)) return false;
  const hasName = keys.some(function (k) { return k.includes("item") || k.includes("name"); });
  const hasImage = keys.some(function (k) { return k.includes("image"); });
  const hasDescription = keys.some(function (k) { return k.includes("description"); });
  const hasPrice = keys.some(function (k) { return k.includes("price"); });
  return hasName && hasImage && hasDescription && hasPrice;
}

function stripGuideCellPrefix(value) {
  return String(value || "").replace(/^\s*(Fishing|Farming)\s*/i, "").trim();
}

function rowHasGuideMarker(item, prefix) {
  const re = new RegExp("^\\s*" + prefix + "\\b", "i");
  return Object.keys(item || {}).some(function (key) {
    if (key.indexOf("__") === 0) return false;
    return re.test(String(item[key] || ""));
  });
}

function filterGuideRows(items, prefix) {
  if (!items || !items.length) return [];
  const markedRows = items.filter(function (item) { return rowHasGuideMarker(item, prefix); });
  if (markedRows.length) return markedRows;
  return items;
}

function filterFishingGuideRows(items) {
  return filterGuideRows(items, "Fishing");
}

function filterFarmingGuideRows(items) {
  return filterGuideRows(items, "Farming");
}

async function fetchGuideSheet(sheetName, kind) {
  try {
    const base = "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/gviz/tq";
    const url = base + "?tqx=out:json&sheet=" + encodeURIComponent(sheetName) + "&headers=1";
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
    const cols = (json.table.cols || []).map(function (c) { return (c.label || "").trim(); });
    const headerOk = kind === "items"
      ? isFishingItemsSheetHeaders(cols)
      : kind === "types"
        ? isFishingTypesSheetHeaders(cols)
        : kind === "farming"
          ? isFarmingItemsSheetHeaders(cols)
          : false;

    if (!headerOk) {
      console.warn(
        'Sheet "' + sheetName + '" is not a valid guide ' + kind + ' tab (got unexpected columns).'
      );
      return { items: [], wrongSheet: true };
    }

    const rows = json.table.rows || [];
    const items = rows.map(function (r) {
      const obj = { __colLabels: cols.slice() };
      cols.forEach(function (label, i) {
        obj[label] = getCellDisplayValue(r.c?.[i]);
      });
      return obj;
    });

    const nameKeys = kind === "items"
      ? ["Fishing Name", "Fishing Item", "Name", "Item Name"]
      : kind === "farming"
        ? ["Farming Item", "Name", "Item Name"]
        : ["Fishing Item Name", "Item Name", "Name"];
    const rowFilter = kind === "farming" ? filterFarmingGuideRows : filterFishingGuideRows;
    const withNames = items.filter(function (item) {
      return guideField(item, nameKeys).length > 0;
    });

    return { items: rowFilter(withNames), wrongSheet: false };
  } catch (err) {
    console.error("Failed to fetch guide sheet: " + sheetName, err);
    return { items: [], wrongSheet: true };
  }
}

async function fetchGuideSheetWithAliases(primaryName, kind) {
  const names = [primaryName];
  if (primaryName.endsWith(" ")) names.push(primaryName.trim());
  if (primaryName === "Fishing Item") names.push("Fishing Items");
  if (primaryName === "Fishing Items") names.push("Fishing Item");
  if (primaryName.indexOf("Fishing Types of fishing") === 0) {
    names.push("Fishing Types of fishing");
    names.push("Fishing Types of Fishes");
  }

  const uniqueNames = Array.from(new Set(names.filter(Boolean)));
  for (let i = 0; i < uniqueNames.length; i++) {
    const result = await fetchGuideSheet(uniqueNames[i], kind);
    if (!result.wrongSheet) return result;
  }
  return { items: [], wrongSheet: true };
}

function guideField(item, keys) {
  const labels = item.__colLabels || Object.keys(item).filter(function (k) {
    return k.indexOf("__") !== 0;
  });

  for (let i = 0; i < keys.length; i++) {
    const direct = stripGuideCellPrefix(String(safe(item[keys[i]])).trim());
    if (direct) return direct;
  }

  for (let i = 0; i < keys.length; i++) {
    const want = normalizeGuideHeader(keys[i]);
    for (let j = 0; j < labels.length; j++) {
      const label = labels[j];
      const got = normalizeGuideHeader(label);
      if (got === want || got.endsWith(want) || got.includes(want)) {
        const value = stripGuideCellPrefix(String(safe(item[label])).trim());
        if (value) return value;
      }
    }
  }
  return "";
}

function parseGuideNumber(value) {
  const n = parseFloat(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value) {
  return "$" + Math.round(Number(value) || 0).toLocaleString("en-US");
}

function calculateFishSellPrice(sellAmount, weight) {
  return Math.round(parseGuideNumber(sellAmount) * parseGuideNumber(weight));
}

function calculateFishBlockSpinPrice(sellAmount, weight) {
  return Math.round(calculateFishSellPrice(sellAmount, weight) * 1.5);
}

function getGuideRarityClass(rarity) {
  const rarityNorm = String(rarity || "").trim().toLowerCase();
  if (rarityNorm === "omega") return "rarity-omega";
  if (rarityNorm === "legendary") return "rarity-legendary";
  if (rarityNorm === "epic") return "rarity-epic";
  if (rarityNorm === "rare") return "rarity-rare";
  if (rarityNorm === "uncommon") return "rarity-uncommon";
  if (rarityNorm === "common") return "rarity-common";
  return "rarity-default";
}

function createGuideItemCard(item, config) {
  const name = guideField(item, config.nameKeys);
  if (!name) return "";

  const imageUrl = guideField(item, config.imageKeys);
  const description = guideField(item, config.descriptionKeys);
  const price = guideField(item, config.priceKeys);
  const imageHtml = imageUrl
    ? `<div class="card-item-image-wrap"><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(name)}" loading="lazy" onerror="this.style.display='none'"></div>`
    : "";

  return `
    <div class="card guide-vcard guide-item-card" data-name="${escapeAttr(name)}">
      <h3 class="guide-vcard__name">${escapeHtml(name)}</h3>
      <div class="guide-vcard__image">${imageHtml}</div>
      <div class="guide-vcard__price">
        <span class="guide-vcard__label">${escapeHtml(i18n("card.price"))}</span>
        <span class="guide-vcard__value">${escapeHtml(price || i18n("card.na"))}</span>
      </div>
      ${description ? `<p class="guide-vcard__desc">${escapeHtml(description)}</p>` : ""}
    </div>
  `;
}

function createFishingItemCard(item) {
  return createGuideItemCard(item, {
    nameKeys: ["Fishing Name", "Fishing Item", "Name", "Item Name"],
    imageKeys: ["Fishing Item image", "Fishing Image", "Item image", "Image", "Image URL"],
    descriptionKeys: ["Fishing Description", "Description"],
    priceKeys: ["Fishing Price", "Price"]
  });
}

function createFarmingItemCard(item) {
  return createGuideItemCard(item, {
    nameKeys: ["Farming Item", "Name", "Item Name"],
    imageKeys: ["Farming Image", "Item image", "Image", "Image URL"],
    descriptionKeys: ["Farming Description", "Description"],
    priceKeys: ["Farming Price", "Price"]
  });
}

function createFishingTypeCard(item) {
  const name = guideField(item, ["Fishing Item Name", "Item Name", "Name"]);
  if (!name) return "";

  const imageUrl = guideField(item, ["Fishing Image", "Image", "Item image", "Image URL"]);
  const rarity = guideField(item, ["Fishing Rarity", "Rarity"]);
  const sellAmount = parseGuideNumber(guideField(item, ["Fishing Sell Amount", "Sell Amount"]));
  const initialWeight = FISH_WEIGHT_MAX;
  const initialPrice = calculateFishSellPrice(sellAmount, initialWeight);
  const initialBlockSpinPrice = calculateFishBlockSpinPrice(sellAmount, initialWeight);
  const rarityClass = getGuideRarityClass(rarity);
  const imageHtml = imageUrl
    ? `<div class="card-item-image-wrap"><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(name)}" onerror="this.style.display='none'"></div>`
    : "";

  return `
    <div class="card guide-vcard guide-fish-card fishing-fish-card" data-name="${escapeAttr(name)}" data-sell-amount="${escapeAttr(String(sellAmount))}">
      <h3 class="guide-vcard__name">${escapeHtml(name)}</h3>
      <div class="guide-vcard__image">${imageHtml}</div>
      ${rarity ? `<span class="guide-vcard__rarity ${rarityClass}">${escapeHtml(rarity)}</span>` : ""}
      <div class="guide-vcard__weight fish-weight-control">
        <label class="guide-vcard__label">${escapeHtml(i18n("card.weight"))}</label>
        <div class="fish-weight-input-row">
          <input
            type="number"
            class="fish-weight-input"
            value="${initialWeight.toFixed(1)}"
            min="0"
            max="${FISH_WEIGHT_MAX}"
            step="${FISH_WEIGHT_STEP}"
            oninput="enforceFishWeight(this)"
            onchange="updateFishCardPrice(this)"
          />
          <span class="fish-weight-max">/${FISH_WEIGHT_MAX}</span>
          <div class="fish-weight-arrows">
            <button type="button" aria-label="${escapeAttr(i18n("card.increaseWeight"))}" onmousedown="adjustFishWeight(this, 1, event)" ontouchstart="adjustFishWeight(this, 1, event)">▲</button>
            <button type="button" aria-label="${escapeAttr(i18n("card.decreaseWeight"))}" onmousedown="adjustFishWeight(this, -1, event)" ontouchstart="adjustFishWeight(this, -1, event)">▼</button>
          </div>
        </div>
      </div>
      <div class="guide-vcard__divider" aria-hidden="true"></div>
      <div class="guide-vcard__stat">
        <span class="guide-vcard__label">${escapeHtml(i18n("card.sellAmount"))}</span>
        <span class="guide-vcard__value guide-vcard__value--sell fish-sell-value">${formatMoney(initialPrice)}</span>
      </div>
      <div class="guide-vcard__stat guide-vcard__stat--blockspin">
        <span class="guide-vcard__label">${escapeHtml(i18n("card.sellBlockSpin"))}</span>
        <span class="guide-vcard__value guide-vcard__value--blockspin fish-blockspin-value">${formatMoney(initialBlockSpinPrice)}</span>
      </div>
    </div>
  `;
}

function buildComingSoonGuidePanelHtml() {
  return (
    '<div class="coming-soon-guide-wrap">' +
    '<h3 class="coming-soon-guide-title" id="mg-guide-coming-soon">' +
    escapeHtml(i18n("guide.comingSoonSection")) +
    "</h3>" +
    '<div class="guide-coming-soon-showcase">' +
    '<img src="' +
    escapeAttr(GUIDE_COMING_SOON_IMAGE_URL) +
    '" alt="" loading="lazy" decoding="async" />' +
    "</div></div>"
  );
}

function buildGuideFooterImageHtml(imageUrl) {
  if (!imageUrl) return "";
  return (
    '<div class="guide-footer-image">' +
    '<img src="' +
    escapeAttr(imageUrl) +
    '" alt="" loading="lazy" decoding="async" />' +
    '<p class="guide-footer-image__caption">' +
    escapeHtml(i18n("guide.moreComingSoon")) +
    "</p></div>"
  );
}

function buildFishingGuideHtml(fishingItems, fishingTypes) {
  const itemCards = (fishingItems || []).map(createFishingItemCard).filter(Boolean).join("");
  const typeCards = (fishingTypes || []).map(createFishingTypeCard).filter(Boolean).join("");

  return `
    <div class="fishing-guide-wrap">
      <h3 class="fishing-guide-title" id="mg-guide-fishing">${escapeHtml(i18n("guide.fishing"))}</h3>
      <h4 class="fishing-mini-header" id="mg-fishing-items">${escapeHtml(i18n("guide.items"))}</h4>
      <div class="guide-vcards-grid fishing-items-cards">${itemCards || '<p class="fishing-empty">' + escapeHtml(i18n("guide.noFishingItems")) + '</p>'}</div>
      <h4 class="fishing-mini-header" id="mg-fishing-types">${escapeHtml(i18n("guide.fishTypes"))}</h4>
      <div class="guide-vcards-grid fishing-types-cards">${typeCards || '<p class="fishing-empty">' + escapeHtml(i18n("guide.noFishTypes")) + '</p>'}</div>
      ${buildGuideFooterImageHtml(FISHING_GUIDE_FOOTER_IMAGE_URL)}
    </div>
  `;
}

async function loadFarmingGuidePanel() {
  const farmingPanel = document.getElementById("money-guide-farming");
  if (!farmingPanel || farmingPanel.dataset.loaded === "1") return Promise.resolve();

  farmingPanel.innerHTML = '<p class="guide-empty">' + escapeHtml(i18n("guide.loadingFarming")) + '</p>';
  try {
    const result = await fetchGuideSheetWithAliases(MONEY_GUIDE_SHEETS.farming, "farming");
    let warningHtml = "";
    if (result.wrongSheet) {
      warningHtml =
        '<div class="guide-sheet-warning">Could not load <strong>' +
        escapeHtml(MONEY_GUIDE_SHEETS.farming) +
        '</strong>. Use headers: Farming Item, Farming Image, Farming Description, Farming Price.</div>';
    }
    farmingPanel.innerHTML = warningHtml + buildFarmingGuideHtml(result.items);
    initFarmingPlotPlanner(farmingPanel.querySelector(".farming-planner"));
    farmingPanel.dataset.loaded = "1";
  } catch (error) {
    console.error("Failed to load farming guide data:", error);
    farmingPanel.innerHTML = '<p class="guide-empty">' + escapeHtml(i18n("guide.failedFarming")) + '</p>';
  }
}

function farmingComboKey(pot, soil, seed) {
  return pot + "|" + soil + "|" + seed;
}

function getFarmingCombo(pot, soil, seed) {
  if (!pot || !soil || !seed) return null;
  return FARMING_COMBO_LOOKUP[farmingComboKey(pot, soil, seed)] || null;
}

function formatFarmingMoney(amount) {
  return "$" + Number(amount).toLocaleString("en-US");
}

function parseFarmingTimeToMinutes(timeStr) {
  var s = String(timeStr || "").trim().toLowerCase();
  var m = /^(\d+)\s*minutes?$/.exec(s);
  if (m) return Number(m[1]);
  m = /^(\d+)\s*hours?$/.exec(s);
  if (m) return Number(m[1]) * 60;
  m = /^(\d+)\s*days?$/.exec(s);
  if (m) return Number(m[1]) * 1440;
  return 0;
}

function formatFarmingTimeBreakdown(timeStr) {
  if (window.bsvI18n && window.bsvI18n.tTime) {
    return window.bsvI18n.tTime(timeStr);
  }
  return timeStr;
}

function formatFarmingPotList(potNumbers) {
  var labels = potNumbers.map(function (n) {
    return i18n("guide.potN", { n: n });
  });
  var andWord = i18n("guide.and");
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels[0] + " " + andWord + " " + labels[1];
  return labels.slice(0, -1).join(", ") + ", " + andWord + " " + labels[labels.length - 1];
}

function buildFarmingTimeBreakdownLines(plots) {
  var potsByTime = new Map();

  plots.forEach(function (plot) {
    var time = plot.dataset.time;
    if (!time) return;
    var potNum = Number(plot.dataset.plotIndex) + 1;
    if (!potsByTime.has(time)) potsByTime.set(time, []);
    potsByTime.get(time).push(potNum);
  });

  if (!potsByTime.size) return [];

  return [...potsByTime.entries()]
    .sort(function (a, b) {
      var minA = Math.min.apply(null, a[1]);
      var minB = Math.min.apply(null, b[1]);
      return minA - minB;
    })
    .map(function (entry) {
      var time = entry[0];
      var potNumbers = entry[1].sort(function (a, b) {
        return a - b;
      });
      return i18n("guide.potsGrowIn", {
        potList: formatFarmingPotList(potNumbers),
        time: formatFarmingTimeBreakdown(time)
      });
    });
}

let FARMING_ITEM_IMAGES = {};

function buildFarmingItemImageLookup(farmingItems) {
  const lookup = {};
  (farmingItems || []).forEach(function (item) {
    const name = guideField(item, ["Farming Item", "Name", "Item Name"]);
    if (!name) return;
    const imageUrl = guideField(item, ["Farming Image", "Item image", "Image", "Image URL"]);
    if (imageUrl) lookup[name] = imageUrl;
  });
  return lookup;
}

function farmingOptionLabel(optionValue) {
  return window.bsvI18n && window.bsvI18n.tFarmingOption
    ? window.bsvI18n.tFarmingOption(optionValue)
    : optionValue;
}

function farmingOptionImageHtml(optionValue, className) {
  const imageUrl = FARMING_ITEM_IMAGES[optionValue];
  if (!imageUrl) {
    return '<span class="' + className + ' farming-plot__option-image--empty" aria-hidden="true"></span>';
  }
  return (
    '<img class="' +
    className +
    '" src="' +
    escapeAttr(imageUrl) +
    '" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
  );
}

function farmingPickerTriggerHtml(placeholder, value) {
  if (!value) {
    return (
      '<span class="farming-plot__picker-value farming-plot__picker-value--placeholder">' +
      escapeHtml(placeholder) +
      "</span>"
    );
  }
  return (
    farmingOptionImageHtml(value, "farming-plot__picker-thumb") +
    '<span class="farming-plot__picker-value">' +
    escapeHtml(farmingOptionLabel(value)) +
    "</span>"
  );
}

function buildFarmingSelectOptions(options, placeholderKey) {
  var placeholder = i18n(placeholderKey);
  var opts = '<option value="">' + escapeHtml(placeholder) + "</option>";
  options.forEach(function (opt) {
    var label = farmingOptionLabel(opt);
    opts += '<option value="' + escapeAttr(opt) + '">' + escapeHtml(label) + "</option>";
  });
  return opts;
}

function buildFarmingImagePickerHtml(options, placeholderKey, selectClass) {
  var placeholder = i18n(placeholderKey);
  var optionItems = options
    .map(function (opt) {
      return (
        '<li><button type="button" class="farming-plot__picker-option" role="option" data-value="' +
        escapeAttr(opt) +
        '">' +
        farmingOptionImageHtml(opt, "farming-plot__option-image") +
        '<span class="farming-plot__option-label">' +
        escapeHtml(farmingOptionLabel(opt)) +
        "</span></button></li>"
      );
    })
    .join("");

  return (
    '<div class="farming-plot__picker" data-placeholder="' +
    escapeAttr(placeholder) +
    '">' +
    '<select class="farming-plot__select ' +
    selectClass +
    ' farming-plot__select--native" aria-hidden="true" tabindex="-1">' +
    buildFarmingSelectOptions(options, placeholderKey) +
    "</select>" +
    '<button type="button" class="farming-plot__picker-trigger" aria-haspopup="listbox" aria-expanded="false">' +
    farmingPickerTriggerHtml(placeholder, "") +
    '<span class="farming-plot__picker-chevron" aria-hidden="true"></span>' +
    "</button>" +
    '<ul class="farming-plot__picker-menu" role="listbox" hidden>' +
    optionItems +
    "</ul></div>"
  );
}

function farmingPotThemeClass(pot) {
  if (pot === "Diamond Pot") return "farming-plot--pot-diamond";
  if (pot === "Golden Pot") return "farming-plot--pot-golden";
  if (pot === "Regular Pot") return "farming-plot--pot-regular";
  return "";
}

function syncFarmingPickerDisplay(pickerEl) {
  if (!pickerEl) return;
  var select = pickerEl.querySelector(".farming-plot__select--native");
  var trigger = pickerEl.querySelector(".farming-plot__picker-trigger");
  if (!select || !trigger) return;

  var placeholder = pickerEl.dataset.placeholder || "";
  var value = select.value;
  trigger.innerHTML =
    farmingPickerTriggerHtml(placeholder, value) +
    '<span class="farming-plot__picker-chevron" aria-hidden="true"></span>';

  pickerEl.querySelectorAll(".farming-plot__picker-option").forEach(function (optionBtn) {
    optionBtn.setAttribute("aria-selected", optionBtn.dataset.value === value ? "true" : "false");
  });
}

function setFarmingPickerValue(pickerEl, value) {
  if (!pickerEl) return;
  var select = pickerEl.querySelector(".farming-plot__select--native");
  if (!select) return;
  select.value = value || "";
  syncFarmingPickerDisplay(pickerEl);
}

function closeFarmingPickerMenu(pickerEl) {
  if (!pickerEl) return;
  var menu = pickerEl.querySelector(".farming-plot__picker-menu");
  var trigger = pickerEl.querySelector(".farming-plot__picker-trigger");
  if (menu) menu.hidden = true;
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  pickerEl.classList.remove("farming-plot__picker--open");
}

function closeAllFarmingPickerMenus(exceptPicker) {
  document.querySelectorAll(".farming-plot__picker--open").forEach(function (picker) {
    if (picker !== exceptPicker) closeFarmingPickerMenu(picker);
  });
}

function toggleFarmingPickerMenu(pickerEl) {
  if (!pickerEl) return;
  var menu = pickerEl.querySelector(".farming-plot__picker-menu");
  var trigger = pickerEl.querySelector(".farming-plot__picker-trigger");
  if (!menu || !trigger) return;

  var willOpen = menu.hidden;
  closeAllFarmingPickerMenus(pickerEl);
  menu.hidden = !willOpen;
  trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
  pickerEl.classList.toggle("farming-plot__picker--open", willOpen);
}

function initFarmingImagePicker(pickerEl, onChange) {
  if (!pickerEl || pickerEl.dataset.pickerInit === "1") return;
  pickerEl.dataset.pickerInit = "1";

  var select = pickerEl.querySelector(".farming-plot__select--native");
  var trigger = pickerEl.querySelector(".farming-plot__picker-trigger");
  var menu = pickerEl.querySelector(".farming-plot__picker-menu");
  if (!select || !trigger || !menu) return;

  syncFarmingPickerDisplay(pickerEl);

  trigger.addEventListener("click", function () {
    toggleFarmingPickerMenu(pickerEl);
  });

  menu.querySelectorAll(".farming-plot__picker-option").forEach(function (optionBtn) {
    optionBtn.addEventListener("click", function () {
      select.value = optionBtn.dataset.value || "";
      syncFarmingPickerDisplay(pickerEl);
      closeFarmingPickerMenu(pickerEl);
      if (typeof onChange === "function") onChange();
    });
  });
}

function buildFarmingPlotPlannerHtml() {
  var plots = [];
  for (var i = 0; i < FARMING_PLOT_COUNT; i++) {
    plots.push(`
      <article class="farming-plot" data-plot-index="${i}">
        <div class="farming-plot__shell">
          <header class="farming-plot__header">
            <span class="farming-plot__label">${escapeHtml(i18n("guide.potN", { n: i + 1 }))}</span>
            <div class="farming-plot__actions">
              <button type="button" class="farming-plot__paste" aria-label="${escapeAttr(i18n("guide.pastePotAria", { n: i + 1, next: ((i + 1) % FARMING_PLOT_COUNT) + 1 }))}">${escapeHtml(i18n("guide.pastePot"))}</button>
              <button type="button" class="farming-plot__reset" aria-label="${escapeAttr(i18n("guide.resetPotAria", { n: i + 1 }))}">${escapeHtml(i18n("guide.resetPot"))}</button>
            </div>
          </header>
          <div class="farming-plot__pickers">
            <label class="farming-plot__field">
              <span class="farming-plot__field-name">${escapeHtml(i18n("guide.pot"))}</span>
              ${buildFarmingImagePickerHtml(FARMING_POT_OPTIONS, "guide.choosePot", "farming-plot__pot")}
            </label>
            <label class="farming-plot__field">
              <span class="farming-plot__field-name">${escapeHtml(i18n("guide.soil"))}</span>
              ${buildFarmingImagePickerHtml(FARMING_SOIL_OPTIONS, "guide.chooseSoil", "farming-plot__soil")}
            </label>
            <label class="farming-plot__field">
              <span class="farming-plot__field-name">${escapeHtml(i18n("guide.seed"))}</span>
              ${buildFarmingImagePickerHtml(FARMING_SEED_OPTIONS, "guide.chooseSeed", "farming-plot__seed")}
            </label>
          </div>
          <div class="farming-plot__result" hidden>
            <p class="farming-plot__time"><span class="farming-plot__result-label">${escapeHtml(i18n("guide.growTime"))}</span> <strong class="farming-plot__time-value"></strong></p>
            <p class="farming-plot__money"><span class="farming-plot__result-label">${escapeHtml(i18n("guide.payout"))}</span> <strong class="farming-plot__money-value"></strong></p>
            <p class="farming-plot__money-plus"><span class="farming-plot__result-label">${escapeHtml(i18n("guide.payoutPlus"))}</span> <strong class="farming-plot__money-plus-value"></strong></p>
          </div>
          <p class="farming-plot__hint">${escapeHtml(i18n("guide.plotHint"))}</p>
        </div>
      </article>`);
  }

  return `
    <section class="farming-planner" id="mg-farming-planner" aria-label="${escapeAttr(i18n("guide.plannerAria"))}">
      <h4 class="guide-mini-header farming-planner__title">${escapeHtml(i18n("guide.plantPlanner"))}</h4>
      <p class="farming-planner__intro">${escapeHtml(i18n("guide.plantIntro"))}</p>
      <div class="farming-plots-grid">${plots.join("")}</div>
      <div class="farming-planner-summary" hidden>
        <h5 class="farming-planner-summary__title">${escapeHtml(i18n("guide.allPlots"))}</h5>
        <div class="farming-planner-summary__totals">
          <p class="farming-planner-summary__row"><span>${escapeHtml(i18n("guide.totalPayout"))}</span> <strong class="farming-planner-summary__money"></strong></p>
          <p class="farming-planner-summary__row"><span>${escapeHtml(i18n("guide.totalPlus"))}</span> <strong class="farming-planner-summary__money-plus"></strong></p>
        </div>
        <div class="farming-planner-summary__times">
          <h6 class="farming-planner-summary__times-title">${escapeHtml(i18n("guide.timeBreakdown"))}</h6>
          <ul class="farming-planner-summary__times-list"></ul>
        </div>
      </div>
    </section>`;
}

function syncFarmingPlotPickers(plotEl) {
  if (!plotEl) return;
  plotEl.querySelectorAll(".farming-plot__picker").forEach(syncFarmingPickerDisplay);
}

function resetFarmingPlot(plotEl, plannerRoot) {
  if (!plotEl) return;
  plotEl.querySelectorAll(".farming-plot__picker").forEach(function (picker) {
    setFarmingPickerValue(picker, "");
  });
  updateFarmingPlot(plotEl);
  updateFarmingPlannerSummary(plannerRoot);
}

function pasteFarmingPlotToNext(sourcePlotEl, plannerRoot) {
  if (!sourcePlotEl || !plannerRoot) return;
  var sourceIndex = Number(sourcePlotEl.dataset.plotIndex);
  if (isNaN(sourceIndex)) return;

  var plots = plannerRoot.querySelectorAll(".farming-plot");
  if (!plots.length) return;

  var targetPlot = plots[(sourceIndex + 1) % plots.length];
  if (!targetPlot) return;

  targetPlot.querySelector(".farming-plot__pot").value = sourcePlotEl.querySelector(".farming-plot__pot").value;
  targetPlot.querySelector(".farming-plot__soil").value = sourcePlotEl.querySelector(".farming-plot__soil").value;
  targetPlot.querySelector(".farming-plot__seed").value = sourcePlotEl.querySelector(".farming-plot__seed").value;
  syncFarmingPlotPickers(targetPlot);

  updateFarmingPlot(targetPlot);
  updateFarmingPlannerSummary(plannerRoot);
}

function updateFarmingPlot(plotEl) {
  if (!plotEl) return;
  var pot = plotEl.querySelector(".farming-plot__pot").value;
  var soil = plotEl.querySelector(".farming-plot__soil").value;
  var seed = plotEl.querySelector(".farming-plot__seed").value;
  var resultEl = plotEl.querySelector(".farming-plot__result");
  var hintEl = plotEl.querySelector(".farming-plot__hint");

  plotEl.classList.remove(
    "farming-plot--pot-regular",
    "farming-plot--pot-golden",
    "farming-plot--pot-diamond"
  );
  var potClass = farmingPotThemeClass(pot);
  if (potClass) plotEl.classList.add(potClass);

  var combo = getFarmingCombo(pot, soil, seed);
  if (!combo) {
    resultEl.hidden = true;
    hintEl.hidden = false;
    plotEl.dataset.money = "";
    plotEl.dataset.moneyPlus = "";
    plotEl.dataset.time = "";
    return;
  }

  resultEl.querySelector(".farming-plot__time-value").textContent = window.bsvI18n ? window.bsvI18n.tTime(combo.time) : combo.time;
  resultEl.querySelector(".farming-plot__money-value").textContent = formatFarmingMoney(combo.money);
  resultEl.querySelector(".farming-plot__money-plus-value").textContent = formatFarmingMoney(combo.moneyPlus);
  resultEl.hidden = false;
  hintEl.hidden = true;
  plotEl.dataset.money = String(combo.money);
  plotEl.dataset.moneyPlus = String(combo.moneyPlus);
  plotEl.dataset.time = combo.time;
}

function updateFarmingPlannerSummary(plannerRoot) {
  if (!plannerRoot) return;
  var summaryEl = plannerRoot.querySelector(".farming-planner-summary");
  if (!summaryEl) return;

  var plots = plannerRoot.querySelectorAll(".farming-plot");
  var totalMoney = 0;
  var totalPlus = 0;
  var activeCount = 0;

  plots.forEach(function (plot) {
    var money = Number(plot.dataset.money);
    var moneyPlus = Number(plot.dataset.moneyPlus);
    if (!money || !moneyPlus) return;
    totalMoney += money;
    totalPlus += moneyPlus;
    activeCount += 1;
  });

  if (activeCount < 2) {
    summaryEl.hidden = true;
    return;
  }

  summaryEl.querySelector(".farming-planner-summary__money").textContent = formatFarmingMoney(totalMoney);
  summaryEl.querySelector(".farming-planner-summary__money-plus").textContent = formatFarmingMoney(totalPlus);

  var timesList = summaryEl.querySelector(".farming-planner-summary__times-list");
  var timeLines = buildFarmingTimeBreakdownLines(plots);
  if (timesList) {
    timesList.innerHTML = timeLines
      .map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("");
  }

  var timesBlock = summaryEl.querySelector(".farming-planner-summary__times");
  if (timesBlock) timesBlock.hidden = timeLines.length === 0;

  summaryEl.hidden = false;
}

function initFarmingPlotPlanner(root) {
  if (!root || root.dataset.plannerInit === "1") return;
  root.dataset.plannerInit = "1";

  if (!root.dataset.pickerDismissInit) {
    root.dataset.pickerDismissInit = "1";
    document.addEventListener("click", function (event) {
      if (event.target.closest(".farming-plot__picker")) return;
      closeAllFarmingPickerMenus();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAllFarmingPickerMenus();
    });
  }

  var plots = root.querySelectorAll(".farming-plot");
  plots.forEach(function (plot) {
    plot.querySelectorAll(".farming-plot__picker").forEach(function (picker) {
      initFarmingImagePicker(picker, function () {
        updateFarmingPlot(plot);
        updateFarmingPlannerSummary(root);
      });
    });
    var pasteBtn = plot.querySelector(".farming-plot__paste");
    if (pasteBtn) {
      pasteBtn.addEventListener("click", function () {
        pasteFarmingPlotToNext(plot, root);
      });
    }
    var resetBtn = plot.querySelector(".farming-plot__reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        resetFarmingPlot(plot, root);
      });
    }
  });
}

function buildFarmingGuideHtml(farmingItems) {
  FARMING_ITEM_IMAGES = buildFarmingItemImageLookup(farmingItems);
  const itemCards = (farmingItems || []).map(createFarmingItemCard).filter(Boolean).join("");
  return `
    <div class="farming-guide-wrap">
      <h3 class="farming-guide-title" id="mg-guide-farming">${escapeHtml(i18n("guide.farming"))}</h3>
      <h4 class="guide-mini-header" id="mg-farming-items">${escapeHtml(i18n("guide.items"))}</h4>
      <div class="guide-vcards-grid farming-items-cards">${itemCards || '<p class="guide-empty">' + escapeHtml(i18n("guide.noFarmingItems")) + '</p>'}</div>
      ${buildFarmingPlotPlannerHtml()}
      ${buildGuideFooterImageHtml(FARMING_GUIDE_FOOTER_IMAGE_URL)}
    </div>
  `;
}

async function loadFishingGuidePanel() {
  const fishingPanel = document.getElementById("money-guide-fishing");
  if (!fishingPanel || fishingPanel.dataset.loaded === "1") return Promise.resolve();

  fishingPanel.innerHTML = '<p class="fishing-empty">' + escapeHtml(i18n("guide.loadingFishing")) + '</p>';
  try {
    const [itemsResult, typesResult] = await Promise.all([
      fetchGuideSheetWithAliases(MONEY_GUIDE_SHEETS.fishingItems, "items"),
      fetchGuideSheetWithAliases(MONEY_GUIDE_SHEETS.fishingTypes, "types")
    ]);

    const warnings = [];
    if (itemsResult.wrongSheet) {
      warnings.push(
        'Could not load <strong>' + escapeHtml(MONEY_GUIDE_SHEETS.fishingItems) +
        '</strong>. Use headers: Fishing Name, Fishing Item image, Fishing Description, Fishing Price.'
      );
    }
    if (typesResult.wrongSheet) {
      warnings.push(
        'Could not load <strong>' + escapeHtml(MONEY_GUIDE_SHEETS.fishingTypes) +
        '</strong>. Use headers: Fishing Item Name, Fishing Image, Fishing Rarity, Fishing Sell Amount.'
      );
    }

    const warningHtml = warnings.length
      ? '<div class="fishing-sheet-warning">' + warnings.join("<br>") + "</div>"
      : "";

    fishingPanel.innerHTML = warningHtml + buildFishingGuideHtml(itemsResult.items, typesResult.items);
    fishingPanel.dataset.loaded = "1";
    fishingPanel.querySelectorAll(".fish-weight-input").forEach(updateFishCardPrice);
  } catch (error) {
    console.error("Failed to load fishing guide data:", error);
    fishingPanel.innerHTML = '<p class="fishing-empty">' + escapeHtml(i18n("guide.failedFishing")) + '</p>';
  }
}

let fishWeightInterval = null;
let fishWeightTimeout = null;

function stopFishWeightAdjust() {
  if (fishWeightInterval) {
    clearInterval(fishWeightInterval);
    fishWeightInterval = null;
  }
  if (fishWeightTimeout) {
    clearTimeout(fishWeightTimeout);
    fishWeightTimeout = null;
  }
}

function enforceFishWeight(input) {
  const raw = parseGuideNumber(input.value);
  const stepped = Math.round(raw / FISH_WEIGHT_STEP) * FISH_WEIGHT_STEP;
  const clamped = Math.max(0, Math.min(FISH_WEIGHT_MAX, stepped));
  input.value = clamped.toFixed(1);
  updateFishCardPrice(input);
}

function adjustFishWeight(btn, direction, evt) {
  if (evt) evt.preventDefault();
  const card = btn.closest(".fishing-fish-card");
  if (!card) return;
  const input = card.querySelector(".fish-weight-input");
  if (!input) return;

  const maxSteps = Math.round(FISH_WEIGHT_MAX / FISH_WEIGHT_STEP);
  const holdDelayMs = 160;
  const repeatEveryMs = 45;

  function adjustOnce() {
    let step = Math.round(parseGuideNumber(input.value) / FISH_WEIGHT_STEP);
    step = Math.max(0, Math.min(maxSteps, step + direction));
    input.value = (step * FISH_WEIGHT_STEP).toFixed(1);
    updateFishCardPrice(input);
  }

  adjustOnce();
  fishWeightTimeout = setTimeout(() => {
    fishWeightInterval = setInterval(adjustOnce, repeatEveryMs);
  }, holdDelayMs);
}

function updateFishCardPrice(input) {
  const card = input.closest(".fishing-fish-card");
  if (!card) return;
  const sellAmount = parseGuideNumber(card.dataset.sellAmount);
  const weight = parseGuideNumber(input.value);
  const sellTarget = card.querySelector(".fish-sell-value");
  const blockSpinTarget = card.querySelector(".fish-blockspin-value");
  if (sellTarget) {
    sellTarget.textContent = formatMoney(calculateFishSellPrice(sellAmount, weight));
  }
  if (blockSpinTarget) {
    blockSpinTarget.textContent = formatMoney(calculateFishBlockSpinPrice(sellAmount, weight));
  }
}

function getQuestGuideDataLocal() {
  var lang = window.bsvI18n ? window.bsvI18n.getLang() : "en";
  if (typeof window.getQuestGuideData === "function") {
    return window.getQuestGuideData(lang) || window.getQuestGuideData("en");
  }
  return { intro: "", wikiImage: "", wikiAlt: "", categories: [] };
}

function buildQuestGuideIntroHtml(introClass) {
  var introCls = introClass || "quest-guide-intro-wiki";
  var data = getQuestGuideDataLocal();
  var structure = data.introStructure;
  var bodyHtml = "";

  if (structure && Array.isArray(structure.points) && structure.points.length) {
    var sectionsHtml = structure.points.map(function (point) {
      return (
        '<section class="quest-guide-intro-wiki__section">' +
          '<h4 class="quest-guide-intro-wiki__heading">' + escapeHtml(point.title || "") + "</h4>" +
          '<p class="quest-guide-intro-wiki__text">' + escapeHtml(point.text || "") + "</p>" +
        "</section>"
      );
    }).join("");

    var rewardsHtml = "";
    if (structure.rewards && Array.isArray(structure.rewards.items) && structure.rewards.items.length) {
      rewardsHtml =
        '<section class="quest-guide-intro-wiki__section quest-guide-intro-wiki__section--rewards">' +
          '<h4 class="quest-guide-intro-wiki__heading">' + escapeHtml(structure.rewards.title || "") + "</h4>" +
          '<ul class="quest-guide-intro-wiki__list">' +
            structure.rewards.items.map(function (item) {
              return "<li>" + escapeHtml(item) + "</li>";
            }).join("") +
          "</ul>" +
        "</section>";
    }

    bodyHtml =
      '<div class="quest-guide-intro-wiki__body">' +
        (structure.kicker
          ? '<p class="quest-guide-intro-wiki__lead">' + escapeHtml(structure.kicker) + "</p>"
          : "") +
        sectionsHtml +
        rewardsHtml +
        (structure.note
          ? '<p class="quest-guide-intro-wiki__note">' + escapeHtml(structure.note) + "</p>"
          : "") +
      "</div>";
  } else {
    bodyHtml =
      '<div class="quest-guide-intro-wiki__body">' +
        '<p class="quest-guide-intro-wiki__text">' + escapeHtml(data.intro || "") + "</p>" +
      "</div>";
  }

  var figureHtml = "";
  if (data.wikiImage) {
    figureHtml =
      '<figure class="quest-guide-intro-wiki__figure">' +
        '<img src="' + escapeAttr(data.wikiImage) + '" alt="' + escapeAttr(data.wikiAlt) + '" loading="lazy">' +
        (data.wikiAlt
          ? '<figcaption class="quest-guide-intro-wiki__caption">' + escapeHtml(data.wikiAlt) + "</figcaption>"
          : "") +
      "</figure>";
  }

  return '<article class="' + introCls + '" id="mg-quest-intro">' + bodyHtml + figureHtml + "</article>";
}

function buildQuestGuideImageHtml(image, imageClass) {
  if (!image || !image.src) return "";
  var cls = "quest-guide-map-image" + (image.compact ? " quest-guide-map-image--compact" : "");
  if (imageClass) cls = imageClass;
  return `
            <figure class="${cls}">
              <img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || "")}" loading="lazy">
            </figure>`;
}

function buildQuestGuideVideoHtml(video) {
  if (!video || !video.videoId) return "";
  if (video.platform === "tiktok") {
    var embedSrc =
      "https://www.tiktok.com/embed/v2/" +
      encodeURIComponent(video.videoId) +
      "?lang=en-US";
    return (
      '<div class="section-content-embed section-content-embed--tiktok qg-timeline__embed">' +
      '<h3 class="section-content-embed-title">' +
      escapeHtml(video.title || "Quest guide video") +
      "</h3>" +
      '<div class="section-content-embed-frame-wrap section-content-embed-frame-wrap--portrait">' +
      '<iframe src="' +
      escapeAttr(embedSrc) +
      '" data-base-src="' +
      escapeAttr(embedSrc) +
      '" title="' +
      escapeAttr(video.title || "Quest guide video") +
      '" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>' +
      "</div></div>"
    );
  }
  return "";
}

function buildQuestGuideHtml() {
  var data = getQuestGuideDataLocal();
  var sections = data.categories.map(function (cat) {
    var items = cat.quests.map(function (quest) {
      var details = (quest.details || []).map(function (p) {
        return `<p class="qg-timeline__text">${escapeHtml(p)}</p>`;
      }).join("");
      return `
            <li class="qg-timeline__item qg-timeline__item--${escapeAttr(cat.id)}">
              <div class="qg-timeline__node" aria-hidden="true">${quest.num}</div>
              <article class="qg-timeline__card qg-timeline__card--${escapeAttr(cat.id)}">
                <header class="qg-timeline__head">
                  <h5 class="qg-timeline__title">${escapeHtml(i18n("guide.questLabel", { num: quest.num }))}: ${escapeHtml(quest.title)}</h5>
                  <span class="qg-timeline__reward">${escapeHtml(i18n("guide.reward"))}: ${escapeHtml(quest.reward)}</span>
                </header>
                ${details ? `<div class="qg-timeline__body">${details}</div>` : ""}
                ${buildQuestGuideImageHtml(quest.image, "qg-timeline__figure quest-guide-map-image" + (quest.image && quest.image.compact ? " quest-guide-map-image--compact" : ""))}
                ${buildQuestGuideVideoHtml(quest.video)}
              </article>
            </li>`;
    }).join("");

    return `
        <section class="qg-timeline__section qg-timeline__section--${escapeAttr(cat.id)}">
          <div class="qg-timeline__hero qg-timeline__hero--${escapeAttr(cat.id)}" id="mg-quest-${escapeAttr(cat.id)}">
            <h4 class="qg-timeline__section-title">${escapeHtml(cat.title)}</h4>
            <p class="qg-timeline__section-desc">${escapeHtml(cat.intro)}</p>
          </div>
          <ol class="qg-timeline__list">${items}</ol>
        </section>`;
  }).join("");

  return `
    <div class="quest-guide-wrap">
      <h3 class="quest-guide-title" id="mg-guide-quest">${escapeHtml(i18n("guide.questTitle"))}</h3>
      ${buildQuestGuideIntroHtml()}
      <div class="qg-timeline">${sections}</div>
    </div>`;
}


function renderMoneyGameGuideSection() {
  const html = `
    <section class="section money-game-guide-section" id="${slugify("Money & Game Guide")}">
      <h2>${escapeHtml(i18nSection("Money & Game Guide"))}</h2>
      <div class="money-guide-layout">
        <div class="money-guide-content">
          <nav class="money-guide-tabs" aria-label="${escapeAttr(i18nSection("Money & Game Guide"))}">
            <button type="button" class="money-guide-tab money-guide-tab--fishing active" data-panel="money-guide-fishing">${escapeHtml(i18n("guide.fishingTab"))}</button>
            <button type="button" class="money-guide-tab money-guide-tab--farming" data-panel="money-guide-farming">${escapeHtml(i18n("guide.farmingTab"))}</button>
            <button type="button" class="money-guide-tab money-guide-tab--quest" data-panel="money-guide-quest">${escapeHtml(i18n("guide.questTab"))}</button>
            <button type="button" class="money-guide-tab money-guide-tab--coming-soon" data-panel="money-guide-coming-soon">${escapeHtml(i18n("guide.comingSoonTab"))}</button>
          </nav>
          <div id="money-guide-fishing" class="money-guide-panel money-guide-panel--fishing"></div>
          <div id="money-guide-farming" class="money-guide-panel money-guide-panel--farming" hidden></div>
          <div id="money-guide-quest" class="money-guide-panel money-guide-panel--quest" hidden>${buildQuestGuideHtml()}</div>
          <div id="money-guide-coming-soon" class="money-guide-panel money-guide-panel--coming-soon" hidden>${buildComingSoonGuidePanelHtml()}</div>
        </div>
      </div>
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  initMoneyGuideTabs();
}

function activateMoneyGuideTab(tabKey) {
  const panelId =
    tabKey === "farming"
      ? "money-guide-farming"
      : tabKey === "quest"
        ? "money-guide-quest"
        : tabKey === "coming-soon"
          ? "money-guide-coming-soon"
          : "money-guide-fishing";
  const section = document.getElementById(slugify(MONEY_GAME_GUIDE_SECTION));
  if (!section) return Promise.resolve();
  const tab = section.querySelector('.money-guide-tab[data-panel="' + panelId + '"]');
  if (tab) tab.click();
  if (panelId === "money-guide-fishing") return loadFishingGuidePanel();
  if (panelId === "money-guide-farming") return loadFarmingGuidePanel();
  return Promise.resolve();
}

function initMoneyGuideTabs() {
  const section = document.getElementById(slugify(MONEY_GAME_GUIDE_SECTION));
  if (!section || section.dataset.tabsInit === "1") return;
  section.dataset.tabsInit = "1";
  const tabs = section.querySelectorAll(".money-guide-tab");
  const panels = section.querySelectorAll(".money-guide-panel");

  function activate(panelId) {
    tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.panel === panelId));
    panels.forEach(panel => {
      panel.hidden = panel.id !== panelId;
    });
    if (panelId === "money-guide-fishing") {
      loadFishingGuidePanel();
    } else if (panelId === "money-guide-farming") {
      loadFarmingGuidePanel();
    }
    refreshMoneyGuideFastNav(panelId);
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => activate(tab.dataset.panel));
  });
  activate("money-guide-fishing");
}

window.bsvActivateMoneyGuideTab = activateMoneyGuideTab;

function renderSection(title, items) {
  if (title === "BlockSpin Map") {
    renderBlockSpinMapSection();
    return;
  }

  if (title === "Home") {
    const html = `
      <section class="section" id="${slugify(title)}">
        <h2>${escapeHtml(i18nSection(title))}</h2>
        <div class="home-content">
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
    return;
  }
  if (title === "Money & Game Guide") {
    renderMoneyGameGuideSection();
    return;
  }
  if (!items || items.length === 0) return;

  if (title === "💰 Richest Players") {
    renderRichestPlayersSection(items);
  } else if (title === "Crew Logos") {
    renderCrewLogosSection(items);
  } else if (title === ACCESSORIES_SECTION_NAME) {
    renderAccessoriesSection(items);
  } else if (title === "Vehicles") {
    renderVehiclesSectionWithBanner(items);
  } else if (title === "Omega") {
    const html = `
      <section class="section" id="${slugify("Omega")}">
        <h2>${escapeHtml(i18nSection("Omega"))}</h2>
        <div class="cards">
          ${buildCardsHtmlWithDiscordPromo(items, createCard, "Omega")}
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  } else if (title === "Epic") {
    const html = `
      <section class="section" id="${slugify("Epic")}">
        <h2>${escapeHtml(i18nSection("Epic"))}</h2>
        <div class="cards">
          ${buildCardsHtmlWithDiscordPromo(items, createCard, "Epic")}
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  } else {
    const html = `
      <section class="section" id="${slugify(title)}">
        <h2>${escapeHtml(i18nSection(title))}</h2>
        <div class="cards">
          ${buildCardsHtmlWithDiscordPromo(items, createCard, title)}
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  }

  if (typeof window.bsvRefreshSavedCardButtons === "function") {
    window.bsvRefreshSavedCardButtons();
  }
}


function renderVehiclesSectionWithBanner(items) {
  const html = `
    <section class="section" id="${slugify("Vehicles")}">
      <h2>${escapeHtml(i18nSection("Vehicles"))}</h2>
      <div class="cards">
        ${buildCardsHtmlWithDiscordPromo(items, createCard, "Vehicles")}
      </div>
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
}

function fetchDiscordMemberCount() {
  fetch("https://discord.com/api/v10/invites/QbapryYUUx?with_counts=true")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var n = data.approximate_member_count;
      var online = data.approximate_presence_count;
      if (typeof n === "number" && !isNaN(n)) {
        setHomeStatValue("traders", n, true);
      }
      if (typeof online === "number" && !isNaN(online)) {
        setHomeStatValue("online", online, true);
        document.querySelectorAll(".discord-online-count").forEach(function (el) {
          el.textContent = online.toLocaleString();
        });
      }
    })
    .catch(function () {});
}

function createFooterBoosterCard(booster) {
  const name = escapeHtml(String(booster?.name || "Unknown"));
  const avatarUrl = escapeAttr(String(booster?.avatarUrl || ""));
  return `
    <article class="footer-booster-card" aria-label="${name}">
      <img src="${avatarUrl}" alt="${name}" loading="lazy" decoding="async" />
      <span>${name}</span>
    </article>
  `;
}

async function loadFooterBoosters() {
  const footer = document.getElementById("footer-boosters");
  const track = document.getElementById("footer-boosters-track");
  if (!footer || !track) return;

  if (!BOOSTERS_API_URL || BOOSTERS_API_URL.includes("YOUR-RAILWAY-URL")) {
    return;
  }

  try {
    const res = await fetch(BOOSTERS_API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Boosters endpoint failed: ${res.status}`);
    const data = await res.json();
    const boosters = Array.isArray(data?.boosters) ? data.boosters : [];
    if (boosters.length === 0) return;

    const cardsHtml = boosters.map(createFooterBoosterCard).join("");
    track.innerHTML = cardsHtml + cardsHtml;
    footer.hidden = false;
  } catch (err) {
    console.error("Failed to load footer boosters:", err);
  }
}

function renderCrewLogosSection(items) {
  const grouped = {};
  
  items.forEach(item => {
    const header = safe(item["Header"]) || "Uncategorized";
    if (!grouped[header]) {
      grouped[header] = [];
    }
    if (item["Name"]) {
      grouped[header].push(item);
    }
  });

  let html = `<section class="section" id="${slugify("Crew Logos")}"><h2>${escapeHtml(i18nSection("Crew Logos"))}</h2>`;
  const navData = [];
  let crewCounter = 0;

  Object.keys(grouped).forEach(header => {
    if (grouped[header].length > 0) {
      const anchor = `crew-nav-${crewCounter++}`;
      html += `
        <div class="crew-header" id="${anchor}">${escapeHtml(header)}</div>
        <div class="crew-logos-scroll">
          ${grouped[header].map(createCrewLogoCard).join("")}
        </div>
      `;
      navData.push({ title: header, anchor: anchor });
    }
  });
  
  html += `</section>`;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  renderCrewFastNav(navData);
}

function renderAccessoriesSection(items) {
  const miniToBig = {};

  // Pass 1: build mini-header -> big-header map from any row that defines both.
  items.forEach(item => {
    const big = safe(item["Big Header"]).trim();
    const mini = safe(item["Mini Header"]).trim();
    if (big && mini) miniToBig[mini] = big;
  });

  const structure = {};

  function ensureGroup(bigHeader, miniHeader) {
    const big = bigHeader || "Uncategorized";
    const mini = miniHeader || "General";
    if (!structure[big]) structure[big] = {};
    if (!structure[big][mini]) structure[big][mini] = [];
  }

  // Pass 2: add explicit mini-header rows to structure even without items.
  items.forEach(item => {
    const big = safe(item["Big Header"]).trim();
    const mini = safe(item["Mini Header"]).trim();
    const hasName = safe(item["Name"]).trim() !== "";
    if (big && mini && !hasName) ensureGroup(big, mini);
  });

  // Pass 3: place item cards by mini-header, then inferred big-header.
  items.forEach(item => {
    const name = safe(item["Name"]).trim();
    if (!name) return;

    const mini = safe(item["Mini Header"]).trim() || "General";
    const explicitBig = safe(item["Big Header"]).trim();
    const big = explicitBig || miniToBig[mini] || "Uncategorized";
    ensureGroup(big, mini);
    structure[big][mini].push(item);
  });

  let html = `<section class="section accessories-section" id="${slugify(ACCESSORIES_SECTION_NAME)}"><h2>${escapeHtml(i18nSection(ACCESSORIES_SECTION_NAME))}</h2>`;
  const navData = [];
  let bigCounter = 0;
  let miniCounter = 0;

  Object.keys(structure).forEach(bigHeader => {
    const bigAnchor = `acc-big-${bigCounter++}`;
    html += `<div class="accessories-big-header" id="${bigAnchor}">${escapeHtml(bigHeader)}</div>`;
    const miniGroups = structure[bigHeader];
    const miniEntries = [];
    Object.keys(miniGroups).forEach(miniHeader => {
      const miniAnchor = `acc-mini-${miniCounter++}`;
      html += `
        <div class="accessories-mini-header" id="${miniAnchor}">${escapeHtml(miniHeader)}</div>
        <div class="cards">
          ${buildCardsHtmlWithDiscordPromo(miniGroups[miniHeader], createAccessoryCard, ACCESSORIES_SECTION_NAME, 4)}
        </div>
      `;
      miniEntries.push({ title: miniHeader, anchor: miniAnchor });
    });
    navData.push({ title: bigHeader, anchor: bigAnchor, minis: miniEntries });
  });

  html += `</section>`;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  renderAccessoriesFastNav(navData);
}

let accessoriesFastNavData = null;
let crewFastNavData = null;
const GUIDE_FAST_NAV_BOX_ID = "guide-section-fast-nav";

function ensureGuideFastNavBox() {
  const sidebar = document.getElementById("tax-sidebar-column");
  if (!sidebar) return null;

  let box = document.getElementById(GUIDE_FAST_NAV_BOX_ID);
  if (!box) {
    box = document.createElement("aside");
    box.id = GUIDE_FAST_NAV_BOX_ID;
    box.className = "guide-fast-nav";
    sidebar.insertBefore(box, sidebar.firstChild);
  }
  return box;
}

function getActiveMoneyGuidePanelId() {
  const section = document.getElementById(slugify(MONEY_GAME_GUIDE_SECTION));
  if (!section) return "money-guide-fishing";
  const activeTab = section.querySelector(".money-guide-tab.active");
  return activeTab && activeTab.dataset.panel
    ? activeTab.dataset.panel
    : "money-guide-fishing";
}

function buildMoneyGuideFastNavData(panelId) {
  panelId = panelId || getActiveMoneyGuidePanelId();

  if (panelId === "money-guide-farming") {
    return [{
      title: i18n("guide.farmingTab"),
      panel: "money-guide-farming",
      anchor: "mg-guide-farming",
      minis: [
        { title: i18n("guide.items"), anchor: "mg-farming-items" },
        { title: i18n("guide.plantPlanner"), anchor: "mg-farming-planner" }
      ]
    }];
  }

  if (panelId === "money-guide-quest") {
    const data = getQuestGuideDataLocal();
    const questMinis = [{ title: "Overview", anchor: "mg-quest-intro" }];
    (data.categories || []).forEach(function (cat) {
      if (!cat || !cat.id) return;
      questMinis.push({
        title: cat.title || cat.id,
        anchor: "mg-quest-" + cat.id
      });
    });
    return [{
      title: i18n("guide.questTab"),
      panel: "money-guide-quest",
      anchor: "mg-guide-quest",
      minis: questMinis
    }];
  }

  if (panelId === "money-guide-coming-soon") {
    return [{
      title: i18n("guide.comingSoonTab"),
      panel: "money-guide-coming-soon",
      anchor: "mg-guide-coming-soon",
      minis: []
    }];
  }

  return [{
    title: i18n("guide.fishingTab"),
    panel: "money-guide-fishing",
    anchor: "mg-guide-fishing",
    minis: [
      { title: i18n("guide.items"), anchor: "mg-fishing-items" },
      { title: i18n("guide.fishTypes"), anchor: "mg-fishing-types" }
    ]
  }];
}

function removeEmbeddedMoneyGuideFastNav() {
  document.querySelectorAll(".money-guide-fast-nav").forEach(function (el) {
    el.remove();
  });
}

function refreshMoneyGuideFastNav(panelId) {
  if (_activeSectionName !== MONEY_GAME_GUIDE_SECTION) return;
  removeEmbeddedMoneyGuideFastNav();
  const box = ensureGuideFastNavBox();
  if (!box) return;
  renderGuideFastNav(buildMoneyGuideFastNavData(panelId), {
    sectionId: slugify(MONEY_GAME_GUIDE_SECTION)
  });
  setGuideFastNavVisible(true);
}

function handleGuideFastNavClick(btn) {
  const panelId = btn.getAttribute("data-panel");
  const targetId = btn.getAttribute("data-target");

  function scrollToTarget() {
    if (!targetId) {
      if (panelId) {
        const panel = document.getElementById(panelId);
        if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!panelId) {
    scrollToTarget();
    return;
  }

  const panel = document.getElementById(panelId);
  const needsTabSwitch = panel && panel.hidden;
  if (!needsTabSwitch) {
    scrollToTarget();
    return;
  }

  const tab = document.querySelector('.money-guide-tab[data-panel="' + panelId + '"]');
  if (tab) tab.click();

  const loadPromise =
    panelId === "money-guide-fishing"
      ? loadFishingGuidePanel()
      : panelId === "money-guide-farming"
        ? loadFarmingGuidePanel()
        : Promise.resolve();

  Promise.resolve(loadPromise).then(function () {
    requestAnimationFrame(scrollToTarget);
  });
}

function renderGuideFastNav(navGroups, options) {
  options = options || {};
  const box = options.targetBox || ensureGuideFastNavBox();
  if (!box) return;

  const topBtnId = options.topBtnId || "guide-fast-nav-top";
  const rows = [];
  if (options.includeTitle !== false) {
    rows.push(
      '<h2 class="guide-fast-nav__title">' + escapeHtml(options.title || i18n("guide.fastNavAria")) + "</h2>"
    );
  }

  navGroups.forEach(function (group) {
    const groupAttrs = ['type="button"', 'class="guide-fast-nav__btn guide-fast-nav__btn--group"'];
    if (group.anchor) groupAttrs.push('data-target="' + escapeAttr(group.anchor) + '"');
    if (group.panel) groupAttrs.push('data-panel="' + escapeAttr(group.panel) + '"');
    rows.push("<button " + groupAttrs.join(" ") + ">" + escapeHtml(group.title) + "</button>");

    (group.minis || []).forEach(function (mini) {
      const miniAttrs = ['type="button"', 'class="guide-fast-nav__btn guide-fast-nav__btn--mini"'];
      miniAttrs.push('data-target="' + escapeAttr(mini.anchor) + '"');
      const panel = mini.panel || group.panel;
      if (panel) miniAttrs.push('data-panel="' + escapeAttr(panel) + '"');
      rows.push("<button " + miniAttrs.join(" ") + ">" + escapeHtml(mini.title) + "</button>");
    });
  });

  if (options.includeTopButton !== false) {
    rows.push('<div class="guide-fast-nav__spacer"></div>');
    rows.push(
      '<button type="button" class="guide-fast-nav__top" id="' + escapeAttr(topBtnId) + '">' +
        escapeHtml(options.topLabel || i18n("richest.backToTop")) +
      "</button>"
    );
  }
  box.innerHTML = rows.join("");
  box.classList.add("is-visible");
  box.style.display = "block";
  box.style.visibility = "visible";
  box.style.opacity = "1";
  box.style.pointerEvents = "auto";

  box.querySelectorAll("button[data-target], button[data-panel]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      handleGuideFastNavClick(btn);
    });
  });

  if (options.includeTopButton !== false) {
    const topBtn = document.getElementById(topBtnId);
    if (topBtn && options.sectionId) {
      topBtn.addEventListener("click", function () {
        const sec = document.getElementById(options.sectionId);
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }
}

function renderAccessoriesMobileFastNav(navData) {
  const sectionEl = document.getElementById("untradeable-items");
  if (!sectionEl) return;
  ensureAccessoriesMobileChrome(sectionEl);
  const mobileBox = document.getElementById("section-mobile-fastnav");
  if (!mobileBox) return;
  renderGuideFastNav(navData, {
    sectionId: slugify(ACCESSORIES_SECTION_NAME),
    targetBox: mobileBox,
    includeTitle: false,
    includeTopButton: false
  });
}

function setGuideFastNavVisible(visible) {
  const box = document.getElementById(GUIDE_FAST_NAV_BOX_ID);
  if (!box) return;
  box.classList.toggle("is-visible", Boolean(visible));
  box.style.display = visible ? "block" : "none";
  box.style.visibility = visible ? "visible" : "hidden";
  box.style.opacity = visible ? "1" : "0";
  box.style.pointerEvents = visible ? "auto" : "none";
}

function renderMoneyGuideFastNav() {
  refreshMoneyGuideFastNav(getActiveMoneyGuidePanelId());
}

function renderAccessoriesFastNav(navData) {
  accessoriesFastNavData = navData;
  renderGuideFastNav(navData, {
    sectionId: slugify(ACCESSORIES_SECTION_NAME)
  });
  renderAccessoriesMobileFastNav(navData);
}

function renderCrewFastNav(navData) {
  crewFastNavData = navData;
  renderGuideFastNav(navData, {
    sectionId: slugify("Crew Logos")
  });
}


function renderScammerSection(items) {
  let html = `
    <section class="section" id="${slugify("Scammer List")}">
      <h2>Scammer List</h2>
      <p class="scammer-warning">⚠️ WARNING: These clowns have been reported in our discord server for scamming. Please trade with extreme caution! Report scammers in our discord server to have them placed here!</p>
      <div class="cards">
        ${items.map(createScammerCard).join("")}
      </div>
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
}


 function renderRichestPlayersSection(items) {
  const sectionId = slugify("💰 Richest Players");
  const html = `
    <section class="section richest-players-section" id="${sectionId}">
      <a href="#" class="richest-back-to-top" id="richest-back-to-top" hidden aria-label="${escapeAttr(i18n("richest.backToTop"))}">
        <svg class="richest-back-to-top-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 4v12M6 10l6-6 6 6" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 4v12M6 10l6-6 6 6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="richest-back-to-top-text">${escapeHtml(i18n("richest.backToTop"))}</span>
      </a>
      ${createRichestPlayersSection(items)}
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  
  setTimeout(() => {
    const searchInput = document.getElementById("richest-search-input");
    const resetBtn = document.getElementById("richest-search-reset");

    function updateRichestResetVisibility() {
      if (resetBtn) resetBtn.hidden = !searchInput || !searchInput.value;
    }

    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        filterRichestPlayers(e.target.value);
        updateRichestResetVisibility();
      });
    }

    if (resetBtn && searchInput) {
      resetBtn.addEventListener("click", function () {
        searchInput.value = "";
        filterRichestPlayers("");
        updateRichestResetVisibility();
        searchInput.focus();
      });
    }

    updateRichestResetVisibility();

    const backToTop = document.getElementById("richest-back-to-top");
    const section = document.querySelector(".richest-players-section");
    if (backToTop && section) {
      backToTop.addEventListener("click", function (e) {
        e.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    syncBackToTopVisibility();
    loadRichestPlayerAvatars();
  }, 100);
}

function initSectionsNav() {
  const nav = document.getElementById("sections-nav");
  if (!nav) return;

  nav.innerHTML = "";
  let extrasHeaderShown = false;
  SECTION_NAMES.forEach((name) => {
    const cfg = typeof getSectionConfig === "function" ? getSectionConfig(name) : null;
    if (cfg && cfg.navGroup === "extras" && !extrasHeaderShown) {
      const gap = document.createElement("div");
      gap.className = "nav-gap";
      nav.appendChild(gap);

      const extrasHeader = document.createElement("div");
      extrasHeader.className = "nav-extras-header";
      extrasHeader.setAttribute("data-i18n", "nav.extras");
      extrasHeader.textContent = i18n("nav.extras");
      nav.appendChild(extrasHeader);
      extrasHeaderShown = true;
    }

    const btn = document.createElement("button");
    btn.dataset.section = name;
    btn.textContent = i18nSection(name);
    btn.addEventListener("click", () => showSection(name));
    nav.appendChild(btn);
  });
}

function closeSectionsMenu() {
  document.body.classList.remove("sections-menu-open");
  const toggle = document.getElementById("sections-menu-toggle");
  const overlay = document.getElementById("sections-menu-overlay");
  if (toggle) {
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open sections menu");
  }
  if (overlay) {
    overlay.classList.remove("active");
    overlay.hidden = true;
  }
  document.body.style.overflow = "";
}

function openSectionsMenu() {
  document.body.classList.add("sections-menu-open");
  const toggle = document.getElementById("sections-menu-toggle");
  const overlay = document.getElementById("sections-menu-overlay");
  if (toggle) {
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close sections menu");
  }
  if (overlay) {
    overlay.hidden = false;
    overlay.classList.add("active");
  }
  document.body.style.overflow = "hidden";
}

function initMobileSectionsMenu() {
  const toggle = document.getElementById("sections-menu-toggle");
  const overlay = document.getElementById("sections-menu-overlay");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("sections-menu-open")) {
      closeSectionsMenu();
    } else {
      openSectionsMenu();
    }
  });

  if (overlay) {
    overlay.addEventListener("click", closeSectionsMenu);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSectionsMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeSectionsMenu();
  });
}

function initCollapsiblePanels() {
  const homePanels = document.querySelectorAll("[data-home-panel]");
  const sectionPanels = document.querySelectorAll("[data-section-panel]");

  function wirePanel(panel, btnSelector) {
    const btn = panel.querySelector(btnSelector);
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (window.matchMedia("(min-width: 901px)").matches) return;
      const isOpen = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  homePanels.forEach(function (panel) {
    wirePanel(panel, ".home-panel__toggle");
  });
  sectionPanels.forEach(function (panel) {
    wirePanel(panel, ".section-mobile-panel__toggle");
  });

  window.addEventListener("resize", function () {
    if (!window.matchMedia("(min-width: 901px)").matches) return;
    homePanels.forEach(function (panel) {
      panel.classList.add("is-open");
      const btn = panel.querySelector(".home-panel__toggle");
      if (btn) btn.setAttribute("aria-expanded", "true");
    });
    sectionPanels.forEach(function (panel) {
      panel.classList.add("is-open");
      const btn = panel.querySelector(".section-mobile-panel__toggle");
      if (btn) btn.setAttribute("aria-expanded", "true");
    });
  });
}

function initHomePanelToggles() {
  initCollapsiblePanels();
}

function initMobileHeaderToolbar() {
  const toolbar = document.querySelector(".nav-mobile-toolbar");
  const tools = document.getElementById("nav-tools");
  const navRight = document.querySelector(".nav-right");
  const login = document.getElementById("nav-login");
  if (!toolbar || !tools || !navRight) return;

  const mq = window.matchMedia("(max-width: 900px)");

  function apply() {
    if (mq.matches) {
      if (tools.parentElement !== toolbar) {
        toolbar.appendChild(tools);
      }
      if (login && login.parentElement !== navRight) {
        navRight.appendChild(login);
      }
      toolbar.classList.add("is-active");
    } else {
      if (tools.parentElement !== navRight) {
        navRight.insertBefore(tools, login || null);
      }
      if (login && login.parentElement !== navRight) {
        navRight.appendChild(login);
      }
      toolbar.classList.remove("is-active");
    }
  }

  apply();
  mq.addEventListener("change", apply);
}

function getSectionElementId(title) {
  const cfg = typeof getSectionConfig === "function" ? getSectionConfig(title) : null;
  return cfg ? cfg.id : slugify(title);
}

function setHeaderSearchVisible(visible) {
  const searchContainer = document.getElementById("header-search") || document.querySelector(".top-navbar .search-container");
  if (!searchContainer) return;
  searchContainer.classList.toggle("is-hidden", !visible);
}

function shouldUseMobileSectionSearch(sectionName) {
  if (sectionName === "💰 Richest Players") return false;
  const cfg = typeof getSectionConfig === "function" ? getSectionConfig(sectionName) : null;
  if (cfg) return cfg.mobileSearchInSection === true;
  const hiddenSearchSections = ["Home", "Crew Logos", "Crate Game", "💰 Richest Players", ACCESSORIES_SECTION_NAME];
  return !hiddenSearchSections.includes(sectionName);
}

function isHeaderSearchVisibleForSection(sectionName) {
  const cfg = typeof getSectionConfig === "function" ? getSectionConfig(sectionName) : null;
  if (cfg) {
    if (cfg.mobileSearchInSection === true && window.matchMedia("(max-width: 900px)").matches) {
      return true;
    }
    return cfg.search !== "hide";
  }
  const hiddenSearchSections = ["Home", "Crew Logos", "Crate Game", "💰 Richest Players", ACCESSORIES_SECTION_NAME];
  return !hiddenSearchSections.includes(sectionName);
}

function wireSectionMobilePanel(panel) {
  if (!panel || panel.dataset.panelWired === "1") return;
  const btn = panel.querySelector(".section-mobile-panel__toggle");
  if (!btn) return;
  panel.dataset.panelWired = "1";
  btn.addEventListener("click", function () {
    if (window.matchMedia("(min-width: 901px)").matches) return;
    const isOpen = panel.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function ensureAccessoriesMobileChrome(sectionEl) {
  let chrome = sectionEl.querySelector(".section-mobile-chrome");
  if (!chrome) {
    chrome = document.createElement("div");
    chrome.className = "section-mobile-chrome";
    const toggleIcon =
      '<svg class="section-mobile-panel__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    chrome.innerHTML =
      '<div class="section-mobile-panel is-open" data-section-panel>' +
        '<div class="section-mobile-panel__header">' +
          '<h3 class="section-mobile-panel__title">' + escapeHtml(i18n("guide.fastNavAria")) + "</h3>" +
          '<button type="button" class="section-mobile-panel__toggle" aria-expanded="true" aria-label="' +
            escapeAttr(i18n("home.panelToggle")) + '">' + toggleIcon + "</button>" +
        "</div>" +
        '<div class="section-mobile-panel__body">' +
          '<aside class="guide-fast-nav guide-fast-nav--in-section" id="section-mobile-fastnav"></aside>' +
        "</div>" +
      "</div>" +
      '<div class="section-search-mount"></div>';
    const heading = sectionEl.querySelector("h2:first-of-type");
    if (heading) {
      heading.insertAdjacentElement("afterend", chrome);
    } else {
      sectionEl.insertBefore(chrome, sectionEl.firstChild);
    }
    const panel = chrome.querySelector("[data-section-panel]");
    wireSectionMobilePanel(panel);
  }
  return chrome;
}

function ensureAccessoriesBackToTop() {
  let btn = document.getElementById("accessories-back-to-top");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.id = "accessories-back-to-top";
    btn.className = "section-back-to-top";
    btn.hidden = true;
    btn.setAttribute("aria-label", i18n("richest.backToTop"));
    btn.innerHTML =
      '<svg class="section-back-to-top__icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M12 4v12M6 10l6-6 6 6" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M12 4v12M6 10l6-6 6 6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      '<span class="section-back-to-top__text">' + escapeHtml(i18n("richest.backToTop")) + "</span>";
    btn.addEventListener("click", function () {
      const sec = document.getElementById("untradeable-items");
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.body.appendChild(btn);
  }
  return btn;
}

function syncBackToTopVisibility() {
  const mobile = window.matchMedia("(max-width: 900px)").matches;
  const active = _activeSectionName;

  const untradableBtn = ensureAccessoriesBackToTop();
  untradableBtn.hidden = !(mobile && active === ACCESSORIES_SECTION_NAME);

  const richestBtn = document.getElementById("richest-back-to-top");
  if (richestBtn) {
    richestBtn.hidden = active !== RICHEST_SECTION_NAME;
  }
}

function ensureSectionSearchMount(sectionEl) {
  if (sectionEl && sectionEl.id === "untradeable-items") {
    ensureAccessoriesMobileChrome(sectionEl);
  }

  let mount = sectionEl.querySelector(".section-mobile-chrome .section-search-mount") ||
    sectionEl.querySelector(".section-search-mount");
  if (!mount) {
    mount = document.createElement("div");
    mount.className = "section-search-mount";
    const heading = sectionEl.querySelector("h2:first-of-type");
    if (heading) {
      heading.insertAdjacentElement("afterend", mount);
    } else {
      sectionEl.insertBefore(mount, sectionEl.firstChild);
    }
  }
  return mount;
}

function syncHeaderSearchPlacement(sectionName) {
  const searchContainer = document.getElementById("header-search");
  const navContainer = document.querySelector(".nav-container-full");
  if (!searchContainer || !navContainer) return;

  const searchVisible = isHeaderSearchVisibleForSection(sectionName);
  const useInSection = window.matchMedia("(max-width: 900px)").matches &&
    searchVisible &&
    shouldUseMobileSectionSearch(sectionName);

  if (useInSection) {
    const sectionId = typeof getSectionElementId === "function"
      ? getSectionElementId(sectionName)
      : slugify(sectionName);
    const sectionEl = document.getElementById(sectionId);
    if (sectionEl) {
      const mount = ensureSectionSearchMount(sectionEl);
      if (searchContainer.parentElement !== mount) {
        mount.appendChild(searchContainer);
      }
      searchContainer.classList.add("search-container--in-section");
      return;
    }
  }

  const navRight = navContainer.querySelector(".nav-right");
  if (searchContainer.parentElement !== navContainer) {
    navContainer.insertBefore(searchContainer, navRight || null);
  }
  searchContainer.classList.remove("search-container--in-section");
}

function initMobileSectionSearch() {
  const mq = window.matchMedia("(max-width: 900px)");
  mq.addEventListener("change", function () {
    const sectionName = _activeSectionName || "Home";
    const cfg = typeof getSectionConfig === "function" ? getSectionConfig(sectionName) : null;
    const useMobileSectionSearch = mq.matches && shouldUseMobileSectionSearch(sectionName);
    setHeaderSearchVisible(cfg ? (useMobileSectionSearch || cfg.search !== "hide") : isHeaderSearchVisibleForSection(sectionName));
    syncHeaderSearchPlacement(sectionName);
    syncBackToTopVisibility();
  });
}

function showSection(name) {
  console.log(`Showing section: ${name}`);
  _activeSectionName = name;

  const cfg = typeof getSectionConfig === "function" ? getSectionConfig(name) : null;
  if (!cfg) return;

  document.querySelectorAll('.durability-input').forEach(input => {
    const card = input.closest('.card');
    const maxDurability = card.dataset.maxDurability;
    input.value = maxDurability;
    updateCardValues(input);
  });

  const taxSidebarColumn = document.getElementById('tax-sidebar-column');
  const homeValueChanges = document.getElementById('home-value-changes');
  const taxCalc = taxSidebarColumn ? taxSidebarColumn.querySelector('.tax-calculator') : null;
  const middlemanPromo = taxSidebarColumn ? taxSidebarColumn.querySelector('.discord-mm-promo--sidebar') : null;
  const accessoriesFastNav = document.getElementById(GUIDE_FAST_NAV_BOX_ID);
  const isHome = cfg.id === 'home';

  document.body.classList.toggle('is-home', isHome);

  if (taxSidebarColumn) {
    if (isHome || cfg.sidebarColumn === 'hide') {
      taxSidebarColumn.style.display = 'flex';
      taxSidebarColumn.style.visibility = 'hidden';
      taxSidebarColumn.style.opacity = '0';
      taxSidebarColumn.style.pointerEvents = 'none';
    } else {
      taxSidebarColumn.style.visibility = 'visible';
      taxSidebarColumn.style.opacity = '1';
      taxSidebarColumn.style.display = 'flex';
      taxSidebarColumn.style.pointerEvents = 'auto';
    }
  }

  if (typeof applyVisibilityMode === 'function') {
    applyVisibilityMode(taxCalc, cfg.taxCalc, cfg.id === 'home' ? 'none' : 'block');
    applyVisibilityMode(middlemanPromo, cfg.middlemanPromo, 'block');
  }

  if (cfg.accessoriesFastNav) {
    removeEmbeddedMoneyGuideFastNav();
    if (accessoriesFastNavData) {
      renderGuideFastNav(accessoriesFastNavData, {
        sectionId: slugify(ACCESSORIES_SECTION_NAME)
      });
      renderAccessoriesMobileFastNav(accessoriesFastNavData);
    }
    setGuideFastNavVisible(true);
  } else if (cfg.moneyGuideFastNav) {
    renderMoneyGuideFastNav();
  } else if (cfg.crewFastNav) {
    removeEmbeddedMoneyGuideFastNav();
    if (crewFastNavData) {
      renderGuideFastNav(crewFastNavData, {
        sectionId: slugify("Crew Logos")
      });
    }
    setGuideFastNavVisible(true);
  } else {
    removeEmbeddedMoneyGuideFastNav();
    setGuideFastNavVisible(false);
  }

  if (homeValueChanges) {
    homeValueChanges.style.visibility = cfg.homeValueChanges ? 'visible' : 'hidden';
    homeValueChanges.style.opacity = cfg.homeValueChanges ? '1' : '0';
    homeValueChanges.style.display = cfg.homeValueChanges ? 'block' : 'none';
  }

  const useMobileSectionSearch = window.matchMedia("(max-width: 900px)").matches &&
    shouldUseMobileSectionSearch(name);
  setHeaderSearchVisible(useMobileSectionSearch || cfg.search !== "hide");
  syncHeaderSearchPlacement(name);
  syncBackToTopVisibility();

  getSectionRegistry().forEach(function (sectionCfg) {
    const el = document.getElementById(sectionCfg.id);
    if (!el) return;
    if (sectionCfg.title === name) {
      if (sectionCfg.id === "richest-players") {
        el.style.display = "flex";
        el.style.flexDirection = "column";
      } else {
        el.style.display = "block";
        el.style.flexDirection = "";
      }
    } else {
      el.style.display = "none";
    }
  });

  document.querySelectorAll("#sections-nav button").forEach(b => {
    b.classList.toggle("active", b.dataset.section === name);
  });

  closeSectionsMenu();
  trackEvent("view_section", { section_name: name });
}

window.showSection = showSection;

function initSearch() {
  const input = document.getElementById("search");
  const resetBtn = document.getElementById("search-reset");
  if (!input) return;

  function applySearchFilter() {
    const val = input.value.toLowerCase();
    document.querySelectorAll(".card").forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.classList.toggle("hidden", !name.includes(val));
    });
  }

  function updateResetVisibility() {
    if (!resetBtn) return;
    resetBtn.hidden = !input.value;
  }

  input.addEventListener("input", () => {
    applySearchFilter();
    updateResetVisibility();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      input.value = "";
      applySearchFilter();
      updateResetVisibility();
      input.focus();
    });
  }

  updateResetVisibility();
}

function getTaxBreakdown(amountWant) {
  const want = Math.round(Number(amountWant) || 0);
  if (want <= 0) return { totalWithdraw: 0, lines: [], singleDrop: true };
  const totalWithdraw = Math.round(want / TAX_RECEIVE_RATIO);
  if (totalWithdraw <= TAX_MAX_DROP) {
    return {
      totalWithdraw,
      lines: [i18n("tax.dropAmount", { amount: "$" + totalWithdraw.toLocaleString() })],
      singleDrop: true
    };
  }
  const full40kCount = Math.floor(totalWithdraw / TAX_MAX_DROP);
  const receivedFromFull = full40kCount * TAX_RECEIVE_PER_40K;
  const lastReceive = want - receivedFromFull;
  const lastWithdraw = Math.round(lastReceive / TAX_RECEIVE_RATIO);
  const lines = [];

  if (full40kCount === 1 && lastWithdraw > 0) {
    lines.push(i18n("tax.drop40kTimesOnce"));
    lines.push(i18n("tax.thenDrop", { amount: "$" + lastWithdraw.toLocaleString() }));
  } else if (lastWithdraw > 0) {
    lines.push(i18n("tax.drop40kTimes", { count: full40kCount.toLocaleString() }));
    lines.push(i18n("tax.thenDrop", { amount: "$" + lastWithdraw.toLocaleString() }));
  } else {
    lines.push(i18n("tax.drop40kTimes", { count: full40kCount.toLocaleString() }) + ".");
  }
  return { totalWithdraw, lines, singleDrop: false };
}

function formatDollar(amount) {
  return '$' + (Math.round(Number(amount) || 0)).toLocaleString();
}

function buildTaxBreakdownHtml(want, breakdown) {
  return '<span class="tax-how-label">' +
    escapeHtml(i18n("tax.howLabel", { want: formatDollar(want), withdraw: formatDollar(breakdown.totalWithdraw) })) +
    '</span><br>' +
    breakdown.lines.map(function(line) { return escapeHtml(line) + '<br>'; }).join('');
}

function bindTaxCalcWidget(root) {
  if (!root || root.dataset.taxBound === "1") return;
  var input = root.querySelector("[data-tax-input]");
  var amountEl = root.querySelector("[data-tax-amount]");
  var breakdownEl = root.querySelector("[data-tax-breakdown]");
  if (!input || !amountEl) return;
  root.dataset.taxBound = "1";

  function update() {
    var raw = input.value.replace(/[^\d]/g, "");
    var want = parseInt(raw, 10) || 0;
    var b = getTaxBreakdown(want);
    amountEl.textContent = b.totalWithdraw.toLocaleString();
    var afterLabel = root.querySelector("[data-tax-after-label]");
    if (afterLabel) afterLabel.hidden = b.totalWithdraw <= 0;
    if (!breakdownEl) return;
    if (b.totalWithdraw <= 0) {
      breakdownEl.innerHTML = "";
      return;
    }
    breakdownEl.innerHTML = buildTaxBreakdownHtml(want, b);
  }

  input.addEventListener("input", function (e) {
    var cursorPos = e.target.selectionStart;
    var oldValue = e.target.value;
    var newValue = oldValue.replace(/[^\d]/g, "");
    if (oldValue !== newValue) {
      e.target.value = newValue;
      e.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1));
    }
    update();
  });

  input.addEventListener("paste", function (e) {
    e.preventDefault();
    var paste = (e.clipboardData || window.clipboardData).getData("text");
    var cleaned = (paste || "").replace(/[^\d]/g, "");
    document.execCommand("insertText", false, cleaned);
  });

  update();
}

function initTaxCalculator() {
  const taxInput = document.getElementById("taxInput");
  const taxAmount = document.getElementById("tax-amount");
  const taxBreakdown = document.getElementById("tax-breakdown");

  if (!taxInput || !taxAmount) {
    console.log("Tax calculator elements not found");
    return;
  }

  function update() {
    const raw = taxInput.value.replace(/[^\d]/g, '');
    const want = parseInt(raw, 10) || 0;
    const b = getTaxBreakdown(want);
    taxAmount.innerHTML = b.totalWithdraw.toLocaleString() + ' <span class="tax-after-label">After Tax</span>';
    if (taxBreakdown) {
      if (b.totalWithdraw <= 0) {
        taxBreakdown.innerHTML = '';
        return;
      }
      taxBreakdown.innerHTML = buildTaxBreakdownHtml(want, b);
    }
  }

  taxInput.addEventListener("input", function(e) {
    const cursorPos = e.target.selectionStart;
    const oldValue = e.target.value;
    const newValue = oldValue.replace(/[^\d]/g, '');
    if (oldValue !== newValue) {
      e.target.value = newValue;
      e.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1));
    }
    update();
  });

  taxInput.addEventListener('paste', function(e) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = (paste || '').replace(/[^\d]/g, '');
    document.execCommand('insertText', false, cleaned);
  });

  update();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    btn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 1500);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    btn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 1500);
  });
}

let durabilityInterval = null;
let durabilityTimeout = null;

function enforceMaxDurability(input) {
  const card = input.closest('.card');
  const maxDurability = parseInt(card.dataset.maxDurability);
  let value = parseInt(input.value);
  
  if (value > maxDurability) {
    input.value = maxDurability;
  } else if (value < 0) {
    input.value = 0;
  }
  
  updateCardValues(input);
}

function adjustDurability(btn, direction, evt) {
  if (evt) evt.preventDefault();
  
  const card = btn.closest('.card');
  const input = card.querySelector('.durability-input');
  const maxDurability = parseInt(card.dataset.maxDurability);
  const isTouch =
    !!evt && (
      evt.type === 'touchstart' ||
      (evt.pointerType && evt.pointerType === 'touch')
    );
  const holdDelayMs = isTouch ? 120 : 200;
  const repeatEveryMs = isTouch ? 30 : 50;
  
  function adjust() {
    let newValue = (parseInt(input.value) || 0) + direction;
    newValue = Math.max(0, Math.min(newValue, maxDurability));
    input.value = newValue;
    updateCardValues(input);
  }
  
  adjust();
  
  durabilityTimeout = setTimeout(() => {
    durabilityInterval = setInterval(adjust, repeatEveryMs);
  }, holdDelayMs);
}

function stopDurabilityAdjust() {
  if (durabilityInterval) {
    clearInterval(durabilityInterval);
    durabilityInterval = null;
  }
  if (durabilityTimeout) {
    clearTimeout(durabilityTimeout);
    durabilityTimeout = null;
  }
}

function updateCardValues(input) {
  const card = input.closest('.card');
  const currentDurability = parseInt(input.value) || 0;
  const maxDurability = parseInt(card.dataset.maxDurability);
  
  const durabilityPercent = currentDurability / maxDurability;
  
  const originalAvg = card.dataset.avg;
  const originalRanged = card.dataset.ranged;
  
  card.querySelector('.avg-value').textContent = calculateDurabilityValue(originalAvg, durabilityPercent);
  card.querySelector('.ranged-value').textContent = calculateDurabilityValue(originalRanged, durabilityPercent);
  
  const internalValue = card.dataset.internalValue;
  const repairValueElement = card.querySelector('.repair-value');
  
  if (repairValueElement && internalValue) {
    const missingDurability = maxDurability - currentDurability;
    const internalVal = parseInternalValue(internalValue);
    const repairPrice = Math.round(missingDurability * (internalVal / maxDurability / 1.43));
    repairValueElement.textContent = '$' + (isNaN(repairPrice) ? 0 : repairPrice).toLocaleString();
  }
  
  const pawnValueElement = card.querySelector('.pawn-value');
  
  if (pawnValueElement && internalValue) {
    const missingDurability = maxDurability - currentDurability;
    const internalVal = parseInternalValue(internalValue);
    
    const baseValue = internalVal * 0.3;
    const deduction = missingDurability * ((internalVal * 0.3) / maxDurability / 1.43);
    const pawnPrice = Math.round(baseValue - deduction);
    
    pawnValueElement.textContent = '$' + (isNaN(pawnPrice) ? 0 : pawnPrice).toLocaleString();
  }
}

function calculateDurabilityValue(originalValue, durabilityPercent) {
  if (!originalValue || originalValue === '' || originalValue === 'N/A' || originalValue === '-') {
    return originalValue || 'N/A';
  }
  
  const valueMultiplier = 0.20 + (0.80 * durabilityPercent);
  
  if (originalValue.includes(' to ')) {
    const parts = originalValue.split(' to ');
    const low = parseValue(parts[0]) * valueMultiplier;
    const high = parseValue(parts[1]) * valueMultiplier;
    
    if (!isNaN(low) && !isNaN(high)) {
      const lowFormatted = formatLikeOriginal(low, parts[0]);
      const highFormatted = formatLikeOriginal(high, parts[1]);
      return lowFormatted + ' to ' + highFormatted;
    }
  }
  
  const value = parseValue(originalValue) * valueMultiplier;
  
  if (!isNaN(value) && value > 0) {
    return formatLikeOriginal(value, originalValue);
  }
  
  return originalValue;
}

function parseValue(str) {
  if (!str) return 0;
  
  str = str.toString().trim().toLowerCase();
  str = str.replace(/[$,]/g, '');
  
  if (/\bmillion\b/.test(str)) {
    return parseFloat(str.replace(/[^0-9.]/g, '')) * 1000000;
  }
  
  if (str.includes('k')) {
    return parseFloat(str.replace(/k/g, '')) * 1000;
  }
  
  if (str.includes('m')) {
    return parseFloat(str.replace(/m/g, '')) * 1000000;
  }
  
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}



function formatLikeOriginal(num, original) {
  num = Math.round(num);
  
  const lower = original.toLowerCase();
  // "1 Million" contains "m" but must not use abbreviated $Xm styling
  const wasK = lower.includes('k') && !/\bthousand\b/.test(lower);
  const wasM = lower.includes('m') && !/\bmillion\b/.test(lower);
  const hadCommas = original.includes(',');
  
  if (wasM) {
    const m = Math.round(num / 1000000);
    return '$' + m + 'm';
  } else if (wasK) {
    const k = Math.round(num / 1000);
    return '$' + k + 'k';
  } else if (hadCommas || num >= 1000) {
    return '$' + num.toLocaleString();
  } else {
    return '$' + num;
  }
}

document.addEventListener('mouseup', stopDurabilityAdjust);
document.addEventListener('touchend', stopDurabilityAdjust);
document.addEventListener('touchcancel', stopDurabilityAdjust);
document.addEventListener('mouseup', stopFishWeightAdjust);
document.addEventListener('touchend', stopFishWeightAdjust);
document.addEventListener('touchcancel', stopFishWeightAdjust);

function safe(str) { return str ?? ""; }
function escapeAttr(str) {
  return (str + "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeHtml(str) {
  return (str + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function parseInternalValue(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return 0;
  const numeric = raw.replace(/[^0-9.]/g, "");
  if (!numeric) return 0;
  let n = parseFloat(numeric);
  if (!isFinite(n)) return 0;
  if (/\bbillion\b/.test(raw) || raw.includes("b")) n *= 1e9;
  else if (/\bmillion\b/.test(raw) || raw.includes("m")) n *= 1e6;
  else if (/\bthousand\b/.test(raw) || raw.includes("k")) n *= 1e3;
  return n;
}
function normalizeHeaderKey(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function getInternalValueFromItem(item) {
  if (!item || typeof item !== "object") return "";
  const direct = item["Internal Value"];
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") return direct;

  const preferredKeys = ["internalvalue", "networthvalue", "internal", "networth"];
  for (const key of Object.keys(item)) {
    const norm = normalizeHeaderKey(key);
    if (!norm) continue;
    if (preferredKeys.includes(norm) || norm.includes("internalvalue") || norm.includes("networthvalue")) {
      const v = item[key];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
  }

  // Fallback: recover by sheet column position when labels are inconsistent.
  const rowValues = Array.isArray(item.__rowValues) ? item.__rowValues : [];
  const colLabels = Array.isArray(item.__colLabels) ? item.__colLabels : [];
  if (rowValues.length) {
    let internalIdx = -1;
    for (let i = 0; i < colLabels.length; i++) {
      if (normalizeHeaderKey(colLabels[i]).includes("internalvalue")) {
        internalIdx = i;
        break;
      }
    }
    if (internalIdx >= 0 && internalIdx < rowValues.length) {
      const byHeaderIndex = rowValues[internalIdx];
      if (byHeaderIndex !== undefined && byHeaderIndex !== null && String(byHeaderIndex).trim() !== "") {
        return byHeaderIndex;
      }
    }
    // Known schema fallback: Name, Image URL, Demand, Average, Ranged, Quantum, Durability, Internal, Durability Invisible
    if (rowValues.length >= 8) {
      const byKnownIndex = rowValues[7];
      if (byKnownIndex !== undefined && byKnownIndex !== null && String(byKnownIndex).trim() !== "") {
        return byKnownIndex;
      }
    }
  }
  return "";
}
/** Prefer numeric cell.v from Sheets (reliable); else formatted f; else string v. */
function coerceInternalCell(cell) {
  if (!cell) return "";
  if (typeof cell.v === "number" && Number.isFinite(cell.v)) {
    return String(cell.v);
  }
  if (cell.v !== null && cell.v !== undefined) {
    const vs = String(cell.v).trim();
    if (vs !== "") return vs;
  }
  if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== "") {
    return String(cell.f);
  }
  return "";
}
function getCellDisplayValue(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== "") {
    return cell.f;
  }
  if (cell.v !== undefined && cell.v !== null) {
    return cell.v;
  }
  return "";
}
function getSheetNameForSection(displayName) {
  if (displayName === "Common / Uncommon") return "Uncommon";
  if (displayName === ACCESSORIES_SECTION_NAME) return "Accessories";
  return displayName;
}

function slugify(str) {
  const cfg = typeof getSectionConfig === "function" ? getSectionConfig(str) : null;
  if (cfg && cfg.id) return cfg.id;
  if (str === "Common / Uncommon") return "uncommon";
  return str.toLowerCase().replace(/\s+/g, "-");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOM loaded, initializing...');
  initAnalytics();
  setupDiscordClickTracking();
  initDiscordJoinNudge();

  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.warn('Loading timeout - forcing hide');
      loadingScreen.style.display = 'none';
    }
  }, 15000);
  
  const sectionsContainer = document.getElementById("sections");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  if (!sectionsContainer || !progressBar || !progressText) {
    loadFooterBoosters();
    return;
  }

  var homeHumveeWrap = document.querySelector(".home-humvee-banner-wrap");
  if (homeHumveeWrap) {
    homeHumveeWrap.innerHTML = "";
  }
  mountHomeDiscordPromo();

  initSectionsNav();
  initMobileSectionsMenu();
  initHomePanelToggles();
  initMobileHeaderToolbar();
  initMobileSectionSearch();
  initSearch();
  initTaxCalculator();
  await loadExternalGiveawayConfig();
  await loadSectionContentConfig();

  const totalSections = SECTION_NAMES.length;
  let loadedSections = 0;

  const fetchPromises = SECTION_NAMES.map(async (sec) => {
   
    console.log(`Fetching data for: ${sec}`);
    
    let items = [];
    const cfg = typeof getSectionConfig === "function" ? getSectionConfig(sec) : null;
    try {
      if (cfg && cfg.dataSource === "richest") {
        items = await fetchRichestPlayers();
        console.log(`Got ${items.length} items for ${sec} from NEW spreadsheet`);
      } else if (cfg && cfg.dataSource === "sheet") {
        items = await fetchSheet(cfg.sheetName || getSheetNameForSection(sec));
        console.log(`Got ${items.length} items for ${sec} from OLD spreadsheet`);
      }
    } catch (error) {
      console.error(`Failed to load ${sec}:`, error);
      items = [];
    }
    
    loadedSections++;
    const progress = Math.round((loadedSections / totalSections) * 100);
    progressBar.style.width = progress + '%';
    progressText.textContent = progress + '%';
    
    return { section: sec, items };
  });

  const results = await Promise.all(fetchPromises);

  sectionsContainer.classList.add("loaded");

  results.forEach(function (result) {
    _renderedSectionCache.push(result);
    renderSection(result.section, result.items);
  });
  if (typeof window.bsvRefreshSavedCardButtons === "function") {
    window.bsvRefreshSavedCardButtons();
  }
  if (typeof window.bsvFetchSavedCards === "function") {
    window.bsvFetchSavedCards();
  }
  updateHomeSiteStatsFromResults(results);
  applyStripGiveawayBannerVisibility();
  initGiveawayBannerCarousels();
  initDiscordPromoCardCarousels();
  renderSectionContentEmbeds();

  setTimeout(function () {
    var loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) loadingScreen.style.display = "none";
  }, 150);

  let initialSection = "Home";
  if (window.location.hash && window.location.hash.startsWith('#sec=')) {
    let requested = decodeURIComponent(window.location.hash.substring(5));
    if (requested === "Uncommon") requested = "Common / Uncommon";
    if (requested === "richest-players" || requested === "Richest Players") {
      requested = "💰 Richest Players";
    }
    if (requested === "Untradable Items") requested = ACCESSORIES_SECTION_NAME;
    if (SECTION_NAMES.includes(requested)) {
      initialSection = requested;
    }
  }

  showSection(initialSection);
  loadValueChanges();
  fetchDiscordMemberCount();
  loadFooterBoosters();
});

function refreshDynamicContentForLanguage() {
  document.querySelectorAll("#sections > .section:not(#home)").forEach(function (el) {
    el.remove();
  });

  _renderedSectionCache.forEach(function (result) {
    renderSection(result.section, result.items);
  });

  applyStripGiveawayBannerVisibility();
  initGiveawayBannerCarousels();
  initDiscordPromoCardCarousels();
  renderSectionContentEmbeds();
  initSectionsNav();
  showSection(_activeSectionName);

  var taxInput = document.getElementById("taxInput");
  if (taxInput) taxInput.dispatchEvent(new Event("input"));
}

document.addEventListener("bsv:languagechange", function () {
  if (_renderedSectionCache.length) {
    refreshDynamicContentForLanguage();
  } else {
    initSectionsNav();
  }
});

document.addEventListener('click', function(e) {
  const trigger = e.target.closest('.card-giveaway-trigger');
  if (!trigger) return;
  ensureGiveawayModal();
  const modal = document.getElementById('giveaway-modal');
  if (!modal) return;
  modal.classList.add('visible');
});

document.addEventListener('click', function(e) {
  if (e.target.matches('[data-giveaway-close]') || e.target.closest('[data-giveaway-close]')) {
    const modal = document.getElementById('giveaway-modal');
    if (modal) modal.classList.remove('visible');
  }
});

function openRiverLinks(e) {
  e.preventDefault();
  const modal = document.createElement('div');
  modal.className = 'river-links-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>River's Contact</h2>
      <div class="links-list">
        <a href="https://www.roblox.com/users/2361072897/profile" target="_blank">
          <span class="link-icon">🎮</span>
          <span class="link-text">Roblox Profile</span>
        </a>
        <div class="copy-link" onclick="copyToClipboard('_.riverr')">
          <svg class="link-icon discord-svg" viewBox="0 0 24 24" width="20" height="20" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.29a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span class="link-text">Discord: _.riverr</span>
          <span class="copy-icon">📋</span>
        </div>
        <div class="copy-link" onclick="copyToClipboard('riverytacc11@gmail.com')">
          <span class="link-icon">📧</span>
          <span class="link-text">Email: riverytacc11@gmail.com</span>
          <span class="copy-icon">📋</span>
        </div>
      </div>
      <button class="close-modal-btn" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Fetch and display recent value changes from spreadsheet (sheet: "Website Configs", columns: Title, Date, Text, Color)
function buildValueChangeItemHtml(r, useTimeline) {
  var colorMap = { green: "green", orange: "orange", red: "red", blue: "blue" };
  var title = (r.Title || "").toString().trim();
  var date = (r.Date || "").toString().trim();
  var text = (r.Text || "").toString().trim();
  var color = (r.Color || "").toString().trim().toLowerCase();
  var colorKey = colorMap[color] ? color : "";
  var colorClass = colorKey ? " value-change-item--" + colorKey : "";
  var timelineClass = useTimeline ? " value-change-item--timeline" : "";
  var titleEsc = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var dateEsc = date.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var textEsc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");

  if (useTimeline) {
    return (
      '<div class="value-change-item value-change-item--timeline' + colorClass + '">' +
        '<div class="value-change-item__body">' +
        (titleEsc ? '<p class="value-change-title">' + titleEsc + "</p>" : "") +
        (dateEsc ? '<p class="value-change-date">' + dateEsc + "</p>" : "") +
        (textEsc ? '<p class="value-change-text">' + textEsc + "</p>" : "") +
        "</div>" +
        '<div class="value-change-icon' + colorClass + '" aria-hidden="true"></div>' +
      "</div>"
    );
  }

  return (
    '<div class="value-change-item' + colorClass + '">' +
      '<div class="value-change-icon' + colorClass + '"></div>' +
      (titleEsc ? '<p class="value-change-title">' + titleEsc + "</p>" : "") +
      (dateEsc ? '<p class="value-change-date">' + dateEsc + "</p>" : "") +
      (textEsc ? '<p class="value-change-text">' + textEsc + "</p>" : "") +
    "</div>"
  );
}

async function loadValueChanges() {
  var listEl = document.getElementById('value-changes-list');
  var homeMainListEl = document.getElementById('home-main-value-changes-list');
  if (!listEl && !homeMainListEl) return;
  function setSidebarValueChangesHtml(html) {
    if (listEl) listEl.innerHTML = html;
  }
  try {
    var rows = await fetchSheet("Website Configs");
    if (!rows || rows.length === 0) {
      var emptyHtml = '<div class="value-changes-loading">' + escapeHtml(i18n("changes.none")) + '</div>';
      setSidebarValueChangesHtml(emptyHtml);
      if (homeMainListEl) homeMainListEl.innerHTML = emptyHtml;
      return;
    }
    var filtered = filterValueChangeRows(rows);
    if (filtered.length === 0) {
      var noneHtml = '<div class="value-changes-loading">' + escapeHtml(i18n("changes.none")) + '</div>';
      setSidebarValueChangesHtml(noneHtml);
      if (homeMainListEl) homeMainListEl.innerHTML = noneHtml;
      return;
    }
    var classicHtml = filtered.map(function (r) { return buildValueChangeItemHtml(r, false); }).join("");
    var timelineHtml = filtered.map(function (r) { return buildValueChangeItemHtml(r, true); }).join("");
    setSidebarValueChangesHtml(classicHtml);
    if (homeMainListEl) {
      homeMainListEl.innerHTML =
        '<div class="value-changes-list__track">' +
          '<div class="value-changes-list__items">' + timelineHtml + "</div>" +
        "</div>";
    }
  } catch (err) {
    console.error('Error loading value changes:', err);
    var failHtml = '<div class="value-changes-loading">' + escapeHtml(i18n("changes.failed")) + '</div>';
    setSidebarValueChangesHtml(failHtml);
    if (homeMainListEl) homeMainListEl.innerHTML = failHtml;
  }
}


/* ========== PINK WEBSITE THEME - theme switcher (remove with theme section in style.css) ========== */
var THEMES_DISABLED = true; /* Set to false to re-enable theme switcher */

function applyPinkThemeDividers() {
  if (THEMES_DISABLED) {
    document.querySelectorAll('.home-divider').forEach(function(el) {
      el.style.removeProperty('background');
    });
    return;
  }
  var theme = document.body.getAttribute('data-theme');
  var gradient = theme === 'pink'
    ? 'linear-gradient(90deg, transparent, #d0a8b8, transparent)'
    : null;
  document.querySelectorAll('.home-divider').forEach(function(el) {
    if (gradient) {
      el.style.setProperty('background', gradient, 'important');
    } else {
      el.style.removeProperty('background');
    }
  });
}
function initThemeSwitcher() {
  if (THEMES_DISABLED) {
    document.body.removeAttribute('data-theme');
    document.body.classList.add('themes-disabled');
    applyPinkThemeDividers();
    return;
  }
  document.body.classList.remove('themes-disabled');
  var saved = localStorage.getItem('bsv-theme') || 'default';
  // Apply saved theme: '' for default, or specific theme name (e.g. 'red', 'pink', 'purple')
  if (saved === 'pink' || saved === 'red' || saved === 'purple') {
    document.body.setAttribute('data-theme', saved);
  } else {
    document.body.removeAttribute('data-theme');
    saved = 'default';
  }
  applyPinkThemeDividers();
  var wrap = document.getElementById('theme-switcher');
  if (!wrap) return;
  var btns = wrap.querySelectorAll('.theme-switcher-btn');
  btns.forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === saved);
    btn.addEventListener('click', function() {
      var theme = this.getAttribute('data-theme');
      if (theme === 'default') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', theme);
      }
      localStorage.setItem('bsv-theme', theme);
      btns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-theme') === theme); });
      applyPinkThemeDividers();
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initThemeSwitcher();
    applyPinkThemeDividers();
  });
} else {
  initThemeSwitcher();
  applyPinkThemeDividers();
}
