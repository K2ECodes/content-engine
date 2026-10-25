#!/usr/bin/env node
// Upload local files to kie's file host for public URLs (Schedchie upload_media fetches by URL).
//   node scripts/kie-upload-list.mjs <in.json> <out.json>   in: [{file, ...}] -> out: same items + url (skips items that already have url)
import fs from 'node:fs';
import path from 'node:path';
import { upload } from './lib/kie.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [inF, outF] = process.argv.slice(2);
const items = JSON.parse(fs.readFileSync(inF, 'utf8'));
for (const it of items) {
  if (it.url) continue;
  for (let a = 0; a < 3 && !it.url; a++) { try { it.url = await upload(path.resolve(ROOT, it.file), 'trials'); } catch (e) { console.error(it.file, e.message); } }
  fs.writeFileSync(outF, JSON.stringify(items, null, 1));
}
console.log(items.filter((i) => i.url).length, '/', items.length, 'uploaded');
