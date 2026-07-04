/**
 * Generates locale JSON from English using MyMemory free API.
 * Usage:
 *   node scripts/build-locales.mjs           # all pending
 *   node scripts/build-locales.mjs ml ta fr  # specific codes
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

const ALL_TARGETS = [
  'ml', 'ta', 'te', 'kn', 'bn', 'mr', 'gu', 'pa', 'or', 'ur',
  'fr', 'es', 'ar', 'zh', 'ja', 'ko', 'ru', 'de', 'pt',
];

const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en.json'), 'utf8'));
const dashboardEn = JSON.parse(
  fs.readFileSync(path.join(LOCALES_DIR, 'dashboard.en.json'), 'utf8')
);

const cache = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isStillEnglish(code) {
  try {
    const ui = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), 'utf8'));
    return ui.app?.tagline === en.app.tagline;
  } catch {
    return true;
  }
}

async function translateText(text, target) {
  if (!text?.trim()) return text;
  const key = `${target}::${text}`;
  if (cache.has(key)) return cache.get(key);

  let safe = text;
  const placeholders = [];
  safe = safe.replace(/\{\{[^}]+\}\}/g, (m) => {
    placeholders.push(m);
    return `__PH${placeholders.length - 1}__`;
  });

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(safe)}&langpair=en|${target}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'API error');
      let out = data.responseData.translatedText;
      placeholders.forEach((p, i) => {
        out = out.replace(new RegExp(`__PH${i}__`, 'gi'), p);
      });
      cache.set(key, out);
      await sleep(600);
      return out;
    } catch {
      await sleep(2000 * (attempt + 1));
    }
  }
  console.warn(`\n  ⚠ EN fallback: "${text.slice(0, 40)}..."`);
  return text;
}

async function translateValue(value, target, stats) {
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await translateValue(item, target, stats));
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await translateValue(v, target, stats);
    }
    return out;
  }
  if (typeof value === 'string') {
    stats.count++;
    process.stdout.write(`\r    ${stats.count} strings`);
    return translateText(value, target);
  }
  return value;
}

async function buildLang(code) {
  if (!isStillEnglish(code)) {
    console.log(`\n⏭ ${code} — already translated, skipping`);
    return;
  }
  console.log(`\n▶ ${code}`);
  const ui = await translateValue(structuredClone(en), code, { count: 0 });
  console.log('\n  UI ✓');
  const dashboard = await translateValue(structuredClone(dashboardEn), code, { count: 0 });
  console.log('\n  Dashboard ✓');
  fs.writeFileSync(path.join(LOCALES_DIR, `${code}.json`), JSON.stringify(ui, null, 2), 'utf8');
  fs.writeFileSync(path.join(LOCALES_DIR, `dashboard.${code}.json`), JSON.stringify(dashboard, null, 2), 'utf8');
  console.log(`  ✓ saved ${code}`);
}

const args = process.argv.slice(2);
let langs = args.length ? args.filter((c) => ALL_TARGETS.includes(c)) : ALL_TARGETS.filter(isStillEnglish);

console.log(`Translating ${langs.length} language(s): ${langs.join(', ')}`);

for (const code of langs) {
  await buildLang(code);
}
console.log('\n✅ Done');
