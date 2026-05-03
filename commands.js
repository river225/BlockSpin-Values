const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} = require("discord.js");
const { checkAndConsumeLimit } = require("./limits");
const { fetchSheetRows } = require("./sheets");
const TAX_RECEIVE_RATIO = 29091 / 40000;
const TAX_MAX_DROP = 40000;
const TAX_RECEIVE_PER_40K = 29091;
const FEE_ALLOWED_ROLE_ID = "1411554004688699535";
const SR_ALLOWED_ROLE_ID = "1406803726559215670";
const VALUE_SUGGESTION_BLOCKED_ROLE_ID = "1497237278538469588";
const WEBSITE_PROMO_TEXT = "Check out our values website https://blockspinvalues.com/";
const ITEM_SHEETS = ["Uncommon", "Rare", "Epic", "Legendary", "Omega", "Misc", "Vehicles", "Accessories"];
const ITEM_CACHE_TTL_MS = 60 * 1000;
let itemCache = { expiresAt: 0, items: [] };
const activeItemViews = new Map();
const activeTaxViews = new Map();
const activeDiceChallenges = new Map();
const activeValueChangesViews = new Map();
const BSV_LOGO_URL = "https://i.ibb.co/WW3G6H2j/Nombre-del-proyecto.gif";
const VALUE_SUGGESTION_CHANNEL_ID = "1461226880844697728";
const RICHEST_SPREADSHEET_ID = "1nfWrJcFkVCZ-Yr0mWmCCjQoQgUD3_-W2Qsy4XD4NT3k";
const RICHEST_CACHE_TTL_MS = 60 * 1000;
let richestCache = { expiresAt: 0, rows: [] };
const VALUE_CHANGES_CACHE_TTL_MS = 60 * 1000;
let valueChangesCache = { expiresAt: 0, rows: [] };

function getRichestRankColor(rank) {
  if (rank === 1) return 0xFFD700; // Gold
  if (rank === 2) return 0xC0C0C0; // Silver
  if (rank === 3) return 0xCD7F32; // Bronze
  if (rank >= 4 && rank <= 25) return 0x8B5CF6; // Purple
  if (rank >= 26 && rank <= 100) return 0xEC4899; // Pink
  if (rank >= 101 && rank <= 500) return 0x48BB78; // Green
  return 0xA0A0A0; // Gray
}

function getTaxBreakdown(amountWant) {
  const want = Math.round(Number(amountWant) || 0);
  if (want <= 0) return { totalWithdraw: 0, lines: [] };

  const totalWithdraw = Math.round(want / TAX_RECEIVE_RATIO);
  if (totalWithdraw <= TAX_MAX_DROP) {
    return {
      totalWithdraw,
      lines: [`Drop $${totalWithdraw.toLocaleString("en-US")} once.`]
    };
  }

  const full40kCount = Math.floor(totalWithdraw / TAX_MAX_DROP);
  const receivedFromFull = full40kCount * TAX_RECEIVE_PER_40K;
  const lastReceive = want - receivedFromFull;
  const lastWithdraw = Math.round(lastReceive / TAX_RECEIVE_RATIO);
  const lines = [];

  if (full40kCount === 1 && lastWithdraw > 0) {
    lines.push("Drop $40,000 once.");
    lines.push(`Then drop $${lastWithdraw.toLocaleString("en-US")}.`);
  } else if (lastWithdraw > 0) {
    lines.push(`Drop $40,000 ${full40kCount.toLocaleString("en-US")} times.`);
    lines.push(`Then drop $${lastWithdraw.toLocaleString("en-US")}.`);
  } else {
    lines.push(`Drop $40,000 ${full40kCount.toLocaleString("en-US")} times.`);
  }

  return { totalWithdraw, lines };
}

function buildTaxEmbed(amount) {
  const breakdown = getTaxBreakdown(amount);
  const amountText = `$${Math.round(Number(amount) || 0).toLocaleString("en-US")}`;

  const steps = breakdown.lines.length > 0
    ? breakdown.lines.join("\n")
    : "Enter a cash amount using the button below.";

  return new EmbedBuilder()
    .setTitle("Tax Calculator")
    .setColor(0x33cce6)
    .setThumbnail(BSV_LOGO_URL)
    .setDescription([
      `**Cash you are dropping: ${amountText}**`,
      "",
      "**Steps:**",
      steps,
      "",
      "How does it work?",
      "Tax calculator shows exactly how much cash to drop and in what order to avoid losing money to the game's cash tax system.",
      "",
      "- You NEED BlockSpin Plus for this method",
      "- NEVER reset with more than 40,000 cash on you",
      "- NEVER leave the game in combat after resetting",
      "- Wait 1 min in between cash drops"
    ].join("\n"))
    .setFooter({ text: "Use the button bellow to Adjust the cash you want to calculate", iconURL: BSV_LOGO_URL });
}

function buildTaxButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("taxcalc:adjust")
        .setLabel("Adjust Cash")
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

function parseMoneyLike(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return 0;
  const numeric = raw.replace(/[^0-9.]/g, "");
  if (!numeric) return 0;
  let n = parseFloat(numeric);
  if (!Number.isFinite(n)) return 0;
  if (/\bbillion\b/.test(raw) || raw.includes("b")) n *= 1e9;
  else if (/\bmillion\b/.test(raw) || raw.includes("m")) n *= 1e6;
  else if (/\bthousand\b/.test(raw) || raw.includes("k")) n *= 1e3;
  return n;
}

function formatMoney(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString("en-US")}`;
}

function getDurabilityAtMax(durabilityRaw) {
  const text = String(durabilityRaw || "").trim();
  if (!text || !text.includes("/")) return null;
  const parts = text.split("/");
  const max = parseInt(parts[1], 10);
  if (!Number.isFinite(max) || max <= 0) return null;
  return { current: max, max };
}

async function getIndexedItems() {
  const now = Date.now();
  if (itemCache.expiresAt > now && itemCache.items.length > 0) return itemCache.items;

  const sections = await Promise.all(
    ITEM_SHEETS.map(async (sheetName) => {
      try {
        const rows = await fetchSheetRows(sheetName);
        return rows.map((row) => ({ ...row, __sheet: sheetName }));
      } catch (_) {
        return [];
      }
    })
  );

  const seen = new Set();
  const items = [];
  sections.flat().forEach((row) => {
    const name = String(row["Name"] || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push(row);
  });

  itemCache = { expiresAt: now + ITEM_CACHE_TTL_MS, items };
  return items;
}

async function fetchRichestRows() {
  const now = Date.now();
  if (richestCache.expiresAt > now && richestCache.rows.length > 0) return richestCache.rows;

  const url = `https://docs.google.com/spreadsheets/d/${RICHEST_SPREADSHEET_ID}/gviz/tq?tqx=out:json&headers=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Richest sheet request failed (${res.status})`);
  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));
  const cols = (json.table.cols || []).map((c) => (c.label || "").trim());
  const rows = (json.table.rows || []).map((row, idx) => {
    const out = { __rank: idx + 1 };
    cols.forEach((label, i) => {
      const cell = row.c?.[i];
      out[label] = cell?.f ?? cell?.v ?? "";
    });
    return out;
  });

  const filtered = rows.filter((r) => String(r["Roblox Username"] || r["Player Name"] || r["Name"] || "").trim() !== "");
  richestCache = { expiresAt: now + RICHEST_CACHE_TTL_MS, rows: filtered };
  return filtered;
}

async function fetchValueChangesRows() {
  const now = Date.now();
  if (valueChangesCache.expiresAt > now && valueChangesCache.rows.length > 0) return valueChangesCache.rows;

  const rows = await fetchSheetRows("Website Configs");
  const filtered = (rows || []).filter((r) => {
    const name = String(r.Title || r.Name || "").trim();
    if (name === "Anaconda GW" || name === "Firework GW") return false;
    const hasContent = String(r.Title || r.Date || r.Text || "").trim().length > 0;
    return hasContent;
  });

  valueChangesCache = { expiresAt: now + VALUE_CHANGES_CACHE_TTL_MS, rows: filtered };
  return filtered;
}

function getValueChangeVisual(row) {
  const color = String(row.Color || "").trim().toLowerCase();
  const image =
    String(row.Image || row["Image URL"] || row.Icon || "").trim();
  if (image) return { marker: "🖼️", image };
  if (color === "green") return { marker: "🟢", image: "" };
  if (color === "red") return { marker: "🔴", image: "" };
  if (color === "blue") return { marker: "🔵", image: "" };
  if (color === "orange") return { marker: "🟠", image: "" };
  return { marker: "⚪", image: "" };
}

function buildValueChangesEmbed(rows, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const start = safePage * pageSize;
  const slice = rows.slice(start, start + pageSize);

  const embed = new EmbedBuilder()
    .setTitle("Value Changes")
    .setColor(0x33cce6)
    .setThumbnail(BSV_LOGO_URL)
    .setFooter({ text: `Page ${safePage + 1}/${totalPages}`, iconURL: BSV_LOGO_URL });

  if (slice.length === 0) {
    embed.setDescription("No value changes found.");
    return { embed, page: safePage, totalPages };
  }

  slice.forEach((r, i) => {
    const idx = start + i + 1;
    const title = String(r.Title || "Untitled").trim();
    const date = String(r.Date || "").trim();
    const text = String(r.Text || "").trim();
    const visual = getValueChangeVisual(r);
    const imageLine = visual.image ? `\n[Image](${visual.image})` : "";
    const body = [date ? `**Date:** ${date}` : null, text || null].filter(Boolean).join("\n");
    embed.addFields({
      name: `${visual.marker} #${idx} ${title}`,
      value: `${body || "No details."}${imageLine}`.slice(0, 1024),
      inline: false
    });
  });

  return { embed, page: safePage, totalPages };
}

function buildValueChangesButtons(page, totalPages) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("valuechanges:prev")
        .setLabel("Previous 10")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0),
      new ButtonBuilder()
        .setCustomId("valuechanges:next")
        .setLabel("Next 10")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= totalPages - 1)
    )
  ];
}

function parseValue(str) {
  if (!str) return 0;
  const s = String(str).trim().toLowerCase().replace(/[$,]/g, "");
  if (/\bbillion\b/.test(s)) return (parseFloat(s.replace(/[^0-9.]/g, "")) || 0) * 1e9;
  if (/\bmillion\b/.test(s)) return (parseFloat(s.replace(/[^0-9.]/g, "")) || 0) * 1e6;
  if (/\bthousand\b/.test(s)) return (parseFloat(s.replace(/[^0-9.]/g, "")) || 0) * 1e3;
  if (s.includes("b")) return (parseFloat(s.replace(/b/g, "")) || 0) * 1e9;
  if (s.includes("m")) return (parseFloat(s.replace(/m/g, "")) || 0) * 1e6;
  if (s.includes("k")) return (parseFloat(s.replace(/k/g, "")) || 0) * 1e3;
  return parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
}

function formatLikeOriginal(num, original) {
  const lower = String(original || "").toLowerCase();
  const rounded = Math.round(num);
  const wasK = lower.includes("k") && !/\bthousand\b/.test(lower);
  const wasM = lower.includes("m") && !/\bmillion\b/.test(lower);
  if (wasM) return `$${Math.round(rounded / 1e6)}m`;
  if (wasK) return `$${Math.round(rounded / 1e3)}k`;
  return `$${rounded.toLocaleString("en-US")}`;
}

function calculateDurabilityValue(originalValue, current, max) {
  if (!originalValue || !max || max <= 0) return String(originalValue || "N/A");
  const valueMultiplier = 0.2 + 0.8 * (current / max);
  const originalText = String(originalValue);
  if (originalText.includes(" to ")) {
    const [lowText, highText] = originalText.split(" to ");
    const low = parseValue(lowText) * valueMultiplier;
    const high = parseValue(highText) * valueMultiplier;
    return `${formatLikeOriginal(low, lowText)} to ${formatLikeOriginal(high, highText)}`;
  }
  const value = parseValue(originalText) * valueMultiplier;
  return formatLikeOriginal(value, originalText);
}

function buildItemValueEmbed(state) {
  const sectionNorm = String(state.section || "").toLowerCase();
  const isAccessories = sectionNorm.includes("accessories");
  const sectionDisplay = isAccessories ? "Untradable Items" : state.section;
  const sectionColor =
    sectionNorm.includes("omega") ? 0xe74c3c :
    sectionNorm.includes("legendary") ? 0xf5c312 :
    sectionNorm.includes("epic") ? 0x8e63ce :
    sectionNorm.includes("rare") ? 0x4a90e2 :
    sectionNorm.includes("uncommon") || sectionNorm.includes("common / uncommon") ? 0x4caf50 :
    sectionNorm.includes("common") ? 0x8f9aa7 :
    sectionNorm.includes("misc") ? 0xec407a :
    sectionNorm.includes("vehicles") ? 0x718096 :
    0x33cce6;

  const durabilityText = state.maxDurability
    ? `${state.currentDurability}/${state.maxDurability}`
    : "N/A";
  const avg = state.maxDurability
    ? calculateDurabilityValue(state.avgRaw, state.currentDurability, state.maxDurability)
    : state.avgRaw;
  const ranged = state.maxDurability
    ? calculateDurabilityValue(state.rangedRaw, state.currentDurability, state.maxDurability)
    : state.rangedRaw;
  const networth = state.internalNum > 0 ? formatMoney(state.internalNum) : (state.internalRaw || "N/A");

  let pawn = "N/A";
  let repair = "N/A";
  if (state.maxDurability && state.internalNum > 0) {
    const missing = state.maxDurability - state.currentDurability;
    const basePawn = state.internalNum * 0.3;
    const deduction = missing * ((state.internalNum * 0.3) / state.maxDurability / 1.43);
    pawn = formatMoney(Math.round(basePawn - deduction));
    repair = formatMoney(Math.round(missing * (state.internalNum / state.maxDurability / 1.43)));
  }

  const embed = new EmbedBuilder()
    .setTitle(state.name)
    .setColor(sectionColor);

  if (isAccessories) {
    let accessoriesNetworth = state.networthRaw || state.internalRaw || "";
    if (!accessoriesNetworth && state.internalNum > 0) accessoriesNetworth = formatMoney(state.internalNum);
    const accessoriesNetworthNum = parseMoneyLike(accessoriesNetworth);
    const networthOut =
      accessoriesNetworthNum > 0
        ? formatMoney(accessoriesNetworthNum)
        : (String(accessoriesNetworth || "").trim() || "N/A");

    const pawnRaw = String(state.pawnRaw || "").trim();
    const pawnRawNum = parseMoneyLike(pawnRaw);
    const pawnFromNetworth = accessoriesNetworthNum > 0 ? formatMoney(accessoriesNetworthNum * 0.3) : "N/A";
    const pawnOut =
      pawnRawNum > 0
        ? formatMoney(pawnRawNum)
        : (pawnRaw || pawnFromNetworth);
    const rarityOut = String(state.rarityRaw || "").trim() || "N/A";
    const bigHeaderOut = String(state.bigHeaderRaw || "").trim() || "N/A";
    const miniHeaderOut = String(state.miniHeaderRaw || "").trim() || "N/A";

    embed
      .addFields(
        { name: "Networth Value", value: networthOut, inline: true },
        { name: "Pawn Value", value: pawnOut, inline: true },
        { name: "Rarity", value: rarityOut, inline: true },
        { name: "Section", value: sectionDisplay, inline: true },
        { name: "Type", value: bigHeaderOut, inline: true },
        { name: "Specification", value: miniHeaderOut, inline: true }
      )
      .setFooter({ text: "This item is untradeable", iconURL: BSV_LOGO_URL });
  } else {
    embed
      .addFields(
        { name: "Average Value", value: String(avg || "N/A"), inline: true },
        { name: "Ranged Value", value: String(ranged || "N/A"), inline: true },
        { name: "Section", value: sectionDisplay, inline: true },
        { name: "Networth Value", value: networth, inline: true },
        { name: "Pawn Value", value: pawn, inline: true },
        { name: "Repair Price", value: repair, inline: true },
        { name: "Durability", value: durabilityText, inline: false }
      )
      .setFooter({ text: "Use buttons to adjust the item’s durability and view its stats at any durability.", iconURL: BSV_LOGO_URL });
  }

  if (state.img) embed.setThumbnail(state.img);
  return embed;
}

function buildDurabilityButtons(state) {
  if (!state.maxDurability) return [];
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("itemvalue:set").setLabel("Change Durability").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("itemvalue:max").setLabel("Max durability").setStyle(ButtonStyle.Success)
    )
  ];
}

const commandConfigs = [
  {
    name: "help",
    cooldownMs: 2000,
    dailyLimit: null,
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("Show available commands"),
    async execute(interaction) {
      await interaction.reply(
        [
          "These are our available commands:",
          "",
          "- `/itemvalue` - View full item details from our value list https://blockspinvalues.com/",
          "",
          "- `/taxcalculator` - Calculate the exact in-game cash to drop step by step, accounting for tax and drop limits.",
          "",
          "- `/valuesuggestion` - Submit a value change suggestion for any item, Your suggestion will be sent to https://discord.com/channels/1402820361539817554/1461226880844697728 for community votes. High positive votes may result in the suggestion being considered.",
          "",
          "- `/sr` - Add or update a Value List Lead response on a suggestion post.",
          "",
          "- `/valuechanges` - View the latest value changes with pagination.",
          "",
          "- `/dice` - Dice in game cash or items with anyone in the server",
          "",
          "- `/playernetworthrank` - Search your ranking or anyone else’s on the top 1,000 richest players by net worth. If you don’t appear, you’re either outside the top 1,000 or your Roblox account isn’t verified in the official BlockSpin Discord server.",
          "",
          "- `/whatismiddleman` - Learn how the middleman process works.",
          "",
          "- `/fee` - Show our middleman service fees.",
          "",
          "- `/help` - Shows available commands and extra information.",
          "",
          "To report any issues with a command or suggest a new command, make a support ticket in https://discord.com/channels/1402820361539817554/1406606788526080083 ."
        ].join("\n")
      );
    }
  },
  {
    name: "valuesuggestion",
    cooldownMs: 2000,
    dailyLimit: 25,
    data: new SlashCommandBuilder()
      .setName("valuesuggestion")
      .setDescription("Submit a value change suggestion."),
    async execute(interaction) {
      const memberRoles = interaction.member?.roles?.cache;
      const hasBlockedRole =
        memberRoles && typeof memberRoles.has === "function"
          ? memberRoles.has(VALUE_SUGGESTION_BLOCKED_ROLE_ID)
          : false;
      if (hasBlockedRole) {
        await interaction.reply({
          content: "You are not allowed to use /valuesuggestion.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("valuesuggestion:submit")
        .setTitle("Value Suggestion");

      const itemInput = new TextInputBuilder()
        .setCustomId("item")
        .setLabel("Item Name")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Name of item...")
        .setRequired(true);

      const suggestionInput = new TextInputBuilder()
        .setCustomId("suggestion")
        .setLabel("What Value do you suggest it changes to?")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("This could be average value, ranged value or demand...")
        .setRequired(true);

      const reasoningInput = new TextInputBuilder()
        .setCustomId("reasoning")
        .setLabel("Why do you suggest this change?")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Why is this a good change?\n* Troll suggestions can get you banned.\n* Avoid duplicate suggestions.")
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(itemInput),
        new ActionRowBuilder().addComponents(suggestionInput),
        new ActionRowBuilder().addComponents(reasoningInput)
      );

      await interaction.showModal(modal);
    }
  },
  {
    name: "valuechanges",
    cooldownMs: 2000,
    dailyLimit: 50,
    deferReply: true,
    data: new SlashCommandBuilder()
      .setName("valuechanges")
      .setDescription("View the latest value changes."),
    async execute(interaction) {
      const rows = await fetchValueChangesRows();
      const pageSize = 10;
      const built = buildValueChangesEmbed(rows, 0, pageSize);
      const msg = await interaction.editReply({
        embeds: [built.embed],
        components: buildValueChangesButtons(built.page, built.totalPages),
        fetchReply: true
      });
      activeValueChangesViews.set(msg.id, {
        ownerUserId: interaction.user.id,
        rows,
        page: built.page,
        pageSize
      });
    }
  },
  {
    name: "sr",
    cooldownMs: 2000,
    dailyLimit: 100,
    data: new SlashCommandBuilder()
      .setName("sr")
      .setDescription("Add Value List Lead response to a suggestion message.")
      .addStringOption((option) =>
        option
          .setName("form_response_message_id")
          .setDescription("Message ID of the value suggestion post")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("typed_in_text")
          .setDescription("Response text to append at the bottom")
          .setRequired(true)
      ),
    async execute(interaction) {
      const memberRoles = interaction.member?.roles?.cache;
      const hasSrRole =
        memberRoles && typeof memberRoles.has === "function"
          ? memberRoles.has(SR_ALLOWED_ROLE_ID)
          : false;
      if (!hasSrRole) {
        await interaction.reply({
          content: "You do not have permission to use /sr.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const messageId = interaction.options.getString("form_response_message_id", true).trim();
      const responseText = interaction.options.getString("typed_in_text", true).trim();

      const channel =
        interaction.client.channels.cache.get(VALUE_SUGGESTION_CHANNEL_ID) ||
        await interaction.client.channels.fetch(VALUE_SUGGESTION_CHANNEL_ID);

      if (!channel || typeof channel.messages?.fetch !== "function") {
        await interaction.reply({
          content: "Suggestion channel is not accessible.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      let targetMessage;
      try {
        targetMessage = await channel.messages.fetch(messageId);
      } catch (_) {
        await interaction.reply({
          content: "Could not find that suggestion message ID in the suggestion channel.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const existingEmbed = targetMessage.embeds?.[0];
      if (!existingEmbed) {
        await interaction.reply({
          content: "That message does not contain an embed to update.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const builder = EmbedBuilder.from(existingEmbed);
      const existingFields = Array.isArray(existingEmbed.fields) ? existingEmbed.fields : [];
      const responseFieldName = "RESPONSE / RESULT";
      const cleanedFields = existingFields.filter((f) => String(f.name || "").trim() !== responseFieldName);

      cleanedFields.push({
        name: responseFieldName,
        value: responseText,
        inline: false
      });

      builder.setFields(cleanedFields);
      await targetMessage.edit({ embeds: [builder] });

      await interaction.reply({
        content: `Updated suggestion response on message \`${messageId}\`.`,
        flags: MessageFlags.Ephemeral
      });
    }
  },
  {
    name: "dice",
    cooldownMs: 2000,
    dailyLimit: 50,
    data: new SlashCommandBuilder()
      .setName("dice")
      .setDescription("Dice in game cash or items with anyone in the server")
      .addIntegerOption((option) =>
        option
          .setName("number_on_dice")
          .setDescription("Highest possible number on the dice")
          .setRequired(true)
          .setMinValue(2)
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("How winner is decided")
          .setRequired(true)
          .addChoices(
            { name: "highest wins", value: "highest" },
            { name: "lowest wins", value: "lowest" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("your_item")
          .setDescription("Your item")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("their_item")
          .setDescription("Their item")
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName("person_you_are_dicing_with")
          .setDescription("Person you are dicing with")
          .setRequired(true)
      ),
    async execute(interaction) {
      const diceMax = interaction.options.getInteger("number_on_dice", true);
      const mode = interaction.options.getString("type", true);
      const yourItem = interaction.options.getString("your_item", true).trim();
      const theirItem = interaction.options.getString("their_item", true).trim();
      const opponent = interaction.options.getUser("person_you_are_dicing_with", true);

      if (opponent.id === interaction.user.id) {
        await interaction.reply({ content: "You cannot dice with yourself.", flags: MessageFlags.Ephemeral });
        return;
      }
      if (opponent.bot) {
        await interaction.reply({ content: "You cannot dice with a bot.", flags: MessageFlags.Ephemeral });
        return;
      }

      const challengeId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      activeDiceChallenges.set(challengeId, {
        requesterId: interaction.user.id,
        requesterTag: interaction.user.username,
        opponentId: opponent.id,
        opponentTag: opponent.username,
        diceMax,
        mode,
        yourItem,
        theirItem
      });

      const embed = new EmbedBuilder()
        .setTitle("Dice Challenge")
        .setColor(0x8B5CF6)
        .setThumbnail(BSV_LOGO_URL)
        .setDescription(`${interaction.user} has challenged ${opponent} to a dice roll.`)
        .addFields(
          { name: "Number on dice", value: String(diceMax), inline: true },
          { name: "Type", value: mode === "highest" ? "highest wins" : "lowest wins", inline: true },
          { name: `${interaction.user.username}'s item`, value: yourItem || "N/A", inline: false },
          { name: `${opponent.username}'s item`, value: theirItem || "N/A", inline: false }
        )
        .setFooter({ text: "Waiting for acceptance...", iconURL: BSV_LOGO_URL });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`dice:accept:${challengeId}`)
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success)
      );

      await interaction.reply({
        content: `${opponent}, you have been challenged to dice.`,
        embeds: [embed],
        components: [row]
      });
    }
  },
  {
    name: "whatismiddleman",
    cooldownMs: 2000,
    dailyLimit: null,
    data: new SlashCommandBuilder()
      .setName("whatismiddleman")
      .setDescription("Learn how the middleman process works."),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("What is a Middleman?")
        .setColor(0x33cce6)
        .setThumbnail(BSV_LOGO_URL)
        .setDescription(
          [
            "The Middleman team is dedicated to ensuring you never get scammed. They specialise in facilitating safe, secure trades.",
            "",
            "A Middleman temporarily holds the buyer’s item during a transaction. The seller then delivers their item to the buyer, and once everything is confirmed, the Middleman releases the buyer’s item to the seller. This process ensures that both parties fulfil their side of the trade, preventing scams."
          ].join("\n")
        )
        .setImage("https://i.ibb.co/Ng5wPhpN/how-middlewoman-works-v0-gam53cvrsoec1.webp")
        .setFooter({ text: "BlockSpin Values", iconURL: BSV_LOGO_URL });

      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    name: "fee",
    cooldownMs: 2000,
    dailyLimit: null,
    data: new SlashCommandBuilder()
      .setName("fee")
      .setDescription("Show middleman service fees."),
    async execute(interaction) {
      const memberRoles = interaction.member?.roles?.cache;
      const hasFeeRole =
        memberRoles && typeof memberRoles.has === "function"
          ? memberRoles.has(FEE_ALLOWED_ROLE_ID)
          : false;
      if (!hasFeeRole) {
        await interaction.reply({
          content: "You do not have permission to use /fee.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("**Middleman Service Fee's**")
        .setColor(0x33cce6)
        .setThumbnail(BSV_LOGO_URL)
        .setDescription(
          [
            "**Information**",
            "- Tickets are valued in total trade amount (Buyer item value + Seller item value)",
            "- Each is **split** between Seller and buyer",
            "",
            "**Prices**",
            "",
            " 0 -- 1M = Free",
            "1M -- 1.5M = 50k Fee ",
            "1.5M -- 2M  = 60k  Fee ",
            "2M -- 3M =  80k  Fee ",
            "3M+ = 100k Fee",
            "> We also accept guns as payment",
            "",
            "-#  middleman services takes time and focus, sometimes up to 30 minutes for a single ticket. To keep things fair for both our staff and our clients, we charge a small fee that is split evenly between the buyer and the seller.",
            "",
            " Are you a Regular MM Client? Then you get 50% discounts across all our prices! ",
            "",
            "The requirements for this role are:",
            "- 50 Successful tickets completed",
            "- Vouching our MM's after each trade",
            "> Contact a Head Middleman if you feel you meet the requirements for this role"
          ].join("\n")
        )
        .setFooter({ text: "BlockSpin Values", iconURL: BSV_LOGO_URL });

      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    name: "taxcalculator",
    cooldownMs: 3000,
    dailyLimit: 50,
    data: new SlashCommandBuilder()
      .setName("taxcalculator")
      .setDescription("Calculate the exact in-game cash to drop step by step, accounting for tax and drop limits."),
    async execute(interaction) {
      const state = { ownerUserId: interaction.user.id, amount: 0 };
      const embed = buildTaxEmbed(state.amount);
      const msg = await interaction.reply({
        content: WEBSITE_PROMO_TEXT,
        embeds: [embed],
        components: buildTaxButtons(),
        fetchReply: true
      });
      activeTaxViews.set(msg.id, state);
    }
  },
  {
    name: "playernetworthrank",
    cooldownMs: 2500,
    dailyLimit: 50,
    deferReply: true,
    data: new SlashCommandBuilder()
      .setName("playernetworthrank")
      .setDescription("Search a Roblox user to view their in-game net worth ranking.")
      .addStringOption((option) =>
        option
          .setName("roblox_username")
          .setDescription("Roblox Username")
          .setRequired(true)
          .setAutocomplete(true)
      ),
    async execute(interaction) {
      const input = interaction.options.getString("roblox_username", true).trim().toLowerCase();
      const rows = await fetchRichestRows();
      let row = rows.find((r) => String(r["Roblox Username"] || r["Player Name"] || r["Name"] || "").trim().toLowerCase() === input);
      if (!row) {
        row = rows.find((r) => String(r["Roblox Username"] || r["Player Name"] || r["Name"] || "").trim().toLowerCase().includes(input));
      }
      if (!row) {
        await interaction.followUp({
          content: `${interaction.options.getString("roblox_username", true)} does not appear on the list. They are either outside the top 1,000 or their Roblox account isn’t verified in the official BlockSpin Discord server.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const username = String(row["Roblox Username"] || row["Player Name"] || row["Name"] || "Unknown");
      const level = String(row["Level"] || "N/A");
      const networthRaw = String(row["Networth"] || row["Net Worth"] || row["Worth"] || "").trim();
      const networthNum = parseMoneyLike(networthRaw);
      const networth = networthNum > 0 ? formatMoney(networthNum) : (networthRaw || "N/A");
      const rank = row.__rank || "N/A";
      const profileUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`;
      const rankNum = Number(rank);
      const embedColor = Number.isFinite(rankNum) ? getRichestRankColor(rankNum) : 0xA0A0A0;

      const embed = new EmbedBuilder()
        .setTitle(`Rank #${rank}`)
        .setColor(embedColor)
        .addFields(
          { name: "Roblox Username", value: username, inline: true },
          { name: "Level", value: level, inline: true },
          { name: "Net Worth", value: networth, inline: true },
          { name: "Profile", value: `[View Roblox Profile](${profileUrl})`, inline: false }
        );

      await interaction.editReply({ content: WEBSITE_PROMO_TEXT, embeds: [embed] });
    },
    async autocomplete(interaction) {
      const focused = interaction.options.getFocused().toLowerCase().trim();
      const rows = await fetchRichestRows();
      const names = rows
        .map((r) => String(r["Roblox Username"] || r["Player Name"] || r["Name"] || "").trim())
        .filter(Boolean);

      const starts = names.filter((n) => n.toLowerCase().startsWith(focused));
      const includes = names.filter(
        (n) => !n.toLowerCase().startsWith(focused) && n.toLowerCase().includes(focused)
      );
      const merged = [...starts, ...includes].slice(0, 25);
      await interaction.respond(merged.map((name) => ({ name, value: name })));
    }
  },
  {
    name: "itemvalue",
    cooldownMs: 2500,
    dailyLimit: 50,
    deferReply: true,
    data: new SlashCommandBuilder()
      .setName("itemvalue")
      .setDescription("View full item details from the value list.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Type item name")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("durability")
          .setDescription("Optional starting durability (0 to max)")
          .setRequired(false)
          .setMinValue(0)
      ),
    async execute(interaction) {
      const inputName = interaction.options.getString("name", true).trim();
      const requestedDurability = interaction.options.getInteger("durability", false);
      const items = await getIndexedItems();
      const normalized = inputName.toLowerCase();
      let item = items.find((x) => String(x["Name"] || "").trim().toLowerCase() === normalized);
      if (!item) {
        item = items.find((x) => String(x["Name"] || "").toLowerCase().includes(normalized));
      }

      if (!item) {
        await interaction.followUp({ content: "Item not found.", flags: MessageFlags.Ephemeral });
        return;
      }

      const name = String(item["Name"] || "Unknown");
      const img = String(item["Image URL"] || item["Image"] || "").trim();
      const avg = String(item["Average Value"] || "N/A").trim() || "N/A";
      const ranged = String(item["Ranged Value"] || "N/A").trim() || "N/A";
      const section = String(item.__sheet || "Unknown");
      const durabilityRaw = String(item["Durability"] || "").trim();
      const durabilityAtMax = getDurabilityAtMax(durabilityRaw);
      const internalRaw = String(item["Internal Value"] || item["Networth Value"] || "").trim();
      const internalNum = parseMoneyLike(internalRaw);

      const state = {
        ownerUserId: interaction.user.id,
        name,
        img,
        section,
        avgRaw: avg,
        rangedRaw: ranged,
        networthRaw: String(item["Networth Value"] || "").trim(),
        pawnRaw: String(item["Pawn Value"] || "").trim(),
        rarityRaw: String(item["Rarity"] || "").trim(),
        bigHeaderRaw: String(item["Big Header"] || "").trim(),
        miniHeaderRaw: String(item["Mini Header"] || "").trim(),
        internalRaw,
        internalNum,
        maxDurability: durabilityAtMax ? durabilityAtMax.max : null,
        currentDurability: durabilityAtMax ? durabilityAtMax.max : null
      };

      if (state.maxDurability && requestedDurability !== null && requestedDurability !== undefined) {
        state.currentDurability = Math.max(0, Math.min(state.maxDurability, requestedDurability));
      }

      const embed = buildItemValueEmbed(state);
      const components = buildDurabilityButtons(state);
      const msg = await interaction.editReply({
        content: WEBSITE_PROMO_TEXT,
        embeds: [embed],
        components,
        fetchReply: true
      });
      if (state.maxDurability) {
        activeItemViews.set(msg.id, state);
      }
    },
    async autocomplete(interaction) {
      const focused = interaction.options.getFocused().toLowerCase().trim();
      const items = await getIndexedItems();
      const names = items.map((x) => String(x["Name"] || "").trim()).filter(Boolean);

      const starts = names.filter((n) => n.toLowerCase().startsWith(focused));
      const includes = names.filter(
        (n) => !n.toLowerCase().startsWith(focused) && n.toLowerCase().includes(focused)
      );
      const merged = [...starts, ...includes].slice(0, 25);
      await interaction.respond(merged.map((name) => ({ name, value: name })));
    }
  }
];

function getSlashCommandData() {
  const desiredOrder = [
    "itemvalue",
    "taxcalculator",
    "valuesuggestion",
    "sr",
    "valuechanges",
    "dice",
    "playernetworthrank",
    "whatismiddleman",
    "fee",
    "help"
  ];
  const byName = new Map(commandConfigs.map((c) => [c.name, c]));
  const ordered = desiredOrder.map((name) => byName.get(name)).filter(Boolean);
  const leftovers = commandConfigs.filter((c) => !desiredOrder.includes(c.name));
  return [...ordered, ...leftovers].map((c) => c.data.toJSON());
}

async function handleCommand(interaction) {
  const cfg = commandConfigs.find((c) => c.name === interaction.commandName);
  if (!cfg) return;

  const limit = checkAndConsumeLimit(interaction.user.id, cfg.name, {
    cooldownMs: cfg.cooldownMs,
    dailyLimit: cfg.dailyLimit
  });
  if (!limit.ok) {
    await interaction.reply({ content: limit.message, flags: MessageFlags.Ephemeral });
    return;
  }

  if (cfg.deferReply) {
    await interaction.deferReply();
  }

  await cfg.execute(interaction);
}

async function handleAutocomplete(interaction) {
  const cfg = commandConfigs.find((c) => c.name === interaction.commandName);
  if (!cfg || typeof cfg.autocomplete !== "function") {
    await interaction.respond([]);
    return;
  }
  await cfg.autocomplete(interaction);
}

async function handleButtonInteraction(interaction) {
  if (interaction.customId.startsWith("valuechanges:")) {
    const state = activeValueChangesViews.get(interaction.message.id);
    if (!state) {
      await interaction.reply({ content: "This value changes view expired. Run `/valuechanges` again.", flags: MessageFlags.Ephemeral });
      return true;
    }
    if (interaction.user.id !== state.ownerUserId) {
      await interaction.reply({ content: "Only the command user can change pages on this view.", flags: MessageFlags.Ephemeral });
      return true;
    }

    const action = interaction.customId.split(":")[1];
    const delta = action === "next" ? 1 : -1;
    const nextPage = state.page + delta;
    const built = buildValueChangesEmbed(state.rows, nextPage, state.pageSize || 10);
    state.page = built.page;
    activeValueChangesViews.set(interaction.message.id, state);
    await interaction.update({
      embeds: [built.embed],
      components: buildValueChangesButtons(built.page, built.totalPages)
    });
    return true;
  }

  if (interaction.customId.startsWith("dice:accept:")) {
    const challengeId = interaction.customId.split(":")[2];
    const challenge = activeDiceChallenges.get(challengeId);
    if (!challenge) {
      await interaction.reply({ content: "This dice challenge has expired or was already resolved.", flags: MessageFlags.Ephemeral });
      return true;
    }

    if (interaction.user.id !== challenge.opponentId) {
      await interaction.reply({ content: "Only the selected opponent can accept this dice challenge.", flags: MessageFlags.Ephemeral });
      return true;
    }

    const userRoll = Math.floor(Math.random() * challenge.diceMax) + 1;
    const oppRoll = Math.floor(Math.random() * challenge.diceMax) + 1;

    let winnerId = null;
    let loserId = null;
    let loserItem = null;

    if (userRoll === oppRoll) {
      // Tie: no one owes anything.
    } else if (challenge.mode === "lowest") {
      if (userRoll < oppRoll) {
        winnerId = challenge.requesterId;
        loserId = challenge.opponentId;
        loserItem = challenge.theirItem;
      } else {
        winnerId = challenge.opponentId;
        loserId = challenge.requesterId;
        loserItem = challenge.yourItem;
      }
    } else {
      if (userRoll > oppRoll) {
        winnerId = challenge.requesterId;
        loserId = challenge.opponentId;
        loserItem = challenge.theirItem;
      } else {
        winnerId = challenge.opponentId;
        loserId = challenge.requesterId;
        loserItem = challenge.yourItem;
      }
    }

    const winnerText = winnerId ? `<@${winnerId}> wins.` : "It's a tie.";
    const settlementText = winnerId
      ? `<@${loserId}> owes <@${winnerId}> **${loserItem}**`
      : "No item is owed because this dice ended in a tie.";

    const resultEmbed = new EmbedBuilder()
      .setTitle("Dice Results")
      .setColor(0x8B5CF6)
      .setThumbnail(BSV_LOGO_URL)
      .addFields(
        { name: "Type", value: challenge.mode === "highest" ? "highest wins" : "lowest wins", inline: true },
        { name: "Dice max", value: String(challenge.diceMax), inline: true },
        { name: `${challenge.requesterTag}'s item`, value: challenge.yourItem, inline: true },
        { name: `${challenge.opponentTag}'s item`, value: challenge.theirItem, inline: true },
        { name: "Requester roll", value: `<@${challenge.requesterId}> rolled **${userRoll}**`, inline: false },
        { name: "Opponent roll", value: `<@${challenge.opponentId}> rolled **${oppRoll}**`, inline: false },
        { name: "Winner", value: winnerText, inline: false },
        { name: "Result", value: settlementText, inline: false }
      )
      .setFooter({ text: `Items: ${challenge.yourItem} vs ${challenge.theirItem}`, iconURL: BSV_LOGO_URL });

    activeDiceChallenges.delete(challengeId);
    await interaction.update({
      content: `<@${challenge.requesterId}> vs <@${challenge.opponentId}>`,
      embeds: [resultEmbed],
      components: []
    });
    return true;
  }

  if (interaction.customId.startsWith("taxcalc:")) {
    const state = activeTaxViews.get(interaction.message.id);
    if (!state) {
      await interaction.reply({ content: "This tax view expired. Run `/taxcalculator` again.", flags: MessageFlags.Ephemeral });
      return true;
    }
    if (interaction.user.id !== state.ownerUserId) {
      await interaction.reply({ content: "Only the command user can adjust this calculator.", flags: MessageFlags.Ephemeral });
      return true;
    }

    const modal = new ModalBuilder()
      .setCustomId(`taxcalc:setcash:${interaction.message.id}`)
      .setTitle("Adjust Cash");
    const input = new TextInputBuilder()
      .setCustomId("cash_amount")
      .setLabel("Enter target cash amount")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    return true;
  }

  if (!interaction.customId.startsWith("itemvalue:")) return false;

  const state = activeItemViews.get(interaction.message.id);
  if (!state) {
    await interaction.reply({ content: "This item view expired. Run `/itemvalue` again.", flags: MessageFlags.Ephemeral });
    return true;
  }

  // Optional: lock controls to original requester only.
  if (interaction.user.id !== state.ownerUserId) {
    await interaction.reply({ content: "This is tied to another user’s command. Run it yourself to interact.", flags: MessageFlags.Ephemeral });
    return true;
  }

  if (!state.maxDurability) {
    await interaction.reply({ content: "This item has no durability controls.", flags: MessageFlags.Ephemeral });
    return true;
  }

  const action = interaction.customId.split(":")[1];
  if (action === "set") {
    const modal = new ModalBuilder()
      .setCustomId(`itemvalue:setdur:${interaction.message.id}`)
      .setTitle("Set Durability");
    const input = new TextInputBuilder()
      .setCustomId("durability_value")
      .setLabel(`Enter durability (0-${state.maxDurability})`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(String(state.currentDurability ?? state.maxDurability));
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    return true;
  }
  if (action === "max") state.currentDurability = state.maxDurability;

  state.currentDurability = Math.max(0, Math.min(state.maxDurability, state.currentDurability));
  activeItemViews.set(interaction.message.id, state);

  const embed = buildItemValueEmbed(state);
  const components = buildDurabilityButtons(state);
  await interaction.update({ embeds: [embed], components });
  return true;
}

async function handleModalSubmit(interaction) {
  if (interaction.customId === "valuesuggestion:submit") {
    const memberRoles = interaction.member?.roles?.cache;
    const hasBlockedRole =
      memberRoles && typeof memberRoles.has === "function"
        ? memberRoles.has(VALUE_SUGGESTION_BLOCKED_ROLE_ID)
        : false;
    if (hasBlockedRole) {
      await interaction.reply({
        content: "You are not allowed to submit value suggestions.",
        flags: MessageFlags.Ephemeral
      });
      return true;
    }

    const item = interaction.fields.getTextInputValue("item").trim();
    const suggestion = interaction.fields.getTextInputValue("suggestion").trim();
    const reasoning = interaction.fields.getTextInputValue("reasoning").trim();

    const displayName =
      interaction.member?.displayName ||
      interaction.user?.globalName ||
      interaction.user?.username ||
      "Unknown";

    const embed = new EmbedBuilder()
      .setColor(0x8B5CF6)
      .setAuthor({
        name: `${displayName} (@${interaction.user.username})`,
        iconURL: interaction.user.displayAvatarURL({ size: 256 })
      })
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setDescription([
        `**Username:** ${interaction.user.username || "N/A"}`,
        `**Display Name:** ${displayName}`,
        "",
        "**Value Change Suggestion**"
      ].join("\n"))
      .addFields(
        { name: "Item", value: item || "N/A", inline: false },
        { name: "Change", value: suggestion || "N/A", inline: false },
        { name: "Reasoning", value: reasoning || "N/A", inline: false }
      )
      .setFooter({
        text: "Positive votes increase the chance of this change being considered.",
        iconURL: BSV_LOGO_URL
      })
      .setTimestamp();

    try {
      const channel =
        interaction.client.channels.cache.get(VALUE_SUGGESTION_CHANNEL_ID) ||
        await interaction.client.channels.fetch(VALUE_SUGGESTION_CHANNEL_ID);

      if (!channel || typeof channel.send !== "function") {
        await interaction.reply({
          content: "Suggestion channel is not accessible. Please contact staff.",
          flags: MessageFlags.Ephemeral
        });
        return true;
      }

      const msg = await channel.send({ embeds: [embed] });
      await msg.react("✅").catch(() => {});
      await msg.react("❌").catch(() => {});

      await interaction.reply({
        content: "Your suggestion has been submitted successfully to https://discord.com/channels/1402820361539817554/1461226880844697728. Positive votes may increase its chances of being considered for the value list.",
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error("Value suggestion submit failed:", err);
      await interaction.reply({
        content: "Failed to submit suggestion. Please try again later.",
        flags: MessageFlags.Ephemeral
      });
    }
    return true;
  }

  if (interaction.customId.startsWith("taxcalc:setcash:")) {
    const messageId = interaction.customId.split(":")[2];
    const state = activeTaxViews.get(messageId);
    if (!state) {
      await interaction.reply({ content: "This tax view expired. Run `/taxcalculator` again.", flags: MessageFlags.Ephemeral });
      return true;
    }

    if (interaction.user.id !== state.ownerUserId) {
      await interaction.reply({ content: "Only the command user can adjust this calculator.", flags: MessageFlags.Ephemeral });
      return true;
    }

    const raw = interaction.fields.getTextInputValue("cash_amount");
    const parsed = Math.max(0, Math.round(Number(String(raw).replace(/[^\d.]/g, "")) || 0));
    state.amount = parsed;
    activeTaxViews.set(messageId, state);
    const embed = buildTaxEmbed(state.amount);
    await interaction.update({ embeds: [embed], components: buildTaxButtons() });
    return true;
  }

  if (!interaction.customId.startsWith("itemvalue:setdur:")) return false;
  const messageId = interaction.customId.split(":")[2];
  const state = activeItemViews.get(messageId);
  if (!state) {
    await interaction.reply({ content: "This item view expired. Run `/itemvalue` again.", flags: MessageFlags.Ephemeral });
    return true;
  }
  if (interaction.user.id !== state.ownerUserId) {
    await interaction.reply({ content: "Only the command user can adjust this item.", flags: MessageFlags.Ephemeral });
    return true;
  }

  const raw = interaction.fields.getTextInputValue("durability_value");
  const parsed = parseInt(String(raw || "").trim(), 10);
  if (!Number.isFinite(parsed)) {
    await interaction.reply({ content: "Please enter a valid whole number.", flags: MessageFlags.Ephemeral });
    return true;
  }

  state.currentDurability = Math.max(0, Math.min(state.maxDurability, parsed));
  activeItemViews.set(messageId, state);
  const embed = buildItemValueEmbed(state);
  const components = buildDurabilityButtons(state);
  await interaction.update({ embeds: [embed], components });
  return true;
}

module.exports = {
  getSlashCommandData,
  handleCommand,
  handleAutocomplete,
  handleButtonInteraction,
  handleModalSubmit
};
