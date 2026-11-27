/* ui-reel runtime. window.renderPost(data) builds the DOM + 1 paused GSAP timeline; window.seek(t) renders time t
   deterministically (typing, invader legs, face frames and background drift are pure functions of t).
   window.sfx collects { t, kind, vol } cues that scripts/render.mjs mixes from assets/sfx.
   Schema: .claude/skills/ui-reel/SKILL.md. Every `at` / `<name>At` was resolved by render.mjs to `t` / `<name>T` seconds. */
(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const COLORS = { blue: '#3B7BF6', red: '#E5484D', green: '#1F9D63', yellow: '#F2B53A', purple: '#7C5CF0', teal: '#13A3A0', pink: '#E0457B', orange: '#E8803A', grey: '#2B2943', dark: '#1B1930', white: '#F4F3FA' };
  const I = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>',
    lockS: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>',
    cursor: '<svg viewBox="0 0 32 32"><path d="M6 3 L6 25 L11.5 19.8 L15.2 28 L19 26.3 L15.4 18.4 L23 18.4 Z" fill="#fff" stroke="#14122a" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  };
  const INV = [
    ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
    ['..X.....X..', 'X..X...X..X', 'X.XXXXXXX.X', 'XXX.XXX.XXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..X.....X..', '.X.......X.'],
  ];
  const invSvg = (f, col) => `<svg viewBox="0 0 11 8" shape-rendering="crispEdges">${INV[f].map((r, y) => [...r].map((c, x) => c === 'X' ? `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${col}"/>` : '').join('')).join('')}</svg>`;

  let gid = 0;
  function logoSvg(b, fill) {
    if (!b || !b.svg) return '';
    let s = b.svg.replace(/<title>.*?<\/title>/, '').replace(/\swidth="[^"]*"|\sheight="[^"]*"/g, '');
    const grad = fill === 'gradient' && b.grad ? b.grad : null;
    const f = grad ? `url(#lg${++gid})` : fill === 'brand' ? b.bg : fill || '#fff';
    s = s.replace(/<svg([^>]*?)\sfill="[^"]*"/, '<svg$1').replace(/<svg/, `<svg fill="${f}"`);
    if (grad) s = s.replace(/(<svg[^>]*>)/, `$1<defs><linearGradient id="lg${gid}" x1="0" y1="0" x2="1" y2="1">${grad.map((c, i) => `<stop offset="${i / (grad.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`);
    return s;
  }
  // App icon: { brand } (logo on its brand tile), { icon: lucide, color }, { text, color }, { q: true } (question tile)
  function appIcon(s = {}, size = 84) {
    if (s.q) return `<div class="app q" style="--s:${size}px"><b>?</b></div>`;
    if (s.b) {
      const dark = s.tile === 'dark' || (s.tile !== 'brand' && s.b.grad);
      return `<div class="app" style="--s:${size}px;--c:${dark ? '#1b1930' : s.b.bg}">${logoSvg(s.b, dark ? 'gradient' : '#fff')}${s.dot ? '<i class="dot"></i>' : ''}</div>`;
    }
    const col = s.color === 'accent' ? 'var(--accent)' : COLORS[s.color] || s.color || COLORS.grey;
    const grey = !s.color || s.color === 'grey' || s.color === 'dark';
    return `<div class="app${grey ? ' grey' : ''}" style="--s:${size}px;--c:${col}">${s.iconSvg || (s.text ? `<b>${esc(s.text)}</b>` : '')}${s.dot ? '<i class="dot"></i>' : ''}</div>`;
  }

  // ---------- body blocks (window, phone, card) ----------
  function block(k) {
    const at = k.t !== undefined ? ' data-bt="1"' : '';
    switch (k.k) {
      case 'bar': return `<div class="sk${k.dim ? ' dim' : ''}"${at} style="width:${k.w || '70%'}"></div>`;
      case 'bars': return Array.from({ length: k.n || 3 }, (_, i) => `<div class="sk${k.dim ? ' dim' : ''}" style="width:${[86, 64, 74, 52, 68][i % 5]}%"></div>`).join('');
      case 'text': return `<div class="tx${k.mute ? ' mute' : ''}${k.big ? ' big' : ''}"${at}${k.type ? ` data-type="${esc(k.text)}"` : ''} style="${k.size ? `font-size:${k.size}px;` : ''}${k.color === 'accent' ? 'color:var(--accent);' : ''}">${k.type ? '' : esc(k.text)}</div>`;
      case 'row': return `<div class="row${k.hi ? ' hi' : ''}"${at}${k.doneT !== undefined ? ' data-done="1"' : ''}>${k.check ? `<div class="ck">${I.check}</div>` : ''}${k.b || k.iconSvg || k.color || k.text ? appIcon(k, 52) : ''}<div class="lb"><b>${esc(k.label)}</b>${k.sub ? `<small>${esc(k.sub)}</small>` : ''}</div>${k.toggle ? '<div class="tg"><i></i></div>' : ''}${k.value ? `<div class="val">${esc(k.value)}</div>` : ''}</div>`;
      case 'bubble': return k.ai ? `<div class="bub ai"${at}>${appIcon(k, 34)}<div class="tx mute" style="font-size:21px">${esc(k.text)}</div></div>` : `<div class="bub me"${at}>${esc(k.text)}</div>`;
      case 'chart': return `<div class="chart"${at}><svg viewBox="0 0 400 120" preserveAspectRatio="none"><polyline points="${(k.pts || [90, 80, 86, 60, 66, 40, 48, 22]).map((v, i, a) => `${(i / (a.length - 1)) * 400},${v}`).join(' ')}" fill="none" stroke="${k.accent === false ? 'var(--sk)' : 'var(--accent)'}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div>`;
      case 'img': return `<div class="blk-img"${at}><img src="${esc(k.srcUrl)}"></div>`;
      case 'btn': return `<div class="btn${k.ghost ? ' ghost' : ''}"${at}>${esc(k.label)}</div>`;
      case 'btns': return `<div class="btns"${at}>${(k.items || []).map((b, i) => `<div class="btn${i < (k.items.length - 1) ? ' ghost' : ''}">${esc(b)}</div>`).join('')}</div>`;
      case 'input': return `<div class="input"${at}>${esc(k.text || 'Reply...')}</div>`;
      case 'gap': return `<div style="height:${k.h || 12}px"></div>`;
      case 'notif': return `<div class="notif"${at}>${appIcon(k, 58)}<div class="nb"><b>${esc(k.title)}</b><span>${esc(k.body || '')}</span></div><em>${esc(k.time || 'now')}</em></div>`;
      default: return '';
    }
  }
  const blocks = (arr) => (arr || []).map(block).join('');
  function animBlocks(tl, root, arr, t0, sfxOn = true) {
    const els = [...root.children];
    (arr || []).forEach((k, i) => {
      const el = els[i]; if (!el) return;
      if (k.t !== undefined) {
        tl.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', immediateRender: false }, k.t);
        if (sfxOn) window.sfx.push({ t: k.t, kind: k.k === 'notif' ? 'notify' : 'pop', vol: k.k === 'notif' ? 0.06 : 0.045 });
        gsap.set(el, { opacity: 0 });
      }
      if (k.k === 'text' && k.type) typer(el, k.type === true ? k.text : k.type, k.typeT ?? k.t ?? t0, k.cps || 22);
      if (k.k === 'chart') tl.to(el.querySelector('polyline'), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, (k.t ?? t0) + 0.15);
      if (k.k === 'row' && k.doneT !== undefined) {
        const ck = el.querySelector('.ck'), tg = el.querySelector('.tg');
        if (ck) tl.to(ck, { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', duration: 0.2 }, k.doneT).to(ck.querySelector('svg'), { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, k.doneT);
        if (tg) tl.to(tg, { backgroundColor: 'var(--accent)', duration: 0.2 }, k.doneT).to(tg.querySelector('i'), { x: 26, backgroundColor: '#fff', duration: 0.25, ease: 'power2.out' }, k.doneT);
        if (k.hiOnDone) tl.to(el, { borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)', boxShadow: '0 0 30px color-mix(in srgb, var(--accent) 22%, transparent)', duration: 0.3 }, k.doneT);
        const v = el.querySelector('.val'); if (v) tl.to(v, { color: 'var(--accent)', duration: 0.2 }, k.doneT);
        window.sfx.push({ t: k.doneT, kind: 'tick', vol: 0.06 });
      }
      if (k.k === 'btn' && k.pressT !== undefined) { tl.to(el, { scale: 0.9, duration: 0.08, yoyo: true, repeat: 1 }, k.pressT); window.sfx.push({ t: k.pressT, kind: 'click', vol: 0.08 }); }
    });
  }

  // ---------- deterministic per-frame work ----------
  const dyn = [];
  function typer(el, text, t0, cps, opts = {}) {
    const caret = '<span class="caret"></span>';
    dyn.push((t) => {
      const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps)));
      const typing = t >= t0 && (n < text.length || (opts.holdCaret && t < (opts.until ?? 1e9)));
      if (t < t0 && opts.ph) { el.innerHTML = `<span class="ph">${esc(opts.ph)}</span>`; return; }
      const blink = Math.floor(t * 2.4) % 2 === 0;
      el.innerHTML = esc(text.slice(0, n)) + (typing || (opts.caretAfter && blink && t < (opts.until ?? 1e9)) ? caret : '');
    });
    // a soft key click every ~3 chars while typing
    for (let i = 0; i < text.length; i += 3) if (text[i] !== ' ') window.sfx.push({ t: t0 + i / cps, kind: 'key', vol: 0.035 });
  }

  // ---------- components: html(s) and anim(tl, el, s) ----------
  const C = {};
  C.tile = {
    html: (s) => { const sz = s.size || 200; const dark = s.tile === 'dark' || (s.tile !== 'brand' && s.b?.grad);
      return `<div class="tile" style="--s:${sz}px;--tbg:${s.b ? (dark ? '#1b1930' : s.b.bg) : (COLORS[s.color] || 'var(--accent)')}">${s.ring !== false ? '<div class="ring"></div>' : ''}<div class="face">${s.b ? logoSvg(s.b, dark ? 'gradient' : '#fff') : s.iconSvg || ''}</div>${(s.orbit || []).map((o, i) => { const n = s.orbit.length, a = (i / n) * Math.PI * 2 - Math.PI / 2, r = sz * (o.r || 0.98); return `<div class="orb" style="transform:translate(${Math.cos(a) * r - (o.size || sz * 0.32) / 2}px,${Math.sin(a) * r * 1.05 - (o.size || sz * 0.32) / 2}px)">${appIcon(o, o.size || Math.round(sz * 0.32))}</div>`; }).join('')}</div>`; },
    anim: (tl, el, s) => {
      const ring = el.querySelector('.ring'); const rt = s.ringT ?? s.t + 0.35;
      if (ring) { tl.fromTo(ring, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', immediateRender: false }, rt); window.sfx.push({ t: rt, kind: 'whoosh', vol: 0.04 }); }
      el.querySelectorAll('.orb').forEach((o, i) => { const t = (s.orbitT ?? s.t + 0.6) + i * 0.09; tl.fromTo(o, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: true }, t); window.sfx.push({ t, kind: 'pop', vol: 0.04 }); });
      tl.to(el.querySelector('.face'), { y: -8, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 7 }, s.t + 0.5);
    },
  };
  C.window = {
    html: (s) => `<div class="win${s.glow ? ' glow' : ''}" style="--w:${s.w || 760}px;--h:${s.h || 0}px"><div class="bar"><i></i><i></i><i></i>${s.url ? `<div class="url">${I.lockS}${esc(s.url)}</div>` : `<div class="tt">${esc(s.title || '')}</div>`}</div><div class="body">${blocks(s.body)}</div></div>`,
    anim: (tl, el, s) => { animBlocks(tl, el.querySelector('.body'), s.body, s.t + 0.3);
      if (s.glowT !== undefined) { tl.to(el.querySelector('.win'), { boxShadow: '0 30px 80px rgba(0,0,0,.5), 0 0 0 1.5px color-mix(in srgb, var(--accent) 55%, transparent), 0 0 46px color-mix(in srgb, var(--accent) 30%, transparent)', duration: 0.4 }, s.glowT); window.sfx.push({ t: s.glowT, kind: 'chime', vol: 0.05 }); } },
  };
  C.dock = {
    html: (s) => { const sz = s.size || 84; const dock = `<div class="dock">${(s.icons || []).map((ic) => `<div class="slot">${appIcon(ic, sz)}<i class="pip"></i></div>`).join('')}</div>`;
      return s.monitor ? `<div class="monitor" style="--w:${s.w || 820}px"><div class="scr">${s.inner ? `<div class="inner">${C[s.inner.type].html(s.inner)}</div>` : ''}${dock}</div><div class="neck"></div><div class="foot"></div></div>` : dock; },
    anim: (tl, el, s) => {
      const slots = [...el.querySelectorAll('.slot')];
      slots.forEach((sl, i) => { const t = (s.icons[i].t ?? s.t + 0.25 + i * 0.09); tl.fromTo(sl, { opacity: 0, y: 30, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.8)', immediateRender: true }, t); window.sfx.push({ t, kind: 'pop', vol: 0.035 }); });
      if (s.hi !== undefined && slots[s.hi]) { const t = s.hiT ?? s.t + 1; tl.to(slots[s.hi], { y: -16, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 }, t).to(slots[s.hi].querySelector('.pip'), { opacity: 1, duration: 0.2 }, t + 0.3); window.sfx.push({ t, kind: 'click', vol: 0.07 }); }
      if (s.inner) { const inEl = el.querySelector('.inner'); tl.fromTo(inEl.firstElementChild, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out', immediateRender: false }, s.inner.t ?? s.t + 1); C[s.inner.type].anim?.(tl, inEl, { ...s.inner, t: s.inner.t ?? s.t + 1 }); }
    },
  };
  const gridHtml = (s, sz) => `<div class="${s._launch ? 'gr' : 'grid'}" style="--cols:${s.cols || 3};--s:${sz}px;--gap:${s.gap ?? Math.round(sz * 0.3)}px">${(s.icons || []).map((ic, i) => `<div class="icell">${i === s.hi ? '<i class="hiring"></i>' : ''}${appIcon(i === s.q ? { q: true } : ic, sz)}${ic.label ? `<small>${esc(ic.label)}</small>` : ''}</div>`).join('')}</div>`;
  function animGrid(tl, el, s, t0) {
    const cells = [...el.querySelectorAll('.icell')];
    cells.forEach((c, i) => { const t = s.icons[i].t ?? t0 + i * 0.07; tl.fromTo(c, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(1.8)', immediateRender: true }, t); if (i % 2 === 0) window.sfx.push({ t, kind: 'pop', vol: 0.035 }); });
    if (s.hi !== undefined && cells[s.hi]) {
      const t = s.hiT ?? t0 + 1.2;
      if (s.dim !== false) cells.forEach((c, i) => { if (i !== s.hi) tl.to(c, { opacity: 0.32, duration: 0.35 }, t); });
      tl.fromTo(cells[s.hi].querySelector('.hiring'), { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: false }, t).to(cells[s.hi], { scale: 1.1, duration: 0.35, ease: 'back.out(2)' }, t);
      window.sfx.push({ t, kind: 'tick', vol: 0.07 });
    }
  }
  C.grid = { html: (s) => gridHtml(s, s.size || 110), anim: (tl, el, s) => animGrid(tl, el, s, s.t + 0.1) };
  C.launcher = {
    html: (s) => `<div class="launch" style="--w:${s.w || 560}px"><div class="search">${I.search}${esc(s.search || 'Search')}</div><div class="lt">${esc(s.title || 'Pinned')}</div>${gridHtml({ ...s, _launch: true, cols: s.cols || 4 }, s.size || 84)}</div>`,
    anim: (tl, el, s) => animGrid(tl, el, s, s.t + 0.3),
  };
  C.prompt = {
    html: (s) => `<div class="prompt${s.glow ? ' glow' : ''}" style="--w:${s.w || 780}px"><div class="top">${s.b ? appIcon(s, 38) : ''}<div class="txt"></div></div><div class="bot">${s.modes ? `<div class="modes"><i class="knob"></i>${s.modes.map((m, i) => `<span class="${i === 0 ? 'on' : ''}">${esc(m)}</span>`).join('')}</div>` : ''}<div class="send">${I.up}</div></div></div>`,
    anim: (tl, el, s) => {
      const tx = el.querySelector('.txt'); const t0 = s.typeT ?? s.t + 0.4; const cps = s.cps || 20;
      const doneT = t0 + (s.text || '').length / cps;
      typer(tx, s.text || '', t0, cps, { ph: s.placeholder || 'Ask anything', caretAfter: true, until: s.sendT ?? doneT + 0.6 });
      if (s.modes) {
        // measured per frame (fonts load after renderPost), so the knob always fits its label
        const spans = [...el.querySelectorAll('.modes span')], knob = el.querySelector('.knob'), ease = gsap.parseEase('power3.inOut');
        dyn.push((t) => {
          const p = s.modeT === undefined || !spans[1] ? 0 : ease(Math.max(0, Math.min(1, (t - s.modeT) / 0.35)));
          const a = spans[0], b = spans[1] || a;
          knob.style.width = `${a.offsetWidth + (b.offsetWidth - a.offsetWidth) * p}px`;
          knob.style.transform = `translateX(${(b.offsetLeft - a.offsetLeft) * p}px)`;
          a.className = p < 0.5 ? 'on' : ''; if (spans[1]) b.className = p >= 0.5 ? 'on' : '';
        });
        if (s.modeT !== undefined && spans[1]) window.sfx.push({ t: s.modeT, kind: 'click', vol: 0.08 });
      }
      if (s.sendT !== undefined) { tl.to(el.querySelector('.send'), { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1 }, s.sendT).to(el.querySelector('.prompt'), { boxShadow: '0 24px 70px rgba(0,0,0,.45), 0 0 0 1.5px color-mix(in srgb, var(--accent) 60%, transparent), 0 0 46px color-mix(in srgb, var(--accent) 35%, transparent)', duration: 0.3 }, s.sendT); window.sfx.push({ t: s.sendT, kind: 'click', vol: 0.09 }, { t: s.sendT + 0.05, kind: 'whoosh', vol: 0.05 }); }
    },
  };
  C.checklist = {
    html: (s) => `<div class="list" style="--w:${s.w || 640}px">${s.title ? `<div class="lt">${s.iconSvg || ''}${esc(s.title)}</div>` : ''}<div class="lbody" style="display:flex;flex-direction:column;gap:12px">${blocks((s.items || []).map((it) => ({ k: 'row', check: !s.toggles, toggle: !!s.toggles, ...it })))}</div></div>`,
    anim: (tl, el, s) => animBlocks(tl, el.querySelector('.lbody'), (s.items || []).map((it, i) => ({ k: 'row', ...it, t: it.t ?? s.t + 0.15 + i * 0.12 })), s.t),
  };
  C.progress = {
    html: (s) => `<div class="prog" style="--w:${s.w || 700}px">${s.label || s.pct ? `<div class="hd"><b>${esc(s.label || '')}</b><span class="pc">${s.pct ? '0%' : esc(s.right || '')}</span></div>` : ''}<div class="tr"><div class="fl"></div></div></div>`,
    anim: (tl, el, s) => {
      const t0 = s.fillT ?? s.t + 0.3, d = s.dur || 1.4, to = s.to ?? 1, from = s.from ?? 0;
      tl.fromTo(el.querySelector('.fl'), { scaleX: from }, { scaleX: to, duration: d, ease: 'power2.inOut', immediateRender: false }, t0);
      const pc = el.querySelector('.pc'); if (pc && s.pct) dyn.push((t) => { const p = from + (to - from) * gsap.parseEase('power2.inOut')(Math.max(0, Math.min(1, (t - t0) / d))); pc.textContent = `${Math.round(p * 100)}%`; });
      window.sfx.push({ t: t0, kind: 'roll', vol: 0.035 }, { t: t0 + d, kind: 'tick', vol: 0.06 });
    },
  };
  C.stats = {
    html: (s) => `<div class="stats">${(s.tiles || []).map((x) => `<div class="stat" style="--ts:${s.size || 190}px"><i class="lit"></i>${
      x.k === 'ring' ? `<svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--sk)" stroke-width="7"/><circle class="arc" cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 50 50)"/></svg><span class="rv">${esc(x.value || '')}</span>`
      : x.k === 'bars' ? `<div class="bars">${(x.vals || [0.35, 0.55, 0.45, 0.8, 0.65]).map((v) => `<i style="height:${v * 100}%"></i>`).join('')}</div>`
      : x.k === 'num' ? `<div class="num"><b>${esc(x.value)}</b><small>${esc(x.label || '')}</small></div>`
      : `<div class="ls">${Array.from({ length: 3 }, () => '<div><i></i><span></span></div>').join('')}</div>`}</div>`).join('')}</div>`,
    anim: (tl, el, s) => {
      const tiles = [...el.querySelectorAll('.stat')];
      tiles.forEach((st, i) => { const t = s.t + 0.15 + i * 0.12; tl.fromTo(st, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', immediateRender: true }, t); });
      const lt = s.litT; if (lt === undefined) return;
      tiles.forEach((st, i) => {
        const t = lt + i * 0.15, x = s.tiles[i];
        tl.to(st.querySelector('.lit'), { opacity: 1, duration: 0.35 }, t).to(st, { borderColor: 'transparent', duration: 0.2 }, t);
        if (x.k === 'ring') tl.to(st.querySelector('.arc'), { strokeDashoffset: 1 - (x.p ?? 0.72), duration: 0.9, ease: 'power2.out' }, t);
        if (x.k === 'bars') tl.to(st.querySelectorAll('.bars i'), { backgroundColor: 'var(--accent)', duration: 0.3, stagger: 0.05 }, t).fromTo(st.querySelectorAll('.bars i'), { scaleY: 0.3 }, { scaleY: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.05, immediateRender: false }, t);
        if (x.k === 'list') tl.to(st.querySelectorAll('.ls i'), { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', duration: 0.2, stagger: 0.15 }, t);
        if (x.k === 'num') tl.to(st.querySelector('.num b'), { color: 'var(--accent)', duration: 0.3 }, t);
        window.sfx.push({ t, kind: 'tick', vol: 0.055 });
      });
    },
  };
  C.cursor = {
    abs: true,
    html: (s) => `<div class="cursor">${I.cursor}</div><div class="ripple"></div>${s.menu ? `<div class="menu" style="left:${s.menu.x ?? (s.path.at(-1).x + 14)}px;top:${s.menu.y ?? (s.path.at(-1).y + 14)}px"><i class="mh"></i>${s.menu.items.map((m) => m === '-' ? '<div class="sep"></div>' : `<div>${esc(m)}</div>`).join('')}</div>` : ''}`,
    anim: (tl, el, s) => {
      const cur = el.querySelector('.cursor'), rip = el.querySelector('.ripple'), p = s.path;
      gsap.set(cur, { x: p[0].x - 8, y: p[0].y - 4 });
      p.slice(1).forEach((pt, i) => { const t = pt.t ?? s.t + 0.5 + i * 0.7; tl.to(cur, { x: pt.x - 8, y: pt.y - 4, duration: pt.dur || 0.6, ease: 'power2.inOut' }, t); });
      (s.clicks || []).forEach((c) => { const at = c.t; const pt = [...p].reverse().find((q) => (q.t ?? 0) <= at) || p[0];
        tl.set(rip, { left: pt.x, top: pt.y }, at).fromTo(rip, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.3, duration: 0.45, ease: 'power2.out', immediateRender: false }, at).to(cur, { scale: 0.86, duration: 0.07, yoyo: true, repeat: 1 }, at);
        window.sfx.push({ t: at, kind: 'click', vol: 0.09 }); });
      if (s.menu) { const m = el.querySelector('.menu'), t = s.menu.t ?? (s.clicks || []).find((c) => c.right)?.t ?? s.t + 1;
        tl.fromTo(m, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power3.out', immediateRender: false }, t + 0.05);
        if (s.menu.hi !== undefined) { const rows = [...m.querySelectorAll('div')]; const row = rows[s.menu.hi]; const ht = s.menu.hiT ?? t + 0.6;
          tl.set(m.querySelector('.mh'), { top: row.offsetTop }, ht).to(m.querySelector('.mh'), { opacity: 1, duration: 0.15 }, ht).to(row, { color: '#fff', duration: 0.15 }, ht);
          if (s.menu.cursorTo !== false) tl.to(cur, { x: (s.menu.x ?? (p.at(-1).x + 14)) + 120, y: (s.menu.y ?? (p.at(-1).y + 14)) + row.offsetTop + 14, duration: 0.45, ease: 'power2.inOut' }, ht - 0.45);
          window.sfx.push({ t: ht, kind: 'tick', vol: 0.06 }); } }
    },
  };
  C.arrow = {
    abs: true,
    html: (s) => { const { x1, y1, x2, y2 } = s; const bend = s.bend || 0; const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
      const ang = Math.atan2(y2 - my, x2 - mx); const hs = 16; const col = s.color === 'muted' ? 'var(--mute)' : 'var(--accent)';
      const id = `am${++gid}`;
      return `<svg class="over"><defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path class="mk" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" stroke="#fff" stroke-width="14" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></mask></defs><path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 12" fill="none" mask="url(#${id})"/>${s.head !== false ? `<path class="hd" d="M${x2 - hs * Math.cos(ang - 0.5)} ${y2 - hs * Math.sin(ang - 0.5)} L${x2} ${y2} L${x2 - hs * Math.cos(ang + 0.5)} ${y2 - hs * Math.sin(ang + 0.5)}" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>` : ''}</svg>`; },
    anim: (tl, el, s) => { const d = s.dur || 0.55; tl.to(el.querySelector('.mk'), { strokeDashoffset: 0, duration: d, ease: 'power2.inOut' }, s.t); const hd = el.querySelector('.hd'); if (hd) tl.to(hd, { opacity: 1, duration: 0.15 }, s.t + d - 0.1); window.sfx.push({ t: s.t, kind: 'whoosh', vol: 0.04 }); },
  };
  C.strike = {
    abs: true,
    html: (s) => { const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1), a = Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180 / Math.PI; return `<div class="strike" style="left:${s.x1}px;top:${s.y1 - 4}px;width:${len}px;transform:rotate(${a}deg) scaleX(0)"></div>`; },
    anim: (tl, el, s) => { const a = Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180 / Math.PI; const st = el.querySelector('.strike'); gsap.set(st, { rotation: a, scaleX: 0 }); tl.to(st, { scaleX: 1, duration: 0.35, ease: 'power3.out' }, s.t); window.sfx.push({ t: s.t, kind: 'scratch', vol: 0.06 }); },
  };
  C.shot = {
    html: (s) => `<div class="shot" style="--w:${s.w || 760}px;--h:${s.h || 520}px"><div class="im"><img src="${esc(s.srcUrl)}"></div><i class="fl"></i></div>${s.domain ? `<div class="dom">${I.globe}${esc(s.domain)}</div>` : ''}`,
    anim: (tl, el, s) => { tl.fromTo(el.querySelector('.fl'), { opacity: 0.7 }, { opacity: 0, duration: 0.35, immediateRender: false }, s.t + 0.05); window.sfx.push({ t: s.t + 0.05, kind: 'shutter', vol: 0.05 });
      if (s.pan) tl.fromTo(el.querySelector('img'), { y: 0 }, { y: -s.pan, duration: Math.max(1, (s._end - s.t)), ease: 'sine.inOut', immediateRender: false }, s.t + 0.3); },
  };
  C.headline = {
    html: (s) => `<div class="news" style="--w:${s.w || 780}px"><div class="src">${s.b || s.iconSvg || s.color ? appIcon(s, 38) : ''}${esc(s.source || '')}<em>${esc(s.date || '')}</em></div><h3>${s.mark ? esc(s.headline).replace(esc(s.mark), `<span class="hl">${esc(s.mark)}</span>`) : esc(s.headline)}</h3><div class="by">${esc(s.byline || '')}</div></div>`,
    anim: (tl, el, s) => { window.sfx.push({ t: s.t + 0.05, kind: 'shutter', vol: 0.04 }); const hl = el.querySelector('.hl'); if (hl) { const t = s.markT ?? s.t + 0.8; tl.to(hl, { backgroundSize: '100% 100%', duration: 0.5, ease: 'power2.out' }, t); window.sfx.push({ t, kind: 'scratch', vol: 0.04 }); } },
  };
  C.phone = {
    html: (s) => `<div class="phone" style="--w:${s.w || 420}px;--h:${s.h || 820}px"><i class="isl"></i><div class="pb" style="display:flex;flex-direction:column;gap:14px">${blocks(s.body)}</div></div>`,
    anim: (tl, el, s) => animBlocks(tl, el.querySelector('.pb'), s.body, s.t + 0.3),
  };
  C.notif = {
    html: (s) => `<div style="width:${s.w || 760}px">${block({ k: 'notif', ...s, t: undefined })}</div>`,
    anim: (tl, el, s) => window.sfx.push({ t: s.t, kind: 'notify', vol: 0.06 }),
    in: 'drop',
  };
  C.invaders = {
    abs: true,
    html: (s) => { const n = s.n || 7, w = s.size || 54, gap = s.gap || 26, total = n * w + (n - 1) * gap, x0 = (s.x ?? 540) - total / 2, col = s.color || 'var(--accent)';
      return Array.from({ length: n }, (_, i) => `<div class="inv" style="left:${x0 + i * (w + gap)}px;top:${(s.y ?? 1300) - w * 0.36 + (i % 2 ? 10 : 0)}px;width:${w}px;height:${w * 0.73}px"><div class="f0">${invSvg(0, col)}</div><div class="f1" style="display:none">${invSvg(1, col)}</div>${s.q && i % 2 === 0 ? '<b class="q">?</b>' : ''}</div>`).join(''); },
    anim: (tl, el, s) => {
      const invs = [...el.querySelectorAll('.inv')];
      invs.forEach((v, i) => { const t = s.t + i * 0.08; tl.fromTo(v, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)', immediateRender: true }, t); window.sfx.push({ t, kind: 'blip', vol: 0.025 }); });
      dyn.push((t) => { const f = Math.floor(t * 4) % 2; invs.forEach((v, i) => { const ff = (f + i) % 2; v.children[0].style.display = ff ? 'none' : ''; v.children[1].style.display = ff ? '' : 'none'; v.style.transform = `translateX(${Math.sin(t * 2.2) * 14}px)`; const q = v.querySelector('.q'); if (q) q.style.transform = `translate(-50%, ${Math.sin(t * 5 + i) * 5}px)`; }); });
    },
  };
  C.chips = {
    html: (s) => `<div class="chips" style="--w:${s.w || 820}px">${(s.items || []).map((c) => `<div class="chip${c.hi ? ' hi' : ''}">${c.iconSvg || ''}${esc(c.label)}</div>`).join('')}</div>`,
    anim: (tl, el, s) => [...el.querySelectorAll('.chip')].forEach((c, i) => { const t = s.items[i].t ?? s.t + 0.1 + i * 0.12; tl.fromTo(c, { opacity: 0, scale: 0.7, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: true }, t); window.sfx.push({ t, kind: 'pop', vol: 0.045 }); }),
  };
  C.pill = { html: (s) => `<div class="pill${s.ghost ? ' ghost' : ''}">${esc(s.label)}</div>`, in: 'pop' };
  C.text = { html: (s) => `<div class="bigt" style="--fs:${s.size || 120}px"><b class="${s.accent ? 'acc' : ''}">${esc(s.text)}</b>${s.sub ? `<span>${esc(s.sub)}</span>` : ''}</div>`, in: 'pop' };
  C.label = { html: (s) => `<div class="label" style="${s.size ? `font-size:${s.size}px;` : ''}${s.accent ? 'color:var(--accent);' : ''}">${esc(s.text)}</div>`, in: 'fade' };
  C.icon = { html: (s) => `<div class="icell">${appIcon(s, s.size || 120)}${s.label ? `<small>${esc(s.label)}</small>` : ''}</div>`, in: 'pop' };
  C.icons = {
    html: (s) => `<div style="display:flex;gap:${s.gap ?? 44}px;align-items:flex-start">${(s.items || []).map((ic) => `<div class="icell">${appIcon(ic, s.size || 110)}${ic.label ? `<small>${esc(ic.label)}</small>` : ''}</div>`).join('')}</div>`,
    anim: (tl, el, s) => [...el.querySelectorAll('.icell')].forEach((c, i) => { const t = s.items[i].t ?? s.t + 0.1 + i * 0.15; tl.fromTo(c, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.9)', immediateRender: true }, t); window.sfx.push({ t, kind: 'pop', vol: 0.045 }); }),
  };
  C.people = {
    html: (s) => { const pal = s.colors || ['var(--accent)', '#5c5a78', '#7a7896', '#4b4966']; return `<div class="people">${Array.from({ length: s.n || 7 }, (_, i) => `<div class="person" style="--pc:${pal[i % pal.length]}"><i></i><b></b></div>`).join('')}</div>`; },
    anim: (tl, el, s) => [...el.querySelectorAll('.person')].forEach((p, i) => { const t = s.t + 0.1 + i * 0.07; tl.fromTo(p, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: true }, t); if (i % 2 === 0) window.sfx.push({ t, kind: 'pop', vol: 0.035 }); }),
  };
  C.plans = {
    html: (s) => `<div class="plans">${(s.cols || []).map((c) => `<div class="plan${c.hi ? ' hi' : ''}" style="--pw:${s.pw || 180}px"><h4>${esc(c.label)}</h4><div class="sk" style="width:80%"></div><div class="sk dim" style="width:60%"></div><div class="sk dim" style="width:70%"></div><div class="st lock">${I.lock}</div><div class="st ok">${I.check}</div></div>`).join('')}</div>`,
    anim: (tl, el, s) => {
      const cols = [...el.querySelectorAll('.plan')];
      cols.forEach((c, i) => { const t = s.t + 0.1 + i * 0.1; tl.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', immediateRender: true }, t); });
      cols.forEach((c, i) => { const col = s.cols[i]; if (col.open) { gsap.set(c.querySelector('.lock'), { opacity: 0 }); gsap.set(c.querySelector('.ok'), { opacity: 1 }); }
        const t = col.unlockT; if (t === undefined) return;
        tl.to(c.querySelector('.lock'), { opacity: 0, scale: 0.5, duration: 0.2 }, t).fromTo(c.querySelector('.ok'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)', immediateRender: false }, t + 0.1)
          .to(c, { borderColor: 'color-mix(in srgb, var(--accent) 65%, transparent)', boxShadow: '0 0 34px color-mix(in srgb, var(--accent) 30%, transparent)', duration: 0.35 }, t + 0.1);
        window.sfx.push({ t: t + 0.1, kind: 'success', vol: 0.05 }); });
    },
  };
  C.comments = {
    html: (s) => `<div class="comm" style="--w:${s.w || 680}px"><div class="ct">${esc(s.title || 'Comments')}</div><div class="cr mine" style="display:none"><i></i><div class="cl"><b>${esc(s.keyword)}</b></div></div>${Array.from({ length: s.rows || 3 }, (_, i) => `<div class="cr"><i></i><div class="cl"><div class="sk" style="width:${[46, 38, 52][i % 3]}%"></div><div class="sk dim" style="width:${[78, 64, 70][i % 3]}%"></div></div></div>`).join('')}<div class="ci"><span class="kt"></span><div class="send">${I.up}</div></div></div>`,
    anim: (tl, el, s) => {
      const kt = el.querySelector('.kt'), t0 = s.typeT ?? s.t + 0.5;
      typer(kt, s.keyword, t0, s.cps || 9, { ph: 'Add a comment...', caretAfter: true, until: s.sendT ?? 1e9 });
      if (s.sendT !== undefined) { const mine = el.querySelector('.cr.mine');
        tl.set(mine, { display: 'flex' }, s.sendT).fromTo(mine, { opacity: 0, y: -10, height: 0 }, { opacity: 1, y: 0, height: 40, duration: 0.35, ease: 'power3.out', immediateRender: false }, s.sendT)
          .set(kt, { visibility: 'hidden' }, s.sendT).to(el.querySelector('.send'), { scale: 0.8, duration: 0.08, yoyo: true, repeat: 1 }, s.sendT - 0.05);
        window.sfx.push({ t: s.sendT, kind: 'success', vol: 0.06 }); }
    },
  };
  C.focus = {
    abs: true,
    html: (s) => { const m = s.moves[0]; return `<div class="focus" style="left:${m.x - m.w / 2}px;top:${m.y - m.h / 2}px;width:${m.w}px;height:${m.h}px"></div>`; },
    anim: (tl, el, s) => { const f = el.querySelector('.focus'); s.moves.slice(1).forEach((m) => { tl.to(f, { left: m.x - m.w / 2, top: m.y - m.h / 2, width: m.w, height: m.h, duration: 0.5, ease: 'power3.inOut' }, m.t); window.sfx.push({ t: m.t, kind: 'whoosh', vol: 0.035 }); }); },
    in: 'fade',
  };
  C.spark = {
    abs: true,
    html: (s) => `<div class="spark" style="left:${s.x ?? 540}px;top:${s.y ?? 700}px">${Array.from({ length: 10 }, (_, i) => `<i style="transform:rotate(${i * 36}deg) translateY(${s.r || 70}px)"></i>`).join('')}</div>`,
    anim: (tl, el, s) => { tl.fromTo(el.querySelectorAll('.spark i'), { opacity: 0, scaleY: 0.2 }, { opacity: 1, scaleY: 1, duration: 0.2, immediateRender: false }, s.t).to(el.querySelectorAll('.spark i'), { opacity: 0, duration: 0.35 }, s.t + 0.35); window.sfx.push({ t: s.t, kind: 'chime', vol: 0.05 }); },
    in: 'none',
  };

  // ---------- captions: 1 phrase of 2 to 4 words at a time ----------
  function phrases(words, maxW = 4) {
    const chunks = []; let cur = [];
    words.forEach((w, i) => { cur.push(w); const nx = words[i + 1];
      if (!nx || /[,.!?:;]$/.test(w.w) || nx.start - w.end > 0.45) { chunks.push(cur); cur = []; } });
    let out = [];
    for (const c of chunks) { const n = Math.ceil(c.length / maxW), size = Math.ceil(c.length / n); for (let i = 0; i < c.length; i += size) out.push(c.slice(i, i + size)); }
    for (let i = 0; i < out.length; i++) {
      if (out[i].length !== 1) continue;
      const nx = out[i + 1], pv = out[i - 1];
      const endsHard = /[.!?]$/.test(out[i][0].w);
      if (!endsHard && nx && nx.length < maxW && nx[0].start - out[i][0].end < 0.5) { out[i + 1] = out[i].concat(nx); out.splice(i, 1); i--; }
      else if (pv && pv.length < maxW && !/[.!?]$/.test(pv.at(-1).w)) { out[i - 1] = pv.concat(out[i]); out.splice(i, 1); i--; }
    }
    return out.map((ws) => ({ t: ws[0].start - 0.05, end: ws.at(-1).end, text: ws.map((w) => w.w).join(' ') }));
  }

  // ---------- build ----------
  window.renderPost = (data) => {
    window.sfx = []; dyn.length = 0;
    const accent = data.accent || data.b?.accent || data.b?.bg || '#D97757';
    const root = document.getElementById('root');
    const caps = phrases(data.words, data.captions?.maxWords || 4);
    const face = data.face || {};
    root.innerHTML = `<div class="canvas" id="cv" style="--accent:${accent};--accent-fg:${data.accentFg || '#fff'}">
      <div class="bg"><div class="glow g1" id="g1"></div><div class="glow g2" id="g2"></div><div class="vign"></div></div>
      <div id="sw">${data.scenes.map((s, i) => `<div class="scene" id="s${i}"><div class="cam" id="c${i}">${(s.items || []).map((it, k) => {
        const Cx = C[it.type]; if (!Cx) throw new Error(`ui-reel: unknown item type "${it.type}" (scene ${i})`);
        const abs = Cx.abs; return `<div class="item${abs ? ' abs' : ''}" id="i${i}_${k}" style="${abs ? '' : `left:${it.x ?? 540}px;top:${it.y ?? 700}px;`}${it.z ? `z-index:${it.z};` : ''}"><div class="fx"><div class="anim" style="${it.scale ? `transform:scale(${it.scale});` : ''}">${Cx.html(it)}</div></div></div>`; }).join('')}</div></div>`).join('')}</div>
      <div id="face"><img id="fimg" alt=""><div class="seam"></div></div>
      <div class="caps">${caps.map((c, i) => `<div class="ph" id="cp${i}">${esc(c.text)}</div>`).join('')}</div>
    </div>`;

    const tl = gsap.timeline({ paused: true });
    // Scenes: cross-dissolve (default), subtle slide, or cut. Every scene drifts slowly unless it has camera keyframes.
    data.scenes.forEach((s, i) => {
      const el = document.getElementById('s' + i), cam = document.getElementById('c' + i);
      const tr = s.tr || data.tr || 'fade', end = s.end, nextTr = data.scenes[i + 1]?.tr || data.tr || 'fade';
      if (i === 0) tl.set(el, { autoAlpha: 1 }, 0);
      else if (tr === 'cut') tl.set(el, { autoAlpha: 1 }, s.t);
      else if (tr === 'slide') tl.fromTo(el, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, s.t);
      else tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.out', immediateRender: false }, s.t);
      if (i < data.scenes.length - 1) {
        if (nextTr === 'cut') tl.set(el, { autoAlpha: 0 }, end);
        else if (nextTr === 'slide') tl.to(el, { autoAlpha: 0, x: -90, duration: 0.4, ease: 'power3.in' }, end);
        else tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, end);
      }
      if (i > 0 && tr !== 'cut') window.sfx.push({ t: s.t, kind: 'whoosh', vol: s.whoosh ?? 0.035 });
      if (s.cam && s.cam.length) {
        const C0 = { x: 540, y: 700, zoom: 1 };
        const pos = (k) => ({ x: 540 - k.x * k.zoom, y: 700 - k.y * k.zoom, scale: k.zoom });
        const first = { ...C0, ...(s.cam[0].t === undefined || s.cam[0].t <= s.t + 0.01 ? s.cam[0] : {}) };
        gsap.set(cam, pos(first));
        s.cam.forEach((k) => { if (k.t === undefined || k.t <= s.t + 0.01) return; tl.to(cam, { ...pos({ ...C0, ...k }), duration: k.dur || 0.8, ease: 'power2.inOut' }, k.t); });
      } else if (s.drift !== false) {
        tl.fromTo(cam, { scale: 1, x: 0, y: 0 }, { scale: 1.035, x: -540 * 0.035, y: -700 * 0.035, duration: Math.max(0.5, end - s.t + 0.4), ease: 'none', immediateRender: false }, s.t);
      }
      (s.items || []).forEach((it, k) => {
        const item = document.getElementById(`i${i}_${k}`), fx = item.firstElementChild, an = fx.firstElementChild;
        const Cx = C[it.type]; const t = it.t ?? (s.t + 0.12 + k * 0.12);
        const its = { ...it, t, _end: end };
        const kind = it.in || Cx.in || (Cx.abs ? 'none' : 'rise');
        const base = it.scale || 1;
        if (kind === 'none') tl.set(an, { opacity: 1 }, t);
        else if (kind === 'fade') tl.fromTo(an, { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, t);
        else if (kind === 'pop') tl.fromTo(an, { opacity: 0, scale: base * 0.55 }, { opacity: 1, scale: base, duration: 0.45, ease: 'back.out(1.8)', immediateRender: false }, t);
        else if (kind === 'drop') tl.fromTo(an, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)', immediateRender: false }, t);
        else if (kind === 'slide') tl.fromTo(an, { opacity: 0, x: -70 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, t);
        else tl.fromTo(an, { opacity: 0, y: 30, scale: base * 0.94 }, { opacity: 1, y: 0, scale: base, duration: 0.5, ease: 'power3.out', immediateRender: false }, t);
        if (kind !== 'none' && it.sfx !== false && !['arrow', 'strike', 'cursor', 'invaders', 'spark', 'focus'].includes(it.type)) window.sfx.push({ t, kind: it.sfx || 'pop', vol: it.sfxVol ?? 0.045 });
        Cx.anim?.(tl, an, its);
        if (it.moveT !== undefined) tl.to(fx, { x: (it.mx ?? it.x ?? 540) - (it.x ?? 540), y: (it.my ?? it.y ?? 700) - (it.y ?? 700), scale: it.mscale ?? 1, duration: it.mdur || 0.6, ease: 'power3.inOut' }, it.moveT);
        if (it.dimT !== undefined) tl.to(fx, { opacity: 0.3, duration: 0.35 }, it.dimT);
        if (it.undimT !== undefined) tl.to(fx, { opacity: 1, duration: 0.3 }, it.undimT);
        if (it.outT !== undefined) tl.to(fx, { opacity: 0, y: it.outY ?? 0, scale: it.outScale ?? 1, duration: 0.3, ease: 'power2.in' }, it.outT);
      });
    });

    // Face slots: the stage squeezes into the top half while a face is up; faceless renders stay full-screen.
    const SPLIT = { y: -150, scale: 0.82 };
    const slots = ['open', 'close'].map((k) => face[k]).filter((f) => f && f.url);
    for (const f of slots) {
      const t0 = f.t0, t1 = f.t1;
      if (t0 <= 0.01) gsap.set('#sw', SPLIT); else tl.to('#sw', { ...SPLIT, duration: 0.45, ease: 'power3.inOut' }, t0 - 0.2);
      tl.set('#face', { opacity: 1 }, t0);
      if (t1 < data.duration - 0.05) { tl.set('#face', { opacity: 0 }, t1).to('#sw', { y: 0, scale: 1, duration: 0.45, ease: 'power3.inOut' }, t1); }
    }
    window._face = slots;

    // Captions
    caps.forEach((c, i) => { const el = document.getElementById('cp' + i); const off = Math.min(caps[i + 1]?.t ?? 1e9, c.end + 0.7);
      tl.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out', immediateRender: false }, c.t).set(el, { opacity: 0 }, off); });

    window.duration = data.duration;
    window.seek = (t) => {
      tl.seek(t, false);
      for (const f of dyn) f(t);
      const g1 = document.getElementById('g1'), g2 = document.getElementById('g2');
      g1.style.transform = `translate(${Math.sin(t * 0.21) * 60}px, ${Math.cos(t * 0.17) * 50}px)`;
      g2.style.transform = `translate(${Math.cos(t * 0.15) * 80}px, ${Math.sin(t * 0.19) * 60}px)`;
      const img = document.getElementById('fimg');
      const f = window._face.find((x) => t >= x.t0 - 0.001 && t < x.t1);
      if (f) { const k = Math.max(0, Math.floor((t - f.t0) * f.fps)), c = f.count, m = c > 1 ? k % (2 * c - 2) : 0;   // short clips ping-pong (natural micro-movement), loop:false holds the last frame
        const n = f.loop === false ? Math.min(c, k + 1) : (m < c ? m : 2 * c - 2 - m) + 1; const src = `${f.url}${String(n).padStart(5, '0')}.jpg`; if (img.getAttribute('src') !== src) img.setAttribute('src', src); }
    };
    window.ready = async () => { const img = document.getElementById('fimg'); if (img.getAttribute('src') && !img.complete) await img.decode().catch(() => {}); };
    window.seek(0);
  };
})();
