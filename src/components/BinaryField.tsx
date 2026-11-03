import { useEffect, useRef } from "react";

// The site's background: runs of binary digits on deep navy, brighter toward the middle and in
// loose horizontal bands. Drawn on one fixed canvas (nothing to download). A few digits flip
// every tick. Around the pointer the digits lift and bob, and moving it (or tapping) drops
// ripples that push the digits outward like rings on water, then let them settle.
// All motion stops for reduced motion and while the tab is hidden.

const FONT = 13; // CSS px
const CELL_W = 9;
const CELL_H = 17;
const LEVELS = 16;

const HOVER_R = 120; // px around the pointer where digits float
const RIPPLE_LIFE = 1100; // ms
const RIPPLE_SPEED = 0.26; // px per ms
const RIPPLE_W = 24; // half-width of the ring, px
const MAX_RIPPLES = 4;

type Ripple = { x: number; y: number; t: number; a: number };
type Rect = { c0: number; c1: number; r0: number; r1: number };

export function BinaryField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ground = document.createElement("canvas");
    const gctx = ground.getContext("2d")!;
    const colour = (b: number) =>
      `rgba(${Math.round(60 + b * 150)}, ${Math.round(150 + b * 95)}, ${Math.round(205 + b * 50)}, ${(0.1 + b * 0.85).toFixed(3)})`;
    const palette = Array.from({ length: LEVELS }, (_, i) => colour(i / (LEVELS - 1)));
    const BASE_MAX = 11; // resting digits stay below the top levels, which the ripples use

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let level = new Int8Array(0); // brightness level per cell; -1 is a gap
    let base = new Float32Array(0); // each cell's resting brightness
    let digit = new Uint8Array(0);

    const glow = (x: number, y: number) => {
      const dx = (x / w - 0.5) / 0.7;
      const dy = (y / h - 0.45) / 0.8;
      return Math.max(0.15, 1 - Math.sqrt(dx * dx + dy * dy));
    };
    const baseline = (r: number) => r * CELL_H + CELL_H - 4;

    const build = () => {
      w = window.innerWidth;
      h = Math.max(window.innerHeight, canvas.clientHeight);
      // A window with no size yet (a hidden or collapsed pane) has nothing to draw: drawing
      // from a zero-size canvas throws. Wait for the resize that gives it a size.
      if (!w || !h) {
        cols = rows = 0;
        level = new Int8Array(0);
        lastRect = null;
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

      cols = Math.ceil(w / CELL_W);
      rows = Math.ceil(h / CELL_H);
      level = new Int8Array(cols * rows);
      base = new Float32Array(cols * rows);
      digit = new Uint8Array(cols * rows);
      ctx.font = `${FONT}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

      // Loose horizontal bands, like light catching rows of a terminal.
      const band = Array.from({ length: rows }, (_, r) => 0.55 + 0.45 * Math.sin(r * 0.37 + Math.sin(r * 0.11) * 2.2));
      for (let r = 0; r < rows; r++) {
        let c = 0;
        while (c < cols) {
          const run = 1 + Math.floor(Math.random() * 8);
          for (let k = 0; k < run && c < cols; k++, c++) {
            const i = r * cols + c;
            let b = band[r] * glow(c * CELL_W, r * CELL_H) * (0.25 + 0.75 * Math.random() ** 2);
            if (Math.random() < 0.025) b = Math.min(1, b + 0.6);
            base[i] = b;
            level[i] = Math.round(b * BASE_MAX);
            digit[i] = Math.random() < 0.5 ? 0 : 1;
            ctx.fillStyle = palette[level[i]];
            ctx.fillText(digit[i] ? "1" : "0", c * CELL_W, baseline(r));
          }
          const gap = 1 + Math.floor(Math.random() * 3);
          for (let k = 0; k < gap && c < cols; k++, c++) level[r * cols + c] = -1;
        }
      }
      ripples = [];
      lastRect = null;
    };

    // ---- Pointer: floating digits and ripples ----
    let ripples: Ripple[] = [];
    let lastRect: Rect | null = null;
    let px = -1e4;
    let py = -1e4;
    let lastMove = -1e9;
    let hover = 0;
    let spawnX = -1e4;
    let spawnY = -1e4;
    let spawnT = 0;
    let raf = 0;

    const inRect = (i: number, rc: Rect | null) => {
      if (!rc) return false;
      const c = i % cols;
      const r = (i / cols) | 0;
      return c >= rc.c0 && c <= rc.c1 && r >= rc.r0 && r <= rc.r1;
    };

    // Redraws only the patch of field the effect touches (plus last frame's patch, to settle it).
    const render = (now: number) => {
      if (!cols) return false;
      ripples = ripples.filter((rp) => now - rp.t < RIPPLE_LIFE);
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
      if (hover > 0.01) reach(px, py, HOVER_R + 16);
      for (const rp of ripples) reach(rp.x, rp.y, (now - rp.t) * RIPPLE_SPEED + RIPPLE_W * 2 + 16);

      const cur: Rect | null =
        x1 < x0
          ? null
          : {
              c0: Math.max(0, Math.floor(x0 / CELL_W) - 1),
              c1: Math.min(cols - 1, Math.ceil(x1 / CELL_W) + 1),
              r0: Math.max(0, Math.floor(y0 / CELL_H) - 1),
              r1: Math.min(rows - 1, Math.ceil(y1 / CELL_H) + 1),
            };
      const rc = cur && lastRect
        ? { c0: Math.min(cur.c0, lastRect.c0), c1: Math.max(cur.c1, lastRect.c1), r0: Math.min(cur.r0, lastRect.r0), r1: Math.max(cur.r1, lastRect.r1) }
        : cur ?? lastRect;
      lastRect = cur;
      if (!rc || rc.c1 < rc.c0 || rc.r1 < rc.r0) return false;

      const rx = rc.c0 * CELL_W;
      const ry = rc.r0 * CELL_H;
      const rw = (rc.c1 - rc.c0 + 1) * CELL_W;
      const rh = (rc.r1 - rc.r0 + 1) * CELL_H;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(ground, rx * dpr, ry * dpr, rw * dpr, rh * dpr, rx, ry, rw, rh);
      const hr2 = HOVER_R * HOVER_R;
      for (let r = rc.r0; r <= rc.r1; r++) {
        for (let c = rc.c0; c <= rc.c1; c++) {
          const i = r * cols + c;
          if (level[i] < 0) continue;
          const cx = c * CELL_W + CELL_W / 2;
          const cy = r * CELL_H + CELL_H / 2;
          let dx = 0;
          let dy = 0;
          let lift = 0;
          if (hover > 0.01) {
            const ex = cx - px;
            const ey = cy - py;
            const d2 = ex * ex + ey * ey;
            if (d2 < hr2) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / HOVER_R) ** 2 * hover;
              const ph = now * 0.0028 + i * 0.9;
              dy -= f * (7 + 4 * Math.sin(ph));
              dx += f * (3 * Math.cos(ph * 0.8) + (ex / d) * 6);
              lift += f * 0.55;
            }
          }
          for (const rp of ripples) {
            const age = now - rp.t;
            const ex = cx - rp.x;
            const ey = cy - rp.y;
            const d = Math.sqrt(ex * ex + ey * ey) || 1;
            const k = Math.exp(-(((d - age * RIPPLE_SPEED) / RIPPLE_W) ** 2));
            if (k < 0.02) continue;
            const fade = 1 - age / RIPPLE_LIFE;
            const amp = k * fade * fade * rp.a;
            dx += (ex / d) * amp * 7;
            dy += (ey / d) * amp * 7 - amp * 3;
            lift += amp * 0.75;
          }
          ctx.fillStyle = palette[Math.min(LEVELS - 1, level[i] + Math.round(lift * (LEVELS - 1)))];
          ctx.fillText(digit[i] ? "1" : "0", c * CELL_W + dx, baseline(r) + dy);
        }
      }
      ctx.restore();
      return true;
    };

    const loop = (now: number) => {
      const target = now - lastMove < 1800 ? 1 : 0;
      hover += (target - hover) * 0.08;
      if (hover < 0.01 && target === 0) hover = 0;
      const drew = render(now);
      raf = drew || hover > 0 || ripples.length ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!raf && !still) raf = requestAnimationFrame(loop);
    };
    const drop = (x: number, y: number, a: number, now: number) => {
      ripples.push({ x, y, t: now, a });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      spawnX = x;
      spawnY = y;
      spawnT = now;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch moves are scrolls
      const now = performance.now();
      px = e.clientX;
      py = e.clientY;
      lastMove = now;
      const moved = Math.hypot(px - spawnX, py - spawnY);
      if (moved > 90 || (moved > 8 && now - spawnT > 280)) drop(px, py, 1, now);
      wake();
    };
    const onDown = (e: PointerEvent) => {
      drop(e.clientX, e.clientY, 1.4, performance.now());
      wake();
    };
    const onLeave = () => {
      lastMove = -1e9;
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

    let timer = 0;
    const tick = () => {
      if (!cols) return;
      for (let n = 0; n < 45; n++) {
        const i = Math.floor(Math.random() * level.length);
        if (level[i] < 0 || inRect(i, lastRect)) continue;
        const b = Math.min(1, base[i] * (0.6 + Math.random() * 0.9));
        level[i] = Math.round(b * BASE_MAX);
        if (Math.random() < 0.5) digit[i] ^= 1;
        const c = i % cols;
        const r = (i / cols) | 0;
        const x = c * CELL_W;
        const y = r * CELL_H;
        ctx.drawImage(ground, x * dpr, y * dpr, CELL_W * dpr, CELL_H * dpr, x, y, CELL_W, CELL_H);
        ctx.fillStyle = palette[level[i]];
        ctx.fillText(digit[i] ? "1" : "0", x, baseline(r));
      }
    };
    const start = () => {
      if (!still && !timer && !document.hidden) timer = window.setInterval(tick, 110);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    start();

    return () => {
      stop();
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas className="binary" ref={ref} aria-hidden="true" />;
}
