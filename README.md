# Isha Mishra · portfolio

Personal site for a senior software engineer building AI agents, structured from research on what reviewers actually read
(see `reports/Engineer portfolio website best practices.md`):

- **Home:** hero with one line, current status and two buttons → a scrolling strip of employer logos (`public/logos`) →
  experience (Now strip, four role tiles, education) → 5 project cards with tech chips → Writing and contact tiles.
- **Writing** at `/writing/how-i-build-agents/`: the six calls from `src/data/views.ts`, each linked to the project
  where it shows up, plus the quiz. **Drafted from the READMEs; rewrite it in your own words.**
- **One page per project** at `/work/<slug>/`: a Back button (to the exact spot you left), summary, links, three
  results, caveat, screenshot, live demo (for 3 projects).
- **`/resume/`** page plus a phone-free PDF built from the same data.
- **Pre-rendered:** every page ships as static HTML with its own title, canonical URL, Open Graph card and JSON-LD,
  so Google, link-preview bots (LinkedIn, Slack) and AI crawlers that don't run JavaScript see the real content.
- **Look:** components modelled on deccan.ai (thin two-tone headings, small uppercase labels, square white buttons,
  blue gradient cards, asterisk lists, pill tabs) over a field of binary digits drawn on one canvas
  (`BinaryField.tsx`: no image to download; digits float around the pointer and ripple out like water when it moves
  or taps; all still under Reduce Motion). Dark only; Inter Tight.
- **Fast:** no animation library. Sections fade in with CSS scroll-driven animation where supported. About 145 KB
  over the wire for the home page.

Built with React 18, TypeScript and Vite 7. No router or SSR framework: `src/router.ts` and `scripts/prerender.mjs` do it.

## Run it

Needs Node 22.18 or newer (the asset script imports `.ts` files directly).

```bash
npm install
npm run dev        # http://localhost:5173 (client-rendered, for editing)
npm run build      # type-check → client build → server bundle → pre-render every page into dist/
npm run preview    # serve dist/ exactly as production will
```

## Change what it says

| File | What it holds |
|---|---|
| `src/config.ts` | `SITE_URL` (the domain every absolute URL uses), booking link settings, résumé PDF path |
| `src/data/profile.ts` | Name, proof line, hero highlights, roles (short tiles + full résumé bullets), education, skills |
| `src/data/projects.ts` | Every project: tagline, summary, problem, steps, results, caveat, links. `featured: true` puts it on the home page (keep it to 3–4). |
| `src/data/views.ts` | The six "How I think" stances. **Drafted from your READMEs; rewrite them in your own words.** |

After changing profile or project data, regenerate the images and PDF:

```bash
npm run build && npm run assets && npm run build
```

`npm run assets` uses local Google Chrome (headless) to write `public/og/*.jpg` (1200×630 preview cards, via macOS `sips`),
`public/favicon-48.png`, `public/apple-touch-icon.png` and `public/isha-mishra-resume.pdf` (printed from the built
`/resume/` page, so it never contains a phone number). Run `node scripts/assets.mjs og|icons|pdf` for one part.

## Turn on calendar booking

"Book a call" embeds the Calendly intro call set in `src/config.ts` (`BOOKING_URL`), so it works locally and once
deployed with no setup. To use a different page, change it there or set `VITE_BOOKING_URL` in `.env` or the host's
environment variables. The panel also links to the page in a new tab and offers email as a fallback.

## Visit stats (optional)

Anonymous visit counts through [Umami](https://cloud.umami.is): no cookies, so no consent banner, and nothing that
identifies a person. Create a free account, add the site, and set its website ID as `VITE_UMAMI_ID` in the host's
environment variables (or `.env`). Only production builds load the tracker, and it counts the site's own address only.

| What | Where in Umami |
|---|---|
| Visits, pages, referrers, countries, devices | Website overview |
| `Book a call opened`, `Call booked`, `Email clicked`, `Résumé downloaded`, `Code opened` / `Live site opened` (by project) | Events |
| Which application link someone came from | Events → `Arrived from link`, `ref` property |

Application links: send `https://<domain>/?ref=stripe` (any short tag). The tag is attached to every event in that
visit, and a call booked from it shows `utm_source=stripe` on the booking in Calendly.

To leave your own visits out, open the live site once and run `localStorage.setItem("umami.disabled", 1)` in the
browser console.

## Deploy

| Host | Steps |
|---|---|
| **Vercel** | Import the repo. Vite is auto-detected (build `npm run build`, output `dist`). `vercel.json` adds trailing slashes; `404.html` is served for unknown paths. |
| **Render** | "New → Blueprint" with this repo; `render.yaml` defines a static site. Real files are served first; anything else gets the noindex 404 page. |
| **Netlify / Cloudflare Pages** | Build `npm run build`, publish `dist`. |

Then, for search:

1. The site's address is filled in at build time from the host (`VERCEL_PROJECT_PRODUCTION_URL` on Vercel,
   `RENDER_EXTERNAL_URL` on Render; on Vercel, keep "Automatically expose System Environment Variables" on).
   Set `SITE_URL` in the host's environment variables to override it, e.g. after adding a custom domain.
2. Verify the domain in Google Search Console and submit `https://<domain>/sitemap.xml`.
3. Put the same URL in your GitHub and LinkedIn profiles (they are listed in the JSON-LD `sameAs`).
4. Check the preview card with LinkedIn Post Inspector after the first deploy.
