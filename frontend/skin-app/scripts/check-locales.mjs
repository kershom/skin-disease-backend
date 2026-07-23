import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const engBase = path.join(base, 'en.json');
const engDash = path.join(base, 'dashboard.en.json');
const files = fs.readdirSync(base).filter((f) => f.endsWith('.json') && f !== 'index.js');

const langs = {};
for (const file of files) {
  if (file.startsWith('dashboard.')) {
    const code = file.slice('dashboard.'.length, -5);
    langs[code] ||= {};
    langs[code].dashboard = path.join(base, file);
  } else {
    const code = file.slice(0, -5);
    langs[code] ||= {};
    langs[code].base = path.join(base, file);
  }
}

for (const code of Object.keys(langs).sort()) {
  if (code === 'en') continue;
  const missing = [];
  if (langs[code].base) {
    const data = JSON.parse(fs.readFileSync(langs[code].base, 'utf8'));
    const eng = JSON.parse(fs.readFileSync(engBase, 'utf8'));
    for (const key of Object.keys(eng)) {
      if (!(key in data)) missing.push(key);
    }
  }
  if (langs[code].dashboard) {
    const data = JSON.parse(fs.readFileSync(langs[code].dashboard, 'utf8'));
    const eng = JSON.parse(fs.readFileSync(engDash, 'utf8'));
    for (const key of Object.keys(eng)) {
      if (!(key in data)) missing.push(`dashboard:${key}`);
    }
  }
  if (missing.length) {
    console.log(`${code}: ${missing.length} missing`);
    for (const item of missing) console.log(`  ${item}`);
  }
}
