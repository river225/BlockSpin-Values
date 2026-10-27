#!/usr/bin/env node
/**
 * Copy the production site into the test site safely.
 *
 *   node tools/sync-test-site.mjs ../bsv-test-website
 *
 * Never copied (production only): CNAME (custom domain), Google Search Console verification
 * files, README.md, and generated pages (the test site builds its own for its own address).
 * Kept on the test site: its test-only files, tools/site.json, noindex + data-bsv-env="test"
 * on every page, and its own canonical on the home page. Analytics needs no change: it only
 * runs on blockspinvalues.com.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEST = path.resolve(process.argv[2] || "");
if (!process.argv[2] || !fs.existsSync(path.join(TEST, "index.html"))) {
  console.error("Usage: node tools/sync-test-site.mjs <path to bsv-test-website checkout>");
  process.exit(1);
}
const TEST_ROOT = "/BSV-TEST-WEBSITE/";
const TEST_CANONICAL = "https://river225.github.io/BSV-TEST-WEBSITE/";
const GENERATED = ["values/", "guides/", "items/", "richest-players/", "crew-logos/"];
const EXCLUDE = (f) =>
  f === "CNAME" || f === "README.md" || f === "tools/site.json" ||
  /^google[0-9a-f]+\.html$/.test(f) || GENERATED.some((g) => f.startsWith(g));

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: PROD, encoding: "utf8" }).split("\n").filter(Boolean);
let copied = 0;
for (const f of files) {
  if (EXCLUDE(f)) continue;
  const dst = path.join(TEST, f);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(PROD, f), dst);
  copied++;
}

// Test markers on every hand-made page (generated pages inherit them from index.html).
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (p.endsWith(".html")) acc.push(p);
  }
  return acc;
}
let marked = 0;
for (const f of walk(TEST)) {
  const rel = path.relative(TEST, f).split(path.sep).join("/");
  if (GENERATED.some((g) => rel.startsWith(g))) continue;
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  if (!s.includes('data-bsv-env="test"')) s = s.replace(/<html(?=[\s>])/, '<html data-bsv-env="test"');
  if (!/name="robots" content="noindex/.test(s)) s = s.replace(/(<head[^>]*>)/, '$1\n<meta name="robots" content="noindex, nofollow" />');
  if (rel === "index.html") s = s.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${TEST_CANONICAL}" />`);
  if (s !== before) { fs.writeFileSync(f, s); marked++; }
}

const siteFile = path.join(TEST, "tools", "site.json");
if (!fs.existsSync(siteFile)) fs.writeFileSync(siteFile, JSON.stringify({ root: TEST_ROOT, test: true }, null, 2) + "\n");

// Test-only add-ons listed in tools/site.json ("extraScripts"/"extraStyles") are linked into
// index.html here, so experiments live only on the test site and never in main.
const settings = JSON.parse(fs.readFileSync(siteFile, "utf8"));
{
  const idx = path.join(TEST, "index.html");
  let s = fs.readFileSync(idx, "utf8");
  for (const css of settings.extraStyles || []) {
    if (!s.includes(`href="${css}`)) s = s.replace("</head>", `<link rel="stylesheet" href="${css}?v=init" />\n</head>`);
  }
  for (const js of settings.extraScripts || []) {
    if (!s.includes(`src="${js}`)) s = s.replace('<script defer src="script.js', `<script defer src="${js}?v=init"></script>\n<script defer src="script.js`);
  }
  fs.writeFileSync(idx, s);
}

execFileSync("node", ["tools/release.mjs"], { cwd: TEST, stdio: "inherit" });

// Safety checks: nothing production-only may exist on the test site.
const problems = [];
if (fs.existsSync(path.join(TEST, "CNAME"))) problems.push("CNAME present");
for (const f of walk(TEST)) {
  const s = fs.readFileSync(f, "utf8");
  const rel = path.relative(TEST, f);
  if (!s.includes('data-bsv-env="test"')) problems.push("missing test marker: " + rel);
  if (!/name="robots" content="noindex/.test(s)) problems.push("missing noindex: " + rel);
  if (/^google[0-9a-f]+\.html$/.test(path.basename(f))) problems.push("verification file: " + rel);
}
if (problems.length) {
  console.error("SYNC PROBLEMS:\n  " + problems.slice(0, 20).join("\n  "));
  process.exit(1);
}
console.log(`Synced ${copied} files, re-marked ${marked} pages. Test site is clean.`);
