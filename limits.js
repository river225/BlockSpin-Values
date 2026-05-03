const cooldownStore = new Map();
const dailyStore = new Map();

function getDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function checkAndConsumeLimit(userId, commandName, options = {}) {
  const cooldownMs = options.cooldownMs ?? 0;
  const dailyLimit = options.dailyLimit ?? null;
  const now = Date.now();

  const cooldownKey = `${commandName}:${userId}`;
  const lastUsedAt = cooldownStore.get(cooldownKey) ?? 0;
  if (cooldownMs > 0 && now - lastUsedAt < cooldownMs) {
    const waitMs = cooldownMs - (now - lastUsedAt);
    return {
      ok: false,
      message: `Please wait ${Math.ceil(waitMs / 1000)}s before using \`/${commandName}\` again.`
    };
  }

  if (dailyLimit !== null) {
    const dayKey = getDayKey();
    const usageKey = `${dayKey}:${commandName}:${userId}`;
    const used = dailyStore.get(usageKey) ?? 0;
    if (used >= dailyLimit) {
      return {
        ok: false,
        message: `Daily limit reached for \`/${commandName}\` (${dailyLimit}/day).`
      };
    }
    dailyStore.set(usageKey, used + 1);
  }

  if (cooldownMs > 0) cooldownStore.set(cooldownKey, now);
  return { ok: true };
}

module.exports = { checkAndConsumeLimit };
