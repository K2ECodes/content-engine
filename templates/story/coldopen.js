// Cold open for templates/story (Korede's reference reels, 2026-10-23): the first 1 to 4 s is ONE visual gag that acts
// out the hook line with characters. Brand logos become characters (logo tile body, blinking eyes, limbs, props), sets
// are warm illustrated backdrops, editorial serif title on top, word-by-word captions bottom-middle, smooth GSAP, SFX
// on every action. Everything is seek-safe: one paused timeline, no callbacks.
// data.coldOpen (resolved by render.mjs): { t0, end, title:[l1,l2], titles:[{t,text}], titleColor, set,
//   actors:[{b?|srcUrl?|thing?, props, x, y, scale, text, sub, color, facing, eyes, limbs, n}], beats:[{t, actor, do, say, ...}] }
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ital = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const lum = (hex) => { const h = String(hex || '#888').replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const GROUND = 560;          // floor line inside the 700px stage
  const STAGE_TOP = 520;

  // ---------- sets: clean illustrated backdrops, 1080x700 ----------
  const SKY = (a, b, c) => `<div class="co-sky" style="background:linear-gradient(180deg,${a} 0%,${b} 55%,${c} 100%)"></div>`;
  const PLANKS = (top, a, b, edge) => `<div class="co-floor" style="top:${top}px;background:repeating-linear-gradient(90deg,rgba(70,40,15,.16) 0 2px,transparent 2px 132px),linear-gradient(180deg,${a},${b});box-shadow:inset 0 6px 0 ${edge}"></div>`;
  const SETS = {
    desk: () => `${SKY('#F6E6D0', '#F4CFA2', '#EFB081')}
      <svg class="co-svg" viewBox="0 0 1080 700"><defs><radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1CF"/><stop offset=".6" stop-color="#FFD9A0"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient></defs>
      <circle cx="820" cy="470" r="190" fill="url(#sun)"/><circle cx="820" cy="470" r="92" fill="#FFE3B3"/>
      <path d="M0 500 C120 470 200 486 300 470 S520 440 620 476 S860 456 1080 470 V560 H0Z" fill="#E7B48C" opacity=".75"/>
      <path d="M0 530 C160 512 260 526 420 516 S760 500 1080 520 V560 H0Z" fill="#DDA27A"/>
      <g fill="#7FA35A"><rect x="938" y="470" width="18" height="92" rx="9"/><rect x="918" y="496" width="14" height="40" rx="7"/><rect x="960" y="486" width="14" height="36" rx="7"/></g>
      <g stroke="#9C6B45" stroke-width="7" stroke-linecap="round"><line x1="760" y1="500" x2="1080" y2="500"/><line x1="790" y1="490" x2="790" y2="560"/><line x1="1010" y1="490" x2="1010" y2="560"/></g></svg>
      ${PLANKS(GROUND, '#D9A877', '#B9824F', '#E9C49A')}`,
    stage: () => `<div class="co-sky" style="background:radial-gradient(ellipse 60% 55% at 50% 62%,#FFFFFF 0%,rgba(255,255,255,0) 70%)"></div>
      <div class="co-floor" style="top:${GROUND - 30}px;background:radial-gradient(ellipse 46% 28% at 50% 22%,rgba(60,50,40,.10),rgba(60,50,40,0) 70%)"></div>`,
    graveyard: () => `${SKY('#4A4468', '#9A7896', '#EDB28A')}
      <svg class="co-svg" viewBox="0 0 1080 700"><defs><radialGradient id="moon"><stop offset="0" stop-color="#FFF6DD"/><stop offset=".45" stop-color="#FFF0CC" stop-opacity=".5"/><stop offset="1" stop-color="#FFF0CC" stop-opacity="0"/></radialGradient></defs>
      <circle cx="810" cy="190" r="170" fill="url(#moon)"/><circle cx="810" cy="190" r="70" fill="#FFF3D8"/>
      <path d="M150 560 V380 M150 430 L90 380 M150 410 L210 350 M150 470 L200 440" stroke="#3A3350" stroke-width="16" stroke-linecap="round" fill="none"/>
      <g fill="#5C5372"><path d="M300 560 v-62 a34 34 0 0 1 68 0 v62z"/><path d="M700 560 v-50 a28 28 0 0 1 56 0 v50z"/><path d="M880 560 v-70 a38 38 0 0 1 76 0 v70z"/><rect x="520" y="486" width="14" height="74"/><rect x="503" y="502" width="48" height="12"/></g>
      <g stroke="#3A3350" stroke-width="6"><line x1="0" y1="520" x2="260" y2="520"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${12 + i * 30}" y1="490" x2="${12 + i * 30}" y2="560"/>`).join('')}</g></svg>
      <div class="co-floor" style="top:${GROUND - 8}px;background:linear-gradient(180deg,#6E7D58,#4E5A3E);border-radius:50% 50% 0 0/26px 26px 0 0;box-shadow:inset 0 5px 0 #84946B"></div>
      <div class="co-fog"></div>`,
    warehouse: () => `${SKY('#F4ECDF', '#EFE3D0', '#E8D8C0')}
      <svg class="co-svg" viewBox="0 0 1080 700">
      ${[40, 560].map((x0) => `<g><rect x="${x0}" y="150" width="14" height="410" fill="#3E5C7E"/><rect x="${x0 + 466}" y="150" width="14" height="410" fill="#3E5C7E"/>
        ${[290, 430].map((y) => `<rect x="${x0}" y="${y}" width="480" height="16" fill="#E0762E"/>`).join('')}
        ${[0, 1, 2, 3].map((k) => `<g transform="translate(${x0 + 26 + k * 112},${206})"><rect width="96" height="84" rx="4" fill="#C99A62"/><rect x="40" width="16" height="84" fill="#DDB580"/></g><g transform="translate(${x0 + 26 + k * 112},${352})"><rect width="${k === 2 ? 0 : 96}" height="78" rx="4" fill="#BF8F58"/><rect x="40" width="${k === 2 ? 0 : 16}" height="78" fill="#D7AE78"/></g>`).join('')}</g>`).join('')}
      ${[270, 810].map((x) => `<g><line x1="${x}" y1="0" x2="${x}" y2="60" stroke="#2C2C2C" stroke-width="4"/><path d="M${x - 46} 96 L${x - 22} 60 H${x + 22} L${x + 46} 96Z" fill="#2C2C2C"/><path d="M${x - 46} 96 L${x - 150} 400 H${x + 150} L${x + 46} 96Z" fill="#FFF4D6" opacity=".35"/></g>`).join('')}</svg>
      <div class="co-floor" style="top:${GROUND}px;background:linear-gradient(180deg,#D5CCBD,#B9AE9C);box-shadow:inset 0 5px 0 #E2DACD"></div>
      <div class="co-floor" style="top:${GROUND + 70}px;height:14px;bottom:auto;background:repeating-linear-gradient(90deg,#F2C230 0 60px,#2C2C2C 60px 90px)"></div>`,
    office: () => `${SKY('#F5EADB', '#F1E2CD', '#EAD6BC')}
      <svg class="co-svg" viewBox="0 0 1080 700"><rect x="600" y="110" width="360" height="300" rx="10" fill="#F7C99A"/><rect x="600" y="110" width="360" height="300" rx="10" fill="url(#dusk)"/>
      <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DB6D8"/><stop offset="1" stop-color="#F6C99B"/></linearGradient></defs>
      <g fill="#8E8CA8">${[[620, 300], [660, 250], [720, 280], [770, 220], [830, 270], [880, 240], [920, 300]].map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="${410 - y}"/>`).join('')}</g>
      <rect x="600" y="110" width="360" height="300" rx="10" fill="none" stroke="#FFFFFF" stroke-width="14"/><line x1="780" y1="110" x2="780" y2="410" stroke="#FFF" stroke-width="10"/>
      <circle cx="260" cy="200" r="52" fill="#FFF" stroke="#3B3B3B" stroke-width="8"/><path d="M260 200 V168 M260 200 L284 214" stroke="#3B3B3B" stroke-width="7" stroke-linecap="round"/>
      <g><path d="M78 560 l12 -86 h72 l12 86z" fill="#D8835A"/><path d="M126 476 C90 420 60 400 50 360 C96 380 116 410 126 476 C130 400 150 360 186 340 C176 400 150 430 126 476" fill="#6E9B5E"/></g></svg>
      ${PLANKS(GROUND, '#D2AA7E', '#B78C60', '#E2C29C')}`,
    store: () => `${SKY('#F6EEE1', '#F2E6D3', '#EDDDC5')}
      <svg class="co-svg" viewBox="0 0 1080 700">${[200, 360].map((y, r) => `<rect x="40" y="${y + 120}" width="1000" height="16" rx="4" fill="#B98B5E"/>
        ${Array.from({ length: 11 }, (_, k) => (r === 1 && (k === 4 || k === 5)) ? '' : `<rect x="${60 + k * 88}" y="${y + 40 + (k % 3) * 8}" width="70" height="${80 - (k % 3) * 8}" rx="6" fill="${['#E9C46A', '#F4A261', '#8AB17D', '#7FA7D6', '#E78F8E'][(k + r * 2) % 5]}"/><rect x="${60 + k * 88 + 14}" y="${y + 66}" width="42" height="16" rx="3" fill="#FFF" opacity=".75"/>`).join('')}`).join('')}
      <rect x="400" y="530" width="110" height="24" rx="4" fill="#fff"/><text x="455" y="548" font-family="Inter" font-weight="800" font-size="16" text-anchor="middle" fill="#C0392B">SOLD OUT</text></svg>
      <div class="co-floor" style="top:${GROUND}px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 2px,transparent 2px 90px),linear-gradient(180deg,#E9E0D2,#D3C7B4);box-shadow:inset 0 5px 0 #F3ECE1"></div>`,
    sky: () => `${SKY('#BFDDF2', '#E4ECF0', '#F6E6D2')}
      <svg class="co-svg" viewBox="0 0 1080 700"><g fill="#FFFFFF" opacity=".9"><ellipse cx="180" cy="160" rx="110" ry="34"/><ellipse cx="230" cy="138" rx="60" ry="40"/><ellipse cx="880" cy="250" rx="130" ry="36"/><ellipse cx="830" cy="226" rx="66" ry="42"/></g>
      <path d="M0 540 C200 500 360 520 540 510 S900 490 1080 520 V700 H0Z" fill="#B6D19C"/></svg>
      <div class="co-floor" style="top:${GROUND}px;background:linear-gradient(180deg,#A8C98C,#8DB074);box-shadow:inset 0 5px 0 #C2DBAA"></div>`,
    night: () => `${SKY('#1E2440', '#2C3557', '#3B4468')}
      <svg class="co-svg" viewBox="0 0 1080 700"><rect x="600" y="100" width="360" height="300" rx="10" fill="#141A33" stroke="#4C5680" stroke-width="12"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${620 + (i * 97) % 330}" cy="${120 + (i * 61) % 260}" r="${i % 3 ? 2 : 3}" fill="#FFF" opacity=".8"/>`).join('')}<circle cx="890" cy="170" r="34" fill="#FFF3D8"/>
      <path d="M150 300 l-40 100 h80z" fill="#F2C76B"/><path d="M110 400 L40 560 H260 L190 400Z" fill="#F2C76B" opacity=".12"/><rect x="146" y="300" width="8" height="260" fill="#5B6488"/></svg>
      ${PLANKS(GROUND, '#3F4766', '#2F3550', '#56608A')}`,
  };

  // ---------- art ----------
  const HAT = `<svg viewBox="0 0 240 130"><path d="M64 78 C60 40 78 10 120 10 C162 10 180 40 176 78Z" fill="#7A4A2C"/><path d="M96 14 C110 30 130 30 144 14" stroke="#5E3720" stroke-width="7" fill="none"/>
    <path d="M64 70 C90 80 150 80 176 70 L177 82 C150 92 90 92 63 82Z" fill="#3E2618"/><rect x="112" y="72" width="16" height="13" rx="2" fill="#E8B84B"/>
    <path d="M6 70 C30 104 78 104 120 100 C162 104 210 104 234 70 C222 96 190 118 120 116 C50 118 18 96 6 70Z" fill="#8B5734"/></svg>`;
  const CHAIR = `<svg viewBox="0 0 280 300"><g fill="none" stroke-linecap="round"><path d="M10 268 C80 300 200 300 272 262" stroke="#6B3F22" stroke-width="16"/>
    <path d="M70 280 L76 196 M200 282 L196 196" stroke="#7A4A2C" stroke-width="14"/><path d="M40 196 H236" stroke="#8B5734" stroke-width="22"/>
    <path d="M206 196 L238 20 M244 196 L262 30" stroke="#7A4A2C" stroke-width="14"/>${[60, 100, 140].map((y) => `<path d="M${228 - y * 0.02} ${y} L${258 - y * 0.02} ${y + 4}" stroke="#8B5734" stroke-width="10"/>`).join('')}
    <path d="M30 150 C30 130 50 128 60 140 L62 196" stroke="#7A4A2C" stroke-width="12"/></g></svg>`;
  const CRATE = `<svg viewBox="0 0 120 100"><rect x="2" y="2" width="116" height="96" rx="6" fill="#D2A26B" stroke="#9C6B45" stroke-width="5"/><path d="M8 10 L112 90 M8 50 H112" stroke="#9C6B45" stroke-width="6"/></svg>`;
  const pathLogo = (b, filt) => b ? `<img class="lg" src="${b.logoUrl}" style="filter:${filt}">` : '';
  const monoFilter = (b) => lum(b.fg) > 0.5 ? 'brightness(0) invert(1)' : 'brightness(0)';
  const THINGS = {
    box: { w: 200, h: 170, eyes: [100, 64], art: (a) => `<svg viewBox="0 0 200 170"><rect x="4" y="22" width="192" height="146" rx="10" fill="#C99A62"/><path d="M4 22 L30 4 H170 L196 22Z" fill="#DDB27A"/><rect x="84" y="4" width="32" height="164" fill="#E8C793" opacity=".9"/><rect x="4" y="150" width="192" height="18" rx="8" fill="#000" opacity=".08"/></svg>${a.b ? `<div class="sticker" style="background:${a.b.bg}">${pathLogo(a.b, monoFilter(a.b))}</div>` : ''}` },
    invoice: { w: 170, h: 220, eyes: [85, 66], art: (a) => `<div class="paper"><b>INVOICE</b><i></i><i></i><i style="width:60%"></i><div class="tot"><span>Total</span><span>${esc(a.text || '$0')}</span></div></div>` },
    bag: { w: 180, h: 200, eyes: [90, 104], art: (a) => `<svg viewBox="0 0 180 200"><path d="M62 40 C50 20 60 6 90 6 C120 6 130 20 118 40Z" fill="#C9A46A"/><rect x="58" y="38" width="64" height="14" rx="7" fill="#8B6A3A"/><path d="M60 50 C10 80 4 196 90 196 C176 196 170 80 120 50Z" fill="#D8B47A"/></svg><span class="bagt">${esc(a.text || '$')}</span>` },
    tombstone: { w: 230, h: 280, art: (a) => `<div class="stone"><span class="rip">RIP</span>${a.b ? pathLogo(a.b, 'brightness(0) opacity(.55)') : ''}<b>${esc(a.text || '')}</b><small>${esc(a.sub || '')}</small></div>` },
    key: { w: 240, h: 120, eyes: [62, 58], art: () => `<svg viewBox="0 0 240 120"><circle cx="62" cy="60" r="54" fill="#E8B84B"/><circle cx="62" cy="60" r="54" fill="none" stroke="#C99A3C" stroke-width="6"/><rect x="108" y="48" width="126" height="24" rx="8" fill="#E8B84B"/><rect x="186" y="66" width="16" height="30" rx="4" fill="#E8B84B"/><rect x="214" y="66" width="16" height="22" rx="4" fill="#E8B84B"/></svg>` },
    laptop: { w: 260, h: 180, eyes: [130, 62], art: (a) => `<div class="lap"><div class="scr" style="background:${a.color || '#FFFFFF'}">${a.b ? pathLogo(a.b, 'none') : ''}</div><div class="kb"></div></div>` },
    cloud: { w: 300, h: 180, eyes: [150, 66], art: (a) => `<svg viewBox="0 0 300 180"><g fill="#FFFFFF"><ellipse cx="150" cy="120" rx="140" ry="56"/><circle cx="105" cy="88" r="56"/><circle cx="180" cy="74" r="66"/></g><ellipse cx="150" cy="160" rx="120" ry="14" fill="#000" opacity=".05"/></svg>${a.b ? `<div class="clogo">${pathLogo(a.b, 'none')}</div>` : ''}` },
    bot: { w: 170, h: 190, eyes: [85, 100], art: (a) => `<svg viewBox="0 0 170 190"><line x1="85" y1="8" x2="85" y2="40" stroke="#2C2C2C" stroke-width="7"/><circle cx="85" cy="10" r="10" fill="${a.color || '#E8B84B'}"/><rect x="8" y="38" width="154" height="148" rx="40" fill="${a.color || '#E8B84B'}"/><rect x="28" y="66" width="114" height="76" rx="26" fill="#1F2433"/></svg>` },
    person: { w: 130, h: 230, eyes: [65, 64], art: (a) => `<svg viewBox="0 0 130 230"><rect x="10" y="118" width="110" height="112" rx="40" fill="${a.color || '#5E8E3E'}"/><circle cx="65" cy="66" r="54" fill="${a.skin || '#F0C7A3'}"/><path d="M12 62 C12 18 118 18 118 62 C104 34 30 34 12 62Z" fill="${a.hair || '#3B2A20'}"/></svg>` },
    ghost: { w: 200, h: 240, eyes: [100, 80], art: (a) => `<svg viewBox="0 0 200 240"><path d="M10 230 V100 C10 40 50 6 100 6 C150 6 190 40 190 100 V230 L160 206 L130 232 L100 206 L70 232 L40 206Z" fill="#FBFAF7"/><path d="M190 100 V230 L160 206" fill="#000" opacity=".05"/></svg>${a.text ? `<div class="gtxt">${esc(a.text)}</div>` : ''}` },
    button: { w: 220, h: 190, art: (a) => `<svg viewBox="0 0 220 190"><rect x="20" y="96" width="180" height="90" rx="14" fill="#3A3F4B"/><ellipse cx="110" cy="96" rx="80" ry="22" fill="#2A2E37"/><path d="M50 90 C50 40 170 40 170 90Z" fill="#E0452F"/><ellipse cx="110" cy="90" rx="60" ry="16" fill="#F0624A"/></svg><div class="btxt">${esc(a.text || '')}</div>` },
    sign: { w: 250, h: 270, art: (a) => `<svg viewBox="0 0 250 270"><rect x="115" y="90" width="20" height="180" fill="#8B5734"/></svg><div class="board">${esc(a.text || '')}</div>` },
    cart: { w: 230, h: 190, art: () => `<svg viewBox="0 0 230 190"><path d="M8 20 H44 L70 130 H196 L216 52 H54" fill="none" stroke="#3A3F4B" stroke-width="10" stroke-linejoin="round"/><rect x="80" y="64" width="50" height="50" rx="5" fill="#C99A62"/><rect x="136" y="72" width="44" height="42" rx="5" fill="#E9C46A"/><circle cx="86" cy="164" r="16" fill="#3A3F4B"/><circle cx="180" cy="164" r="16" fill="#3A3F4B"/></svg>` },
    phone: { w: 120, h: 220, eyes: [60, 80], art: () => `<svg viewBox="0 0 120 220"><rect x="4" y="4" width="112" height="212" rx="22" fill="#24272F"/><rect x="12" y="20" width="96" height="176" rx="12" fill="#F4F1EC"/></svg>` },
    card: { w: 220, h: 140, art: (a) => `<svg viewBox="0 0 220 140"><rect x="2" y="2" width="216" height="136" rx="16" fill="${a.color || '#2C3E50'}"/><rect x="2" y="30" width="216" height="24" fill="#111" opacity=".5"/><rect x="20" y="78" width="40" height="30" rx="5" fill="#E8B84B"/></svg>` },
    crowd: { w: 0, h: 150, art: () => '' },
  };
  const PERSON_COLORS = ['#5E8E3E', '#D97757', '#3E6FB0', '#E8B84B', '#8E75B2', '#C0392B'];
  const SKINS = ['#F0C7A3', '#C68B5E', '#8D5A3B', '#F3D2B5', '#A86B45'];
  const HAIRS = ['#3B2A20', '#1E1A18', '#8A5A2B', '#2B2B2B', '#C49A5A'];
  const EYES = '<div class="eyes"><i><b></b></i><i><b></b></i></div><div class="lids"><i></i><i></i></div><div class="xeyes"><i>×</i><i>×</i></div>';
  const HELD = {
    coffee: '<svg viewBox="0 0 60 60"><rect x="6" y="14" width="38" height="42" rx="6" fill="#FFF"/><rect x="6" y="14" width="38" height="12" fill="#C98A3C"/><path d="M44 24 C58 24 58 44 44 44" stroke="#FFF" stroke-width="6" fill="none"/></svg>',
    phone: '<svg viewBox="0 0 50 86"><rect x="2" y="2" width="46" height="82" rx="10" fill="#24272F"/><rect x="7" y="10" width="36" height="66" rx="5" fill="#9FD2FF"/></svg>',
    card: '<svg viewBox="0 0 80 52"><rect x="1" y="1" width="78" height="50" rx="7" fill="#2C3E50"/><rect x="1" y="12" width="78" height="9" fill="#111" opacity=".5"/><rect x="8" y="28" width="16" height="12" rx="2" fill="#E8B84B"/></svg>',
    suitcase: '<svg viewBox="0 0 90 80"><path d="M32 14 V6 H58 V14" stroke="#3E2618" stroke-width="6" fill="none"/><rect x="2" y="14" width="86" height="64" rx="10" fill="#B5652F"/><rect x="2" y="38" width="86" height="8" fill="#8B4A1F"/></svg>',
    box: '<svg viewBox="0 0 110 90"><rect x="2" y="12" width="106" height="76" rx="6" fill="#C99A62"/><path d="M2 12 L14 2 H96 L108 12Z" fill="#DDB27A"/><rect x="47" y="2" width="16" height="86" fill="#E8C793"/></svg>',
    gift: '<svg viewBox="0 0 80 80"><rect x="4" y="26" width="72" height="50" rx="6" fill="#E0452F"/><rect x="34" y="26" width="12" height="50" fill="#E8B84B"/><rect x="2" y="18" width="76" height="14" rx="4" fill="#F0624A"/><path d="M40 18 C20 0 14 18 40 18 C66 18 60 0 40 18" stroke="#E8B84B" stroke-width="6" fill="none"/></svg>',
    magnifier: '<svg viewBox="0 0 80 80"><circle cx="30" cy="30" r="22" fill="#CFE8FF" fill-opacity=".6" stroke="#2C2C2C" stroke-width="8"/><path d="M46 46 L74 74" stroke="#2C2C2C" stroke-width="10" stroke-linecap="round"/></svg>',
  };

  function actorHTML(a, i, data) {
    const props = new Set(a.props || []);
    const T = a.thing && THINGS[a.thing];
    const char = !T || a.limbs;                         // brand/sprite characters always get limbs; things only with limbs:true
    let W = 200, H = 300, body;
    const bc = a.b ? a.b.bg : a.color || '#D97757';
    if (a.thing === 'crowd') {
      const n = a.n || 6; W = n * 104; H = 170;
      body = `<div class="crowd">${Array.from({ length: n }, (_, k) => `<div class="mini" id="co${i}m${k}" style="left:${k * 104}px">${a.b ? `<div class="mtile" style="background:${a.b.bg}">${pathLogo(a.b, monoFilter(a.b))}<div class="eyes sm"><i><b></b></i><i><b></b></i></div></div>`
        : THINGS.person.art({ color: PERSON_COLORS[k % 6], skin: SKINS[k % 5], hair: HAIRS[(k * 2) % 5] })}</div>`).join('')}</div>`;
    } else if (T) {
      W = T.w; H = T.h + (char ? 70 : 0);
      body = `<div class="thing t-${a.thing}" style="width:${T.w}px;height:${T.h}px;${char ? 'bottom:70px' : 'bottom:0'}">${T.art(a)}${T.eyes && a.eyes !== false ? `<div class="face" style="left:${T.eyes[0]}px;top:${T.eyes[1]}px">${EYES}</div>` : ''}</div>`;
    } else if (a.srcUrl) {
      W = 220; H = a.h || 300;
      body = `<img class="sprite" src="${a.srcUrl}" style="height:${H}px">`;
    } else {
      body = `<div class="tile" style="background:${bc}">${pathLogo(a.b, a.b ? monoFilter(a.b) : '')}<div class="face" style="left:90px;top:44px">${EYES}</div></div>`;
    }
    const limbs = char && !a.srcUrl && a.thing !== 'crowd';
    const lc = lum(bc) < 0.18 ? '#4A4A4A' : `color-mix(in srgb, ${bc} 72%, #000)`;
    const held = [...props].filter((p) => HELD[p]).map((p) => `<div class="held h-${p}">${HELD[p]}</div>`).join('');
    const upperH = H - (limbs ? 70 : 0);
    return `<div class="actor${props.has('chair') ? ' sit' : ''}" id="co${i}" style="left:${a.x}px;top:${STAGE_TOP + (a.y ?? GROUND)}px;--bc:${bc};--lc:${lc};z-index:${10 + (a.z ?? i)}">
      <div class="shadow" style="width:${Math.max(120, W * 0.8)}px;margin-left:${-Math.max(120, W * 0.8) / 2}px"></div>
      ${props.has('laptop') ? `<div class="biglap" id="co${i}lap"><div class="lid" id="co${i}lid"><div class="ui"><div class="bar"><i></i><i></i><i></i></div><div class="wk">${a.b ? `<img src="${a.b.logoUrl}">` : ''}<span>${esc(a.screen || 'Working...')}</span></div><p><b class="ok"></b>Read inbox.csv</p><p><b class="ok"></b>Edit orders.ts</p><p><b class="sp"></b>Running tests</p><div class="inp">Type / for commands</div></div></div><div class="base"></div></div>` : ''}
      ${props.has('crate') || props.has('chair') ? `<div class="crate">${CRATE}</div>` : ''}
      ${props.has('tombstone') ? `<div class="pstone">${THINGS.tombstone.art({ b: a.b, text: a.text, sub: a.sub })}</div>` : ''}
      <div class="rock" id="co${i}r">${props.has('chair') ? `<div class="chair" id="co${i}ch">${CHAIR}</div>` : ''}
        <div class="fig" id="co${i}f" style="width:${W}px;height:${H}px;margin-left:${-W / 2}px">
          ${limbs ? `<i class="leg l" id="co${i}ll" style="left:${W / 2 - 34}px"></i><i class="leg r" id="co${i}lr" style="left:${W / 2 + 10}px"></i>` : ''}
          <div class="upper" id="co${i}u" style="height:${upperH}px;bottom:${limbs ? 70 : 0}px">
            <div class="breath" id="co${i}b">
              ${limbs ? `<i class="arm l" id="co${i}al" style="left:${-2}px;top:${upperH * 0.42}px"></i>` : ''}
              ${body.replace('bottom:70px', 'bottom:0')}
              ${limbs ? `<i class="arm r" id="co${i}ar" style="right:${-2}px;top:${upperH * 0.42}px">${held}</i>` : ''}
              ${props.has('cart') ? `<div class="pcart">${THINGS.cart.art()}</div>` : ''}
              ${props.has('hat') ? `<div class="hat" id="co${i}hat">${HAT}</div>` : ''}
              ${props.has('crown') ? `<div class="crown"><svg viewBox="0 0 100 60"><path d="M6 56 L2 12 L28 32 L50 4 L72 32 L98 12 L94 56Z" fill="#E8B84B" stroke="#B8862A" stroke-width="4"/></svg></div>` : ''}
              ${props.has('mask') ? `<div class="mask"></div>` : ''}
              ${props.has('glasses') ? `<div class="glasses"><i></i><i></i></div>` : ''}
              ${props.has('headset') ? `<div class="headset"></div>` : ''}
              ${props.has('sign') ? `<div class="psign" id="co${i}sg"><div class="board">${esc(a.sign || 'ASK FIRST')}</div></div>` : ''}
              ${props.has('sweat') || true ? `<div class="sweat" id="co${i}sw" style="opacity:${props.has('sweat') ? 1 : 0}"><i></i><i></i></div>` : ''}
              <div class="zz" id="co${i}z">${[0, 1, 2, 3, 4, 5].map((k) => `<span id="co${i}z${k}">Z</span>`).join('')}</div>
              <div class="bang" id="co${i}bang">!</div>
            </div>
          </div>
        </div>
      </div>
      <div class="dust" id="co${i}d"><i></i><i></i><i></i><i></i></div>
    </div>`;
  }

  window.ColdOpen = {
    html(data) {
      const C = data.coldOpen;
      const set = (SETS[C.set] || SETS.stage)();
      const titles = C.titles?.length ? C.titles : [{ t: 0, text: C.title || [] }];
      const tsz = (s) => Math.round(Math.min(124, 980 / Math.max(4, String(s).replace(/\*/g, '').length * 0.44)));
      const words = data.words.map((w, i) => ({ ...w, i })).filter((w) => w.start < C.end - 0.02);
      const keys = new Set([...(data.keys || []), ...(C.accent || [])].map((k) => k.toLowerCase().replace(/[^\w$€.%+]/g, '').replace(/\.$/, '')));
      const clean = (w) => w.toLowerCase().replace(/[^\w$€.%+]/g, '').replace(/\.$/, '');
      const chunks = []; let cur = [];
      words.forEach((w) => { cur.push(w); if (/[.?!,;:]$/.test(w.w) || cur.length >= 4) { chunks.push(cur); cur = []; } });
      if (cur.length) chunks.push(cur);
      C._chunks = chunks;
      const bubbles = C.beats.map((b, k) => b.say ? `<div class="bubble" id="cob${k}">${esc(b.say)}</div>` : '').join('');
      return `<div class="co" id="co" style="--acc:${C.titleColor}">
        <div class="co-stage" id="costage">${set}<div class="co-cast">${C.actors.map((a, i) => actorHTML(a, i, data)).join('')}</div>${bubbles}
          <div class="chips" id="cochips">${Array.from({ length: 10 }, (_, k) => `<div class="chip" id="coc${k}"></div>`).join('')}</div>
          <div class="confetti" id="coconf">${Array.from({ length: 18 }, (_, k) => `<i id="cof${k}" style="background:${[C.titleColor, '#E8B84B', '#FFFFFF', '#2B2B2B'][k % 4]}"></i>`).join('')}</div></div>
        <div class="co-title">${titles.map((tt, k) => `<div class="tset" id="cot${k}">${(tt.text || []).map((l, j) => `<div class="tl${j ? ' l2' : ''}" style="font-size:${tsz(l) * (j ? 1.08 : 1)}px">${ital(l)}</div>`).join('')}</div>`).join('')}</div>
        <div class="co-caps">${chunks.map((ch, k) => `<div class="cl" id="cocl${k}">${ch.map((w) => `<span class="${keys.has(clean(w.w)) ? 'acc' : ''}" id="cow${w.i}">${esc(w.w)}</span>`).join(' ')}</div>`).join('')}</div>
      </div>`;
    },

    build(tl, data) {
      const C = data.coldOpen, END = C.end, sfx = (t, kind, vol) => window.sfx.push({ t: Math.max(0, t), kind, vol: vol ?? 0.16, co: true });
      const $ = (id) => document.getElementById(id);
      const A = C.actors;
      // ---- title(s): soft blur-rise in, crossfade on change
      const titles = C.titles?.length ? C.titles : [{ t: 0 }];
      titles.forEach((tt, k) => {
        const el = $('cot' + k), t0 = k === 0 ? 0.02 : tt.t, t1 = titles[k + 1]?.t ?? END + 1;
        tl.set(el, { opacity: 0 }, 0);
        tl.fromTo(el.children, { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.42, stagger: 0.09, ease: 'power3.out', immediateRender: false }, t0);
        tl.set(el, { opacity: 1 }, t0);
        if (titles[k + 1]) tl.to(el, { opacity: 0, filter: 'blur(8px)', duration: 0.22 }, t1 - 0.04);
      });
      // ---- captions: phrase by phrase, word by word
      C._chunks.forEach((ch, k) => {
        const el = $('cocl' + k), t0 = ch[0].start - 0.03, t1 = C._chunks[k + 1] ? C._chunks[k + 1][0].start - 0.04 : END;
        tl.set(el, { opacity: 0 }, 0).set(el, { opacity: 1 }, t0).set(el, { opacity: 0 }, t1);
        ch.forEach((w) => tl.fromTo('#cow' + w.i, { opacity: 0, y: 14, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.16, ease: 'power2.out', immediateRender: false }, Math.max(0, w.start - 0.03)));
      });

      // ---- actors: initial state, idle life
      const firstBeat = (i) => C.beats.find((b) => b.actor === i);
      const ENTER = new Set(['run-in', 'drop', 'rise', 'pop-in', 'sneak']);
      A.forEach((a, i) => {
        const root = $('co' + i), f = $('co' + i + 'f');
        tl.set(root, { scale: a.scale ?? 1, transformOrigin: '0 0' }, 0);
        if (a.flip) tl.set(f, { scaleX: -1 }, 0);
        const fb = firstBeat(i);
        if (fb && ENTER.has(fb.do)) tl.set(root, { opacity: 0 }, 0);
        if (a.hidden) tl.set(root, { opacity: 0 }, 0);
        // breathing + blinking
        const br = $('co' + i + 'b');
        tl.fromTo(br, { scaleY: 1 }, { scaleY: 1.025, scaleX: 0.99, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(END / 0.7) + 2, transformOrigin: '50% 100%' }, 0.05 * i);
        for (let t = 0.9 + i * 0.37; t < END + 1; t += 2.1 + (i % 3) * 0.35) tl.to(root.querySelectorAll('.eyes'), { scaleY: 0.08, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t);
      });

      // ---- beats
      const next = (k) => { const b = C.beats[k]; const n = C.beats.slice(k + 1).find((x) => x.actor === b.actor); return n ? n.t : END + 0.6; };
      const sleeping = {};
      const wake = (i, t) => { if (!sleeping[i]) return; sleeping[i] = false; const r = $('co' + i); tl.set(r.querySelectorAll('.lids'), { opacity: 0 }, t).set(r.querySelectorAll('.eyes'), { opacity: 1 }, t).to($('co' + i + 'z'), { opacity: 0, duration: 0.1 }, t); };
      const dirOf = (a, b) => b.dir === 'left' ? -1 : b.dir === 'right' ? 1 : (a.x > 540 ? -1 : 1);
      let chip = 0, conf = false;
      const walk = (i, t, dur, step = 0.11, amp = 34) => {
        const n = Math.max(2, Math.floor(dur / step));
        const ll = $('co' + i + 'll'), lr = $('co' + i + 'lr');
        if (ll) { tl.to(ll, { rotation: amp, duration: step, yoyo: true, repeat: n - 1, ease: 'sine.inOut' }, t).to(lr, { rotation: -amp, duration: step, yoyo: true, repeat: n - 1, ease: 'sine.inOut' }, t).to([ll, lr], { rotation: 0, duration: 0.08 }, t + n * step); }
        tl.to($('co' + i + 'f'), { y: -14, duration: step, yoyo: true, repeat: n - 1, ease: 'sine.inOut' }, t).to($('co' + i + 'f'), { y: 0, duration: 0.08 }, t + n * step);
      };
      const dust = (i, t) => { const d = $('co' + i + 'd'); tl.fromTo(d.children, { opacity: 0.9, scale: 0.3, x: 0, y: 0 }, { opacity: 0, scale: 1.5, x: (k) => [-90, -40, 40, 90][k], y: (k) => [-20, -46, -46, -20][k], duration: 0.5, ease: 'power2.out', immediateRender: false }, t); };
      const ACT = {
        sleep(i, t, d, b) {
          sleeping[i] = true; const r = $('co' + i), a = A[i];
          tl.set(r.querySelectorAll('.eyes'), { opacity: 0 }, t).set(r.querySelectorAll('.lids'), { opacity: 1 }, t).set($('co' + i + 'z'), { opacity: 1 }, t);
          tl.to($('co' + i + 'u'), { rotation: (a.props || []).includes('chair') ? 8 : -6, duration: 0.5, ease: 'sine.inOut' }, t);
          if ((a.props || []).includes('chair')) tl.fromTo($('co' + i + 'r'), { rotation: -3 }, { rotation: 4, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.ceil(d / 0.9)), transformOrigin: '50% 100%', immediateRender: false }, t);
          for (let k = 0, z = t + 0.1; z < t + d && k < 24; k++, z += 0.55) {
            const el = $(`co${i}z${k % 6}`);
            tl.fromTo(el, { opacity: 0, x: 0, y: 0, scale: 0.5 }, { opacity: 1, x: 30, y: -50, scale: 0.9, duration: 0.45, ease: 'sine.out', immediateRender: false }, z).to(el, { opacity: 0, x: 60, y: -110, scale: 1.2, duration: 0.6, ease: 'sine.in' }, z + 0.45);
          }
          for (let z = t + 0.15; z < t + d - 0.3; z += 1.5) sfx(z, 'snore', 0.22);
        },
        fall(i, t, d, b) {
          const a = A[i], dir = b.dir === 'left' ? -1 : 1, r = $('co' + i + 'r'), f = $('co' + i + 'f'), hat = $('co' + i + 'hat'), ch = $('co' + i + 'ch');
          tl.to(r, { rotation: -6 * dir, duration: 0.12, ease: 'power2.out', transformOrigin: '50% 100%' }, t);
          if (ch) {
            tl.to(r, { rotation: 34 * dir, duration: 0.28, ease: 'power2.in' }, t + 0.12)
              .to(ch, { rotation: 52 * dir, x: 70 * dir, y: -10, duration: 0.3, ease: 'power2.in', transformOrigin: '80% 100%' }, t + 0.4)
              .to(f, { rotation: 62 * dir, x: -40 * dir, y: 10, duration: 0.3, ease: 'power2.in', transformOrigin: '50% 100%' }, t + 0.4)
              .to(f, { rotation: 50 * dir, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, t + 0.7);
            tl.to($('co' + i + 'll'), { rotation: -40, duration: 0.2 }, t + 0.4).to($('co' + i + 'lr'), { rotation: -70, duration: 0.2 }, t + 0.45);
          } else {
            tl.to(f, { rotation: 92 * dir, duration: 0.4, ease: 'power2.in', transformOrigin: '50% 100%' }, t + 0.1)
              .to(f, { rotation: 84 * dir, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, t + 0.5);
            tl.to(r, { rotation: 0, duration: 0.2 }, t + 0.12);
          }
          const impact = t + (ch ? 0.7 : 0.5);
          tl.to($('co' + i + 'al'), { rotation: 150, duration: 0.25 }, t + 0.1).to($('co' + i + 'ar'), { rotation: -150, duration: 0.25 }, t + 0.1);
          if (hat) tl.to(hat, { x: -170 * dir, y: -260, rotation: -260 * dir, duration: 0.45, ease: 'power2.out' }, t + 0.15).to(hat, { y: 140, x: -250 * dir, rotation: -350 * dir, duration: 0.4, ease: 'bounce.out' }, t + 0.6);
          const rr = $('co' + i);
          tl.set(rr.querySelectorAll('.eyes'), { opacity: 0 }, impact).set(rr.querySelectorAll('.lids'), { opacity: 0 }, impact).set(rr.querySelectorAll('.xeyes'), { opacity: 1 }, impact).set($('co' + i + 'z'), { opacity: 0 }, t);
          tl.fromTo('#costage', { y: 0 }, { y: 12, duration: 0.05, yoyo: true, repeat: 3, immediateRender: false }, impact);
          dust(i, impact);
          sfx(t + 0.05, 'whoosh', 0.18); sfx(impact, 'thud', 0.32); if (hat) sfx(t + 0.95, 'tick', 0.12);
        },
        jump(i, t) {
          const f = $('co' + i + 'f');
          tl.to(f, { scaleY: 0.8, scaleX: 1.14, duration: 0.1, ease: 'power2.out', transformOrigin: '50% 100%' }, t)
            .to(f, { y: -210, scaleY: 1.1, scaleX: 0.92, duration: 0.3, ease: 'power2.out' }, t + 0.1)
            .to(f, { y: 0, scaleY: 1.04, scaleX: 0.97, duration: 0.24, ease: 'power2.in' }, t + 0.4)
            .to(f, { scaleY: 0.84, scaleX: 1.12, duration: 0.07 }, t + 0.64)
            .to(f, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1,0.4)' }, t + 0.71);
          sfx(t + 0.08, 'boing', 0.16); sfx(t + 0.64, 'thud', 0.14);
        },
        shake(i, t, d) {
          const f = $('co' + i + 'f');
          tl.to(f, { x: 12, duration: 0.04, yoyo: true, repeat: 11, ease: 'sine.inOut' }, t).to(f, { x: 0, duration: 0.05 }, t + 0.48);
          tl.to($('co' + i + 'sw'), { opacity: 1, duration: 0.1 }, t);
          tl.fromTo($('co' + i + 'sw').children, { y: 0 }, { y: 30, opacity: 0, duration: 0.5, stagger: 0.15, repeat: 1, immediateRender: false }, t + 0.1);
          sfx(t, 'roll', 0.16);
        },
        'run-in'(i, t, d, b) {
          const a = A[i], from = b.from === 'left' ? -1 : b.from === 'right' ? 1 : (a.x > 540 ? 1 : -1), root = $('co' + i), f = $('co' + i + 'f');
          const dur = b.dur ?? 0.6;
          tl.set(root, { opacity: 1 }, t).fromTo(root, { x: from * (from > 0 ? 1300 - a.x : a.x + 260) }, { x: 0, duration: dur, ease: 'power2.out', immediateRender: false }, t);
          tl.fromTo($('co' + i + 'u'), { rotation: -from * 12 }, { rotation: from * 6, duration: dur * 0.85, ease: 'power1.out', immediateRender: false }, t).to($('co' + i + 'u'), { rotation: 0, duration: 0.35, ease: 'elastic.out(1,0.45)' }, t + dur * 0.85);
          walk(i, t, dur * 0.9);
          sfx(t, 'whoosh', 0.16);
        },
        sneak(i, t, d, b) {
          const a = A[i], from = b.from === 'left' ? -1 : b.from === 'right' ? 1 : (a.x > 540 ? 1 : -1), root = $('co' + i);
          const dur = b.dur ?? 1.1;
          tl.set(root, { opacity: 1 }, t).fromTo(root, { x: from * (from > 0 ? 1300 - a.x : a.x + 260) }, { x: 0, duration: dur, ease: 'sine.inOut', immediateRender: false }, t);
          tl.to($('co' + i + 'u'), { rotation: from * 10, scaleY: 0.92, duration: 0.2, transformOrigin: '50% 100%' }, t).to($('co' + i + 'u'), { rotation: 0, scaleY: 1, duration: 0.3 }, t + dur);
          walk(i, t, dur, 0.22, 40);
          for (let k = 0; k < dur / 0.44; k++) sfx(t + k * 0.44, 'tick', 0.06);
        },
        'run-out'(i, t, d, b) {
          const a = A[i], to = b.dir === 'left' ? -1 : b.dir === 'right' ? 1 : (a.x > 540 ? 1 : -1), root = $('co' + i);
          tl.to($('co' + i + 'u'), { rotation: to * 14, duration: 0.15 }, t);
          tl.to(root, { x: to * (to > 0 ? 1350 - a.x : a.x + 300), duration: 0.55, ease: 'power2.in' }, t + 0.08);
          walk(i, t, 0.6, 0.09);
          sfx(t + 0.05, 'whoosh', 0.18);
        },
        spin(i, t) {
          const f = $('co' + i + 'f');
          tl.to(f, { y: -140, duration: 0.25, ease: 'power2.out' }, t).to(f, { rotation: '+=360', duration: 0.5, ease: 'power2.inOut', transformOrigin: '50% 60%' }, t).to(f, { y: 0, duration: 0.25, ease: 'power2.in' }, t + 0.25);
          sfx(t, 'whoosh', 0.16); sfx(t + 0.5, 'tick', 0.1);
        },
        panic(i, t, d) {
          const r = $('co' + i), al = $('co' + i + 'al'), ar = $('co' + i + 'ar'), f = $('co' + i + 'f');
          tl.to(r.querySelectorAll('.eyes'), { scale: 1.45, duration: 0.12, ease: 'back.out(3)' }, t);
          if (al) tl.to(al, { rotation: 155, duration: 0.12 }, t).to(al, { rotation: 135, duration: 0.09, yoyo: true, repeat: 7 }, t + 0.12).to(ar, { rotation: -155, duration: 0.12 }, t).to(ar, { rotation: -135, duration: 0.09, yoyo: true, repeat: 7 }, t + 0.12);
          tl.to(f, { y: -22, duration: 0.09, yoyo: true, repeat: 7, ease: 'sine.inOut' }, t);
          tl.fromTo($('co' + i + 'bang'), { opacity: 0, scale: 0.2, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'back.out(3)', immediateRender: false }, t);
          tl.to($('co' + i + 'sw'), { opacity: 1, duration: 0.1 }, t);
          sfx(t, 'pop', 0.16); sfx(t + 0.05, 'roll', 0.12);
        },
        celebrate(i, t) {
          const al = $('co' + i + 'al'), ar = $('co' + i + 'ar'), f = $('co' + i + 'f');
          if (al) tl.to(al, { rotation: 160, duration: 0.15 }, t).to(ar, { rotation: -160, duration: 0.15 }, t);
          tl.to(f, { y: -90, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 3 }, t);
          if (!conf) { conf = true; const root = $('co' + i), x = A[i].x;
            document.querySelectorAll('#coconf i').forEach((el, k) => { const ang = -Math.PI / 2 + (k / 17 - 0.5) * 2.2, sp = 260 + (k * 53) % 200;
              tl.fromTo(el, { opacity: 1, left: x, top: (A[i].y ?? GROUND) - 260, rotation: 0 }, { left: x + Math.cos(ang) * sp, top: (A[i].y ?? GROUND) - 260 + Math.sin(ang) * sp + 420, rotation: 540, duration: 1.3, ease: 'power1.out', immediateRender: false }, t + 0.05).to(el, { opacity: 0, duration: 0.2 }, t + 1.2); }); }
          sfx(t, 'ding', 0.18); sfx(t + 0.05, 'pop', 0.12);
        },
        squash(i, t) {
          const f = $('co' + i + 'f');
          tl.to(f, { scaleY: 0.68, scaleX: 1.26, duration: 0.12, ease: 'power2.out', transformOrigin: '50% 100%' }, t).to(f, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1.2,0.32)' }, t + 0.12);
          sfx(t, 'boing', 0.18);
        },
        point(i, t, d, b) {
          const dir = dirOf(A[i], b), arm = $('co' + i + (dir > 0 ? 'ar' : 'al'));
          if (arm) tl.to(arm, { rotation: dir > 0 ? -100 : 100, duration: 0.18, ease: 'back.out(2.5)' }, t);
          tl.to($('co' + i + 'u'), { rotation: dir * 7, duration: 0.18, ease: 'power2.out' }, t);
          sfx(t, 'pop', 0.14);
        },
        drop(i, t) {
          const root = $('co' + i), f = $('co' + i + 'f');
          tl.set(root, { opacity: 1 }, t).fromTo(f, { y: -900 }, { y: 0, duration: 0.42, ease: 'power3.in', immediateRender: false }, t)
            .to(f, { scaleY: 0.78, scaleX: 1.18, duration: 0.07, transformOrigin: '50% 100%' }, t + 0.42).to(f, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'elastic.out(1,0.38)' }, t + 0.49);
          dust(i, t + 0.42);
          sfx(t, 'whoosh', 0.12); sfx(t + 0.42, 'thud', 0.28);
        },
        rise(i, t) {
          const root = $('co' + i), f = $('co' + i + 'f');
          tl.set(root, { opacity: 1 }, t).fromTo(f, { y: 320, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', immediateRender: false }, t)
            .to(f, { rotation: 4, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 0.6);
          sfx(t, 'whoosh', 0.2);
        },
        'pop-in'(i, t) {
          const root = $('co' + i);
          tl.set(root, { opacity: 1 }, t).fromTo($('co' + i + 'f'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.4)', transformOrigin: '50% 100%', immediateRender: false }, t);
          sfx(t, 'pop', 0.18);
        },
        grow(i, t, d, b) {
          tl.to($('co' + i + 'f'), { scale: b.to ?? 1.6, duration: 0.45, ease: 'back.out(2)', transformOrigin: '50% 100%' }, t);
          sfx(t, 'boing', 0.16);
        },
        throw(i, t, d, b) {
          const a = A[i], ar = $('co' + i + 'ar'), n = b.n ?? 3;
          const tx = typeof b.to === 'number' ? (A[b.to] ? A[b.to].x : b.to) : 760;
          if (ar) tl.to(ar, { rotation: 50, duration: 0.14 }, t).to(ar, { rotation: -150, duration: 0.12, ease: 'power3.in' }, t + 0.14).to(ar, { rotation: -20, duration: 0.3 }, t + 0.5);
          const B = b.b || a.b;
          for (let k = 0; k < n; k++) {
            const el = $('coc' + (chip++ % 10)), t0 = t + 0.22 + k * 0.12, x1 = tx + (k - (n - 1) / 2) * 70 + (A[b.to]?.thing === 'crowd' ? (k * 104 - (n - 1) * 52) : 0);
            el.innerHTML = b.item && HELD[b.item] ? HELD[b.item] : B ? `<span style="background:${B.bg}"><img src="${B.logoUrl}" style="filter:${monoFilter(B)}"></span>` : '';
            const y0 = (a.y ?? GROUND) - 230 * (a.scale ?? 1), y1 = (A[b.to]?.y ?? GROUND) - 220;
            tl.fromTo(el, { opacity: 1, left: a.x, top: y0, rotation: 0, scale: 0.6 }, { left: x1, rotation: 360, scale: 1, duration: 0.55, ease: 'none', immediateRender: false }, t0)
              .fromTo(el, { y: 0 }, { y: -220, duration: 0.27, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, t0)
              .to(el, { top: y1, duration: 0.55, ease: 'none' }, t0)
              .to(el, { opacity: 0, scale: 0.4, duration: 0.15 }, t0 + 0.62);
            sfx(t0 + 0.55, 'pop', 0.12);
          }
          sfx(t + 0.2, 'whoosh', 0.14);
        },
        close(i, t) {
          const lid = $('co' + i + 'lid');
          if (lid) tl.to(lid, { scaleY: 0.04, duration: 0.26, ease: 'power3.in', transformOrigin: '50% 100%' }, t);
          sfx(t + 0.24, 'thud', 0.22); sfx(t + 0.2, 'click', 0.12);
        },
        type(i, t, d) {
          const al = $('co' + i + 'al'), ar = $('co' + i + 'ar'), n = Math.min(14, Math.floor(Math.min(d, 1.6) / 0.1));
          if (al) tl.to(al, { rotation: -40, duration: 0.1, yoyo: true, repeat: n }, t).to(ar, { rotation: 40, duration: 0.1, yoyo: true, repeat: n }, t + 0.05);
          for (let k = 0; k < n; k += 2) sfx(t + k * 0.1, 'key', 0.1);
        },
        look(i, t, d, b) { tl.to($('co' + i).querySelectorAll('.eyes b'), { x: dirOf(A[i], b) * 6, duration: 0.15 }, t); sfx(t, 'tick', 0.08); },
        wave(i, t) { const ar = $('co' + i + 'ar'); if (ar) tl.to(ar, { rotation: -150, duration: 0.15 }, t).to(ar, { rotation: -120, duration: 0.12, yoyo: true, repeat: 5 }, t + 0.15).to(ar, { rotation: 0, duration: 0.2 }, t + 0.9); sfx(t, 'pop', 0.12); },
        sad(i, t) {
          const r = $('co' + i);
          tl.to($('co' + i + 'u'), { rotation: 4, scaleY: 0.94, duration: 0.4, ease: 'sine.inOut', transformOrigin: '50% 100%' }, t).to(r.querySelectorAll('.eyes'), { scaleY: 0.45, y: 6, duration: 0.3 }, t);
          tl.to([$('co' + i + 'al'), $('co' + i + 'ar')].filter(Boolean), { rotation: 0, duration: 0.3 }, t);
          sfx(t, 'tick', 0.08);
        },
        buzz(i, t) { const h = $('co' + i).querySelectorAll('.held, .thing'); tl.to(h, { rotation: 8, duration: 0.04, yoyo: true, repeat: 9 }, t).to(h, { rotation: 0, duration: 0.04 }, t + 0.4); sfx(t, 'roll', 0.14); },
        raise(i, t) { const s = $('co' + i + 'sg'), ar = $('co' + i + 'ar'); if (s) tl.fromTo(s, { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)', immediateRender: false }, t); if (ar) tl.to(ar, { rotation: -170, duration: 0.2 }, t); sfx(t, 'pop', 0.16); },
        hide(i, t) { tl.to($('co' + i), { opacity: 0, scale: (A[i].scale ?? 1) * 0.6, duration: 0.2 }, t); sfx(t, 'tick', 0.08); },
        say() {},
      };
      // sign held from the start if the prop is there and no raise beat
      A.forEach((a, i) => { if ((a.props || []).includes('sign') && !C.beats.some((b) => b.actor === i && b.do === 'raise')) tl.set($('co' + i + 'ar'), { rotation: -170 }, 0); });
      C.beats.forEach((b, k) => {
        const d = Math.max(0.3, next(k) - b.t);
        if (b.do !== 'sleep') wake(b.actor, b.t);
        (ACT[b.do] || ACT.squash)(b.actor, b.t, d, b);
        if (b.say) {
          const el = $('cob' + k), a = A[b.actor], h = (a.thing && THINGS[a.thing] ? THINGS[a.thing].h : 300) * (a.scale ?? 1);
          el.style.left = `${Math.min(1040, Math.max(40, a.x + (b.bx ?? 0)))}px`; el.style.top = `${(a.y ?? GROUND) - h - 70 + (b.by ?? 0)}px`;
          const nb = C.beats.slice(k + 1).find((x) => x.actor === b.actor && x.say);
          const t1 = Math.min(nb ? nb.t : END, b.t + (b.hold ?? 2.2));
          tl.fromTo(el, { opacity: 0, scale: 0.3, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'back.out(2.6)', immediateRender: false }, b.t + 0.04).to(el, { opacity: 0, scale: 0.8, duration: 0.15 }, Math.max(b.t + 0.4, t1 - 0.05));
          sfx(b.t + 0.04, 'pop', 0.12);
        }
      });

      // ---- exit: the whole gag lifts away and the video proper slides in under it
      const co = $('co');
      tl.set(co, { opacity: 1 }, 0);
      tl.to('#costage', { scale: 0.86, y: -60, opacity: 0, duration: 0.34, ease: 'power3.in', transformOrigin: '50% 30%' }, END - 0.12)
        .to('#co .co-title, #co .co-caps', { y: -40, opacity: 0, filter: 'blur(8px)', duration: 0.26, ease: 'power2.in' }, END - 0.12)
        .to(co, { opacity: 0, duration: 0.22, ease: 'power1.in' }, END + 0.02)
        .set(co, { visibility: 'hidden' }, END + 0.26);
      sfx(END - 0.1, 'whoosh', 0.2);
      return END + 0.1;
    },
  };
})();
