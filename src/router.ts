// A tiny path router. Every route has a real URL that is pre-rendered to static HTML at build
// time (see scripts/prerender.mjs), so crawlers and link-preview bots see the same page people do.

import { designs } from "./data/designs";
import { projects } from "./data/projects";

export type Route =
  | { name: "home" }
  | { name: "project"; slug: string }
  | { name: "design"; slug: string }
  | { name: "resume" }
  | { name: "writing" }
  | { name: "blog" }
  | { name: "notfound" };

export function normalize(path: string): string {
  const p = path.split(/[?#]/)[0] || "/";
  return p === "/" ? "/" : `/${p.replace(/^\/+|\/+$/g, "")}/`;
}

export function parse(path: string): Route {
  const p = normalize(path);
  if (p === "/") return { name: "home" };
  if (p === "/resume/") return { name: "resume" };
  if (p === paths.writing) return { name: "writing" };
  if (p === paths.blog) return { name: "blog" };
  const m = p.match(/^\/work\/([a-z0-9-]+)\/$/);
  if (m && projects.some((x) => x.slug === m[1])) return { name: "project", slug: m[1] };
  const d = p.match(/^\/work\/([a-z0-9-]+)\/design\/$/);
  if (d && designs.some((x) => x.slug === d[1])) return { name: "design", slug: d[1] };
  return { name: "notfound" };
}

export const paths = {
  home: "/",
  resume: "/resume/",
  writing: "/writing/how-i-build-agents/",
  blog: "/blog/",
  project: (slug: string) => `/work/${slug}/`,
  design: (slug: string) => `/work/${slug}/design/`,
  section: (id: string) => `/#${id}`,
};

/** Every page that gets its own static HTML file. */
export function allPaths(): string[] {
  return [
    paths.home,
    paths.resume,
    paths.blog,
    paths.writing,
    ...projects.map((p) => paths.project(p.slug)),
    ...designs.map((d) => paths.design(d.slug)),
  ];
}
