import { useEffect, useRef } from "react";

// The site's background: binary digits on deep navy, lit like a dithered field. A slow wave of
// light drifts across the grid and a 4×4 ordered-dither threshold decides which digits it lights,
// so the light reads as soft halftone bands while every other digit stays faint. The pointer
// lights the digits under it in lime and yellow and leaves rings that spread and fade, and a few
// digits spark bright yellow inside the glow; the drifting bands stay blue. One fixed canvas, repainted
// only where a digit changed. A still
// frame for reduced motion; nothing runs while the tab is hidden.

const FONT = 13; // CSS px
const CELL_W = 9;
const CELL_H = 17;
const LEVELS = 16;
const GLOW = LEVELS; // palette index where the pointer's shades start: 3 tint steps of LEVELS each
const SPARK = LEVELS * 4; // the bright yellow spark
const TAU = Math.PI * 2;

// Ordered-dither thresholds: a digit is lit where the light beats its cell's threshold.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

const DRIFT = 0.24; // how fast the wave of light moves, per second
const CORE = 46; // px: the light right under the pointer
const HALO = 180; // px: the softer glow around it
const RING_SPEED = 190; // px per second
const RING_W = 15; // px: a ring's half-thickness
const RING_FADE = 2.3; // per second
const RING_ECHO = 0.18; // s: a fainter ring follows each one
const MAX_RINGS = 6;
const FRAME_IDLE = 33; // ms between frames while only the wave moves
const FRAME_LIVE = 16; // ... and while the pointer or a ring is in play

type Ring = { x: number; y: number; t: number; a: number };

const smooth = (x: number) => {
  const k = x < 0 ? 0 : x > 1 ? 1 : x;
  return k * k * (3 - 2 * k);
};

export function BinaryField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ground = document.createElement("canvas");
    const gctx = ground.getContext("2d")!;
    // Blue for the field. Around the pointer, a lime-to-yellow gradient (#c7fc50 for its softer
    // digits, #f9ff54 for its brightest), reached in three steps so the glow's edge stays soft;
    // sparks are the yellow end at full strength.
    const blue = (b: number) => [60 + b * 150, 150 + b * 95, 205 + b * 50];
    const lime = (b: number) => [199 + b * 50, 252 + b * 3, 80 + b * 4];
    const rgba = (c: number[], b: number) => `rgba(${c.map(Math.round).join(", ")}, ${(0.1 + b * 0.85).toFixed(3)})`;
    const shade = (b: number, k: number) => blue(b).map((v, j) => v + (lime(b)[j] - v) * k);
    const step = (i: number) => i / (LEVELS - 1);
    const palette = [
      ...Array.from({ length: LEVELS }, (_, i) => rgba(blue(step(i)), step(i))),
      ...[1, 2, 3].flatMap((k) => Array.from({ length: LEVELS }, (_, i) => rgba(shade(step(i), k / 3), step(i)))),
      "rgba(249, 255, 84, 1)",
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let digit = new Uint8Array(0);
    let gap = new Uint8Array(0); // the spaces between runs of digits
    let shown = new Int8Array(0); // the level each digit was last painted at
    let glow = new Float32Array(0); // brighter toward the middle of the screen
    let seedS = new Float32Array(0); // each digit's own shimmer phase
    let seedC = new Float32Array(0);
    let spark = new Uint8Array(0); // the few digits that can flash white
    let colA = new Float32Array(0);
    let colS2 = colA;
    let colC2 = colA;
    let colS3 = colA;
    let colC3 = colA;
    let rowS2 = colA;
    let rowC2 = colA;
    let rowS3 = colA;
    let rowC3 = colA;
    let rowD = colA;
    const buckets: number[][] = palette.map(() => []);
    const baseline = (r: number) => r * CELL_H + CELL_H - 4;

    let t = Math.random() * 40; // where the wave starts
    let rings: Ring[] = [];
    let hasPointer = false;
    let weight = 0; // how present the pointer's glow is, 0 to 1
    let px = 0;
    let py = 0;
    let wx = 0; // the glow's centre, a step behind the pointer
    let wy = 0;
    let spawnX = -1e4;
    let spawnY = -1e4;
    let spawnT = -1e9;

    const build = () => {
      w = window.innerWidth;
      h = Math.max(window.innerHeight, canvas.clientHeight);
      // A window with no size yet (a hidden or collapsed pane) has nothing to draw: drawing
      // from a zero-size canvas throws. Wait for the resize that gives it a size.
      if (!w || !h) {
        cols = rows = 0;
        return;
      }
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, ground]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = gctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
      g.addColorStop(0, "#103c58");
      g.addColorStop(0.55, "#0a2940");
      g.addColorStop(1, "#05141f");
      gctx.fillStyle = g;
      gctx.fillRect(0, 0, w, h);
      ctx.drawImage(ground, 0, 0, w, h);
      ctx.font = `${FONT}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

      cols = Math.ceil(w / CELL_W);
      rows = Math.ceil(h / CELL_H);
      const n = cols * rows;
      digit = new Uint8Array(n);
      gap = new Uint8Array(n);
      shown = new Int8Array(n).fill(-1);
      glow = new Float32Array(n);
      seedS = new Float32Array(n);
      seedC = new Float32Array(n);
      spark = new Uint8Array(n);
      for (let r = 0; r < rows; r++) {
        let c = 0;
        while (c < cols) {
          const run = 1 + Math.floor(Math.random() * 8);
          for (let k = 0; k < run && c < cols; k++, c++) {
            const i = r * cols + c;
            const dx = ((c + 0.5) / cols - 0.5) / 0.7;
            const dy = ((r + 0.5) / rows - 0.45) / 0.8;
            glow[i] = Math.max(0.15, 1 - Math.sqrt(dx * dx + dy * dy));
            digit[i] = Math.random() < 0.5 ? 0 : 1;
            const a = Math.random() * TAU;
            seedS[i] = Math.sin(a);
            seedC[i] = Math.cos(a);
            spark[i] = Math.random() < 0.04 ? 1 : 0;
          }
          const gaps = 1 + Math.floor(Math.random() * 3);
          for (let k = 0; k < gaps && c < cols; k++, c++) gap[r * cols + c] = 1;
        }
      }
      colA = new Float32Array(cols);
      colS2 = new Float32Array(cols);
      colC2 = new Float32Array(cols);
      colS3 = new Float32Array(cols);
      colC3 = new Float32Array(cols);
      rowS2 = new Float32Array(rows);
      rowC2 = new Float32Array(rows);
      rowS3 = new Float32Array(rows);
      rowC3 = new Float32Array(rows);
      rowD = new Float32Array(rows);
      rings = [];
      paint(performance.now() / 1000);
    };

    // The wave is a sum of a few slow sines across the grid, kept separable (one row of numbers
    // per column and per row) so a frame costs a handful of multiplies per digit.
    const prepWave = () => {
      const sway = 0.3 * Math.sin(0.23 * t);
      for (let c = 0; c < cols; c++) {
        const u = c / cols;
        colA[c] = Math.sin(TAU * (1.3 * u + sway) + 0.7 * t);
        const p2 = -TAU * 0.8 * u;
        colS2[c] = Math.sin(p2);
        colC2[c] = Math.cos(p2);
        const p3 = TAU * 2.9 * u;
        colS3[c] = Math.sin(p3);
        colC3[c] = Math.cos(p3);
      }
      const roll = 0.9 * Math.sin(0.17 * t);
      for (let r = 0; r < rows; r++) {
        const v = r / rows;
        const p2 = TAU * 1.8 * v - 0.55 * t + 1.3;
        rowS2[r] = Math.sin(p2);
        rowC2[r] = Math.cos(p2);
        const p3 = TAU * 2.4 * v + 0.35 * t + 3.9;
        rowS3[r] = Math.sin(p3);
        rowC3[r] = Math.cos(p3);
        rowD[r] = Math.cos(TAU * (1.1 * v - roll) - 0.45 * t);
      }
    };

    const paint = (sec: number) => {
      if (!cols) return;
      prepWave();
      const shimmerS = Math.sin(1.3 * t);
      const shimmerC = Math.cos(1.3 * t);
      const blinkS = Math.sin(0.55 * sec);
      const blinkC = Math.cos(0.55 * sec);

      // The rings still alight, and the patch of grid the pointer and they can reach.
      const live: { x: number; y: number; r1: number; r2: number; f: number }[] = [];
      rings = rings.filter((rg) => Math.exp(-(sec - rg.t) * RING_FADE) >= 0.02);
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const reach = (x: number, y: number, rad: number) => {
        x0 = Math.min(x0, x - rad);
        y0 = Math.min(y0, y - rad);
        x1 = Math.max(x1, x + rad);
        y1 = Math.max(y1, y + rad);
      };
      for (const rg of rings) {
        const age = sec - rg.t;
        const r1 = age * RING_SPEED;
        live.push({ x: rg.x, y: rg.y, r1, r2: Math.max(0, age - RING_ECHO) * RING_SPEED, f: Math.exp(-age * RING_FADE) * 0.9 * rg.a });
        reach(rg.x, rg.y, r1 + 3 * RING_W);
      }
      const lit = weight > 0.004;
      if (lit) {
        reach(px, py, 3 * CORE);
        reach(wx, wy, HALO);
      }
      const c0 = Math.max(0, Math.floor(x0 / CELL_W));
      const c1 = Math.min(cols - 1, Math.floor(x1 / CELL_W));
      const r0 = Math.max(0, Math.floor(y0 / CELL_H));
      const r1 = Math.min(rows - 1, Math.floor(y1 / CELL_H));
      const core2 = 2 * CORE * CORE;
      const halo2 = HALO * HALO;
      const ring2 = 2 * RING_W * RING_W;
      const band = 3 * RING_W;

      // Flip a few digits each frame, so the field stays alive between the bands.
      if (!still) {
        for (let k = Math.round(cols * rows * 0.0004); k > 0; k--) {
          const i = Math.floor(Math.random() * digit.length);
          if (gap[i]) continue;
          digit[i] ^= 1;
          shown[i] = -1;
        }
      }

      for (let r = 0; r < rows; r++) {
        const s2 = rowS2[r];
        const c2 = rowC2[r];
        const s3 = rowS3[r];
        const c3 = rowC3[r];
        const d = rowD[r];
        const thresholds = BAYER[r & 3];
        const near = r >= r0 && r <= r1;
        const cy = r * CELL_H + CELL_H / 2;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (gap[i]) continue;
          const wave = colA[c] + 0.7 * (colS2[c] * c2 + colC2[c] * s2) + 0.5 * (colS3[c] * c3 + colC3[c] * s3) + 0.4 * d;
          const sh = 0.5 + 0.5 * (seedS[i] * shimmerC + seedC[i] * shimmerS);
          let b = smooth((wave - 0.05) / 1.6) * (0.85 + 0.15 * sh) * (0.4 + 0.6 * glow[i]);

          let v = 0;
          if (near && c >= c0 && c <= c1) {
            const cx = c * CELL_W + CELL_W / 2;
            if (lit) {
              const ex = cx - px;
              const ey = cy - py;
              v += Math.exp(-(ex * ex + ey * ey) / core2) * weight;
              const hx = cx - wx;
              const hy = cy - wy;
              const hd = hx * hx + hy * hy;
              if (hd < halo2) {
                const k = 1 - hd / halo2;
                v += k * k * 0.45 * weight;
              }
            }
            for (const rg of live) {
              const ex = cx - rg.x;
              const ey = cy - rg.y;
              const dist = Math.sqrt(ex * ex + ey * ey);
              const a = dist - rg.r1;
              if (a > -band && a < band) v += Math.exp(-(a * a) / ring2) * rg.f;
              if (rg.r2 > 0) {
                const e = dist - rg.r2;
                if (e > -band && e < band) v += Math.exp(-(e * e) / (1.25 * ring2)) * rg.f * 0.5;
              }
            }
            if (v > 1) v = 1;
            if (v > 0) {
              // Light where the field is dark; where a band is already bright, carve into it a little.
              const k = 0.6 * smooth((b - 0.2) / 0.4);
              const up = v > b ? v : b;
              const carve = b > v ? b - v : 0;
              b = up + (carve - up) * k;
            }
          }

          let level: number;
          if (spark[i] && v > 0.3) level = SPARK;
          else if (spark[i] && 0.5 + 0.5 * (seedS[i] * blinkC + seedC[i] * blinkS) > 0.97) level = 15;
          else if (b > thresholds[c & 3]) {
            level = Math.min(14, 6 + Math.round(4 * glow[i] + 5 * v));
            const tint = Math.min(3, Math.round(v * 6)); // the pointer's light: full colour from v ≈ 0.4
            if (tint > 0) level += GLOW + (tint - 1) * LEVELS;
          } else level = 1 + Math.round(1.6 * glow[i]);
          if (level === shown[i]) continue;
          shown[i] = level;
          const x = c * CELL_W;
          const y = r * CELL_H;
          ctx.drawImage(ground, x * dpr, y * dpr, CELL_W * dpr, CELL_H * dpr, x, y, CELL_W, CELL_H);
          buckets[level].push(i);
        }
      }
      for (let level = 0; level < palette.length; level++) {
        const list = buckets[level];
        if (!list.length) continue;
        ctx.fillStyle = palette[level];
        for (const i of list) {
          const c = i % cols;
          const r = (i / cols) | 0;
          ctx.fillText(digit[i] ? "1" : "0", c * CELL_W, baseline(r));
        }
        list.length = 0;
      }
    };

    // ---- The loop: the wave always moves; the pointer and rings raise the frame rate ----
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const active = weight > 0.004 || hasPointer || rings.length > 0;
      if (last && now - last < (active ? FRAME_LIVE : FRAME_IDLE) - 4) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.033;
      last = now;
      if (!cols) return;
      t += DRIFT * dt;
      const ease = Math.min(1, 7 * dt);
      weight += ((hasPointer ? 1 : 0) - weight) * ease;
      if (weight < 0.004 && !hasPointer) weight = 0;
      wx += (px - wx) * ease;
      wy += (py - wy) * ease;
      paint(now / 1000);
    };
    const start = () => {
      if (still || raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ring = (x: number, y: number, a: number, now: number) => {
      rings.push({ x, y, t: now / 1000, a });
      if (rings.length > MAX_RINGS) rings.shift();
      spawnX = x;
      spawnY = y;
      spawnT = now;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch moves are scrolls
      const now = performance.now();
      if (!hasPointer) {
        wx = e.clientX;
        wy = e.clientY;
      }
      hasPointer = true;
      px = e.clientX;
      py = e.clientY;
      if (Math.hypot(px - spawnX, py - spawnY) >= 28 && now - spawnT >= 100) ring(px, py, 1, now);
    };
    const onDown = (e: PointerEvent) => ring(e.clientX, e.clientY, 1.4, performance.now());
    const onLeave = () => {
      hasPointer = false;
    };

    build();

    // Rebuild only when the width changes or the height grows a lot, so a phone's toolbar
    // sliding in and out doesn't reshuffle the digits mid-scroll.
    let lastW = w;
    let lastH = h;
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (cols && window.innerWidth === lastW && window.innerHeight - lastH < 160) return;
        build();
        lastW = w;
        lastH = h;
      }, 150);
    };
    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("blur", onLeave);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    start();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas className="binary" ref={ref} aria-hidden="true" />;
}
