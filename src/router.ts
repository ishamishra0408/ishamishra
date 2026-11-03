// A tiny path router. Every route has a real URL that is pre-rendered to static HTML at build
// time (see scripts/prerender.mjs), so crawlers and link-preview bots see the same page people do.

import { projects } from "./data/projects";

export type Route =
  | { name: "home" }
  | { name: "project"; slug: string }
  | { name: "resume" }
  | { name: "writing" }
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
  const m = p.match(/^\/work\/([a-z0-9-]+)\/$/);
  if (m && projects.some((x) => x.slug === m[1])) return { name: "project", slug: m[1] };
  return { name: "notfound" };
}

export const paths = {
  home: "/",
  resume: "/resume/",
  writing: "/writing/how-i-build-agents/",
  project: (slug: string) => `/work/${slug}/`,
  section: (id: string) => `/#${id}`,
};

/** Every page that gets its own static HTML file. */
export function allPaths(): string[] {
  return [paths.home, paths.resume, paths.writing, ...projects.map((p) => paths.project(p.slug))];
}
