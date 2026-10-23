<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>SOPs just became portable</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Anton"; src: url("assets/fonts/Anton-Regular.ttf"); }
      @font-face { font-family: "Permanent Marker"; src: url("assets/fonts/PermanentMarker-Regular.ttf"); }
      @font-face { font-family: "Caveat"; src: url("assets/fonts/Caveat-VF.ttf"); font-weight: 400 700; }
      @font-face { font-family: "Space Mono"; src: url("assets/fonts/SpaceMono-Bold.ttf"); font-weight: 700; }
      :root {
        --ink: #17281C; --cream: #F5F0E8; --orange: #C98A3C; --gold: #E8B84B; --sage: #9CCAA0;
        --pink: #FF4F8B; --blue: #3355FF; --claude: #D97757; --shadow: rgba(10, 20, 12, 0.35);
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: var(--ink); }
      body { font-family: "Anton", sans-serif; color: var(--ink); }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink); }
      #world { position: absolute; inset: -40px; }
      .scene { position: absolute; inset: 0; overflow: hidden; }
      .slide { position: absolute; inset: 0; }
      .sheet { position: absolute; inset: -60px; background: var(--bg); overflow: hidden; }
      .stage { position: absolute; left: 40px; top: 40px; width: 1080px; height: 1920px; }
      .rays {
        position: absolute; left: 50%; top: 44%; width: 3000px; height: 3000px; margin: -1500px 0 0 -1500px;
        border-radius: 50%;
        background: repeating-conic-gradient(var(--r1) 0deg 9deg, var(--r2) 9deg 18deg);
      }
      .scraps { position: absolute; inset: 0; }
      .scrap { position: absolute; box-shadow: 5px 6px 0 var(--shadow); }
      .bg-ink { --bg: #17281C; --r1: #17281C; --r2: #1F3727; }
      .bg-gold { --bg: #E8B84B; --r1: #E8B84B; --r2: #F2A23A; }
      .bg-claude { --bg: #D97757; --r1: #D97757; --r2: #E58C6C; }
      .bg-grid { --bg: #17281C; --r1: #17281C; --r2: #1C3123; }
      .bg-grid .sheet::after { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(156,202,160,.16) 3px, transparent 3px), linear-gradient(90deg, rgba(156,202,160,.16) 3px, transparent 3px); background-size: 72px 72px; }
      .bg-blue { --bg: #3355FF; --r1: #3355FF; --r2: #4A69FF; }
      .bg-ink2 { --bg: #17281C; --r1: #17281C; --r2: #2B3B1E; }
      .bg-pink { --bg: #FF4F8B; --r1: #FF4F8B; --r2: #FF6A9D; }
      .bg-cream { --bg: #F5F0E8; --r1: #F5F0E8; --r2: #F3DFC2; }
      .bg-sage { --bg: #9CCAA0; --r1: #9CCAA0; --r2: #AFD8B2; }
      .bg-ink3 { --bg: #17281C; --r1: #17281C; --r2: #3A3216; }

      .cut { position: absolute; }
      .b { position: relative; width: 100%; height: 100%; }
      .b > * { width: 100%; height: 100%; }
      img { display: block; }

      /* binder */
      .binder { position: relative; }
      .binder .cover { position: absolute; inset: 0; background: var(--orange); border: 6px solid #7A4E1B; border-radius: 14px 26px 26px 14px; box-shadow: 12px 14px 0 var(--shadow); overflow: hidden; }
      .binder .spine { position: absolute; left: 0; top: 0; bottom: 0; width: 19%; background: #A86E2C; border-right: 5px solid #7A4E1B; }
      .binder .spine b { position: absolute; left: 26%; width: 48%; aspect-ratio: 1; border-radius: 50%; background: var(--gold); border: 4px solid #7A4E1B; }
      .binder .label { position: absolute; left: 27%; right: 9%; top: 28%; padding: 6% 4%; background: var(--cream); color: var(--ink); font-family: "Permanent Marker"; line-height: 1.05; text-align: center; transform: rotate(-3deg); box-shadow: 5px 6px 0 rgba(0,0,0,.18); }
      .binder .label:empty { display: none; }
      .binder .tabs i { position: absolute; right: -30px; width: 44px; height: 13%; border-radius: 0 10px 10px 0; border: 4px solid rgba(0,0,0,.25); }

      /* paper bits */
      .paper { background: var(--cream); border-radius: 10px; box-shadow: 10px 12px 0 var(--shadow); }
      .page {
        position: relative; border-radius: 6px; box-shadow: 10px 12px 0 var(--shadow);
        background: var(--cream) repeating-linear-gradient(transparent 0 52px, rgba(51,85,255,.22) 52px 55px);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
      }
      .page::before { content: ""; position: absolute; left: 34px; top: 0; bottom: 0; width: 3px; background: rgba(255,79,139,.55); }
      .page.big, .page.mid { justify-content: flex-start; align-items: flex-start; padding: 56px 40px 30px 64px; gap: 10px; }
      .page.mid { padding: 34px 26px 20px 52px; }
      .page.mini { background-size: 100% 26px; }
      .tape { position: absolute; top: -24px; left: 50%; margin-left: -66px; width: 132px; height: 46px; background: rgba(245,240,232,.78); border: 2px solid rgba(0,0,0,.06); transform: rotate(-4deg); }
      .icon { width: 130px !important; height: 130px !important; }
      .pword { font-family: "Permanent Marker"; font-size: 58px; line-height: 1; text-align: center; padding: 0 12px; }
      .ptitle { font-family: "Permanent Marker"; font-size: 52px; line-height: 1.05; color: var(--ink); }
      .pline { font-size: 60px; line-height: 1.1; color: #1D3BCC; }
      .hand { font-family: "Caveat"; font-weight: 700; }
      .sticky { position: relative; padding: 34px 18px 18px; box-shadow: 9px 11px 0 var(--shadow); display: flex; align-items: center; justify-content: center; text-align: center; line-height: .95; color: var(--ink); }
      .star { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
      .tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
      .tlabel { font-size: 42px; letter-spacing: 2px; }
      .logo { background: #fff; border-radius: 28px; border: 7px solid var(--c); display: grid; place-items: center; box-shadow: 8px 10px 0 var(--shadow); }
      .logo img { display: block; }
      .logo.chipface span { font-family: "Anton"; font-size: 40px; line-height: 1; text-align: center; padding: 0 6px; }
      .logo.more span { font-size: 64px; color: var(--ink); }
      .folder { position: relative; background: var(--gold); border-radius: 0 14px 14px 14px; box-shadow: 10px 12px 0 var(--shadow); display: grid; place-items: center; border: 5px solid #A9802A; }
      .folder .ftab { position: absolute; left: -5px; top: -42px; width: 130px; height: 44px; background: var(--gold); border: 5px solid #A9802A; border-bottom: none; border-radius: 12px 12px 0 0; }
      .ftext { font-size: 62px; text-align: center; line-height: 1; color: var(--ink); }
      .box3 { position: relative; }
      .box3 .front { position: absolute; left: 0; right: 0; top: 70px; bottom: 0; background: var(--ink); border: 6px solid #0B140E; border-radius: 6px; box-shadow: 12px 14px 0 var(--shadow); display: grid; place-items: center; padding: 20px; }
      .box3 .front span { color: var(--cream); font-size: 70px; line-height: 1; text-align: center; }
      .box3 .lid { position: absolute; left: -10px; right: -10px; top: 40px; height: 44px; background: #2C4A33; border: 6px solid #0B140E; border-radius: 6px; }
      .stamp { display: grid; place-items: center; border: 12px solid var(--ink); color: var(--ink); background: rgba(245,240,232,.9); border-radius: 16px; letter-spacing: 6px; box-shadow: 8px 10px 0 var(--shadow); }
      .stamp.small { border-width: 8px; color: #C2185B; border-color: #C2185B; background: rgba(255,255,255,.85); }
      .chip { display: inline-block; width: auto !important; height: auto !important; padding: 4px 26px; border-radius: 12px; box-shadow: 7px 8px 0 var(--shadow); line-height: 1.15; white-space: nowrap; }
      .glow { border-radius: 50%; background: radial-gradient(circle, rgba(232,184,75,.95) 0 30%, rgba(232,184,75,.35) 31% 55%, transparent 56%); }
      .bubble { background: #fff; border-radius: 40px; font-size: 64px; display: grid; place-items: center; box-shadow: 7px 8px 0 var(--shadow); color: var(--ink); }
      .mega { font-size: 300px; line-height: 1; text-align: center; -webkit-text-stroke: 10px var(--ink); paint-order: stroke fill; text-shadow: 12px 14px 0 var(--shadow); }
      .ticket { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
      .ticket.gold { background: var(--gold); }
      .num { font-size: 190px; line-height: 1; color: var(--ink); }
      .num.huge { font-size: 250px; }
      .appwin { background: #D9DEE6; border: 6px solid var(--ink); border-radius: 18px; box-shadow: 8px 10px 0 var(--shadow); display: flex; flex-direction: column; }
      .appwin .dots { height: 40px; background: #AEB6C2; border-bottom: 5px solid var(--ink); display: flex; gap: 10px; align-items: center; padding-left: 14px; }
      .appwin .dots i { width: 16px; height: 16px; border-radius: 50%; background: var(--ink); }
      .appt { flex: 1; display: grid; place-items: center; font-size: 74px; }
      .caution { background: repeating-linear-gradient(45deg, #FFD23F 0 46px, #17281C 46px 92px); border: 6px solid #17281C; box-shadow: 8px 10px 0 var(--shadow); display: grid; place-items: center; overflow: hidden; }
      .caution { font-size: 0; }
      .padlock { position: relative; }
      .padlock .shackle { position: absolute; left: 40px; top: 0; width: 140px; height: 150px; border: 28px solid #6B7480; border-bottom: none; border-radius: 70px 70px 0 0; }
      .padlock .lbody { position: absolute; left: 0; right: 0; top: 110px; bottom: 0; background: var(--gold); border: 8px solid var(--ink); border-radius: 22px; box-shadow: 10px 12px 0 var(--shadow); }
      .padlock .kh { position: absolute; left: 50%; top: 40%; width: 34px; height: 60px; margin-left: -17px; background: var(--ink); border-radius: 17px 17px 6px 6px; }
      .arrows { position: absolute; left: 0; top: 0; overflow: visible; }
      .arrows path { fill: none; stroke: var(--ink); stroke-width: 9; stroke-linecap: round; stroke-dasharray: 22 18; }
      .bcard { border-radius: 22px; box-shadow: 10px 12px 0 var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; border: 6px solid var(--ink); }
      .blabel { color: #fff; font-size: 54px; line-height: 1; }
      .check { border-radius: 50%; background: #2BB673; border: 6px solid var(--ink); display: grid; place-items: center; box-shadow: 6px 7px 0 var(--shadow); }
      .check img { width: 64px; height: 64px; filter: brightness(10); }
      .lock { display: grid; place-items: center; }
      .scenecard { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 28px; gap: 16px; }
      .boxes { position: relative; width: 340px; height: 300px; }
      .boxes img { position: absolute; image-rendering: pixelated; }
      .boxes img:nth-child(1) { left: 20px; bottom: 0; width: 140px; }
      .boxes img:nth-child(2) { left: 160px; bottom: 0; width: 140px; }
      .boxes img:nth-child(3) { left: 90px; bottom: 120px; width: 140px; }
      .boxes img.who { left: auto; right: -20px; bottom: 0; width: 120px; }
      .boxes img.cart { left: 170px; bottom: 150px; width: 110px; }
      .letter { border-radius: 14px; border: 6px solid var(--ink); box-shadow: 8px 10px 0 var(--shadow); display: grid; place-items: center; font-size: 132px; line-height: 1; }
      .igc { background: #fff; border-radius: 34px; box-shadow: 10px 12px 0 var(--shadow); display: flex; align-items: center; gap: 26px; padding: 0 34px; border: 5px solid var(--ink); }
      .igc .ava { width: 92px; height: 92px; border-radius: 50%; flex: none; background: conic-gradient(#FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75); border: 5px solid var(--ink); }
      .igc .who2 { font-family: "Space Mono"; font-size: 28px; color: #5B6470; }
      .igc .said { font-size: 76px; line-height: 1; color: var(--ink); letter-spacing: 3px; }
      .igc .heart { width: 64px; height: 64px; margin-left: auto; }
      .marquee { position: absolute; left: 0; top: 1440px; display: flex; gap: 70px; opacity: .22; white-space: nowrap; }
      .marquee img { width: 96px; height: 96px; filter: brightness(0) invert(1); }
      .marquee.dark img { filter: brightness(0); }
      .marquee.dark { opacity: .14; top: 1440px; }

      /* captions */
      #caps { position: absolute; left: 0; top: 1180px; width: 1080px; height: 180px; }
      .cg { position: absolute; left: 0; top: 0; width: 1080px; height: 180px; display: flex; justify-content: center; align-items: center; gap: 14px; }
      .cw { position: relative; font-size: 96px; line-height: 1.1; padding: 2px 20px 6px; color: var(--ink); background: var(--cream); border-radius: 10px; border: 5px solid var(--ink); box-shadow: 7px 8px 0 rgba(0,0,0,.4); white-space: nowrap; }
      #tex { position: absolute; inset: 0; pointer-events: none; opacity: .16; mix-blend-mode: multiply;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .9 0'/></filter><rect width='400' height='400' filter='url(%23n)'/></svg>"); }
      #vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.28) 100%); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="__D__" data-width="1080" data-height="1920">
      <div id="world">
<!--SCENES-->
      </div>
      <div id="caps"></div>
      <div id="tex"></div>
      <div id="vig"></div>

      <audio id="vo" src="assets/audio/vo-tight.wav" data-start="0.4" data-duration="26.44" data-volume="1" data-track-index="20"></audio>
      <audio id="music" src="assets/audio/music.mp3" data-start="0" data-duration="__D__" data-media-start="8.02" data-volume="1" data-track-index="21"
        data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0.42},{"t":0.35,"v":0.15},{"t":26.7,"v":0.15},{"t":27.3,"v":0.45},{"t":29.2,"v":0.45},{"t":30.4,"v":0}]}]}'></audio>
    <!--SFX-->
    </div>

    <script src="captions.js"></script>
    <script>
      (function () {
        const FPS = 12, D = __D__;
        const RING = /*RING*/;
        function rnd(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
        const T = gsap.timeline({ paused: true });
        const $ = (s) => document.querySelector(s);

        // ---------- helpers (all times are composition seconds) ----------
        const dirs = { top: { x: 0, y: -1500 }, bottom: { x: 0, y: 1500 }, left: { x: -1300, y: 0 }, right: { x: 1300, y: 0 } };
        function slap(sel, t, from, rot, dur) {
          const o = dirs[from || "top"];
          T.fromTo(sel, { x: o.x, y: o.y, rotation: (rot || 0) + (o.x ? (o.x < 0 ? -35 : 35) : 25), scale: 1 },
            { x: 0, y: 0, rotation: rot || 0, duration: dur || 0.25, ease: "back.out(1.5)" }, t);
        }
        function pop(sel, t, rot, dur) {
          T.fromTo(sel, { scale: 0, rotation: (rot || 0) - 30 }, { scale: 1, rotation: rot || 0, duration: dur || 0.25, ease: "back.out(2.4)" }, t);
        }
        function stampIn(sel, t, rot, amp) {
          T.fromTo(sel, { scale: 2.8, opacity: 0, rotation: (rot || 0) + 10 }, { scale: 1, opacity: 1, rotation: rot || 0, duration: 0.17, ease: "power4.in" }, t);
          shake(t + 0.17, amp || 14);
        }
        function shake(t, a) {
          T.to("#world", { keyframes: [{ x: a, y: -a * 0.6, duration: 0.084 }, { x: -a * 0.7, y: a * 0.5, duration: 0.084 }, { x: a * 0.3, y: -a * 0.2, duration: 0.084 }, { x: 0, y: 0, duration: 0.084 }] }, t);
        }
        function wobble(sel, t0, t1, amp, period, base) {
          const n = Math.max(1, Math.floor((t1 - t0) / period));
          T.fromTo(sel, { rotation: (base || 0) - amp }, { rotation: (base || 0) + amp, duration: period, ease: "sine.inOut", yoyo: true, repeat: n - 1, immediateRender: false }, t0);
        }
        function hop(sel, t, h) {
          T.to(sel, { keyframes: [{ y: -(h || 60), scaleY: 1.08, scaleX: 0.94, duration: 0.17, ease: "power2.out" }, { y: 0, scaleY: 0.86, scaleX: 1.12, duration: 0.17, ease: "power2.in" }, { scaleY: 1, scaleX: 1, duration: 0.17 }] }, t);
        }

        // ---------- scene slides, rays, scraps ----------
        const B = [0, 2.2, 4.8, 7.68, 10.56, 12.76, 16.32, 18.36, 21.7, 24.5, D];
        const from = ["top", "right", "bottom", "left", "top", "right", "bottom", "left", "top", "right"];
        const scrapCols = [
          ["#E8B84B", "#FF4F8B", "#9CCAA0", "#3355FF", "#F5F0E8"],
          ["#17281C", "#FF4F8B", "#F5F0E8", "#3355FF", "#C98A3C"],
          ["#17281C", "#F5F0E8", "#E8B84B", "#3355FF", "#9CCAA0"],
          ["#E8B84B", "#FF4F8B", "#9CCAA0", "#F5F0E8", "#D97757"],
          ["#E8B84B", "#F5F0E8", "#FF4F8B", "#9CCAA0", "#17281C"],
          ["#E8B84B", "#FF4F8B", "#3355FF", "#9CCAA0", "#F5F0E8"],
          ["#17281C", "#E8B84B", "#F5F0E8", "#3355FF", "#9CCAA0"],
          ["#C98A3C", "#3355FF", "#FF4F8B", "#9CCAA0", "#17281C"],
          ["#17281C", "#F5F0E8", "#E8B84B", "#FF4F8B", "#3355FF"],
          ["#E8B84B", "#FF4F8B", "#9CCAA0", "#3355FF", "#C98A3C"],
        ];
        for (let i = 0; i < 10; i++) {
          const s0 = i === 0 ? 0 : B[i] - 0.12, s1 = i === 9 ? D : B[i + 1] + 0.25;
          if (i > 0) slap(`#s${i + 1}-slide`, s0, from[i], (i % 2 ? 4 : -4), 0.25);
          if (i > 0) T.to(`#s${i + 1}-slide`, { rotation: 0, duration: 0.17 }, s0 + 0.25);
          T.fromTo(`#s${i + 1}-rays`, { rotation: i * 7 }, { rotation: i * 7 + (i % 2 ? -1 : 1) * 14 * (s1 - s0), duration: s1 - s0, ease: "none" }, s0);
          // paper scraps drifting in the background
          const box = $(`#s${i + 1}-scraps`);
          for (let k = 0; k < 16; k++) {
            const r = (n) => rnd(i * 1000 + k * 37 + n);
            const el = document.createElement("div");
            el.className = "scrap";
            const size = 26 + r(1) * 70, shape = Math.floor(r(2) * 4);
            el.style.left = Math.round(r(3) * 1140) + "px";
            el.style.top = Math.round(r(4) * 2000) + "px";
            el.style.width = Math.round(size) + "px";
            el.style.height = Math.round(shape === 1 ? size * 0.38 : size) + "px";
            el.style.background = scrapCols[i][k % 5];
            if (shape === 0) el.style.borderRadius = "50%";
            if (shape === 2) el.style.clipPath = "polygon(50% 0%, 100% 100%, 0% 100%)";
            if (shape === 3) el.style.clipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
            box.appendChild(el);
            const dy = -(120 + r(5) * 260), dx = (r(6) - 0.5) * 160;
            T.fromTo(el, { x: 0, y: 0, rotation: r(7) * 360 }, { x: dx, y: dy, rotation: r(7) * 360 + (r(8) - 0.5) * 540, duration: s1 - s0, ease: "none" }, s0);
          }
        }

        // ---------- S1 binder ----------
        T.fromTo("#s1-binder", { y: -620, rotation: -14 }, { y: 0, rotation: -3, duration: 0.28, ease: "power3.in" }, 0);
        T.to("#s1-binder", { keyframes: [{ scaleY: 0.86, scaleX: 1.1, duration: 0.084 }, { scaleY: 1.05, scaleX: 0.97, duration: 0.084 }, { scaleY: 1, scaleX: 1, duration: 0.084 }] }, 0.28);
        shake(0.28, 18);
        wobble("#s1-binder", 0.6, 2.2, 2, 0.5, -3);
        slap("#s1-note", 0.9, "right", 8);
        pop("#s1-bulb", 1.32, -6);
        hop("#s1-bulb", 1.75, 50);
        pop("#s1-star1", 0.5, 0); pop("#s1-star2", 1.1, 20);
        T.to(["#s1-star1", "#s1-star2"], { rotation: "+=180", duration: 1.5, ease: "none" }, 0.75);

        // ---------- S2 pages fly out ----------
        const p2t = [2.4, 3.1, 3.78], p2r = [-8, 4, 9], p2x = [60, 405, 680];
        T.fromTo("#s2-binder", { scale: 1 }, { keyframes: [{ scaleY: 0.82, scaleX: 1.14, duration: 0.084 }, { scaleY: 1.1, scaleX: 0.92, duration: 0.084 }, { scaleY: 1, scaleX: 1, duration: 0.17 }] }, 2.22);
        p2t.forEach((t, i) => {
          const sel = `#s2-p${i + 1}`;
          T.fromTo(sel, { x: 540 - 135 - p2x[i], y: 860 - 270, scale: 0.25, rotation: 180 + i * 40 }, { x: 0, y: 0, scale: 1, rotation: p2r[i], duration: 0.34, ease: "back.out(1.6)" }, t - 0.08);
          T.set(sel, { opacity: 0 }, 0);
          T.set(sel, { opacity: 1 }, t - 0.08);
          hop("#s2-binder", t - 0.08, 30);
          wobble(sel, t + 0.3, 4.95, 2.5, 0.42, p2r[i]);
        });

        // ---------- S3 Anthropic gives skills ----------
        slap("#s3-anth", 4.84, "left", -5);
        pop("#s3-claude", 5.0, 10);
        slap("#s3-note", 5.2, "right", 7);
        slap("#s3-folder", 5.54, "bottom", -6);
        slap("#s3-box", 6.2, "right", 3);
        T.to("#s3-folder", { keyframes: [{ x: 230, y: -260, rotation: 18, duration: 0.25, ease: "power2.out" }, { x: 470, y: -110, rotation: 4, duration: 0.25, ease: "power2.in" }, { x: 470, y: -20, rotation: 0, duration: 0.17 }] }, 6.4);
        stampIn("#s3-stamp", 6.95, -10, 16);
        wobble("#s3-anth", 5.2, 7.8, 2, 0.5, -5);
        wobble("#s3-claude", 5.3, 7.8, 8, 0.33, 10);

        // ---------- S4 what a skill is ----------
        slap("#s4-page", 7.72, "bottom", -2);
        stampIn("#s4-tag", 7.9, 10, 8);
        [8.3, 8.75, 9.2, 9.6].forEach((t, i) => T.fromTo(`#s4-l${i}`, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.34, ease: "none" }, t));
        pop("#s4-bulb", 9.3, 6);
        T.fromTo("#s4-glow", { scale: 0, opacity: 0 }, { scale: 1.2, opacity: 1, duration: 0.25, ease: "back.out(2)" }, 9.92);
        T.to("#s4-glow", { scale: 0.9, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 10.17);
        pop("#s4-bubble", 9.95, -4);
        hop("#s4-bulb", 10.0, 70);

        // ---------- S5 70+ tools: pages turn into logos ----------
        pop("#s5-binder", 10.5, -3);
        stampIn("#s5-70", 10.62, -4, 18);
        T.fromTo("#s5-mq1", { x: 0 }, { x: -900, duration: 2.6, ease: "none" }, 10.44);
        RING.forEach(([x, y], i) => {
          const t = 10.82 + i * 0.125;
          const dx = 540 - x, dy = 850 - y;
          T.fromTo(`#s5-pg${i}`, { x: dx, y: dy, scale: 0.3, rotation: 0, opacity: 1 }, { x: 0, y: 0, scale: 1, rotation: 160 + i * 25, duration: 0.17, ease: "power2.out" }, t);
          T.set(`#s5-pg${i}`, { opacity: 0 }, t + 0.17);
          T.fromTo(`#s5-lg${i}`, { scale: 0, rotation: -40 }, { scale: 1, rotation: (i % 2 ? 6 : -6), duration: 0.25, ease: "back.out(2.6)" }, t + 0.16);
          wobble(`#s5-lg${i}`, t + 0.42, 12.9, 5, 0.33, (i % 2 ? 6 : -6));
          hop("#s5-binder", t, 18);
        });
        T.set(RING.map((_, i) => `#s5-pg${i}`), { opacity: 0 }, 0);

        // ---------- S6 numbers ----------
        const fmt = (v) => Math.round(v).toLocaleString("en-US");
        slap("#s6-c1", 12.76, "left", -2);
        const n1 = { v: 0 }, n2 = { v: 0 };
        T.to(n1, { v: 1000000, duration: 0.67, ease: "power1.out", onUpdate: () => { $("#s6-n1").textContent = fmt(n1.v); } }, 12.84);
        slap("#s6-c2", 14.0, "right", 2);
        T.to(n2, { v: 280, duration: 0.92, ease: "power1.out", onUpdate: () => { $("#s6-n2").textContent = Math.round(n2.v) + "M"; } }, 14.24);
        T.to("#s6-c2", { keyframes: [{ scale: 1.08, duration: 0.084 }, { scale: 1, duration: 0.17 }] }, 15.62);
        shake(15.62, 16);
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          T.fromTo(`#s6-coin${k}`, { x: 0, y: 0, scale: 0, rotation: 0 }, { x: Math.cos(a) * (380 + rnd(k) * 120), y: Math.sin(a) * 330 - 120, scale: 1.4, rotation: 360, duration: 0.5, ease: "power2.out" }, 15.62);
          T.to(`#s6-coin${k}`, { y: "+=420", opacity: 0, duration: 0.5, ease: "power2.in" }, 16.12);
        }
        wobble("#s6-c1", 13.5, 16.4, 1.2, 0.5, -2);

        // ---------- S7 locked, then free ----------
        slap("#s7-binder", 16.32, "bottom", 3);
        T.fromTo("#s7-tape1", { x: -1300, rotation: 24 }, { x: 0, rotation: 24, duration: 0.17, ease: "power3.out" }, 16.82);
        T.fromTo("#s7-tape2", { x: 1300, rotation: -24 }, { x: 0, rotation: -24, duration: 0.17, ease: "power3.out" }, 16.96);
        shake(16.99, 10); shake(17.13, 10);
        T.fromTo("#s7-lock", { y: -1200, rotation: -20 }, { y: 0, rotation: 0, duration: 0.17, ease: "power3.in" }, 17.03);
        shake(17.2, 20);
        slap("#s7-app", 17.38, "left", -6);
        T.to("#s7-shackle", { y: -70, rotation: 25, duration: 0.17, ease: "back.out(3)" }, 18.04);
        T.to("#s7-lock", { y: 1400, rotation: 70, duration: 0.42, ease: "power2.in" }, 18.12);
        T.to("#s7-tape1", { x: -1500, y: -300, rotation: -30, duration: 0.25, ease: "power2.in" }, 18.04);
        T.to("#s7-tape2", { x: 1500, y: -200, rotation: 40, duration: 0.25, ease: "power2.in" }, 18.04);
        T.to("#s7-app", { x: -600, rotation: -40, duration: 0.25, ease: "power2.in" }, 18.1);
        hop("#s7-binder", 18.1, 90);

        // ---------- S8 write once, runs anywhere ----------
        T.fromTo("#s8-mq1", { x: -900 }, { x: 0, duration: 3.6, ease: "none" }, 18.24);
        slap("#s8-page", 18.42, "top", -3);
        [0, 1, 2].forEach((i) => {
          T.fromTo(`#s8-ar${i}`, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 18.62 + i * 0.084);
          T.fromTo(`#s8-ar${i}`, { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": -240 }, duration: 3.2, ease: "none" }, 18.62);
        });
        const c8 = [19.22, 19.82, 20.66], r8 = [-5, 3, 6];
        c8.forEach((t, i) => { slap(`#s8-card${i}`, t, "bottom", r8[i]); wobble(`#s8-card${i}`, t + 0.3, 21.9, 2.5, 0.42, r8[i]); });
        [21.0, 21.12, 21.24].forEach((t, i) => stampIn(`#s8-chk${i}`, t, -8, 6));

        // ---------- S9 we write those binders ----------
        slap("#s9-lockup", 21.78, "top", -2);
        pop("#s9-b1", 22.14, -12); pop("#s9-b2", 23.9, 14);
        slap("#s9-wh", 22.8, "left", -4);
        slap("#s9-st", 23.72, "right", 4);
        wobble("#s9-wh", 23.1, 24.8, 2, 0.42, -4);
        wobble("#s9-lockup", 22.1, 24.8, 1.2, 0.5, -2);

        // ---------- S10 CTA ----------
        slap("#s10-comment", 24.56, "top", -2);
        "SYSTEMS".split("").forEach((_, i) => {
          const t = 24.82 + i * 0.083, rr = (i % 2 ? 5 : -5);
          stampIn(`#s10-l${i}`, t, rr, 4);
          T.to(`#s10-l${i}`, { keyframes: [{ y: -34, duration: 0.17, ease: "power2.out" }, { y: 0, duration: 0.17, ease: "power2.in" }], repeat: 6, repeatDelay: 0.42, immediateRender: false }, 26.9 + i * 0.084);
        });
        slap("#s10-bubble", 25.3, "left", -2);
        T.fromTo("#s10-said", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.34, ease: "steps(7)" }, 25.46);
        slap("#s10-sheet", 25.9, "bottom", -5);
        stampIn("#s10-free", 26.1, 12, 10);
        pop("#s10-bulb", 26.2, 4);
        [27.0, 27.7, 28.4, 29.1, 29.8].forEach((t) => hop("#s10-bulb", t, 70));
        wobble("#s10-bubble", 26.0, 30.4, 1.5, 0.5, -2);
        // confetti bursts in the tail so the end card never sits still
        const cf = $("#s10-confetti");
        const cfc = ["#E8B84B", "#FF4F8B", "#9CCAA0", "#3355FF", "#F5F0E8", "#C98A3C", "#D97757"];
        [[26.9, 540, 470], [28.0, 300, 900], [29.1, 780, 700]].forEach(([t0, cx, cy], b) => {
          for (let k = 0; k < 22; k++) {
            const r = (n) => rnd(b * 500 + k * 19 + n);
            const el = document.createElement("div");
            el.className = "scrap";
            el.style.left = cx + "px"; el.style.top = cy + "px";
            el.style.width = Math.round(18 + r(1) * 26) + "px"; el.style.height = Math.round(10 + r(2) * 16) + "px";
            el.style.background = cfc[k % cfc.length];
            cf.appendChild(el);
            const a = r(3) * Math.PI * 2, d = 200 + r(4) * 380;
            T.fromTo(el, { x: 0, y: 0, scale: 0, rotation: 0 }, { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8 - 120, scale: 1, rotation: r(5) * 720, duration: 0.42, ease: "power2.out" }, t0);
            T.to(el, { y: "+=360", rotation: "+=300", opacity: 0, duration: 0.67, ease: "power1.in" }, t0 + 0.42);
          }
        });
        wobble("#s10-sheet", 26.3, 30.4, 3, 0.42, -5);

        // ---------- captions: word-by-word paper chips ----------
        const caps = $("#caps");
        const groups = window.CAPTIONS.slice();
        groups.push([{ w: "COMMENT", s: 26.9, e: 30.4 }, { w: "SYSTEMS", s: 26.9, e: 30.4 }]);
        groups.forEach((g, gi) => {
          const div = document.createElement("div");
          div.className = "cg";
          caps.appendChild(div);
          const gStart = g[0].s, gEnd = gi + 1 < groups.length ? groups[gi + 1][0].s : D;
          const chips = g.map((w, wi) => {
            const c = document.createElement("div");
            c.className = "cw";
            c.textContent = w.w.replace(/[.,]+$/, "");
            div.appendChild(c);
            return c;
          });
          // fit: shrink the whole line if it is wider than 840px (measured once at setup)
          const width = chips.reduce((a, c) => a + c.offsetWidth, 0) + 14 * (chips.length - 1);
          const fit = width > 840 ? 840 / width : 1;
          T.set(div, { opacity: 0, scale: fit }, 0);
          T.set(div, { opacity: 1 }, gStart);
          T.set(div, { opacity: 0 }, gEnd);
          chips.forEach((c, wi) => {
            const w = g[wi], rot = ((gi * 3 + wi) % 3 - 1) * 2.5;
            const isKey = /SYSTEMS|70\+|1M|280M|^1$|ANYMORE|FREE/.test(w.w);
            T.fromTo(c, { scale: 0, rotation: rot - 20 }, { scale: 1, rotation: rot, duration: 0.17, ease: "back.out(3)", immediateRender: false }, w.s);
            T.set(c, { scale: 0 }, 0);
            T.set(c, { backgroundColor: isKey ? "#FF4F8B" : "#E8B84B", color: isKey ? "#FFFFFF" : "#17281C" }, w.s);
            const next = g[wi + 1];
            if (next && next.s > w.s) T.set(c, { backgroundColor: "#F5F0E8", color: "#17281C" }, next.s);
          });
        });

        // ---------- stepped driver: quantize to 12 fps, then 2-frame paper boil ----------
        const boils = Array.from(document.querySelectorAll(".b"));
        const tex = $("#tex");
        T.set({}, {}, D);
        function applyTime(t) {
          const step = Math.floor(t * FPS + 1e-6);
          T.totalTime(Math.min(D, step / FPS), false);
          const bi = Math.floor(step / 2);
          for (let i = 0; i < boils.length; i++) {
            gsap.set(boils[i], { x: (rnd(bi * 13 + i * 7.1) - 0.5) * 6, y: (rnd(bi * 29 + i * 3.3) - 0.5) * 6, rotation: (rnd(bi * 47 + i * 5.7) - 0.5) * 1.8 });
          }
          tex.style.backgroundPosition = ((bi * 137) % 400) + "px " + ((bi * 91) % 400) + "px";
          tex.style.opacity = (0.13 + rnd(bi * 3.7) * 0.07).toFixed(3);
        }
        const tl = gsap.timeline({ paused: true, onUpdate: () => applyTime(tl.time()) });
        tl.to({ p: 0 }, { p: 1, duration: D, ease: "none" }, 0);
        applyTime(0);
        window.__timelines = window.__timelines || {};
        window.__timelines["main"] = tl;
      })();
    </script>
  </body>
</html>
