// Refresh assets/pvz.json from the public CDEK integration endpoint.
//
// Run locally or in CI to keep the shipped PVZ snapshot current:
//   node scripts/build-pvz.mjs
//
// The resulting file is consumed by assets/map.js — keys are CDEK cityCodes,
// values are compact arrays [code, address, workTime, phone, lng, lat].

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'assets', 'pvz.json');
const URL = 'https://integration.cdek.ru/pvzlist/v1/json';

console.log('Fetching', URL);
const res = await fetch(URL, { signal: AbortSignal.timeout(180_000) });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const json = await res.json();
const pvz = json.pvz || [];
console.log('Received', pvz.length, 'points');

const filtered = pvz.filter(
    (p) =>
        p.status === 'ACTIVE' &&
        p.countryCodeIso === 'RU' &&
        p.coordX &&
        p.coordY &&
        p.cityCode,
);
console.log('After filter (ACTIVE, RU, has coords):', filtered.length);

const byCity = {};
for (const p of filtered) {
    const key = String(p.cityCode);
    if (!byCity[key]) byCity[key] = [];
    byCity[key].push([
        p.code,
        p.address || '',
        p.workTime || '',
        p.phone || '',
        Number(p.coordX),
        Number(p.coordY),
    ]);
}

fs.writeFileSync(OUT, JSON.stringify(byCity), 'utf8');
const bytes = fs.statSync(OUT).size;
console.log(`Wrote ${path.relative(ROOT, OUT)} (${bytes} bytes, ${Object.keys(byCity).length} cities)`);
