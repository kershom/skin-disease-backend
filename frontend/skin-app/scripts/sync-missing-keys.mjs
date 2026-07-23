import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

const ALL_TARGETS = [
  'ml', 'ta', 'te', 'kn', 'bn', 'mr', 'gu', 'pa', 'or', 'ur',
  'fr', 'es', 'ar', 'zh', 'ja', 'ko', 'ru', 'de', 'pt',
];

const dashboardEn = JSON.parse(
  fs.readFileSync(path.join(LOCALES_DIR, 'dashboard.en.json'), 'utf8')
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

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
    } catch (err) {
      await sleep(2000 * (attempt + 1));
    }
  }
  console.warn(`  ⚠ EN fallback for ${target}: "${text.slice(0, 40)}..."`);
  return text;
}

async function syncObjects(sourceObj, targetObj, targetLang, stats) {
  let updated = false;
  for (const [key, val] of Object.entries(sourceObj)) {
    if (val && typeof val === 'object') {
      if (!(key in targetObj) || typeof targetObj[key] !== 'object') {
        targetObj[key] = Array.isArray(val) ? [] : {};
        updated = true;
      }
      const childUpdated = await syncObjects(val, targetObj[key], targetLang, stats);
      if (childUpdated) updated = true;
    } else {
      if (!(key in targetObj)) {
        console.log(`    Translating "${key}" ("${val}") to ${targetLang}`);
        targetObj[key] = await translateText(val, targetLang);
        stats.translatedCount++;
        updated = true;
      }
    }
  }
  return updated;
}

async function syncLang(code) {
  const filePath = path.join(LOCALES_DIR, `dashboard.${code}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭ dashboard.${code}.json does not exist, skipping`);
    return;
  }

  const targetObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const stats = { translatedCount: 0 };
  
  console.log(`▶ Syncing dashboard.${code}.json...`);
  const updated = await syncObjects(dashboardEn, targetObj, code, stats);

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(targetObj, null, 2), 'utf8');
    console.log(`  ✓ Saved ${code} (${stats.translatedCount} strings translated)\n`);
  } else {
    console.log(`  ✓ No missing keys found for ${code}\n`);
  }
}

async function main() {
  console.log(`Starting localization sync for ${ALL_TARGETS.length} languages...\n`);
  for (const code of ALL_TARGETS) {
    await syncLang(code);
  }
  console.log('✅ Localization sync complete.');
}

main().catch(console.error);
