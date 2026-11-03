// One-off asset generator (run with `npm run assets`, then `npm run build`). Uses the local
// Google Chrome in headless mode to make:
//   public/og/home.jpg, public/og/<slug>.jpg   1200×630 link-preview cards
//   public/favicon-48.png, public/apple-touch-icon.png
//   public/isha-mishra-resume.pdf              printed from the built /resume/ page (no phone number)
// The PDF step needs a fresh `npm run build` first, because it prints the built page.

import { spawn, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}; set CHROME=/path/to/chrome`);

const { projects } = await import(pathToFileURL(join(root, "src/data/projects.ts")).href);
const { profile, highlights } = await import(pathToFileURL(join(root, "src/data/profile.ts")).href);

const chrome = (args) => execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", ...args], { stdio: "pipe" });

// Cards are saved as JPEG: the binary texture makes PNGs ~650 KB, and some apps skip
// preview images over ~300 KB. macOS `sips` does the conversion.
async function shot(file, data) {
  const url = `${pathToFileURL(join(root, "scripts/og-template.html")).href}#${encodeURIComponent(JSON.stringify(data))}`;
  await mkdir(dirname(file), { recursive: true });
  const png = file.replace(/\.jpg$/, ".tmp.png");
  chrome([`--screenshot=${png}`, "--window-size=1200,630", "--virtual-time-budget=1500", url]);
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", png, "--out", file], { stdio: "pipe" });
  await rm(png);
}

const only = process.argv[2]; // optional: "og", "icons" or "pdf"

if (!only || only === "og") {
  const who = `${profile.name} · ${profile.title}`;
  await shot(join(root, "public/og/home.jpg"), {
    who: profile.location,
    title: profile.name,
    line: profile.tagline,
    metric: highlights[0].metric,
    mlabel: `${highlights[0].label} · ${highlights[0].where}`,
  });
  for (const p of projects) {
    await shot(join(root, `public/og/${p.slug}.jpg`), {
      who,
      title: p.name,
      line: p.tagline,
      metric: p.results[0].value,
      mlabel: p.results[0].label,
      });
  }
  console.log(`og: ${projects.length + 1} images`);
}

if (!only || only === "icons") {
  const svg = join(root, "public/favicon.svg");
  for (const [name, size] of [["favicon-48.png", 48], ["apple-touch-icon.png", 180]]) {
    const page = join(root, "scripts", `.icon-${size}.html`);
    await writeFile(
      page,
      `<!doctype html><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}img{width:${size}px;height:${size}px;display:block}</style><img src="${pathToFileURL(svg).href}">`,
    );
    chrome([`--screenshot=${join(root, "public", name)}`, `--window-size=${size},${size}`, "--default-background-color=00000000", pathToFileURL(page).href]);
    execFileSync("rm", [page]);
  }
  console.log("icons: favicon-48.png, apple-touch-icon.png");
}

if (!only || only === "pdf") {
  if (!existsSync(join(root, "dist/resume/index.html"))) throw new Error("Run `npm run build` first; the PDF prints dist/resume/.");
  const port = 4179;
  const server = spawn("npx", ["vite", "preview", "--port", String(port), "--strictPort"], { cwd: root, stdio: "ignore" });
  try {
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(`http://localhost:${port}/resume/`);
        if (r.ok) break;
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    chrome([
      `--print-to-pdf=${join(root, "public/isha-mishra-resume.pdf")}`,
      "--no-pdf-header-footer",
      "--virtual-time-budget=4000",
      `http://localhost:${port}/resume/`,
    ]);
    console.log("pdf: public/isha-mishra-resume.pdf");
  } finally {
    server.kill();
  }
}
