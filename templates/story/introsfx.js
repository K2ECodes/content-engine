// Intro sound design for templates/story (data.introSfx, default on; set false to turn off).
// In the first few seconds it layers: a whoosh-big on the first visual, a short riser into a ding when the
// title lands, and pops/taps on each element entrance. It only pushes cues into window.sfx; scripts/render.mjs
// maps the kinds to the recorded kit in assets/sfx/kit (variants rotate per cue).
(function () {
  const SKIP = '.caps, .caps *, .shard, .bolt, .flash, #hflash, #flash, #wipe, .dust, .scrap, .ray, .blob, .flogo, #cv, #smw';
  const TITLE = '#hko, .ko, #hbar, .bigword, .stat-card, .odo, .digits, h2, .ftitle, .nm, .tile, .card, .shot, .person, .pop.text, .pop.burst';
  const isEntrance = (from) => from && (from.opacity === 0 || (typeof from.scale === 'number' && (from.scale <= 0.6 || from.scale >= 1.8))
    || Math.abs(parseFloat(from.y) || 0) >= 200 || Math.abs(parseFloat(from.x) || 0) >= 300);
  function gStart(tw, tl) { let t = tw.startTime(), p = tw.parent; while (p && p !== tl) { t += p.startTime(); p = p.parent; } return t; }
  function apply(tl, data) {
    const WIN = data.introSfxWindow ?? 3;
    const sfx = window.sfx, add = (t, kind, vol) => sfx.push({ t: Math.max(0, +t.toFixed(3)), kind, vol, intro: true });
    const near = (t, re, gap) => sfx.some((c) => Math.abs(c.t - t) < gap && re.test(c.kind));
    const hidden = data.hook && window.hookEnd ? window.hookEnd : 0;
    // every entrance tween that starts inside the window, earliest first
    const ents = [];
    tl.getChildren(true, true, false).forEach((tw) => {
      const t = gStart(tw, tl);
      if (t >= WIN || !isEntrance(tw.vars.startAt)) return;
      // scenes sit hidden under a hook until window.hookEnd, so their entrances before that are silent
      const els = tw.targets().filter((el) => el instanceof Element && !el.matches(SKIP) && !(hidden > t && el.closest('#scs')));
      if (els.length) ents.push({ t, land: t + tw.duration(), el: els[0] });
    });
    ents.sort((a, b) => a.t - b.t);
    if (!ents.length) return;
    const t0 = ents[0].t;
    if (!near(t0, /^whoosh-big$/, 0.4)) add(t0 + 0.02, 'whoosh-big', 0.14);
    if (data.coldOpen) return;   // the cold open sound-designs its own gag beats
    // the title: the first headline-ish element to land, else the moment a hook hands over to the first scene
    const title = ents.find((e) => e.land > t0 + 0.3 && e.el.matches(TITLE))
      || (hidden && hidden < WIN + 0.5 ? { t: hidden, land: hidden, el: null } : null);
    if (title) {
      if (title.land - 0.85 >= t0 + 0.2 && !near(title.land, /^riser$/, 1)) add(title.land - 0.85, 'riser', 0.11);
      if (!near(title.land, /^(ding|chime|success)$/, 0.5)) add(title.land, 'ding', 0.12);
    }
    let last = -1, k = 0, added = 0;
    for (const e of ents) {
      if (added >= 8) break;
      if (e === title || e.t - last < 0.14 || e.t < t0 + 0.1 || near(e.t, /^(pop|tap|tick|click|thud|blast|impact|ding|shutter|boing|whoosh)/, 0.1)) continue;
      add(e.t, k++ % 2 ? 'tap' : 'pop', 0.1); last = e.t; added++;
    }
  }
  window.IntroSfx = { apply };
})();
