require("dotenv").config();
const { Client, GatewayIntentBits, Events, EmbedBuilder, MessageFlags } = require("discord.js");
const http = require("node:http");
const {
  handleCommand,
  handleAutocomplete,
  handleButtonInteraction,
  handleModalSubmit
} = require("./commands");
const { getSpreadsheetIdFromMode } = require("./sheets");

const token = process.env.BOT_TOKEN;
const MM_CHANNEL_ID = "1406708321242578944";
const VALUE_SUGGESTION_CHANNEL_ID = "1461226880844697728";
const BSV_LOGO_URL = "https://i.ibb.co/WW3G6H2j/Nombre-del-proyecto.gif";
const BOOSTER_GUILD_ID = process.env.BOOSTER_GUILD_ID || "1402820361539817554";
const BOOSTER_CACHE_TTL_MS = 2 * 60 * 1000;
const BOOSTER_API_PORT = Number(process.env.BOOSTER_API_PORT || 3000);
const WEBSITE_ORIGIN = process.env.WEBSITE_ORIGIN || "https://blockspinvalues.com";
const ROLE_VALUE_LIST_LEAD = "1406731239892979783";
const ROLE_VALUE_LIST_TEAM = "1406783681892188321";
const ROLE_HEAD_MIDDLEMAN = "1411554134603333794";
const ROLE_MIDDLEMAN_TEAM = "1411554004688699535";
const ABOUT_TEAM_CACHE_TTL_MS = 5 * 60 * 1000;
let aboutTeamCache = { expiresAt: 0, payload: null };
const greetedThreads = new Set();
const reminderScheduledThreads = new Set();
const reminderSentThreads = new Set();
const threadMessageCounts = new Map();
const MM_SAFETY_TEXT = "Make sure to use our Middleman Service <#1417708249553178786> to ensure your trades are safe and you dont get scammed.";
const VALUE_REMINDER_TEXT = "Want to suggest a value change? do /valuesuggestion. Also make sure to head to https://discord.com/channels/1402820361539817554/1461226880844697728 to vote on other peoples value suggestion!";
let boosterCache = { expiresAt: 0, payload: [] };
if (!token) {
  console.error("Missing BOT_TOKEN in .env");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

function getCorsHeaders(origin) {
  const allowedOrigins = new Set([
    WEBSITE_ORIGIN,
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://blockspinvalues.com",
    "https://www.blockspinvalues.com"
  ]);
  const allowOrigin = allowedOrigins.has(origin) ? origin : WEBSITE_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

async function fetchCurrentBoosters(force = false) {
  if (!force && Date.now() < boosterCache.expiresAt && Array.isArray(boosterCache.payload)) {
    return boosterCache.payload;
  }

  const guild = await client.guilds.fetch(BOOSTER_GUILD_ID);
  await guild.members.fetch();

  const boosters = guild.members.cache
    .filter((member) => Boolean(member.premiumSinceTimestamp))
    .sort((a, b) => (b.premiumSinceTimestamp || 0) - (a.premiumSinceTimestamp || 0))
    .map((member) => ({
      id: member.id,
      name: member.displayName || member.user?.globalName || member.user?.username || "Unknown",
      avatarUrl: member.displayAvatarURL({ extension: "png", forceStatic: false, size: 128 }),
      premiumSince: member.premiumSince ? member.premiumSince.toISOString() : null
    }))
    .slice(0, 40);

  boosterCache = {
    expiresAt: Date.now() + BOOSTER_CACHE_TTL_MS,
    payload: boosters
  };
  return boosters;
}

function memberToAboutEntry(member) {
  return {
    id: member.id,
    displayName: member.displayName || member.user?.globalName || member.user?.username || "Unknown",
    avatarUrl: member.displayAvatarURL({ extension: "png", forceStatic: false, size: 128 })
  };
}

function sortedRoleMembers(role) {
  if (!role) return [];
  try {
    const coll = role.members;
    if (!coll || coll.size === 0) return [];
    return Array.from(coll.values())
      .map((m) => memberToAboutEntry(m))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
  } catch (err) {
    console.error(`sortedRoleMembers failed for role ${role?.id}:`, err);
    return [];
  }
}

async function fetchAboutTeamData(force = false) {
  if (!force && aboutTeamCache.payload && Date.now() < aboutTeamCache.expiresAt) {
    return aboutTeamCache.payload;
  }

  const guild = await client.guilds.fetch(BOOSTER_GUILD_ID);
  await guild.members.fetch({ withPresences: false }).catch((err) => {
    console.error("guild.members.fetch failed in fetchAboutTeamData:", err);
    throw err;
  });

  const rVL = guild.roles.cache.get(ROLE_VALUE_LIST_LEAD);
  const rVLT = guild.roles.cache.get(ROLE_VALUE_LIST_TEAM);
  const rHMM = guild.roles.cache.get(ROLE_HEAD_MIDDLEMAN);
  const rMMT = guild.roles.cache.get(ROLE_MIDDLEMAN_TEAM);

  const valueListLeads = sortedRoleMembers(rVL);
  const vlLeadIds = new Set(valueListLeads.map((m) => m.id));
  const valueListTeam = sortedRoleMembers(rVLT).filter((m) => !vlLeadIds.has(m.id));

  const middlemanLeads = sortedRoleMembers(rHMM);
  const mmLeadIds = new Set(middlemanLeads.map((m) => m.id));
  const middlemanTeam = sortedRoleMembers(rMMT).filter((m) => !mmLeadIds.has(m.id));

  const payload = {
    valueListLeads,
    valueListTeam,
    middlemanLeads,
    middlemanTeam,
    updatedAt: new Date().toISOString()
  };
  aboutTeamCache = { expiresAt: Date.now() + ABOUT_TEAM_CACHE_TTL_MS, payload };
  return payload;
}

function httpRequestPath(req) {
  let raw = req.url || "/";
  const q = raw.indexOf("?");
  if (q !== -1) raw = raw.slice(0, q);
  try {
    raw = decodeURIComponent(raw);
  } catch (_) {
    /* keep raw */
  }
  raw = raw.replace(/\/+/g, "/");
  if (raw.length > 1 && raw.endsWith("/")) raw = raw.slice(0, -1);
  return raw || "/";
}

function startBoosterApiServer() {
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin || "";
    const cors = getCorsHeaders(origin);
    const path = httpRequestPath(req);

    if (req.method === "OPTIONS") {
      res.writeHead(204, cors);
      res.end();
      return;
    }

    if (req.method === "GET" && path === "/api/boosters") {
      try {
        const boosters = await fetchCurrentBoosters(false);
        res.writeHead(200, { ...cors, "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ boosters, updatedAt: new Date().toISOString() }));
      } catch (err) {
        console.error("Failed to build boosters API response:", err);
        res.writeHead(500, { ...cors, "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ boosters: [], error: "failed_to_fetch_boosters" }));
      }
      return;
    }

    if (req.method === "GET" && path === "/api/about-team") {
      try {
        const data = await fetchAboutTeamData(false);
        res.writeHead(200, { ...cors, "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(data));
      } catch (err) {
        console.error("Failed to build about-team API response:", err);
        res.writeHead(500, { ...cors, "Content-Type": "application/json; charset=utf-8" });
        res.end(
          JSON.stringify({
            valueListLeads: [],
            valueListTeam: [],
            middlemanLeads: [],
            middlemanTeam: [],
            error: "failed_to_fetch_about_team"
          })
        );
      }
      return;
    }

    console.warn(`[http] 404 ${req.method} ${path} (raw url: ${req.url || ""})`);
    res.writeHead(404, { ...cors, "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "not_found" }));
  });

  server.listen(BOOSTER_API_PORT, () => {
    console.log(`Booster API listening on port ${BOOSTER_API_PORT}`);
  });
}

client.once(Events.ClientReady, (c) => {
  const mode = (process.env.MODE || "test").toLowerCase();
  const sheetId = getSpreadsheetIdFromMode();
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`MODE=${mode} | Spreadsheet ID set=${Boolean(sheetId)}`);
  c.channels
    .fetch(MM_CHANNEL_ID)
    .then((ch) => {
      if (!ch) {
        console.log(`MM target channel ${MM_CHANNEL_ID} not found in cache/fetch.`);
        return;
      }
      console.log(`MM target resolved: id=${ch.id} type=${ch.type} name=${ch.name || "unknown"}`);
    })
    .catch((err) => {
      console.error(`Failed to fetch MM channel ${MM_CHANNEL_ID}:`, err);
    });
  fetchCurrentBoosters(true)
    .then((boosters) => {
      console.log(`Booster cache warm-up complete: ${boosters.length} active boosters`);
    })
    .catch((err) => {
      console.error("Booster cache warm-up failed:", err);
    });
  fetchAboutTeamData(true)
    .then((data) => {
      const n =
        (data.valueListLeads?.length || 0) +
        (data.valueListTeam?.length || 0) +
        (data.middlemanLeads?.length || 0) +
        (data.middlemanTeam?.length || 0);
      console.log(`About-team cache warm-up complete: ${n} members across roles`);
    })
    .catch((err) => {
      console.error("About-team cache warm-up failed:", err);
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    try {
      await handleAutocomplete(interaction);
    } catch (_) {}
    return;
  }
  if (interaction.isButton()) {
    try {
      const handled = await handleButtonInteraction(interaction);
      if (handled) return;
    } catch (err) {
      console.error("Button interaction failed:", err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "Something went wrong.", flags: MessageFlags.Ephemeral });
      }
      return;
    }
  }
  if (interaction.isModalSubmit()) {
    try {
      const handled = await handleModalSubmit(interaction);
      if (handled) return;
    } catch (err) {
      console.error("Modal interaction failed:", err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "Something went wrong.", flags: MessageFlags.Ephemeral });
      }
      return;
    }
  }
  if (!interaction.isChatInputCommand()) return;
  try {
    await handleCommand(interaction);
  } catch (err) {
    console.error(`Command failed (${interaction.commandName}):`, err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: "Something went wrong.", flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: "Something went wrong.", flags: MessageFlags.Ephemeral });
    }
  }
});

function isTargetThread(thread) {
  const threadId = thread?.id || null;
  const parentId = thread?.parentId || thread?.parent?.id || null;
  // Accept either a parent channel id (normal case) or direct thread id.
  return threadId === MM_CHANNEL_ID || parentId === MM_CHANNEL_ID;
}

function buildSafetyEmbed() {
  return new EmbedBuilder()
    .setColor(0x8B5CF6)
    .setThumbnail(BSV_LOGO_URL)
    .setDescription(MM_SAFETY_TEXT);
}

function scheduleValueSuggestionReminder(thread, source) {
  if (!thread || !isTargetThread(thread)) return;
  if (reminderScheduledThreads.has(thread.id) || reminderSentThreads.has(thread.id)) return;

  reminderScheduledThreads.add(thread.id);
  const fiveMinutesMs = 5 * 60 * 1000;
  const createdAt = Number(thread.createdTimestamp) || Date.now();
  const delayMs = Math.max(0, createdAt + fiveMinutesMs - Date.now());

  setTimeout(async () => {
    try {
      if (reminderSentThreads.has(thread.id)) return;
      await thread.send(VALUE_REMINDER_TEXT);
      reminderSentThreads.add(thread.id);
      console.log(`Value suggestion reminder sent to thread ${thread.id} (${source})`);
    } catch (err) {
      console.error(`Failed to send value suggestion reminder in thread ${thread.id}:`, err);
    } finally {
      reminderScheduledThreads.delete(thread.id);
    }
  }, delayMs);
}

async function maybeSendThreadSafetyEmbed(thread, source) {
  try {
    if (!thread) return;
    if (greetedThreads.has(thread.id)) return;

    const parentId = thread.parentId || thread.parent?.id || null;
    if (!isTargetThread(thread)) {
      console.log(`${source} saw thread ${thread.id} with parent ${parentId} (ignored)`);
      return;
    }

    greetedThreads.add(thread.id);
    console.log(`${source} detected thread ${thread.id} in parent ${parentId}`);

    if (thread.joinable) {
      try {
        await thread.join();
      } catch (joinErr) {
        console.error(`Failed to join thread ${thread.id}:`, joinErr);
      }
    }

    const embed = buildSafetyEmbed();

    await thread.send({ embeds: [embed] });
    console.log(`Thread safety embed sent to ${thread.id}`);
    scheduleValueSuggestionReminder(thread, source);
  } catch (err) {
    console.error("Thread welcome message failed:", err);
    if (thread?.id) greetedThreads.delete(thread.id);
  }
}

client.on(Events.ThreadCreate, async (thread) => {
  await maybeSendThreadSafetyEmbed(thread, "ThreadCreate");
});

client.on(Events.ChannelCreate, async (channel) => {
  try {
    if (!channel || typeof channel.isThread !== "function" || !channel.isThread()) return;
    await maybeSendThreadSafetyEmbed(channel, "ChannelCreate");
  } catch (err) {
    console.error("ChannelCreate thread handler failed:", err);
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author?.bot) return;

    const ch = message.channel;
    if (!ch) return;

    if (typeof ch.isThread === "function" && ch.isThread()) {
      await maybeSendThreadSafetyEmbed(ch, "MessageCreate");

      if (isTargetThread(ch)) {
        const current = (threadMessageCounts.get(ch.id) || 0) + 1;
        threadMessageCounts.set(ch.id, current);

        // After the first timed reminder has been sent, post another reminder every 40 messages.
        if (reminderSentThreads.has(ch.id) && current % 40 === 0) {
          await ch.send(VALUE_REMINDER_TEXT);
          console.log(`40-message reminder sent in thread ${ch.id} at message count ${current}`);
        }
      }
    }
  } catch (err) {
    console.error("MessageCreate thread handler failed:", err);
  }
});

startBoosterApiServer();
client.login(token);
