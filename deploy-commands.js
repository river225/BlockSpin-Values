require("dotenv").config();
const { REST, Routes } = require("discord.js");
const { getSlashCommandData } = require("./commands");

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error("Missing BOT_TOKEN, CLIENT_ID, or GUILD_ID in .env");
  process.exit(1);
}

async function deploy() {
  const rest = new REST({ version: "10" }).setToken(token);
  const body = getSlashCommandData();
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
  console.log(`Deployed ${body.length} slash command(s) to guild ${guildId}.`);
  console.log("Note: Role-based slash-command visibility must be configured in Discord server Integrations settings.");
}

deploy().catch((err) => {
  console.error("Command deploy failed:", err);
  process.exit(1);
});
