// Generates index.html (static markup + SFX track list) for the stop-motion reel.
//   node build.mjs
import fs from 'node:fs';

const D = 30.4;
const B = [0, 2.2, 4.8, 7.68, 10.56, 12.76, 16.32, 18.36, 21.7, 24.5, D]; // scene boundaries (VO + 0.4 s)
const LEAD = 0.12, TAIL = 0.25;
const scene = (i, body, cls) => {
  const start = i === 0 ? 0 : B[i] - LEAD;
  const end = i === B.length - 2 ? D : B[i + 1] + TAIL;
  return `<section id="s${i + 1}" class="scene clip ${cls}" data-start="${start.toFixed(2)}" data-duration="${(end - start).toFixed(2)}" data-track-index="${i + 1}">
  <div class="slide" id="s${i + 1}-slide"><div class="sheet"><div class="rays" id="s${i + 1}-rays"></div><div class="scraps" id="s${i + 1}-scraps"></div></div>
  <div class="stage">${body}</div></div>
</section>`;
};

// one animated cut-out: outer .cut (GSAP-animated), inner .b (boil jitter)
const cut = (id, l, t, w, h, inner, extra = '') =>
  `<div class="cut" id="${id}" style="left:${l}px;top:${t}px;width:${w}px;${h ? `height:${h}px;` : ''}${extra}"><div class="b">${inner}</div></div>`;

const binder = (label, fs = 54) => `<div class="binder"><div class="tabs"><i style="top:14%;background:#9CCAA0"></i><i style="top:34%;background:#FF4F8B"></i><i style="top:54%;background:#3355FF"></i><i style="top:74%;background:#E8B84B"></i></div>
<div class="cover"><div class="spine"><b style="top:16%"></b><b style="top:45%"></b><b style="top:74%"></b></div><div class="label" style="font-size:${fs}px">${label}</div></div></div>`;

const logoTile = (name, c, size = 140) =>
  `<div class="logo" style="--c:${c};width:${size}px;height:${size}px"><img src="assets/logos/${name}.svg" alt="${name}" style="width:${Math.round(size * 0.6)}px;height:${Math.round(size * 0.6)}px"></div>`;

const page = (inner, cls = '') => `<div class="page ${cls}"><span class="tape"></span>${inner}</div>`;

// ---------------- scenes ----------------
const S = [];

// S1: the binder
S.push(scene(0, `
${cut('s1-binder', 250, 400, 560, 690, binder('HOW WE RUN THINGS', 64))}
${cut('s1-note', 690, 270, 240, 220, `<div class="sticky" style="background:#E8B84B"><span class="tape"></span><p class="hand" style="font-size:50px">don't lose this</p></div>`)}
${cut('s1-bulb', 110, 880, 160, 213, `<img src="assets/img/bulb.png" alt="" style="width:160px">`)}
${cut('s1-star1', 150, 300, 90, 90, `<div class="star" style="background:#FF4F8B"></div>`)}
${cut('s1-star2', 820, 980, 70, 70, `<div class="star" style="background:#9CCAA0"></div>`)}
`, 'bg-ink'));

// S2: pages fly out (pack / ship / late order)
const p2 = [
  ['s2-p1', 60, 'package', 'PACK', -8],
  ['s2-p2', 405, 'truck', 'SHIP', 4],
  ['s2-p3', 680, 'alarm-clock', 'LATE ORDER?', 9],
];
S.push(scene(1, `
${cut('s2-binder', 390, 720, 300, 370, binder('HOW WE RUN THINGS', 34))}
${p2.map(([id, l, icon, word]) => cut(id, l, 270, 270, 340, page(`<img class="icon" src="assets/icons/${icon}.svg" alt=""><div class="pword">${word}</div>`))).join('\n')}
`, 'bg-gold'));

// S3: Anthropic hands Agent Skills to the Linux Foundation
S.push(scene(2, `
${cut('s3-anth', 80, 290, 280, 320, `<div class="paper tile"><img src="assets/logos/anthropic.svg" alt="Anthropic" style="width:170px;height:170px"><div class="tlabel">ANTHROPIC</div></div>`)}
${cut('s3-claude', 300, 250, 130, 130, logoTile('claude', '#D97757', 130))}
${cut('s3-note', 700, 270, 220, 190, `<div class="sticky" style="background:#9CCAA0"><span class="tape"></span><p class="hand" style="font-size:60px">Oct 22</p></div>`)}
${cut('s3-folder', 110, 660, 320, 230, `<div class="folder"><span class="ftab"></span><div class="ftext">AGENT SKILLS</div></div>`)}
${cut('s3-box', 540, 640, 380, 360, `<div class="box3"><div class="lid"></div><div class="front"><span>LINUX FOUNDATION</span></div></div>`)}
${cut('s3-stamp', 120, 960, 540, 160, `<div class="stamp" style="font-size:104px">DONATED</div>`)}
`, 'bg-claude'));

// S4: what a skill is
const lines4 = ['1. check the order', '2. pick and pack it', '3. print the label', '4. text the customer'];
S.push(scene(3, `
${cut('s4-page', 120, 300, 700, 760, page(`<div class="ptitle">HOW WE SHIP AN ORDER</div>${lines4.map((l, i) => `<div class="pline hand" id="s4-l${i}">${l}</div>`).join('')}`, 'big'))}
${cut('s4-tag', 600, 240, 320, 120, `<div class="chip" style="background:#E8B84B;font-size:78px;color:#17281C">A SKILL</div>`)}
${cut('s4-glow', 690, 820, 300, 300, `<div class="glow"></div>`)}
${cut('s4-bulb', 760, 860, 180, 240, `<img src="assets/img/bulb.png" alt="" style="width:180px">`)}
${cut('s4-bubble', 600, 720, 230, 120, `<div class="bubble hand">got it</div>`)}
`, 'bg-grid'));

// S5: 70+ tools, pages become logos
const ring = [
  ['claude', '#D97757'], ['openai', '#10A37F'], ['chip:Copilot', '#24292F'], ['chip:Cursor', '#17281C'], ['chip:VS Code', '#007ACC'], ['more', '#E8B84B'],
];
const RC = { x: 540, y: 850, rx: 340, ry: 235 };
const ringPos = ring.map((_, i) => { const a = -Math.PI / 2 + (i / ring.length) * Math.PI * 2; return [Math.round(RC.x + RC.rx * Math.cos(a)), Math.round(RC.y + RC.ry * Math.sin(a))]; });
S.push(scene(4, `
<div class="marquee" id="s5-mq1">${['claude', 'openai', 'anthropic', 'claude', 'openai', 'anthropic', 'claude', 'openai', 'anthropic', 'claude', 'openai', 'anthropic'].map((n) => `<img src="assets/logos/${n}.svg" alt="">`).join('').repeat(2)}</div>
${cut('s5-70', 140, 220, 800, 330, `<div class="mega" style="color:#E8B84B">70+</div>`)}
${cut('s5-binder', 430, 715, 220, 280, binder('HOW WE RUN THINGS', 24))}
${ring.map(([n, c], i) => {
    const [x, y] = ringPos[i];
    const face = n === 'more' ? `<div class="logo more" style="--c:#17281C;width:140px;height:140px;background:#E8B84B"><span>+65</span></div>`
      : n.startsWith('chip:') ? `<div class="logo chipface" style="--c:${c};width:140px;height:140px"><span style="color:${c}">${n.slice(5)}</span></div>` : logoTile(n, c);
    return cut(`s5-pg${i}`, x - 60, y - 75, 120, 150, `<div class="page mini"></div>`) + cut(`s5-lg${i}`, x - 70, y - 70, 140, 140, face);
  }).join('\n')}
`, 'bg-blue'));

// S6: the numbers
S.push(scene(5, `
${cut('s6-c1', 90, 250, 860, 340, `<div class="paper ticket"><div class="num" id="s6-n1">0</div><div class="chip" style="background:#FF4F8B;color:#fff;font-size:58px">SKILLS</div></div>`)}
${cut('s6-c2', 110, 650, 830, 470, `<div class="paper ticket gold"><p class="hand" style="font-size:66px;margin:0">nearly</p><div class="num huge" id="s6-n2">0M</div><div class="chip" style="background:#3355FF;color:#fff;font-size:58px">INSTALLS</div></div>`)}
${Array.from({ length: 10 }, (_, i) => cut(`s6-coin${i}`, 500, 860, 64, 64, `<img src="assets/img/coin.png" alt="" style="width:64px">`)).join('\n')}
`, 'bg-ink2'));

// S7: locked to 1 app, then free
S.push(scene(6, `
${cut('s7-binder', 300, 330, 480, 600, binder('HOW WE RUN THINGS', 56))}
${cut('s7-app', 70, 930, 260, 190, `<div class="appwin"><div class="dots"><i></i><i></i><i></i></div><div class="appt">1 APP</div></div>`)}
${cut('s7-tape1', -10, 580, 1100, 96, `<div class="caution">LOCKED · LOCKED · LOCKED · LOCKED · LOCKED</div>`)}
${cut('s7-tape2', -10, 580, 1100, 96, `<div class="caution">LOCKED · LOCKED · LOCKED · LOCKED · LOCKED</div>`)}
${cut('s7-lock', 430, 480, 220, 280, `<div class="padlock"><div class="shackle" id="s7-shackle"></div><div class="lbody"><span class="kh"></span></div></div>`)}
`, 'bg-pink'));

// S8: write once, runs in Claude / ChatGPT / Copilot
const cards8 = [['claude', '#D97757', 'CLAUDE'], ['openai', '#10A37F', 'CHATGPT'], ['chip:Copilot', '#24292F', 'COPILOT']];
S.push(scene(7, `
<div class="marquee dark" id="s8-mq1">${['claude', 'openai', 'anthropic', 'claude', 'openai', 'anthropic', 'claude', 'openai', 'anthropic'].map((n) => `<img src="assets/logos/${n}.svg" alt="">`).join('').repeat(2)}</div>
${cut('s8-page', 330, 250, 420, 300, page(`<div class="ptitle" style="font-size:40px">HOW WE SHIP AN ORDER</div><div class="pline hand" style="font-size:40px">1. check the order</div><div class="pline hand" style="font-size:40px">2. pick and pack it</div>`, 'mid'))}
<svg class="arrows" viewBox="0 0 1080 1920" width="1080" height="1920">${[[470, 580, 270, 700], [540, 580, 540, 700], [610, 580, 810, 700]].map(([x1, y1, x2, y2], i) => `<path id="s8-ar${i}" d="M${x1} ${y1} Q ${(x1 + x2) / 2 + (i - 1) * 20} ${y1 + 80} ${x2} ${y2}" />`).join('')}</svg>
${cards8.map(([n, c, label], i) => cut(`s8-card${i}`, 150 + i * 270, 720, 240, 320, `<div class="bcard" style="background:${c}">${n.startsWith('chip:') ? `<div class="logo chipface" style="--c:${c};width:150px;height:150px"><span style="color:${c};font-size:64px">&lt;/&gt;</span></div>` : logoTile(n, c, 150)}<div class="blabel">${label}</div></div>`)).join('\n')}
${cards8.map((_, i) => cut(`s8-chk${i}`, 300 + i * 270, 690, 100, 100, `<div class="check"><img src="assets/icons/check.svg" alt=""></div>`)).join('\n')}
`, 'bg-cream'));

// S9: we write those binders
S.push(scene(8, `
${cut('s9-lockup', 140, 250, 800, 170, `<div class="paper lock"><img src="assets/img/lockup-horizontal.png" alt="Content Systems.ai" style="width:720px"></div>`)}
${cut('s9-wh', 70, 520, 410, 470, `<div class="paper scenecard"><div class="boxes"><img src="assets/img/box.png" alt=""><img src="assets/img/box.png" alt=""><img src="assets/img/box.png" alt=""><img src="assets/img/worker.png" alt="" class="who"></div><div class="chip" style="background:#17281C;color:#F5F0E8;font-size:54px">WAREHOUSES</div></div>`)}
${cut('s9-st', 520, 560, 410, 470, `<div class="paper scenecard"><div class="boxes"><img src="assets/img/laptop.png" alt=""><img src="assets/icons/shopping-cart.svg" alt="" class="cart"><img src="assets/img/shopper.png" alt="" class="who"></div><div class="chip" style="background:#C98A3C;color:#17281C;font-size:54px">ONLINE STORES</div></div>`)}
${cut('s9-b1', 340, 470, 150, 190, binder('', 10))}
${cut('s9-b2', 800, 500, 150, 190, binder('', 10))}
`, 'bg-sage'));

// S10: CTA
const letters = 'SYSTEMS'.split('');
const lc = ['#C98A3C', '#E8B84B', '#9CCAA0', '#FF4F8B', '#3355FF', '#F5F0E8', '#D97757'];
S.push(scene(9, `
${cut('s10-comment', 140, 240, 800, 140, `<div class="mega" style="font-size:130px;color:#F5F0E8">COMMENT</div>`)}
${letters.map((ch, i) => cut(`s10-l${i}`, 137 + i * 116, 400, 110, 170, `<div class="letter" style="background:${lc[i]};color:${i === 4 ? '#F5F0E8' : '#17281C'}">${ch}</div>`)).join('\n')}
${cut('s10-bubble', 120, 620, 800, 160, `<div class="igc"><span class="ava"></span><div><div class="who2">you</div><div class="said" id="s10-said">SYSTEMS</div></div><img src="assets/icons/heart.svg" alt="" class="heart"></div>`)}
${cut('s10-sheet', 150, 830, 340, 320, page(`<div class="ptitle" style="font-size:44px">FREE SHEET</div><div class="pline hand" style="font-size:38px">5 skills we install first</div><div class="pline hand" style="font-size:38px">+ the approval sheet</div>`, 'mid'))}
${cut('s10-free', 380, 800, 220, 100, `<div class="stamp small" style="font-size:64px">FREE</div>`)}
<div id="s10-confetti" style="position:absolute;inset:0"></div>
${cut('s10-bulb', 640, 880, 190, 253, `<img src="assets/img/bulb.png" alt="" style="width:190px">`)}
`, 'bg-ink3'));

// ---------------- SFX ----------------
const sfx = [];
const add = (file, t, vol = 0.5) => sfx.push([file, +t.toFixed(3), vol]);
B.slice(1, -1).forEach((b) => add('whoosh', b - 0.16, 0.32));
add('stamp', 0.28, 0.6); add('pop', 0.9, 0.45); add('pop', 1.32, 0.45); add('rustle', 0.05, 0.35);
add('rustle', 2.22, 0.5); add('pop', 2.42, 0.4); add('flip', 3.0, 0.5); add('pop', 3.12, 0.4); add('flip', 3.7, 0.5); add('pop', 3.82, 0.4);
add('pop', 4.84, 0.45); add('pop', 5.0, 0.35); add('pop', 5.2, 0.35); add('rustle', 5.54, 0.45); add('thud', 6.2, 0.55); add('flip', 6.82, 0.5); add('stamp', 7.12, 0.6);
add('rustle', 7.72, 0.45); add('pop', 7.84, 0.4); [8.3, 8.75, 9.2, 9.6].forEach((t) => add('scratch', t, 0.28)); add('pop', 9.3, 0.4); add('ding', 9.92, 0.35);
add('stamp', 10.62, 0.6); ring.forEach((_, i) => { add('flip', 10.82 + i * 0.125, 0.3); add('pop', 10.98 + i * 0.125, 0.32); });
add('stamp', 12.82, 0.55); add('print', 12.84, 0.3); add('pop', 14.06, 0.4); add('print', 14.26, 0.3); add('stamp', 15.62, 0.55); add('coin', 15.66, 0.4);
add('rustle', 16.38, 0.4); add('thud', 16.84, 0.5); add('thud', 16.98, 0.5); add('stamp', 17.2, 0.6); add('pop', 17.4, 0.4); add('snap', 18.04, 0.6); add('rustle', 18.06, 0.5);
add('rustle', 18.42, 0.4); add('scratch', 18.62, 0.25); add('pop', 19.22, 0.45); add('pop', 19.82, 0.45); add('pop', 20.66, 0.45); [21.0, 21.12, 21.24].forEach((t) => add('thud', t, 0.4));
add('pop', 21.8, 0.45); add('pop', 22.14, 0.35); add('rustle', 22.8, 0.45); add('rustle', 23.72, 0.45); add('pop', 23.9, 0.35);
add('rustle', 24.56, 0.35); letters.forEach((_, i) => add('pop', 24.82 + i * 0.083, 0.3)); add('stamp', 25.4, 0.5); [25.5, 25.58, 25.66, 25.74].forEach((t) => add('tick', t, 0.35)); add('stamp', 26.1, 0.5);
add('powerup', 26.9, 0.3); add('pop', 27.0, 0.35); add('coin', 27.6, 0.35); add('pop', 28.0, 0.4); add('rustle', 28.05, 0.3); add('pop', 29.1, 0.4); add('rustle', 29.15, 0.3);
const sfxLen = { whoosh: 0.35, stamp: 0.4, pop: 0.14, rustle: 0.45, flip: 0.16, thud: 0.2, scratch: 0.32, ding: 0.35, print: 0.28, coin: 0.4, snap: 0.12, tick: 0.05, powerup: 0.6 };
sfx.sort((a, b) => a[1] - b[1]);
const lanes = [];
const sfxHtml = sfx.map(([f, t, v], i) => {
  let lane = lanes.findIndex((end) => end <= t - 0.01);
  if (lane < 0) { lanes.push(0); lane = lanes.length - 1; }
  lanes[lane] = t + sfxLen[f];
  return `<audio id="sfx${i}" src="assets/audio/${f}.wav" data-start="${t}" data-duration="${sfxLen[f]}" data-volume="${v}" data-track-index="${30 + lane}"></audio>`;
}).join('\n    ');

const tpl = fs.readFileSync(new URL('./index.tpl', import.meta.url), 'utf8');
fs.writeFileSync(new URL('../index.html', import.meta.url), tpl
  .replace('<!--SCENES-->', S.join('\n'))
  .replace('<!--SFX-->', sfxHtml)
  .replace('/*RING*/', JSON.stringify(ringPos))
  .replaceAll('__D__', String(D)));
console.log(`index.html written: ${S.length} scenes, ${sfx.length} sfx`);
