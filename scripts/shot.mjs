#!/usr/bin/env node
// Screenshot a public web page for use in videos (story `shot` scenes).
//   node scripts/shot.mjs <url> <out.png> [--mobile] [--w 1100] [--h 1400] [--scroll 0]
// Dismisses common cookie banners, then captures the viewport. Commentary use only; credit the source on screen or in Notes.
import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? Number(process.argv[i + 1]) : d; };
const b = await chromium.launch();
const mobile = process.argv.includes('--mobile');
const p = await b.newPage(mobile
  ? { viewport: { width: 430, height: arg('h', 860) }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' }
  : { viewport: { width: arg('w', 1100), height: arg('h', 1400) }, deviceScaleFactor: 1.5,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36' });
try {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(2500);
  for (const t of ['Do not consent', 'Reject all', 'Reject All', 'Decline', 'Accept all', 'Accept All', 'Accept', 'I agree', 'Got it', 'Close']) {
    const btn = p.getByRole('button', { name: t, exact: false }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); await p.waitForTimeout(600); break; }
  }
  for (const f of p.frames()) {
    const btn = f.getByRole('button', { name: /do not consent|reject all|decline/i }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); await p.waitForTimeout(600); }
  }
  await p.evaluate(() => {
    const vw = innerWidth * innerHeight;
    document.querySelectorAll('body *').forEach((el) => {
      const cs = getComputedStyle(el);
      if ((cs.position === 'fixed' || cs.position === 'sticky') && el.tagName !== 'HEADER') {
        const r = el.getBoundingClientRect();
        if (r.width * r.height > vw * 0.15 || /consent|cookie|privacy/i.test(el.textContent.slice(0, 400))) el.remove();
      }
    });
    document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto';
  }).catch(() => {});
  await p.keyboard.press('Escape').catch(() => {});
  await p.addStyleTag({ content: '[class*="ad-unit"],[class*="advert"],[id*="google_ads"],iframe,[class*="banner"],[class*="promo"],[aria-label*="dvertis"]{display:none!important}' }).catch(() => {});
  await p.waitForTimeout(400);
  if (arg('scroll', 0)) { await p.mouse.wheel(0, arg('scroll', 0)); await p.waitForTimeout(800); }
  await p.screenshot({ path: out });
  console.log('wrote', out);
} finally { await b.close(); }
