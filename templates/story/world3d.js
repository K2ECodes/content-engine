// world3d: low-poly 3D hook / stage layer for story videos (what-if, you-decide; simulif.world-style openers).
// Three.js r128 (vendored from cdnjs, templates/_base/vendor). Fully seek-driven: every frame is a pure function of t,
// no clocks, no Math.random (seeded mulberry32), so render.mjs can render any frame in any order.
//
// render.json: data.world3d = shared look { kind: globe|city, palette {...}, pins, arcs, ships, flag, ... }
//              scene.w3d    = per-scene shot, merged over data.world3d { focus {lat, lon}, zoom [from, to], spin, pins: [i...],
//                             arcs: [i...] (drawn over the scene), shipsMove, lightsOff [from, to], traffic, orbit [from, to], height }
// Any scene with `w3d` shows the 3D layer behind its overlay (use type "hud" for the stage text, stat counter and result tag).
(function () {
  const RAD = Math.PI / 180;
  const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
  const lerp = (a, b, u) => a + (b - a) * u;
  const pair = (v, d) => (Array.isArray(v) ? v : v === undefined ? [d, d] : [v, v]);

  // Coarse land mask in 10-degree latitude bands (stylised low-poly continents).
  const LAND = {
    85: [[-60, -20]], 75: [[-125, -20], [10, 30], [50, 145]],
    65: [[-168, -60], [-55, -25], [-24, -13], [5, 180]], 55: [[-165, -155], [-135, -60], [-10, 0], [5, 140], [155, 165]],
    45: [[-125, -65], [-5, 135], [140, 146]], 35: [[-120, -77], [-10, 0], [3, 10], [25, 120], [129, 141]],
    25: [[-112, -97], [-82, -80], [-15, 57], [66, 92], [97, 122]], 15: [[-95, -84], [-17, 40], [42, 52], [73, 81], [97, 109], [120, 125]],
    5: [[-77, -50], [-10, 42], [98, 119]], '-5': [[-81, -35], [10, 40], [105, 151]], '-15': [[-76, -38], [12, 40], [44, 50], [124, 145]],
    '-25': [[-70, -44], [15, 33], [44, 48], [114, 153]], '-35': [[-72, -56], [18, 28], [116, 150], [173, 178]],
    '-45': [[-75, -65], [167, 172]], '-55': [[-72, -64]], '-65': [[-180, 180]], '-75': [[-180, 180]], '-85': [[-180, 180]],
  };
  const isLand = (lat, lon) => { const b = Math.max(-85, Math.min(85, Math.floor(lat / 10) * 10 + 5)); return (LAND[b] || []).some(([a, c]) => lon >= a && lon <= c); };
  const ll = (lat, lon, r = 1) => new THREE.Vector3(r * Math.cos(lat * RAD) * Math.sin(lon * RAD), r * Math.sin(lat * RAD), r * Math.cos(lat * RAD) * Math.cos(lon * RAD));

  const PAL = {
    globe: { sky: ['#06121f', '#123a5c'], ocean: '#1b5c8c', ocean2: '#22679b', land: '#4fa86a', land2: '#5cb474', sand: '#c9b47a', ice: '#eef4f7', pin: '#F2C14E', arc: '#F2C14E', ship: '#ffffff', atmo: '#7fd3ff' },
    city: { sky: ['#0a1020', '#2b3b63'], ground: '#1d2433', road: '#11151e', bld: '#3b4660', bld2: '#55617e', win: '#ffd27a', tree: '#2f7d4f', light: '#ffcf66' },
  };

  let W = null;   // { renderer, scene, camera, kind, objs, windows }

  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t; }

  function buildGlobe(cfg, P) {
    const g = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1, 16);   // non-indexed: 1 flat colour per face
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), rnd = mulberry(7);
    const cO = new THREE.Color(P.ocean), cO2 = new THREE.Color(P.ocean2), cL = new THREE.Color(P.land), cL2 = new THREE.Color(P.land2), cS = new THREE.Color(P.sand), cI = new THREE.Color(P.ice);
    for (let f = 0; f < pos.count; f += 3) {
      const v = new THREE.Vector3(); for (let k = 0; k < 3; k++) v.add(new THREE.Vector3().fromBufferAttribute(pos, f + k)); v.normalize();
      const lat = Math.asin(v.y) / RAD, lon = Math.atan2(v.x, v.z) / RAD, j = rnd();
      const desert = [[18, 30, -12, 30], [18, 28, 40, 55], [-30, -20, 122, 140]].some((bx) => isInBox(lat, lon, bx)) && j > 0.25;
      let c = isLand(lat, lon) ? (Math.abs(lat) > 62 || (lat > 60 && lon > -60 && lon < -20) ? cI : desert ? cS : j > 0.8 ? cL2 : cL) : (j > 0.85 ? cO2 : cO);
      if (cfg.highlight && isInBox(lat, lon, cfg.highlight.box)) c = new THREE.Color(cfg.highlight.color || '#008751');
      for (let k = 0; k < 3; k++) { col[(f + k) * 3] = c.r; col[(f + k) * 3 + 1] = c.g; col[(f + k) * 3 + 2] = c.b; }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
    // atmosphere glow
    const atmo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, w * 0.33, w / 2, w / 2, w / 2); gr.addColorStop(0, P.atmo + 'aa'); gr.addColorStop(0.35, P.atmo + '44'); gr.addColorStop(1, P.atmo + '00'); x.fillStyle = gr; x.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false }));
    atmo.scale.set(2.9, 2.9, 1); atmo.renderOrder = -1; g.add(atmo);
    // pins
    const pins = (cfg.pins || []).map((p) => {
      const pg = new THREE.Group(), c = new THREE.Color(p.color || P.pin);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 6), new THREE.MeshLambertMaterial({ color: c, flatShading: true, emissive: c, emissiveIntensity: 0.35 }));
      cone.rotation.x = Math.PI; cone.position.y = 0.06; pg.add(cone);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.05, 24), new THREE.MeshBasicMaterial({ color: c, transparent: true, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.004; pg.add(ring);
      if (p.flag) pg.add(flagMesh(p.flag));
      const n = ll(p.lat, p.lon).normalize(); pg.position.copy(n); pg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      g.add(pg); return { g: pg, ring, p };
    });
    // arcs (drawn progressively) and ships riding them
    const arcs = (cfg.arcs || []).map((a) => {
      const A = ll(a[0], a[1]), B = ll(a[2], a[3]), ang = A.angleTo(B), M = A.clone().add(B).normalize().multiplyScalar(1 + 0.18 + ang * 0.22);
      const curve = new THREE.QuadraticBezierCurve3(A.multiplyScalar(1.004), M, B.multiplyScalar(1.004));
      const tube = new THREE.TubeGeometry(curve, 64, 0.006, 5, false);
      const m = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color: new THREE.Color(a[4] || P.arc) }));
      g.add(m); return { m, curve, total: tube.index.count, base: m.material.color.clone() };
    });
    const sea = cfg.seaRoutes || [];
    const ships = Array.from({ length: cfg.ships || 0 }, (_, i) => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.075 * (cfg.shipSize || 1), 0.03 * (cfg.shipSize || 1), 0.03 * (cfg.shipSize || 1)), new THREE.MeshLambertMaterial({ color: P.ship, emissive: new THREE.Color(P.ship), emissiveIntensity: 0.25 }));
      g.add(s); const r = mulberry(100 + i);
      return { s, route: sea.length ? sea[i % sea.length] : null, base: r(), speed: 0.02 + r() * 0.03 };
    });
    const routes = sea.map((a) => { const A = ll(a[0], a[1]), B = ll(a[2], a[3]); return (u) => A.clone().lerp(B, u).normalize().multiplyScalar(1.006); });
    return { group: g, pins, arcs, ships, routes };
  }
  const isInBox = (lat, lon, b) => b && lat >= b[0] && lat <= b[1] && lon >= b[2] && lon <= b[3];

  function flagMesh(kind) {
    const tex = canvasTex(96, 64, (x, w, h) => { if (kind === 'ng') { x.fillStyle = '#008751'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.fillRect(w / 3, 0, w / 3, h); } });
    const grp = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.26, 6), new THREE.MeshLambertMaterial({ color: '#dddddd' }));
    pole.position.y = 0.13; grp.add(pole);
    const geo = new THREE.PlaneGeometry(0.15, 0.1, 12, 4);
    const flag = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    flag.position.set(0.075, 0.21, 0); grp.add(flag); grp.userData.wave = geo;
    grp.userData.base = Float32Array.from(geo.attributes.position.array);
    return grp;
  }

  function buildCity(cfg, P) {
    const g = new THREE.Group(), rnd = mulberry(cfg.seed || 11), N = cfg.grid || 9, S = 1.0;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: P.ground }));
    ground.rotation.x = -Math.PI / 2; g.add(ground);
    const winTex = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; for (let yy = 6; yy < h - 6; yy += 12) for (let xx = 6; xx < w - 6; xx += 14) if (((xx * 7 + yy * 13) % 5) !== 0) x.fillRect(xx, yy, 7, 6); });
    winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
    const blds = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      if (i % 3 === 1 || j % 3 === 1) continue;   // streets every 3rd row/col
      const h = 0.4 + Math.pow(rnd(), 2.2) * (Math.abs(i - N / 2) + Math.abs(j - N / 2) < 4 ? 3.2 : 1.4);
      const geo = new THREE.BoxGeometry(0.8 * S, h, 0.8 * S); geo.translate(0, h / 2, 0);
      const tex = winTex.clone(); tex.needsUpdate = true; tex.repeat.set(1, Math.max(1, Math.round(h * 1.6)));
      const mat = new THREE.MeshLambertMaterial({ color: rnd() > 0.5 ? P.bld : P.bld2, emissive: new THREE.Color(P.win), emissiveMap: tex, emissiveIntensity: 1, flatShading: true });
      const m = new THREE.Mesh(geo, mat); m.position.set((i - N / 2) * S, 0, (j - N / 2) * S); g.add(m);
      blds.push({ m, rank: rnd() });
    }
    // roads, cars and traffic lights
    const cars = []; const lights = [];
    for (let k = 0; k < N; k += 3) {
      const z = (k + 1 - N / 2) * S;
      const road = new THREE.Mesh(new THREE.PlaneGeometry(N * S + 2, 0.45), new THREE.MeshLambertMaterial({ color: P.road })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.005, z); g.add(road);
      const road2 = road.clone(); road2.rotation.z = Math.PI / 2; road2.position.set(z, 0.006, 0); g.add(road2);
      for (let c = 0; c < 4; c++) { const car = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.12), new THREE.MeshLambertMaterial({ color: c % 2 ? '#e8e8e8' : '#d9534f' })); g.add(car); cars.push({ car, z, axis: c % 2, off: rnd() * 10, speed: 0.6 + rnd() * 0.6 }); }
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), new THREE.MeshLambertMaterial({ color: '#222' })); pole.position.set(z + 0.3, 0.25, z + 0.3); g.add(pole);
      const bulbs = ['#ff3b30', '#ffcc00', '#34c759'].map((cc, b) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: cc })); s.position.set(z + 0.3, 0.55 - b * 0.08, z + 0.3); g.add(s); return s; });
      lights.push({ bulbs, off: k });
    }
    return { group: g, blds, cars, lights, N };
  }

  function stars(n, seed) {
    const r = mulberry(seed), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(40 + r() * 20); p.set([v.x, v.y, v.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 0.18, transparent: true, opacity: 0.8 }));
  }

  window.W3D = {
    html(data) {
      if (!data.scenes.some((s) => s.w3d)) return '';
      const P = { ...(PAL[(data.world3d || {}).kind || 'globe']), ...((data.world3d || {}).palette || {}) };
      return `<div id="w3dwrap" style="position:absolute;inset:0;z-index:3;opacity:0;background:linear-gradient(180deg, ${P.sky[0]}, ${P.sky[1]})"><canvas id="w3d" width="1080" height="1920" style="width:1080px;height:1920px;display:block"></canvas><div id="w3dlabels"></div></div>`;
    },
    build(tl, data) {
      const wrap = document.getElementById('w3dwrap'); if (!wrap) return;
      const base = data.world3d || {}, kind = base.kind || 'globe', P = { ...PAL[kind], ...(base.palette || {}) };
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('w3d'), antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(kind === 'city' ? 40 : 32, 1080 / 1920, 0.01, 200);
      scene.add(new THREE.AmbientLight('#ffffff', kind === 'city' ? 0.45 : 0.55));
      const sun = new THREE.DirectionalLight('#fff3df', kind === 'city' ? 0.55 : 1.0); sun.position.set(3, 4, 5); scene.add(sun);
      if (kind === 'globe') scene.add(stars(900, 3));
      const objs = kind === 'city' ? buildCity(base, P) : buildGlobe(base, P);
      scene.add(objs.group);
      const labels = document.getElementById('w3dlabels');
      if (kind === 'globe') labels.innerHTML = (base.pins || []).map((p, i) => p.label ? `<div class="w3l" id="w3l${i}" style="position:absolute;left:0;top:0;opacity:0;font:700 30px/1.1 'Inter';letter-spacing:-.01em;color:#fff;background:rgba(10,20,30,.62);border:2px solid ${p.color || P.pin};padding:8px 14px;border-radius:12px;white-space:nowrap;transform:translate(-50%,-140%)">${p.label}</div>` : '').join('');
      const windows = data.scenes.filter((s) => s.w3d).map((s) => ({ t0: s.t, t1: s.end + 0.35, end: s.end, cfg: { ...base, ...s.w3d } }));
      // fade in from the previous scene, fade out over the next one (no hard cut over a photo)
      windows.forEach((w, k) => { const joined = k && Math.abs(windows[k - 1].end - w.t0) < 0.05;
        if (!joined) tl.fromTo(wrap, { opacity: w.t0 < 0.05 ? 1 : 0 }, { opacity: 1, duration: w.t0 < 0.05 ? 0.01 : 0.3, immediateRender: false }, w.t0);
        const next = windows[k + 1]; if (!(next && Math.abs(next.t0 - w.end) < 0.05)) tl.to(wrap, { opacity: 0, duration: 0.35 }, w.end);
        window.smoothWin.push([w.t0, w.t1]); });
      W = { renderer, scene, camera, kind, objs, windows, base };
      if (data.scenes[0]?.w3d) {   // 3D hook: the stage overlay rises in like the reference openers
        window.sfx.push({ t: 0.05, kind: 'whoosh', vol: 0.12 }, { t: 0.6, kind: 'blip', vol: 0.1 });
      }
    },
    render(t) {
      if (!W) return;
      let k = -1; W.windows.forEach((w, i) => { if (t >= w.t0 - 0.001 && t < w.t1) k = i; }); if (k < 0) return;
      const w = W.windows[k], cfg = w.cfg, u = (t - w.t0) / Math.max(0.1, w.t1 - w.t0);
      const prev = W.windows[k - 1], blend = prev && Math.abs(prev.end - w.t0) < 0.05 ? ease((t - w.t0) / 0.9) : 1;
      if (W.kind === 'globe') renderGlobe(t, u, cfg, prev && prev.cfg, blend);
      else renderCity(t, u, cfg, prev && prev.cfg, blend);
      W.renderer.render(W.scene, W.camera);
    },
  };

  function camGlobe(cfg, u) {
    const f = cfg.focus || { lat: 20, lon: 0 }, z = pair(cfg.zoom, 7.5), spin = cfg.spin ?? 6;
    return { lat: f.lat, lon: f.lon + spin * u * 3, dist: lerp(z[0], z[1], ease(u)), look: cfg.lookY ?? 0.9 };
  }
  function renderGlobe(t, u, cfg, pcfg, blend) {
    const O = W.objs; let c = camGlobe(cfg, u);
    if (blend < 1 && pcfg) { const p = camGlobe(pcfg, 1); c = { lat: lerp(p.lat, c.lat, blend), lon: lerp(p.lon, c.lon, blend), dist: lerp(p.dist, c.dist, blend), look: lerp(p.look, c.look, blend) }; }
    // rotate the globe so the focus faces the camera; camera sits on +z, a little above
    O.group.rotation.set(c.lat * RAD * 0.85, -c.lon * RAD, 0);
    W.camera.position.set(0, c.dist * 0.08, c.dist); W.camera.lookAt(0, c.look, 0);   // look above the centre: the globe sits in the lower half, under the captions
    const show = cfg.showPins === undefined ? null : new Set(cfg.showPins);
    O.pins.forEach((p, i) => {
      const on = show ? show.has(i) : true, pop = on ? ease((u * 6) - (p.p.delay || 0) * 6) : 0;
      p.g.visible = pop > 0.01; p.g.scale.setScalar(Math.max(0.01, pop) * (p.p.size || 1));
      p.ring.scale.setScalar(1 + ((t * 0.9 + i * 0.3) % 1) * 1.6); p.ring.material.opacity = 1 - ((t * 0.9 + i * 0.3) % 1);
      p.g.children.forEach((ch) => { if (ch.userData.wave) waveFlag(ch, t); });
      const lab = document.getElementById('w3l' + i);
      if (lab) {
        const wp = new THREE.Vector3(0, 0.12, 0); p.g.localToWorld(wp);
        const facing = wp.clone().normalize().dot(W.camera.position.clone().normalize()) > 0.25;
        const sp = wp.clone().project(W.camera);
        lab.style.left = `${(sp.x * 0.5 + 0.5) * 1080}px`; lab.style.top = `${(-sp.y * 0.5 + 0.5) * 1920}px`;
        lab.style.opacity = on && facing && pop > 0.9 && (cfg.labels !== false) ? 1 : 0;
      }
    });
    const showArcs = cfg.showArcs === undefined ? null : new Set(cfg.showArcs);
    // arcsOff: from that point of the scene (0 to 1) the lines fade to dead grey, one after another (cables cut, network down)
    O.arcs.forEach((a, i) => { const on = showArcs ? showArcs.has(i) : true; const prog = on ? (cfg.drawn ? 1 : ease(u * 2.2 - i * 0.12)) : 0; a.m.visible = prog > 0.01; a.m.geometry.setDrawRange(0, Math.floor(prog * a.total / 6) * 6);
      const dead = cfg.arcsOff === undefined ? 0 : ease((u - cfg.arcsOff) * 6 - i * 0.35); a.m.material.color.copy(a.base).lerp(new THREE.Color('#3a3f47'), dead); });
    O.ships.forEach((s, i) => {
      if (!s.route && !O.routes.length) { s.s.visible = false; return; }
      const route = O.routes[i % O.routes.length], move = cfg.shipsMove !== false;
      const v = move ? (s.base + s.speed * t) % 1 : (i % 2 ? 0.04 + s.base * 0.05 : 0.91 + s.base * 0.05);
      const p = route(v), q = route(Math.min(0.999, v + 0.01)); s.s.position.copy(p); s.s.lookAt(q); s.s.visible = cfg.ships !== 0;
    });
  }
  function waveFlag(grp, t) {
    const geo = grp.userData.wave, a = geo.attributes.position, b = grp.userData.base;
    for (let i = 0; i < a.count; i++) { const x = b[i * 3]; a.array[i * 3 + 2] = Math.sin(x * 40 + t * 6) * 0.012 * (x + 0.075) * 6; }
    a.needsUpdate = true;
  }
  function renderCity(t, u, cfg, pcfg, blend) {
    const O = W.objs, orb = pair(cfg.orbit, 35), hgt = pair(cfg.height, 6), dst = pair(cfg.zoom, 11);
    let ang = lerp(orb[0], orb[1], ease(u)), h = lerp(hgt[0], hgt[1], ease(u)), d = lerp(dst[0], dst[1], ease(u));
    if (blend < 1 && pcfg) { const po = pair(pcfg.orbit, 35), ph = pair(pcfg.height, 6), pd = pair(pcfg.zoom, 11); ang = lerp(po[1], ang, blend); h = lerp(ph[1], h, blend); d = lerp(pd[1], d, blend); }
    W.camera.position.set(Math.sin(ang * RAD) * d, h, Math.cos(ang * RAD) * d); W.camera.lookAt(0, 0.6, 0);
    const lo = pair(cfg.lightsOff, 0), off = lerp(lo[0], lo[1], ease(u));
    O.blds.forEach((b) => { b.m.material.emissiveIntensity = b.rank < off ? 0.03 : 0.95; });
    const traffic = cfg.traffic ?? 1;
    O.cars.forEach((c, i) => { const span = O.N + 2, x = (((c.off + c.speed * t) % span) + span) % span - span / 2; c.car.visible = (i / O.cars.length) < traffic; if (c.axis) c.car.position.set(c.z, 0.06, x); else c.car.position.set(x, 0.06, c.z); c.car.rotation.y = c.axis ? Math.PI / 2 : 0; });
    O.lights.forEach((l, i) => { const phase = Math.floor((t + l.off) / 1.5) % 3; l.bulbs.forEach((bb, k) => { bb.material.color.set(['#ff3b30', '#ffcc00', '#34c759'][k]); bb.material.color.multiplyScalar(k === phase || cfg.lightsWork === false ? (cfg.lightsWork === false ? 0.15 : 1) : 0.15); }); });
  }
})();
