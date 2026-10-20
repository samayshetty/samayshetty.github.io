/* career.git â€” interactive language, three movements.
   HOME: the name condenses out of thousands of glowing particles assembled
   from the real commit count, holds, then disperses downstream and hands
   over to the DOM title.
   JOURNEY: a fixed full-screen canvas renders one glowing river in document
   space. Scrolling flies a camera downstream: the view banks with the river's
   curvature, zooms gently into the nearest milestone pool, and particles gain
   motion trails. Light follows the real hour-of-day histogram (F.hour): warm
   dawn water, bright noon current, neon midnight bands; a sun and moon glide
   over the banks according to the band in view.
   EVERYWHERE: reveal choreography, delta bars, the PR table, and the
   cross-page Ctrl+K palette with real targets.
   Dependency-free; every frame is hand-drawn. */

(() => {
  "use strict";
  const F = window.FORGE;
  if (!F) return;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) {
    // Static ambience only: no loops, no camera; content stays readable.
    document.documentElement.style.setProperty("scroll-behavior", "auto");
  }

  const $ = (id) => document.getElementById(id);
  const MONO = '11px ui-monospace, Consolas, monospace';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (u) => Math.sin(clamp(u, 0, 1) * Math.PI / 2);

  /* =========================================================
     AMBIENT SOUNDSCAPE — purely synthesized, seeded by real data
     No audio files: the river is filtered noise whose loudness
     follows the real weekly work volume in view; the night bands
     get crickets, the dawn band gets birdsong, and each real
     milestone crossing rolls a distant thunder. Off by default;
     the topbar toggle creates the context (autoplay-safe).
     ========================================================= */

  const AUD = {
    on: false, ac: null, master: null, windGain: null,
    activity: 0.3, night: 0, dawn: 0, page: "",
    toggle() {
      if (!this.ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { this.toggle = () => {}; return; }
        this.ac = new AC();
        this.master = this.ac.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.ac.destination);
        const sr = this.ac.sampleRate;
        const buf = this.ac.createBuffer(1, sr * 2, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ac.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = this.ac.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 340;
        this.windGain = this.ac.createGain();
        this.windGain.gain.value = 0.1;
        src.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.master);
        src.start();
      }
      if (this.ac.state === "suspended") this.ac.resume();
      this.on = !this.on;
      const btn = $("audio-btn");
      if (btn) {
        btn.classList.toggle("on", this.on);
        btn.setAttribute("aria-pressed", String(this.on));
      }
    },
    chirp(f0, f1, dur, vol, delay) {
      if (!this.on || !this.ac || this.ac.state !== "running") return;
      const t0 = this.ac.currentTime + (delay || 0);
      const osc = this.ac.createOscillator();
      const g = this.ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f0, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    },
    crickets() {
      for (let k = 0; k < 3; k++) {
        this.chirp(4100 + Math.random() * 600, 3600, 0.05, 0.04, k * 0.095 + Math.random() * 0.05);
      }
    },
    birdcall() {
      this.chirp(2300, 3400, 0.1, 0.05);
      this.chirp(3200, 2500, 0.14, 0.04, 0.16 + Math.random() * 0.06);
    },
    thunder() {
      if (!this.on || !this.ac || this.ac.state !== "running") return;
      const t0 = this.ac.currentTime;
      const buf = this.ac.createBuffer(1, Math.floor(this.ac.sampleRate * 2.4), this.ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.3);
      }
      const src = this.ac.createBufferSource();
      src.buffer = buf;
      const f = this.ac.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(240, t0);
      f.frequency.exponentialRampToValueAtTime(56, t0 + 2.2);
      const g = this.ac.createGain();
      g.gain.value = 0.5;
      src.connect(f);
      f.connect(g);
      g.connect(this.master);
      src.start(t0);
    },
  };

  /* =========================================================
     MOVEMENT 1 â€” particle genesis (home page)
     ========================================================= */

  function initGenesis() {
    const gCan = $("genesis");
    if (!gCan || REDUCED) return;
    if (window.innerWidth < 540) return;
    const nameEl = document.body.querySelector(".hero-name");
    if (!nameEl) return;

    const gctx = gCan.getContext("2d");
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    gCan.width = W * dpr;
    gCan.height = H * dpr;
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Sample the name out of an offscreen rendering: every lit 3px cell
    // becomes one particle's destination.
    const off = document.createElement("canvas");
    const fontSize = clamp(W * 0.082, 40, 88);
    off.width = W;
    off.height = Math.ceil(fontSize * 1.9);
    const octx = off.getContext("2d");
    octx.font = `800 ${fontSize}px -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(F.meta.name || "", off.width / 2, off.height / 2);
    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const targets = [];
    for (let y = 0; y < off.height; y += 3) {
      for (let x = 0; x < off.width; x += 3) {
        if (img[(y * off.width + x) * 4 + 3] > 128) {
          targets.push({ x: x - off.width / 2, y: y - off.height / 2 });
        }
      }
    }
    // Fisher-Yates shuffle so assembly streams in random order.
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }

    const particles = targets.slice(0, 2600).map((t, i) => {
      const pick = Math.random();
      return {
        sx: Math.random() * W,
        sy: Math.random() * H,
        tx: W / 2 + t.x,
        ty: H * 0.40 + t.y,
        delay: (i % 40) / 40 * 0.5,
        size: 0.8 + Math.random() * 1.6,
        tone: pick < 0.62 ? "79,209,197" : pick < 0.9 ? "88,166,255" : "255,201,77",
      };
    });

    document.body.classList.add("genesis-active");
    const stamp = performance.now();
    const ASSEMBLE = 2600, ALIVE_MAX = 9000, DISPERSE = 1700;
    let gMode = "assemble";
    let disperseStamp = 0;
    const gMouse = { x: -9999, y: -9999 };

    // the assembled name stays alive; any input dissolves it downstream
    function gDisperse() {
      if (gMode !== "alive") return;
      gMode = "disperse";
      disperseStamp = performance.now();
    }
    window.addEventListener("mousemove", (ev) => {
      gMouse.x = ev.clientX;
      gMouse.y = ev.clientY;
    }, { passive: true });
    ["wheel", "pointerdown", "keydown", "touchstart"].forEach((type) => {
      document.addEventListener(type, gDisperse, { once: true, passive: true });
    });

    function gDraw(x, y, p, alpha) {
      if (alpha <= 0.01) return;
      gctx.beginPath();
      gctx.arc(x, y, p.size, 0, Math.PI * 2);
      gctx.fillStyle = `rgba(${p.tone},${alpha})`;
      gctx.shadowColor = `rgba(${p.tone},0.8)`;
      gctx.shadowBlur = 6;
      gctx.fill();
    }

    function genesisFrame(now) {
      const t = now - stamp;
      gctx.clearRect(0, 0, W, H);
      let keep = true;
      if (t < ASSEMBLE) {
        particles.forEach((p) => {
          const local = (t - p.delay * 1000) / ASSEMBLE;
          if (local < 1) {
            const u = ease(Math.max(0, local));
            gDraw(lerp(p.sx, p.tx, u), lerp(p.sy, p.ty, u), p, 0.25 + 0.55 * u);
          }
        });
      } else {
        if (gMode === "assemble") {
          gMode = "alive";
          particles.forEach((p) => {
            p.x = p.tx;
            p.y = p.ty;
          });
        }
        if (gMode === "alive" && t > ASSEMBLE + ALIVE_MAX) gDisperse();
        particles.forEach((p) => {
          let x, y, alpha;
          if (gMode === "alive") {
            // the name breathes: a gentle drift, and particles part around
            // the cursor like water around a stone
            const hx = p.tx + Math.sin(now / 620 + p.tx * 0.7) * 1.6;
            const hy = p.ty + Math.cos(now / 700 + p.ty * 0.9) * 1.2;
            const dx = p.x - gMouse.x;
            const dy = p.y - gMouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 12100 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const push = ((110 - d) / 110) * 4.5;
              p.x += (dx / d) * push;
              p.y += (dy / d) * push;
            }
            p.x += (hx - p.x) * 0.16;
            p.y += (hy - p.y) * 0.16;
            x = p.x;
            y = p.y;
            alpha = 0.72 + 0.28 * Math.sin(now / 300 + p.tx);
          } else {
            const u = Math.min(1, (now - disperseStamp) / DISPERSE);
            const fall = u * u * (H * 0.5);
            x = p.tx + Math.sin(p.ty * 0.02 + u * 4) * 26 * u + u * W * 0.05;
            y = p.ty + fall;
            alpha = 0.85 * (1 - u);
            keep = u < 0.995;
          }
          gDraw(x, y, p, alpha);
        });
      }
      if (t > ASSEMBLE + 350) document.body.classList.remove("genesis-active");
      if (
        !keep ||
        (gMode === "disperse" && now - disperseStamp > DISPERSE + 40)
      ) {
        gCan.style.transition = "opacity 0.7s";
        gCan.style.opacity = "0";
        document.body.classList.remove("genesis-active");
        setTimeout(() => { gCan.style.display = "none"; }, 750);
      } else {
        requestAnimationFrame(genesisFrame);
      }
    }
    requestAnimationFrame(genesisFrame);
  }

  /* =========================================================
     MOVEMENT 2+3 â€” the river engine (journey page)
     ========================================================= */

  const canvas = $("river");
  if (canvas) { // ---- the river engine (journey page only) ----
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;

  let riverTop = 0, riverEnd = 1, docHeight = 10;

  const heat = F.heatmap && F.heatmap.counts ? F.heatmap.counts : [];
  const heatStart = F.heatmap && F.heatmap.start
    ? new Date(F.heatmap.start + "T00:00:00Z")
    : new Date(Date.UTC(2023, 6, 1));

  // ---- hour-of-day palette (movement 3): F.hour is the real histogram ----
  const hourRaw = F.hour && F.hour.length === 24 ? F.hour : [];
  const hourTotal = hourRaw.reduce((a, b) => a + b, 0);
  const PHASE_CYCLE = [
    { from: 0, to: 5, name: "midnight", rgb: [64, 229, 255], wash: [8, 36, 62] },
    { from: 5, to: 8, name: "dawn", rgb: [255, 188, 122], wash: [72, 46, 26] },
    { from: 8, to: 11, name: "morning", rgb: [126, 220, 205], wash: [18, 60, 55] },
    { from: 11, to: 14, name: "noon", rgb: [79, 209, 197], wash: [18, 70, 64] },
    { from: 14, to: 17, name: "afternoon", rgb: [96, 176, 255], wash: [16, 48, 90] },
    { from: 17, to: 19, name: "dusk", rgb: [172, 132, 255], wash: [42, 26, 62] },
    { from: 19, to: 24, name: "evening", rgb: [82, 142, 255], wash: [24, 40, 82] },
  ];
  const bandRGB = [], bandWash = [];
  for (let hh = 0; hh < 24; hh++) {
    for (const ph of PHASE_CYCLE) {
      if (hh >= ph.from && hh < ph.to) {
        bandRGB[hh] = ph.rgb; bandWash[hh] = ph.wash;
        break;
      }
    }
  }
  function hourWeight(t) {
    if (!hourTotal) return 1;
    const h = (t * 24) % 24;
    const i = Math.floor(h), frac = h - i, j = (i + 1) % 24;
    return lerp(hourRaw[i] || 0, hourRaw[j] || 0, frac) / hourTotal * 6 + 0.35;
  }
  function hourRGB(t) {
    const h = (t * 24) % 24;
    const i = Math.floor(h) % 24, j = (i + 1) % 24, frac = h - Math.floor(h);
    return [
      Math.round(lerp(bandRGB[i][0], bandRGB[j][0], frac)),
      Math.round(lerp(bandRGB[i][1], bandRGB[j][1], frac)),
      Math.round(lerp(bandRGB[i][2], bandRGB[j][2], frac)),
    ];
  }
  function hourWash(t) {
    const h = (t * 24) % 24;
    const i = Math.floor(h) % 24, j = (i + 1) % 24, frac = h - Math.floor(h);
    return [
      Math.round(lerp(bandWash[i][0], bandWash[j][0], frac)),
      Math.round(lerp(bandWash[i][1], bandWash[j][1], frac)),
      Math.round(lerp(bandWash[i][2], bandWash[j][2], frac)),
    ];
  }

  function center(t) {
    return (
      W * 0.5 +
      Math.sin(t * 2.6 + 0.6) * W * 0.17 +
      Math.sin(t * 5.3 + 2.1) * W * 0.085
    );
  }
  function halfWidth(t) {
    return W * (0.045 + 0.16 * t + Math.sin(t * 1.9) * 0.014);
  }
  const worldY = (t) => riverTop + t * (riverEnd - riverTop);
  const tOf = (y) => clamp((y - riverTop) / (riverEnd - riverTop), 0, 1);

  // islands: DOM milestone cards with their document-space anchor points
  let islands = [];
  function measureIslands() {
    islands = [];
    const journey = $("journey");
    if (!journey) return;
    journey.querySelectorAll(".island").forEach((el, i) => {
      const dotY = el.getBoundingClientRect().top + window.scrollY + 36;
      islands.push({
        el,
        version: el.dataset.version || "",
        date: el.dataset.date || "",
        top: dotY,
        side: i % 2 === 0 ? -1 : 1,
      });
    });
  }

  let anchorsValid = false;
  let timeMin = 0, timeMax = 1; // ms timestamps mapped onto riverTop..riverEnd

  function measureTimeScale() {
    const dated = islands.filter((i) => i.date);
    if (!dated.length) { anchorsValid = false; return; }
    timeMin = new Date(dated[0].date).getTime();
    const lastDated = dated[dated.length - 1].date;
    timeMax = Math.max(new Date(lastDated).getTime(), Date.now());
    anchorsValid = true;
  }

  function yOfDate(ms) {
    if (!anchorsValid) return riverTop;
    const p = clamp((ms - timeMin) / Math.max(timeMax - timeMin, 1), 0, 1);
    return riverTop + p * ((riverEnd - riverTop) * 0.995);
  }

  let yearMarks = [];
  function measureYears() {
    yearMarks = [];
    if (!heat.length) return;
    let last = "";
    for (let i = 0; i < heat.length; i += 7) {
      const d = new Date(heatStart.getTime() + i * 86400000);
      const y = String(d.getUTCFullYear());
      if (y !== last) {
        last = y;
        yearMarks.push({ year: y, ms: d.getTime() });
      }
    }
  }

  function measure() {
    docHeight = Math.max(document.documentElement.scrollHeight, H);
    const journey = $("journey");
    riverTop = window.innerHeight * 0.62;
    riverEnd = journey ? journey.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.55 : docHeight;
    measureIslands();
    measureTimeScale();
    measureYears();
    buildProps();
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = MONO;
    ctx.textBaseline = "middle";
    camY = window.scrollY;
    measure();
  }

  /* ---- flight camera: lag, bank, zoom (movement 2) ---- */
  // Phones and tablets scroll in bursts and get browser-bar height jumps;
  // damped lag plus bank/zoom reads as wobble there, so compact views get a
  // plain, tightly-tracked camera instead.
  const COMPACT = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 720;
  let camY = 0, camBank = 0, camZoom = 1;
  let nearIsland = null;
  function updateCamera() {
    camY += (window.scrollY - camY) * (COMPACT ? 0.34 : 0.16);
    const t0v = tOf(camY), t1v = tOf(camY + H);
    const slope = (center(t1v) - center(t0v)) / Math.max(1, H);
    const targetBank = clamp(slope * 1.1, -0.075, 0.075);
    camBank += (targetBank - camBank) * 0.05;

    let best = null, bestD = 1e9;
    for (const isl of islands) {
      const d = Math.abs(isl.top - camY - H * 0.45);
      if (d < bestD) { bestD = d; best = isl; }
    }
    nearIsland = !COMPACT && best && bestD < 720 ? best : null;
    const targetZoom = nearIsland ? 1 + 0.075 * (1 - bestD / 720) : 1;
    camZoom += (targetZoom - camZoom) * 0.06;
    if (COMPACT) { camBank = 0; camZoom = 1; }
  }
  function islandEmphasis() {
    document.querySelectorAll(".island").forEach((el) => {
      el.classList.toggle("island-near", !!nearIsland && nearIsland.el === el);
    });
  }

  /* ---------------- flow particles ---------------- */

  const particles = [];
  const P_COUNT = COMPACT ? 90 : 170;
  function resetParticle(p, ahead) {
    p.y = ahead
      ? camY - 30 - Math.random() * 300
      : riverTop + Math.random() * Math.max(1, riverEnd - riverTop);
    p.off = (Math.random() * 2 - 1) * 0.55;
    p.speed = 26 + Math.random() * 66;
    p.wob = Math.random() * Math.PI * 2;
    p.size = 0.9 + Math.random() * 2.1;
    p.alpha = 0.3 + Math.random() * 0.5;
    const tonePick = Math.random();
    p.tone = tonePick < 0.58 ? "79,209,197" : tonePick < 0.85 ? "88,166,255" : "255,201,77";
  }
  for (let i = 0; i < P_COUNT; i++) {
    const p = { y: 0, off: 0, speed: 0, wob: 0, size: 1, tone: "", alpha: 0 };
    resetParticle(p, false);
    particles.push(p);
  }

  const mouse = { x: -1e4, y: -1e4, on: false };
  window.addEventListener("mousemove", (ev) => { mouse.x = ev.clientX; mouse.y = ev.clientY; mouse.on = true; }, { passive: true });

  /* ---------------- painters (all use viewY = camY) ---------------- */

  function applyCamera() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c0 = center(tOf(camY + H * 0.5));
    const panX = (W / 2 - c0) * 0.16;
    ctx.translate(W / 2 + panX, H * 0.5);
    ctx.rotate(camBank * 0.6);
    ctx.scale(camZoom, camZoom);
    ctx.translate(-W / 2, -H * 0.5);
  }

  function paintWash(revealT) {
    const t0 = Math.max(0, tOf(camY) - 0.12);
    const t1 = clamp(tOf(camY + H) + 0.05, 0, revealT);
    if (t1 <= t0) return;
    for (let band = 4; band >= 1; band--) {
      ctx.beginPath();
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const t = lerp(t0, t1, i / steps);
        const w = halfWidth(t) * (1 + band * 0.9);
        const x = center(t) - w;
        const y = worldY(t) - camY;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      for (let i = steps; i >= 0; i--) {
        const t = lerp(t0, t1, i / steps);
        const w = halfWidth(t) * (1 + band * 0.9);
        ctx.lineTo(center(t) + w, worldY(t) - camY);
      }
      ctx.closePath();
      const wash = hourWash((t0 + t1) / 2);
      ctx.fillStyle = `rgba(${wash[0]},${wash[1]},${wash[2]},${0.06 + 0.022 * (5 - band) / 5})`;
      ctx.fill();
    }
  }

  function paintVolume(revealT) {
    if (!heat.length || !anchorsValid) return;
    const weeks = Math.ceil(heat.length / 7);
    for (let wk = 0; wk < weeks; wk++) {
      const weekMs = heatStart.getTime() + wk * 7 * 86400000;
      const y = yOfDate(weekMs);
      const t = tOf(y);
      if (y - camY > H + 80) continue;
      if (y - camY < -80) continue;
      if (t > revealT) break;
      let sum = 0;
      for (let d = 0; d < 7; d++) sum += heat[wk * 7 + d] || 0;
      if (!sum) continue;
      const q = Math.min(1, Math.log2(sum + 1) / 6);
      const c = center(t);
      const w = halfWidth(t);
      const tint = hourRGB(t);
      const boost = hourWeight(t);
      ctx.beginPath();
      ctx.ellipse(c, y - camY, w * (0.42 + q * 0.5), (w * (0.42 + q * 0.5)) / 1.9, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${clamp(0.05 * boost + 0.16 * q * boost, 0, 0.4)})`;
      ctx.fill();
    }
  }

  function paintTributaries(revealT) {
    const lanes = (F.lanes && F.lanes.lanes) || [];
    if (!lanes.length || !anchorsValid) return;
    lanes.forEach((lane, i) => {
      if (lane.total < 12 || i > 7) return;
      const firstMs = new Date(lane.start || "").getTime();
      if (Number.isNaN(firstMs)) {
        const p = 0.1 + ((i * 37) % 80) / 100;
        paintOneTributary(i, lane, riverTop + p * (riverEnd - riverTop));
        return;
      }
      paintOneTributary(i, lane, yOfDate(firstMs));
    });

    function paintOneTributary(i, lane, y) {
      const t = tOf(y);
      if (t > revealT + 0.02) return;
      const side = i % 2 === 0 ? 0 : 1;
      const steps = 30;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const tt = lerp(t - 0.14, t, ease(u));
        if (tt < 0) continue;
        const w = halfWidth(tt);
        const from = side === 0 ? -w * 1.4 : W + w * 1.4;
        const to = center(tt) - w * (side === 0 ? 0.9 : -0.9);
        const x = lerp(from, to, u);
        const yy = worldY(tt) - camY;
        s === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      const strong = Math.min(1, Math.log10(lane.total) / 3.4);
      ctx.strokeStyle = `rgba(88,166,255,${0.05 + 0.16 * strong})`;
      ctx.lineWidth = 1 + strong * 2.2;
      ctx.stroke();
      ctx.fillStyle = `rgba(157,177,199,${0.35 + 0.3 * strong})`;
      ctx.font = MONO;
      const lx = side === 0 ? 10 : W - 10;
      ctx.textAlign = side === 0 ? "left" : "right";
      ctx.fillText(`${lane.name} Â· ${lane.total.toLocaleString()}`, lx, y - camY);
      ctx.textAlign = "left";
    }
  }

  function paintCurrent(revealT) {
    const t0 = Math.max(0, tOf(camY) - 0.14);
    const t1 = clamp(tOf(camY + H) + 0.08, 0, revealT);
    if (t1 <= t0) return;
    const steps = 110;
    const tint = hourRGB((t0 + t1) / 2);
    const boost = clamp(hourWeight((t0 + t1) / 2), 0.6, 1.5);

    for (let d = 3; d >= 0; d--) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = lerp(t0, t1, i / steps);
        const w =
          halfWidth(t) * (0.3 + 0.1 * d) +
          Math.sin(t * 12 + time * 1.3 + d) * (2.2 + d * 1.7);
        const y = worldY(t) - camY;
        i === 0 ? ctx.moveTo(center(t) - w, y) : ctx.lineTo(center(t) - w, y);
      }
      for (let i = steps; i >= 0; i--) {
        const t = lerp(t0, t1, i / steps);
        const w =
          halfWidth(t) * (0.3 + 0.1 * d) +
          Math.sin(t * 12 - time * 1.6 + d) * (2.2 + d * 1.7);
        ctx.lineTo(center(t) + w, worldY(t) - camY);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${clamp((0.05 + 0.045 * (4 - d)) * boost, 0, 0.22)})`;
      ctx.fill();
    }

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = lerp(t0, t1, i / steps);
      const y = worldY(t) - camY;
      i === 0 ? ctx.moveTo(center(t), y) : ctx.lineTo(center(t), y);
    }
    ctx.strokeStyle = `rgba(${Math.round(lerp(tint[0], 255, 0.6))},${Math.round(lerp(tint[1], 255, 0.6))},${Math.round(lerp(tint[2], 255, 0.6))},0.78)`;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = `rgba(${tint[0]},${tint[1]},${tint[2]},0.85)`;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function paintYearMarks(revealT) {
    if (!yearMarks.length) return;
    ctx.font = MONO;
    yearMarks.forEach((mark) => {
      const y = yOfDate(mark.ms);
      if (y - camY < -20 || y - camY > H + 20) return;
      const t = tOf(y);
      if (t > revealT) return;
      const c = center(t);
      const w = halfWidth(t);
      ctx.beginPath();
      ctx.moveTo(c - w * 1.15, y - camY);
      ctx.lineTo(c + w * 1.15, y - camY);
      ctx.strokeStyle = "rgba(157,177,199,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(157,177,199,0.6)";
      ctx.fillText(mark.year, c + w * 1.15 + 8, y - camY);
    });
  }

  function paintPools() {
    islands.forEach((isl, i) => {
      const sy = isl.top - camY;
      if (sy < -40 || sy > H + 40) return;
      const t = tOf(isl.top);
      const c = center(t);
      const wob = Math.sin(time * 1.7 + i * 1.9) * 5;
      const x = c + isl.side * (halfWidth(t) * 0.72 + 34 + wob);
      const pulse = 0.7 + 0.3 * Math.sin(time * 2.1 + i * 1.3);
      const rad = 6 + 3.4 * pulse;
      ctx.beginPath();
      ctx.arc(x, sy, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,201,77,${0.3 + 0.55 * pulse})`;
      ctx.shadowColor = "rgba(255,201,77,0.95)";
      ctx.shadowBlur = 16 + 12 * pulse;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, sy, rad + 5 + 4 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,201,77,${0.28 * pulse})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      isl.px = x; isl.py = sy;
    });
  }

  function paintParticles(dt) {
    particles.forEach((p) => {
      p.y += (p.speed * 1.35 * dt) / 1000;
      p.wob += dt / 900;
      if (p.y - camY > H + 60 || p.y > riverEnd) {
        resetParticle(p, true);
      }
      const t = tOf(p.y);
      const sy = p.y - camY;
      if (sy < -60) return;
      let x = center(t) + p.off * halfWidth(t) + Math.sin(p.wob) * (3 + halfWidth(t) * 0.03);
      if (mouse.on) {
        const dx = x - mouse.x, dy = sy - mouse.y;
        const d2 = dx * dx + dy * dy;
        const R = 180;
        if (d2 < R * R && d2 > 0.01) {
          const n = Math.sqrt(d2);
          x += (dx / n) * (1 - n / R) * 52;
        }
      }
      ctx.beginPath();
      ctx.arc(x, sy, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.tone},${p.alpha})`;
      ctx.shadowColor = `rgba(${p.tone},0.8)`;
      ctx.shadowBlur = 7;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function paintDelta() {
    const tEnd = tOf(riverEnd);
    if (tOf(camY + H * 1.4) < tEnd) return;
    const y = riverEnd - camY;
    const c = center(tEnd);
    for (let k = 0; k < 4; k++) {
      const spread = (k - 2) * W * 0.06;
      ctx.beginPath();
      ctx.moveTo(c, y);
      ctx.quadraticCurveTo(c + spread * 1.6, y - 80, c + spread * 2.4, y - 210);
      ctx.strokeStyle = `rgba(27,111,214,${0.1 - k * 0.016})`;
      ctx.lineWidth = 8 - k;
      ctx.stroke();
    }
    // a small bedtime glow where the river settles — calm, not a dome
    const glow = 0.05 + 0.03 * Math.sin(time * 1.2);
    const grad = ctx.createRadialGradient(c, y - 20, 8, c, y - 20, Math.min(W * 0.18, 260));
    grad.addColorStop(0, `rgba(79,209,197,${glow + 0.05})`);
    grad.addColorStop(1, "rgba(79,209,197,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(c - 290, y - 290, 580, 580);
  }

  /* ---- orbiting bodies + stars over the banks (movement 3) ---- */

  function paintStars() {
    const tMid = tOf(camY + H * 0.5);
    const night = hourRaw.length ? clamp(1 - hourWeight(tMid), 0, 1) : 0;
    if (night < 0.35) return;
    for (let i = 0; i < 46; i++) {
      const sx = ((i * 197) % 1000) / 1000 * W;
      const sy = ((i * 389) % 1000) / 1000 * H * 0.5;
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 1.7 + i));
      ctx.fillStyle = `rgba(210,235,255,${0.5 * twinkle * night})`;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
  }

  function paintOrb() {
    const tMid = tOf(camY + H * 0.5);
    const hr = ((tMid * 24) % 24 + 24) % 24;
    if (hr >= 5 && hr < 20) {
      // sun: rises on the left bank, crosses overhead, sets right
      const dayPhase = (hr - 5) / 15;
      const x = W * (0.12 + 0.76 * dayPhase);
      const y = H * 0.14 - Math.sin(dayPhase * Math.PI) * H * 0.05;
      const halo = ctx.createRadialGradient(x, y, 6, x, y, 90);
      halo.addColorStop(0, "rgba(255,214,140,0.75)");
      halo.addColorStop(0.25, "rgba(255,205,120,0.18)");
      halo.addColorStop(1, "rgba(255,205,120,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(x - 90, y - 90, 180, 180);
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,226,160,0.95)";
      ctx.shadowColor = "rgba(255,205,120,0.9)";
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // moon: a small crescent high in the sky band, never over islands
      const span = hr >= 20 ? (hr - 20) / 9 : (hr + 4) / 9;
      const x = W * (0.86 - 0.7 * clamp(span, 0, 1));
      const y = H * 0.1 + Math.sin(clamp(span, 0, 1) * Math.PI) * H * 0.03;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(226,238,255,0.85)";
      ctx.shadowColor = "rgba(160,200,255,0.7)";
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x + 5, y - 3, 9, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(7,11,18,0.8)";
      ctx.fill();
    }
  }

  /* ------------- riverbank civilization ------------- */
  /* The banks are settled by real data: a lighthouse rises at every
     milestone island, a bridge spans at the promotion, docks sit at the
     heaviest delivery weeks, reed tufts mark the dead ones, and pines seed
     themselves wherever the density warrants. Placement is hash-seeded, so
     the civilization grows back the same way on every visit. */

  const WEEKLY = [];
  (function buildWeekly() {
    for (let w = 0; w * 7 < heat.length; w++) {
      let sum = 0;
      for (let d = 0; d < 7; d++) sum += heat[w * 7 + d] || 0;
      WEEKLY.push(sum);
    }
  })();
  const weeklyPeak = Math.max(1, ...WEEKLY);

  const props = [];
  function hashProp(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5;
    return x - Math.floor(x);
  }
  function buildProps() {
    props.length = 0;
    if (!anchorsValid) return;
    const msWeek = (ms) => Math.floor((ms - heatStart.getTime()) / (7 * 86400000));
    const busyWeeks = WEEKLY
      .map((v, w) => ({ v, w }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 8)
      .filter((item) => item.v > weeklyPeak * 0.42)
      .slice(0, 5);
    const reserved = islands
      .filter((isl) => isl.date)
      .map((isl) => msWeek(new Date(isl.date).getTime()));

    islands.forEach((isl) => {
      const ms = isl.date ? new Date(isl.date).getTime() : timeMax;
      const t = clamp(tOf(yOfDate(ms)), 0.01, 0.985);
      const title = isl.el.querySelector(".island-title");
      const promoted = ((title && title.textContent) || "").toLowerCase().includes("promoted");
      if (promoted) props.push({ kind: "bridge", t, side: 0 });
      else props.push({ kind: "lighthouse", t, side: isl.side || -1, seed: hashProp(t * 997) });
    });
    busyWeeks.forEach((item) => {
      if (reserved.some((mw) => Math.abs(mw - item.w) < 7)) return;
      if (hashProp(item.w + 41.7) > 0.7) return;
      props.push({
        kind: "dock",
        t: clamp(tOf(yOfDate(heatStart.getTime() + (item.w * 7 + 3) * 86400000)), 0.01, 0.985),
        side: hashProp(item.w + 7.3) > 0.5 ? 1 : -1,
        seed: item.w,
      });
    });
    WEEKLY.forEach((v, w) => {
      const t = clamp(tOf(yOfDate(heatStart.getTime() + (w * 7 + 3) * 86400000)), 0.01, 0.985);
      if (v === 0) {
        if (w % 2 === 1) props.push({ kind: "reeds", t, side: hashProp(w + 91.1) > 0.5 ? 1 : -1, seed: w });
      } else if (v > weeklyPeak * 0.05 && hashProp(w * 3.3 + 11.7) > 0.82) {
        props.push({ kind: "pine", t, side: hashProp(w + 5.1) > 0.5 ? 1 : -1, seed: w });
      }
    });
    props.sort((a, b) => a.t - b.t);
  }

  function drawPine(px, py, size, tint) {
    ctx.fillStyle = "rgba(10,16,13,0.94)";
    ctx.fillRect(px - 1.6, py - size * 0.9, 3, size * 0.9);
    for (let layer = 0; layer < 3; layer++) {
      const baseY = py - size * 0.72 - layer * size * 0.3;
      const half = size * (0.5 - layer * 0.13);
      ctx.fillStyle = `rgba(14, 30, 26, ${0.95 - layer * 0.09})`;
      ctx.beginPath();
      ctx.moveTo(px, baseY - size * 0.48);
      ctx.lineTo(px - half, baseY);
      ctx.lineTo(px + half, baseY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},0.12)`;
    ctx.beginPath();
    ctx.moveTo(px, py - size * 1.62);
    ctx.lineTo(px - size * 0.4, py - size * 0.78);
    ctx.lineTo(px + size * 0.4, py - size * 0.78);
    ctx.closePath();
    ctx.fill();
  }

  function drawReeds(rx, ry, seed) {
    const sway = Math.sin(time * 1.25 + seed * 3.1) * 2.4;
    ctx.strokeStyle = "rgba(74, 112, 96, 0.7)";
    ctx.lineWidth = 1.2;
    for (let r = 0; r < 4; r++) {
      const bx = rx + (r - 1.5) * 4.2;
      const h = 11 + ((seed * 13 + r * 7) % 9);
      ctx.beginPath();
      ctx.moveTo(bx, ry);
      ctx.quadraticCurveTo(bx + sway * 0.5, ry - h * 0.6, bx + sway, ry - h);
      ctx.stroke();
    }
  }

  function drawDock(x, y, dir) {
    ctx.fillStyle = "rgba(28, 22, 16, 0.9)";
    ctx.fillRect(dir > 0 ? x : x - 25, y - 2.5, 25, 4);
    ctx.fillStyle = "rgba(19, 15, 11, 0.92)";
    for (let post = 0; post < 3; post++) {
      ctx.fillRect(x + dir * (4 + post * 9) - 1, y - 1, 2, 8 - post * 2);
    }
    ctx.fillStyle = "rgba(18, 15, 12, 0.94)";
    ctx.beginPath();
    ctx.moveTo(x + dir * 28, y);
    ctx.quadraticCurveTo(x + dir * 42, y + 2, x + dir * 50, y + 7);
    ctx.lineTo(x + dir * 28, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x + dir * 45 - 0.8, y - 5, 1.6, 6);
  }

  function drawLighthouse(lx, ly, t, seed) {
    const night = hourRaw.length && hourWeight(t) < 0.58;
    const th = 34;
    ctx.fillStyle = "rgba(10, 16, 24, 0.95)";
    ctx.fillRect(lx - 11, ly - 2, 24, 4);
    ctx.fillStyle = "rgba(236, 240, 246, 0.92)";
    ctx.beginPath();
    ctx.moveTo(lx - 6.3, ly - 2);
    ctx.lineTo(lx - 4.05, ly - th);
    ctx.lineTo(lx + 4.05, ly - th);
    ctx.lineTo(lx + 6.3, ly - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(214, 84, 84, 0.88)";
    for (let band = 0; band < 3; band++) {
      const bandW = lerp(5.6, 4.2, band / 2);
      ctx.fillRect(lx - bandW / 2, ly - 8 - band * 9, bandW, 3.4);
    }
    ctx.fillStyle = "rgba(24, 30, 40, 0.95)";
    ctx.fillRect(lx - 4.5, ly - th - 5, 9, 6);
    ctx.beginPath();
    ctx.moveTo(lx - 6, ly - th - 5);
    ctx.lineTo(lx, ly - th - 11);
    ctx.lineTo(lx + 6, ly - th - 5);
    ctx.closePath();
    ctx.fillStyle = "rgba(236, 240, 246, 0.9)";
    ctx.fill();
    const lampY = ly - th - 2;
    if (night) {
      const ang = time * 0.55 + seed * 6.283;
      const reach = 120;
      for (const dir of [1, -1]) {
        ctx.save();
        ctx.translate(lx, lampY);
        ctx.rotate(dir === 1 ? ang : ang + Math.PI);
        const grad = ctx.createLinearGradient(0, 0, reach, 0);
        grad.addColorStop(0, "rgba(255, 214, 122, 0.45)");
        grad.addColorStop(1, "rgba(255, 214, 122, 0)");
        ctx.beginPath();
        ctx.moveTo(0, -1.5);
        ctx.lineTo(reach, -13);
        ctx.lineTo(reach, 13);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.beginPath();
    ctx.arc(lx, lampY, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = night ? "rgba(255, 226, 150, 0.98)" : "rgba(255, 214, 122, 0.42)";
    ctx.shadowColor = "rgba(255, 201, 77, 0.85)";
    ctx.shadowBlur = night ? 16 : 5;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawBridge(cx, cy, t) {
    const w = halfWidth(t);
    const left = cx - w - 24;
    const right = cx + w + 24;
    const rise = 24;
    ctx.strokeStyle = "rgba(32, 44, 56, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left, cy);
    ctx.quadraticCurveTo(cx, cy - rise - 8, right, cy);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (const [px, lean] of [[left, 7], [right, -7]]) {
      ctx.beginPath();
      ctx.moveTo(px, cy + 2);
      ctx.lineTo(px + lean, cy - rise);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(168, 190, 214, 0.55)";
    ctx.lineWidth = 1.1;
    for (const [px, lean] of [[left, 7], [right, -7]]) {
      for (const anchor of [w * 0.4, w * 0.85]) {
        const sign = px === left ? 1 : -1;
        const ax2 = cx + anchor * sign;
        ctx.beginPath();
        ctx.moveTo(px + lean, cy - rise);
        ctx.quadraticCurveTo((px + lean + ax2) / 2, cy - rise * 0.2, ax2, cy - 2);
        ctx.stroke();
      }
    }
    for (let s = 1; s <= 3; s++) {
      const u = s / 4;
      const ax = lerp(left, right, u);
      const ay = cy - Math.sin(u * Math.PI) * rise;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, ay + Math.sin(u * Math.PI) * rise * 0.32);
      ctx.strokeStyle = "rgba(120, 140, 164, 0.4)";
      ctx.stroke();
    }
  }

  function paintSettlement(revealT) {
    if (!anchorsValid || !props.length) return;
    for (const p of props) {
      const y = worldY(p.t) - camY;
      if (y < -140 || y > H + 140) continue;
      if (p.t > revealT + 0.015) continue;
      const c = center(p.t);
      const bankX = c + (p.side || 0) * (halfWidth(p.t) + (p.kind === "pine" || p.kind === "reeds" ? 8 : 16));
      if (p.kind === "pine") drawPine(bankX, y, 15 + ((p.seed % 3) * 5), hourRGB(p.t));
      else if (p.kind === "reeds") drawReeds(bankX, y, p.seed);
      else if (p.kind === "lighthouse") drawLighthouse(bankX, y, p.t, p.seed);
      else if (p.kind === "dock") drawDock(c + (p.side || -1) * (halfWidth(p.t) + 6), y, p.side || -1);
      else if (p.kind === "bridge") drawBridge(c, y, p.t);
    }
  }

  /* ---------------- the walker (a life on the river) ---------------- */
  /* A small engineer walks the bank next to the camera. Everything about
     them is harvested: pace follows the real weekly commit volume of the
     week currently in view, they stop and celebrate at every real
     milestone, an umbrella only opens on genuinely dead weeks, a lantern
     only lights up in the reader's real night bands, and they turn around
     when the reader scrolls upstream. */

  const walker = { phase: 0, celebrating: "", facing: 1, prevScroll: 0, steps: [], jump: 0 };

  function weekActivityAt(t) {
    if (!heat.length || !anchorsValid) return 0;
    const ms = timeMin + t * (timeMax - timeMin);
    const wk = Math.floor((ms - heatStart.getTime()) / (7 * 86400000));
    if (wk < 0 || wk * 7 + 6 >= heat.length) return 0;
    let sum = 0;
    for (let d = 0; d < 7; d++) sum += heat[wk * 7 + d] || 0;
    return sum;
  }

  function paintWalker(dt) {
    if (!anchorsValid) return;
    const t = clamp(tOf(camY + H * 0.86), 0.01, 0.985);
    const docY = worldY(t);
    const y = docY - camY;
    if (y < 46 || y > H - 18) return;

    const c = center(t);
    const w = halfWidth(t);
    let x = c - w - 30;
    if (x < 46) x = c + w + 30;

    walker.facing = window.scrollY >= (walker.prevScroll || window.scrollY) ? 1 : -1;
    walker.prevScroll = window.scrollY;

    const q = weekActivityAt(t);
    const nf = 4 + Math.sqrt(q) * 7; // stride rate: sqrt keeps busy weeks lively
    walker.phase += (dt / 1000) * nf;

    // milestone celebration: one jump per island
    if (nearIsland && walker.celebrating !== nearIsland.version) {
      walker.celebrating = nearIsland.version;
      walker.jump = 0.86; // seconds of airborne joy
      AUD.thunder(); // a distant roll every time a real milestone lands
    }
    if (!nearIsland) walker.celebrating = "";
    if (walker.jump > 0) walker.jump = Math.max(0, walker.jump - dt / 1000);
    const hop = walker.jump > 0 ? Math.sin((1 - walker.jump / 0.86) * Math.PI) * 13 : 0;

    // dead week = light rain; night band = lantern
    const rainy = q === 0;
    const nightDim = hourRaw.length ? (1 - clamp(hourWeight(t) - 0.5, 0, 1)) : 0;
    const lantern = nightDim > 0.5;

    // footprints behind (short-lived)
    walker.steps.push({ x, y, t: time });
    while (walker.steps.length > 26 || (walker.steps[0] && time - walker.steps[0].t > 1.6)) {
      walker.steps.shift();
    }
    walker.steps.forEach((s, i) => {
      const age = time - s.t;
      if (age > 1.6) return;
      ctx.fillStyle = `rgba(79,209,197,${0.2 * (1 - age / 1.6)})`;
      ctx.fillRect(s.x + (i % 2 ? -3 : 3) - 1, s.y + 6, 2, 2);
    });

    ctx.save();
    ctx.translate(x, y - hop);
    ctx.scale(walker.facing, 1);
    const swing = Math.sin(walker.phase);
    const bob = Math.abs(Math.cos(walker.phase)) * -1.3;
    const stride = 5.5;

    // legs
    ctx.strokeStyle = "rgba(232,241,251,0.92)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (const sgn of [1, -1]) {
      const a = swing * sgn;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(a * stride, -2 + Math.max(0, Math.sin(walker.phase * (sgn > 0 ? 1 : -1))) * 2);
      ctx.lineTo(a * stride * 1.35, 0);
      ctx.stroke();
    }
    // body
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, -18 + bob);
    ctx.stroke();
    // arms (up in celebration, swinging otherwise)
    ctx.beginPath();
    if (walker.jump > 0) {
      ctx.moveTo(0, -17 + bob);
      ctx.lineTo(-4, -25 + bob);
      ctx.moveTo(0, -17 + bob);
      ctx.lineTo(6, -26 + bob);
    } else {
      ctx.moveTo(0, -17 + bob);
      ctx.lineTo(-swing * 4 - 2, -9 + bob);
      if (!lantern) {
        ctx.moveTo(0, -17 + bob);
        ctx.lineTo(swing * 4 + 2, -9 + bob);
      } else {
        // lantern carried in the leading hand
        ctx.lineTo(swing * 3 + 3, -10 + bob);
        const lx2 = swing * 3 + 6;
        const lamps = ctx.createRadialGradient(lx2 + 2, -8, 1, lx2 + 2, -8, 30);
        lamps.addColorStop(0, "rgba(255,201,77,0.5)");
        lamps.addColorStop(1, "rgba(255,201,77,0)");
        ctx.fillStyle = lamps;
        ctx.fillRect(lx2 - 28, -38, 60, 60);
        ctx.beginPath();
        ctx.arc(lx2 + 2, -8 + bob * 0.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,226,150,0.95)";
        ctx.shadowColor = "rgba(255,201,77,0.9)";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.stroke();
    // umbrella on dead weeks
    if (rainy) {
      ctx.fillStyle = "rgba(120,200,255,0.14)";
      for (let rd = 0; rd < 9; rd++) {
        const rx = Math.sin(rd * 91.7 + time * 2) * 46;
        ctx.fillRect(rx - 24, (time * 140 + rd * 37) % 46 - 30, 1.5, 7);
      }
      ctx.beginPath();
      ctx.arc(0, -26 + bob, 12, Math.PI, 0);
      ctx.strokeStyle = "rgba(157,177,199,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -26 + bob);
      ctx.lineTo(0, -21 + bob);
      ctx.stroke();
    }
    // head
    ctx.beginPath();
    ctx.arc(0, -23 + bob, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232,241,251,0.95)";
    ctx.fill();
    ctx.restore();
  }

  /* ---------------- HUD + hour dial ---------------- */

  const hudStat = $("hud-stat");
  const dial = $("hour-dial");
  function updateHud() {
    if (dial) {
      const probe = (camY + H * 0.5 - riverTop) / Math.max(1, riverEnd - riverTop);
      const hr = Math.floor((((clamp(probe, 0, 1)) * 24) % 24 + 24) % 24);
      let phase = "midnight";
      for (const ph of PHASE_CYCLE) {
        if (hr >= ph.from && hr < ph.to) { phase = ph.name; break; }
      }
      // the soundtrack follows the same world clock as the palette
      AUD.night = phase === "midnight" ? 1 : phase === "evening" ? 0.55 : 0;
      AUD.dawn = phase === "dawn" ? 1 : 0;
      const text = `${String(hr).padStart(2, "0")}:00 Â· ${phase}`;
      const el = dial.querySelector(".hour-t");
      if (el && el.textContent !== text) el.textContent = text;
      dial.style.setProperty("--hp", clamp(hourWeight(clamp(probe, 0, 1)), 0, 1.4).toFixed(2));
      dial.classList.add("on");
    }
    if (!hudStat) return;
    const probeY = window.scrollY + H * 0.45;
    let current = null;
    for (const isl of islands) {
      if (isl.top <= probeY && isl.version) current = { v: isl.version, t: isl.el.querySelector(".island-title")?.textContent || "" };
    }
    if (window.scrollY < riverTop - H * 0.4 || !current) {
      hudStat.classList.remove("on");
      return;
    }
    const text = `${current.v} Â· ${current.t}`;
    if (hudStat.textContent !== text) hudStat.textContent = text;
    hudStat.classList.add("on");
  }

  /* ---------------- main loop ---------------- */

  let time = 0;
  let last = performance.now();
  const running = !REDUCED;
  let hidden = false;
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; });

  function frame(now) {
    if (running) requestAnimationFrame(frame);
    const dt = Math.min(50, now - last);
    last = now;
    if (hidden) return;
    time += dt / 1000;

    updateCamera();
    islandEmphasis();
    AUD.activity = clamp(weekActivityAt(clamp(tOf(camY + H * 0.5), 0, 1)) / weeklyPeak, 0, 1);
    const revealT = clamp((camY + H - riverTop) / (riverEnd - riverTop), 0.02, 1);

    if (REDUCED) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
    } else {
      // motion trails: translucent cover instead of a hard clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "rgba(7,11,18,0.5)";
      ctx.fillRect(0, 0, W, H);
      applyCamera();
    }
    paintWash(revealT);
    paintVolume(revealT);
    paintTributaries(revealT);
    paintCurrent(revealT);
    paintYearMarks(revealT);
    paintOrb();
    paintStars();
    paintSettlement(revealT);
    paintPools();
    paintParticles(dt);
    paintWalker(dt);
    paintDelta();
    updateHud();
  }

  let lastScroll = -1;
  function measureIfMoving() {
    const s = window.scrollY;
    if (s !== lastScroll) {
      lastScroll = s;
      if (s + H > riverEnd - H * 2 || s === 0) measure();
    }
  }
  window.addEventListener("scroll", measureIfMoving, { passive: true });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  resize();
  measureIfMoving();
  if (running) {
    requestAnimationFrame(frame);
  } else {
    const revealT = clamp((H - riverTop) / (riverEnd - riverTop), 0.05, 1);
    ctx.clearRect(0, 0, W, H);
    paintWash(revealT);
    paintCurrent(revealT);
    paintOrb();
    paintPools();
  }
  } // ---- end river engine ----

  /* =========================================================
     DOM widgets (reveal, bars, PR table, palette)
     ========================================================= */

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("seen");
      });
    },
    { threshold: 0.14 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  function fillBars() {
    const render = (target, rows) => {
      if (!target || !rows.length) return;
      target.textContent = "";
      const max = Math.max(...rows.map((row) => row.count), 1);
      rows.forEach((row) => {
        const el = document.createElement("div");
        el.className = "bar-row";
        const name = document.createElement("span");
        name.className = "bar-name";
        name.textContent = row.name;
        name.title = row.name;
        const track = document.createElement("div");
        track.className = "bar-track";
        const fill = document.createElement("div");
        fill.className = "bar-fill";
        fill.style.setProperty("--w", Math.max(2, Math.round((row.count / max) * 100)) + "%");
        track.append(fill);
        const value = document.createElement("span");
        value.className = "bar-value";
        value.textContent = row.count.toLocaleString();
        el.append(name, track, value);
        target.append(el);
      });
    };
    render($("bars-skills"), F.top_skills || []);
  }

  const pal = { open: false, items: [], active: 0 };
  function palRender() {
    const list = $("palette-results");
    list.textContent = "";
    pal.items.forEach((item, i) => {
      const li = document.createElement("li");
      if (i === pal.active) li.classList.add("active");
      const kind = document.createElement("span");
      kind.className = "palette-kind";
      kind.textContent = item.kind;
      const label = document.createElement("span");
      label.textContent = item.label;
      li.append(kind, label);
      li.addEventListener("click", () => { navigate(item.target); });
      li.addEventListener("mousemove", () => { pal.active = i; palRender(); });
      list.append(li);
    });
  }
  function palFilter(q) {
    const needle = q.toLowerCase();
    pal.items = (F.palette || [])
      .filter((item) => item.label.toLowerCase().includes(needle))
      .slice(0, 12);
    pal.active = 0;
    palRender();
  }
  // Palette targets are "page.html#anchor" (or a bare "page.html"). Staying
  // on the current page scrolls smoothly; otherwise the browser navigates
  // and the anchor lands via scroll-margin-top.
  function navigate(target) {
    palClose();
    const [file, anchor] = target.split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if ((file || "index.html") === here) {
      if (anchor) {
        const el = $(anchor);
        if (el) {
          window.scrollTo({
            top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 84),
            behavior: "smooth",
          });
          return;
        }
      }
    }
    location.href = file;
    if (anchor) location.hash = "#" + anchor;
  }
  function palOpen() {
    pal.open = true;
    $("palette").hidden = false;
    const input = $("palette-input");
    input.value = "";
    palFilter("");
    input.focus();
  }
  function palClose() { pal.open = false; $("palette").hidden = true; }
  $("palette-open").addEventListener("click", palOpen);
  $("palette").addEventListener("click", (ev) => { if (ev.target === $("palette")) palClose(); });
  $("palette-input").addEventListener("input", (ev) => palFilter(ev.target.value));
  $("palette-input").addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowDown") { pal.active = Math.min(pal.active + 1, pal.items.length - 1); palRender(); ev.preventDefault(); }
    else if (ev.key === "ArrowUp") { pal.active = Math.max(pal.active - 1, 0); palRender(); ev.preventDefault(); }
    else if (ev.key === "Enter" && pal.items[pal.active]) { navigate(pal.items[pal.active].target); }
    else if (ev.key === "Escape") palClose();
  });
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      pal.open ? palClose() : palOpen();
    } else if (ev.key === "Escape" && pal.open) palClose();
  });

  /* ------------- home grounds: river strip, ticker, sky ------------- */

  const HOME_BANDS = [
    { from: 0, to: 5, rgb: [64, 229, 255] },
    { from: 5, to: 8, rgb: [255, 188, 122] },
    { from: 8, to: 11, rgb: [126, 220, 205] },
    { from: 11, to: 14, rgb: [79, 209, 197] },
    { from: 14, to: 17, rgb: [96, 176, 255] },
    { from: 17, to: 19, rgb: [172, 132, 255] },
    { from: 19, to: 24, rgb: [82, 142, 255] },
  ];

  function homeBand(hh) {
    for (const b of HOME_BANDS) if (hh >= b.from && hh < b.to) return b.rgb;
    return HOME_BANDS[0].rgb;
  }

  function initStrip() {
    const can = $("river-strip");
    if (!can) return;
    const counts = F.heatmap && F.heatmap.counts ? F.heatmap.counts : [];
    if (!counts.length || window.innerWidth < 540) return;
    const w = can.clientWidth || window.innerWidth;
    const h = 150;
    const dpr = window.devicePixelRatio || 1;
    can.width = w * dpr;
    can.height = h * dpr;
    const sctx = can.getContext("2d");
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.font = '10px ui-monospace, Consolas, monospace';
    sctx.textAlign = "center";

    // weekly sums — the exact curve journey.html renders full-scale
    const weeks = [];
    for (let i = 0; i * 7 < counts.length; i++) {
      let s = 0;
      for (let d = 0; d < 7 && i * 7 + d < counts.length; d++) s += counts[i * 7 + d];
      weeks.push(s);
    }
    const peak = Math.max(1, ...weeks);
    const start = F.heatmap && F.heatmap.start
      ? new Date(F.heatmap.start + "T00:00:00Z").getTime()
      : Date.now() - weeks.length * 7 * 86400000;
    const end = start + weeks.length * 7 * 86400000;
    const midY = h * 0.55;
    const xOfWeek = (ms) => 20 + clamp((ms - start) / (end - start), 0.02, 0.98) * (w - 40);

    const dots = [];
    (F.milestones || []).forEach((m) => {
      if (m && m.date && m.version) {
        dots.push({
          v: m.version,
          x: xOfWeek(new Date(m.date + "T00:00:00Z").getTime()),
        });
      }
    });

    const parts = [];
    for (let i = 0; i < 56; i++) {
      parts.push({
        u: Math.random(),
        v: 0.004 + Math.random() * 0.013,
        off: Math.random() * 2 - 1,
        size: 0.7 + Math.random() * 1.5,
      });
    }

    const flowY = (xx) => {
      const idx = clamp(Math.floor(((xx - 20) / (w - 40)) * weeks.length), 0, weeks.length - 1);
      return {
        half: 7 + 17 * Math.pow((weeks[idx] || 0) / peak, 0.6),
        y: midY + Math.sin(idx * 0.55 + (xx / w) * 2) * h * 0.06,
      };
    };

    const dotHitY = (dot) => {
      const f = flowY(dot.x);
      return f.y - f.half - 14;
    };

    function drawRiver(now) {
      sctx.clearRect(0, 0, w, h);
      // the river: one horizontal flow whose colour slides through the
      // same real hour-of-day palette the journey uses left to right
      const grad = sctx.createLinearGradient(20, 0, w - 20, 0);
      for (let i = 0; i <= 24; i += 2) {
        const rgb = homeBand(i % 24);
        grad.addColorStop(i / 24, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4)`);
      }
      const cts = [];
      sctx.beginPath();
      for (let xx = 20; xx <= w - 20; xx += 8) {
        const f = flowY(xx);
        cts.push([xx, f.y]);
        const first = xx === 20;
        first ? sctx.moveTo(xx, f.y - f.half) : sctx.lineTo(xx, f.y - f.half);
      }
      for (let i = cts.length - 1; i >= 0; i--) {
        sctx.lineTo(cts[i][0], cts[i][1] + flowY(cts[i][0]).half);
      }
      sctx.closePath();
      sctx.fillStyle = grad;
      sctx.fill();
      // crest line
      sctx.beginPath();
      cts.forEach(([xx, yy], i) => (i ? sctx.lineTo(xx, yy) : sctx.moveTo(xx, yy)));
      sctx.strokeStyle = "rgba(255,255,255,0.13)";
      sctx.lineWidth = 1;
      sctx.stroke();
      // shimmer drops riding the flow
      parts.forEach((p) => {
        p.u += p.v;
        if (p.u > 1) p.u -= 1;
        const xx = 20 + p.u * (w - 40);
        const f = flowY(xx);
        const rgb = homeBand(Math.round((xx / (w - 40)) * 24));
        sctx.beginPath();
        sctx.arc(xx, f.y + p.off * (f.half - 2), p.size, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.75)`;
        sctx.fill();
      });
      // milestone dots above the flow, pulsing softly
      dots.forEach((dot, i) => {
        const dy = dotHitY(dot);
        const pulse = 0.5 + 0.5 * Math.sin(now / 480 + i * 1.9);
        sctx.beginPath();
        sctx.arc(dot.x, dy, 4.4, 0, Math.PI * 2);
        sctx.fillStyle = "rgba(255,201,77,0.95)";
        sctx.shadowColor = "rgba(255,201,77,0.8)";
        sctx.shadowBlur = 6 + 10 * pulse;
        sctx.fill();
        sctx.shadowBlur = 0;
        sctx.fillStyle = `rgba(230,214,166,${0.55 + 0.45 * pulse})`;
        sctx.fillText(dot.v, dot.x, dy - 10);
      });
      // the little walker crossing underneath, bobbing with time
      const wx = ((now / 34) % (w + 240)) - 120;
      const wf = flowY(clamp(wx, 20, w - 20));
      const wy = wf.y + wf.half + 9 + Math.sin(now / 140) * 1.2;
      const ph = Math.sin(now / 150) * 2.6;
      sctx.strokeStyle = "rgba(79,209,197,0.9)";
      sctx.lineWidth = 1.4;
      sctx.beginPath();
      sctx.arc(wx, wy - 15, 2.6, 0, Math.PI * 2);
      sctx.moveTo(wx, wy - 11);
      sctx.lineTo(wx, wy - 2);
      sctx.moveTo(wx, wy - 2);
      sctx.lineTo(wx - 3 + ph, wy + 3);
      sctx.moveTo(wx, wy - 2);
      sctx.lineTo(wx + 3 - ph, wy + 3);
      sctx.moveTo(wx, wy - 9);
      sctx.lineTo(wx - 3, wy - 5);
      sctx.moveTo(wx, wy - 9);
      sctx.lineTo(wx + 3, wy - 5);
      sctx.stroke();
    }
    if (REDUCED) {
      drawRiver(1200);
    } else {
      (function loop(now) {
        if (!document.hidden) drawRiver(now);
        requestAnimationFrame(loop);
      })(performance.now());
    }

    can.style.cursor = "pointer";
    can.addEventListener("click", (ev) => {
      const r = can.getBoundingClientRect();
      const mx = ev.clientX - r.left;
      const my = ev.clientY - r.top;
      let best = null;
      let bd = 20;
      dots.forEach((dot) => {
        const d = Math.hypot(dot.x - mx, dotHitY(dot) - my);
        if (d < bd) {
          bd = d;
          best = dot;
        }
      });
      window.location.href = best ? `journey.html#journey-${best.v}` : "journey.html";
    });
  }

  function initTicker() {
    const line = $("ticker-line");
    if (!line) return;
    const c = F.counts || {};
    const gm = F.game || {};
    const items = [];
    if (F.meta && F.meta.name) {
      items.push(`${F.meta.name} — ${(F.meta.label || "").trim()} · ${(F.meta.location || "").trim()}`.replace(/·\s*$/, ""));
    }
    if (c.commits) items.push(`${c.commits.toLocaleString("en-IN")} commits`);
    if (c.pull_requests) {
      items.push(`${c.pull_requests.toLocaleString("en-IN")} pull requests · ${(c.reviews || 0).toLocaleString("en-IN")} reviews given`);
    }
    if (c.work_items) items.push(`${c.work_items.toLocaleString("en-IN")} work items`);
    if (c.wiki_pages) items.push(`${c.wiki_pages.toLocaleString("en-IN")} wiki pages`);
    if (c.pipeline_runs) items.push(`${c.pipeline_runs.toLocaleString("en-IN")} pipeline runs`);
    if (gm.xp) items.push(`${gm.xp.toLocaleString("en-IN")} XP · level ${gm.level || ""}`);
    if (gm.active_days) items.push(`${gm.active_days.toLocaleString("en-IN")} active days`);
    if (gm.longest_streak) items.push(`longest streak ${gm.longest_streak} days`);
    (F.milestones || []).forEach((m) => {
      if (m && m.version) items.push(`${m.version} ${m.title || ""}`.trim());
    });
    items.push("every figure here is harvested — the audit trail lives in the delta");
    if (items.length < 2) return;
    const seg = document.createElement("span");
    seg.className = "ticker-seg";
    items.forEach((text) => {
      const it = document.createElement("span");
      it.className = "ticker-item";
      it.textContent = text;
      const sep = document.createElement("span");
      sep.className = "ticker-sep";
      sep.textContent = "✳";
      seg.append(it, sep);
    });
    line.append(seg, seg.cloneNode(true));
  }

  function initHomeSky() {
    const sky = document.querySelector(".home-sky");
    if (!sky) return;
    const orb = sky.querySelector(".orb");
    if (!orb) return;
    const hourRaw = F.hour && F.hour.length === 24 ? F.hour : [];
    const hr = new Date().getHours();
    const peakH = hourRaw.length ? Math.max(...hourRaw) : 0;
    const weight = hourRaw.length
      ? clamp((hourRaw[hr] || 0) / Math.max(1, peakH), 0.06, 1)
      : 0.5;
    const rgb = homeBand(hr);
    sky.style.setProperty("--sky-rgb", rgb.join(","));
    sky.style.setProperty("--sky-a", Number(0.26 + weight * 0.22).toFixed(3));
    // the orb rides a real arc across the page, sun by day, moon by night
    const night = hr < 5 || hr >= 19;
    const u = night
      ? (hr < 5 ? (hr + 6) / 11 : (hr - 19) / 5)
      : (hr - 5) / 13;
    orb.style.left = (6 + clamp(u, 0, 1) * 88) + "%";
    orb.style.top = (16 + 40 * (1 - Math.sin(clamp(u, 0, 1) * Math.PI))) + "%";
    if (night) orb.classList.add("moon");
    requestAnimationFrame(() => sky.classList.add("on"));
  }

  /* ------------- run the ambience (every page) ------------- */

  AUD.page = document.body.getAttribute("data-page") || "";
  const audioBtn = $("audio-btn");
  if (audioBtn) {
    audioBtn.textContent = "♪";
    audioBtn.addEventListener("click", () => AUD.toggle());
  }
  // The first click anywhere counts as a browser gesture, so the river can
  // start sounding on its own — unless that click is the toggle itself.
  document.addEventListener("pointerdown", (ev) => {
    if (ev.target instanceof Element && ev.target.closest("#audio-btn")) return;
    if (!AUD.on) AUD.toggle();
  }, { once: true, capture: true });
  setInterval(() => {
    if (!AUD.on || !AUD.master) return;
    AUD.master.gain.value += (0.9 - AUD.master.gain.value) * 0.12;
    if (AUD.windGain) {
      const target = AUD.page === "journey"
        ? 0.15 + 0.22 * AUD.activity
        : 0.11 + 0.025 * Math.sin(performance.now() / 1900);
      AUD.windGain.gain.value += (target - AUD.windGain.gain.value) * 0.12;
    }
    if (AUD.page === "journey") {
      if (AUD.night > 0.4 && Math.random() < 0.16) AUD.crickets();
      if (AUD.dawn && Math.random() < 0.06) AUD.birdcall();
    } else if (Math.random() < 0.006) AUD.birdcall();
  }, 240);

  /* ------------- cinematic first run (one typed line per page, per tab) ------------- */

  function initIntro() {
    if (REDUCED || window.innerWidth < 540) return;
    const page = AUD.page || "index";
    const key = "forge-intro-" + page;
    if (sessionStorage.getItem(key) === "done") return;
    const lines = {
      index: "every number here was harvested from real work . . .",
      journey: "pick a bank anywhere. let the river carry you . . .",
      work: "proof speaks. logs bore . . .",
      delta: "this is where all the water settles . . .",
    };
    const text = lines[page];
    if (!text) return;
    sessionStorage.setItem(key, "done");
    const el = document.createElement("div");
    el.className = "intro-line";
    document.body.append(el);
    let close = () => { if (!el.classList.contains("out")) { el.classList.add("out"); setTimeout(() => el.remove(), 800); } };
    const stamp = performance.now();
    (function tick() {
      const n = Math.floor((performance.now() - stamp) / 34);
      el.textContent = text.slice(0, Math.min(n, text.length));
      if (n < text.length) requestAnimationFrame(tick);
      else setTimeout(close, 1200);
    })();
    ["click", "wheel", "keydown", "touchstart"].forEach((type) => {
      document.addEventListener(type, close, { once: true, passive: true });
    });
  }

  /* ------------- konami: the final form (a harvested boss card) ------------- */

  function closeFinalForm() { const box = $("final-form"); if (box) box.classList.remove("open"); }

  function showFinalForm() {
    let box = $("final-form");
    if (!box) {
      box = document.createElement("div");
      box.className = "ff";
      box.id = "final-form";
      const inner = document.createElement("div");
      inner.className = "ff-box";
      const game = F.game || {};
      const counts = F.counts || {};
      const eyebrow = document.createElement("p");
      eyebrow.className = "ff-eyebrow";
      eyebrow.textContent = "FINAL FORM · ↑↑↓↓←→←→BA";
      const name = document.createElement("h3");
      name.className = "ff-name";
      name.textContent = (F.meta && F.meta.name) || "";
      const role = document.createElement("p");
      role.className = "ff-role";
      role.textContent = `level ${(game.level || "")} · ${(game.xp || 0).toLocaleString()} XP · current streak ${(game.streak || 0)} days`;
      const bar = document.createElement("div");
      bar.className = "ff-hp";
      const fill = document.createElement("i");
      fill.style.width = (game.level_pct || 0) + "%";
      bar.append(fill);
      const hp = document.createElement("p");
      hp.className = "ff-hp-label";
      hp.textContent = `levelling integrity ${(game.level_pct || 0)}% — the river is still filling`;
      const grid = document.createElement("div");
      grid.className = "ff-grid";
      [
        ["commits", counts.commits],
        ["pull requests", counts.pull_requests],
        ["reviews given", counts.reviews],
        ["work items", counts.work_items],
        ["wiki pages", counts.wiki_pages],
        ["pipeline runs", counts.pipeline_runs],
        ["active days", game.active_days],
        ["longest streak", game.longest_streak ? `${game.longest_streak} days` : ""],
      ]
        .filter((row) => row[1] !== undefined && row[1] !== null && row[1] !== "")
        .forEach(([label, value]) => {
          const cell = document.createElement("div");
          cell.className = "ff-cell";
          const v = document.createElement("b");
          v.className = "ff-v";
          v.textContent = typeof value === "number" ? value.toLocaleString() : String(value);
          const l = document.createElement("span");
          l.className = "ff-l";
          l.textContent = label;
          cell.append(v, l);
          grid.append(cell);
        });
      const close = document.createElement("button");
      close.type = "button";
      close.className = "ff-close";
      close.textContent = "×";
      close.addEventListener("click", closeFinalForm);
      inner.append(eyebrow, name, role, bar, hp, grid, close);
      box.append(inner);
      document.body.append(box);
      box.addEventListener("click", (ev) => { if (ev.target === box) closeFinalForm(); });
    }
    box.classList.add("open");
    AUD.thunder();
  }

  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiIdx = 0;
  document.addEventListener("keydown", (ev) => {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) { konamiIdx = 0; return; }
    const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) { konamiIdx = 0; showFinalForm(); }
    } else {
      konamiIdx = key === KONAMI[0] ? 1 : 0;
    }
  }, true);

  initGenesis();
  initStrip();
  initTicker();
  initHomeSky();
  initIntro();
})();
