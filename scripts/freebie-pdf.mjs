// Render a freebie HTML (assets/freebies/src/*.html) to PDF: node scripts/freebie-pdf.mjs <src.html> <out.pdf>
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const [src, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
await p.pdf({ path: out, format: 'Letter', printBackground: true, preferCSSPageSize: true });
await b.close(); console.log('wrote', out);
