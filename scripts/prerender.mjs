// Writes a static HTML file for every page, plus sitemap.xml, robots.txt and llms.txt.
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx` (server bundle).
// Crawlers and link-preview bots that don't run JavaScript then still see real content and tags.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const server = await import(pathToFileURL(join(root, "dist-server", "entry-server.js")).href);

const template = await readFile(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
  throw new Error("index.html is missing the <!--app-head--> or <!--app-html--> placeholder");
}

const page = (path) => {
  const { html, head } = server.render(path);
  return template
    .replace("<!--app-head-->", head)
    .replace('<div id="root"><!--app-html--></div>', `<div id="root" data-ssr-path="${path}">${html}</div>`);
};

const written = [];
for (const path of server.allPaths()) {
  const file = path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page(path));
  written.push(path);
}

// Served for unknown URLs (Vercel uses 404.html automatically; render.yaml rewrites to it).
await writeFile(join(dist, "404.html"), page("/404/"));

const today = new Date().toISOString().slice(0, 10);
await writeFile(join(dist, "sitemap.xml"), server.sitemapXml(today));
await writeFile(join(dist, "robots.txt"), server.robotsTxt());
await writeFile(join(dist, "llms.txt"), server.llmsTxt());
await rm(join(root, "dist-server"), { recursive: true, force: true });

console.log(`prerendered ${written.length} pages + 404.html, sitemap.xml, robots.txt, llms.txt`);
