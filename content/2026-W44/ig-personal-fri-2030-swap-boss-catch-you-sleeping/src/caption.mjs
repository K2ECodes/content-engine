import { chromium } from '/Users/koredekola/content-engine/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.setContent(`<html><body style="margin:0;background:transparent"><div style="position:absolute;top:330px;width:1080px;text-align:center;font:600 64px/1.25 -apple-system,'Helvetica Neue',Arial,sans-serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.55)">When your boss catch you<br>sleeping 😂😂😂</div></body></html>`);
await p.screenshot({ path: process.argv[2], omitBackground: true }); await b.close();
