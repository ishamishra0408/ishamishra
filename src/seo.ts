// Page metadata shared by the build-time pre-renderer (static <head> tags, sitemap, robots,
// llms.txt) and the browser (document.title on client-side navigation).

import { SITE_URL } from "./config";
import { designFor, designs } from "./data/designs";
import { education, profile } from "./data/profile";
import { projects } from "./data/projects";
import { POST } from "./data/views";
import { allPaths, paths, type Route } from "./router";

export type Meta = {
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  type: "profile" | "website" | "article";
  noindex?: boolean;
  jsonLd?: object;
};

const abs = (p: string) => `${SITE_URL}${p}`;
const PERSON_ID = abs("/#person");

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: profile.name,
  jobTitle: profile.title,
  description: profile.summary,
  url: abs("/"),
  email: `mailto:${profile.email}`,
  homeLocation: { "@type": "Place", name: profile.location },
  alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
  knowsAbout: ["AI agents", "Retrieval-augmented generation", "Agent security", "LLM evaluation", "Backend engineering"],
  sameAs: [profile.links.github, profile.links.linkedin],
};

export function routeMeta(route: Route): Meta {
  if (route.name === "project") {
    const p = projects.find((x) => x.slug === route.slug)!;
    return {
      path: paths.project(p.slug),
      title: `${p.name} · ${profile.name}`,
      description: p.summary,
      image: abs(`/og/${p.slug}.jpg`),
      imageAlt: `${p.name}: ${p.tagline}`,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: p.name,
        description: p.summary,
        codeRepository: p.repo,
        url: abs(paths.project(p.slug)),
        programmingLanguage: p.stack[0],
        author: { "@type": "Person", "@id": PERSON_ID, name: profile.name },
        ...(p.coBuilders?.length ? { contributor: p.coBuilders.map((name) => ({ "@type": "Person", name })) } : {}),
      },
    };
  }
  if (route.name === "design") {
    const p = projects.find((x) => x.slug === route.slug)!;
    const d = designFor(route.slug)!;
    const title = `${p.name}: system design`;
    return {
      path: paths.design(p.slug),
      title: `${title} · ${profile.name}`,
      description: `How ${p.name} is built: requirements, core entities, API, high-level design and the trade-offs behind it. ${d.intro}`,
      image: abs(`/og/${p.slug}.jpg`),
      imageAlt: `${p.name}: ${p.tagline}`,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: title,
        description: d.intro,
        url: abs(paths.design(p.slug)),
        about: { "@type": "SoftwareSourceCode", name: p.name, codeRepository: p.repo },
        author: { "@type": "Person", "@id": PERSON_ID, name: profile.name },
        ...(p.coBuilders?.length ? { contributor: p.coBuilders.map((name) => ({ "@type": "Person", name })) } : {}),
      },
    };
  }
  if (route.name === "blog") {
    return {
      path: paths.blog,
      title: `Engineering Blog · ${profile.name}`,
      description: `How ${profile.name}'s projects are built: system designs in Hello Interview's format (requirements, core entities, API, high-level design, deep dives), and the calls behind them.`,
      image: abs("/og/home.jpg"),
      imageAlt: `${profile.name}: Engineering Blog`,
      type: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `Engineering Blog · ${profile.name}`,
        url: abs(paths.blog),
        author: { "@type": "Person", "@id": PERSON_ID, name: profile.name },
      },
    };
  }
  if (route.name === "writing") {
    return {
      path: paths.writing,
      title: `${POST.title} · ${profile.name}`,
      description: POST.description,
      image: abs("/og/home.jpg"),
      imageAlt: `${profile.name}: ${POST.title}`,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: POST.title,
        description: POST.description,
        datePublished: POST.date,
        url: abs(paths.writing),
        author: { "@type": "Person", "@id": PERSON_ID, name: profile.name },
      },
    };
  }
  if (route.name === "resume") {
    return {
      path: paths.resume,
      title: `Résumé · ${profile.name}`,
      description: `${profile.name}, ${profile.title}. ${profile.summary}`,
      image: abs("/og/home.jpg"),
      imageAlt: `${profile.name}, ${profile.title}`,
      type: "profile",
    };
  }
  if (route.name === "notfound") {
    return {
      path: "/404/",
      title: `Page not found · ${profile.name}`,
      description: "This page doesn't exist.",
      image: abs("/og/home.jpg"),
      imageAlt: profile.name,
      type: "website",
      noindex: true,
    };
  }
  return {
    path: paths.home,
    title: `${profile.name} · ${profile.title}`,
    description: `${profile.name} is a senior software engineer in San Francisco, open to ${profile.seeking.role} roles in the ${profile.seeking.where.replace(", CA", "")}. ${profile.proof}`,
    image: abs("/og/home.jpg"),
    imageAlt: `${profile.name}, ${profile.title}: ${profile.tagline}`,
    type: "profile",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: profile.name },
        { "@type": "ProfilePage", url: abs("/"), name: `${profile.name} · ${profile.title}`, mainEntity: person },
      ],
    },
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The <head> tags written into each pre-rendered page. Kept early in <head> for preview bots. */
export function headTags(m: Meta): string {
  const url = abs(m.path);
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    m.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${m.type}" />`,
    `<meta property="og:site_name" content="${esc(profile.name)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    ...(m.noindex ? [] : [`<meta property="og:url" content="${url}" />`]),
    `<meta property="og:image" content="${m.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${m.image}" />`,
  ];
  if (m.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(m.jsonLd).replace(/</g, "\\u003c")}</script>`);
  return tags.join("\n    ");
}

export function sitemapXml(lastmod: string): string {
  const urls = allPaths()
    .map((p) => `  <url><loc>${abs(p)}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(): string {
  // Everything is allowed. Search/answer bots are named so the intent is explicit.
  const bots = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot"];
  return `${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n")}\nUser-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`;
}

/** Optional plain-text summary for AI tools (llmstxt.org). Harmless; no proven effect. */
export function llmsTxt(): string {
  const line = (p: (typeof projects)[number]) =>
    `- [${p.name}](${abs(paths.project(p.slug))})${p.coBuilders?.length ? ` (with ${p.coBuilders.join(", ")})` : ""}: ${p.summary}`;
  return [
    `# ${profile.name}`,
    "",
    `> ${profile.title}, ${profile.location}. ${profile.summary}`,
    "",
    "## Projects",
    ...projects.map(line),
    "",
    `## [Engineering blog](${abs(paths.blog)})`,
    ...designs.map((d) => {
      const p = projects.find((x) => x.slug === d.slug)!;
      return `- [${p.name}: how it's built](${abs(paths.design(d.slug))}): ${d.intro}`;
    }),
    `- [${POST.title}](${abs(paths.writing)}): ${POST.description}`,
    "",
    "## Links",
    `- [Résumé](${abs(paths.resume)})`,
    `- [GitHub](${profile.links.github})`,
    `- [LinkedIn](${profile.links.linkedin})`,
    "",
  ].join("\n");
}
