import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// The site's public address, for canonical links, link previews, the sitemap and structured data.
// Vercel and Render both tell the build where the site lives (VERCEL_PROJECT_PRODUCTION_URL,
// RENDER_EXTERNAL_URL); SITE_URL overrides either, e.g. once a custom domain is set up. Local
// builds fall back to the planned Vercel address.
function siteUrl(): string {
  const env = process.env;
  const url =
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    env.RENDER_EXTERNAL_URL ||
    "https://ishamishra.vercel.app";
  return url.replace(/\/+$/, "");
}

// Visit stats (Umami, no cookies). Production builds get the tracker only when VITE_UMAMI_ID is set.
// It loads async, so it never holds up the page, and counts visits on the site's own address only,
// so local builds and preview deploys stay out of the numbers.
function umami(id: string, site: string): Plugin {
  return {
    name: "umami",
    apply: "build",
    transformIndexHtml: () =>
      id
        ? [
            {
              tag: "script",
              injectTo: "head",
              attrs: {
                async: true,
                // Not "umami": an element id becomes window.<id>, which would pose as the tracker.
                id: "umami-tracker",
                src: "https://cloud.umami.is/script.js",
                "data-website-id": id,
                "data-domains": new URL(site).host,
                "data-exclude-hash": "true",
                "data-do-not-track": "true",
              },
            },
          ]
        : [],
  };
}

export default defineConfig(({ mode }) => {
  const site = siteUrl();
  const umamiId = loadEnv(mode, process.cwd(), "VITE_").VITE_UMAMI_ID?.trim() ?? "";
  return {
    plugins: [react(), umami(umamiId, site)],
    server: { port: 5173 },
    define: { __SITE_URL__: JSON.stringify(site) },
  };
});
