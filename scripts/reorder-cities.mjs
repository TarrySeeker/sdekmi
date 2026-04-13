// Re-sort assets/cities.js so cities with active PVZ appear before cities
// without. Within each group, entries stay alphabetically sorted.
//
// Why: the autocomplete in calculator.js / map.js walks CITIES in order and
// stops at the first 10 matches. Putting "real shipping destinations" first
// means typing "Мос" surfaces Москва before some hamlet called "Московка",
// even though both share the prefix.
//
// Usage: node scripts/reorder-cities.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CITIES_PATH = path.join(ROOT, 'assets', 'cities.js');
const PVZ_PATH = path.join(ROOT, 'assets', 'pvz.json');

const src = fs.readFileSync(CITIES_PATH, 'utf8');
const pvz = JSON.parse(fs.readFileSync(PVZ_PATH, 'utf8'));

// Preserve the header comments verbatim.
const headerEnd = src.indexOf('var CITIES =');
const header = src.slice(0, headerEnd);

const re = /\["((?:[^"\\]|\\.)*)",(\d+)\]/g;
const entries = [];
let m;
while ((m = re.exec(src)) !== null) {
    entries.push([m[1], Number(m[2])]);
}

// Tier 1: cities with PVZ, ranked by PVZ count descending (Москва > Тула > …).
// Tier 2: cities without PVZ, alphabetical.
// The autocomplete walks the array and picks the first 10 matches, so Tier 1
// cities always surface before villages sharing the same prefix.
entries.sort((a, b) => {
    const aCnt = pvz[String(a[1])] ? pvz[String(a[1])].length : 0;
    const bCnt = pvz[String(b[1])] ? pvz[String(b[1])].length : 0;
    if (aCnt !== bCnt) return bCnt - aCnt;
    return a[0].localeCompare(b[0], 'ru');
});

const rows = [];
for (let i = 0; i < entries.length; i += 4) {
    const slice = entries
        .slice(i, i + 4)
        .map((e) => `["${e[0].replace(/"/g, '\\"')}",${e[1]}]`)
        .join(',');
    rows.push(slice + (i + 4 < entries.length ? ',' : ''));
}

const out = header + 'var CITIES = [\n' + rows.join('\n') + '\n];\n';
fs.writeFileSync(CITIES_PATH, out, 'utf8');

const withPvz = entries.filter((e) => pvz[String(e[1])]).length;
console.log(`Reordered ${entries.length} entries (${withPvz} with PVZ first)`);
