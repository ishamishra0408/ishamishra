import { projects } from "./data/projects";

// Visit stats through Umami (cloud.umami.is): no cookies, nothing that identifies a person. The
// tracker is added to production builds only when VITE_UMAMI_ID is set (vite.config.ts); without
// it, everything here does nothing.

type Data = Record<string, string>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Data) => void };
  }
}

const REF_KEY = "visit-ref";
let ref = "";
const waiting: [string, Data | undefined][] = [];

/** The tag on a link sent with an application (…/?ref=stripe), kept for the whole visit. */
export function visitRef(): string {
  return ref;
}

/** Counts one event, with the visit's ref when it has one. Events before the tracker loads wait for it. */
export function track(event: string, data?: Data) {
  const send = (e: string, d?: Data) => {
    try {
      window.umami?.track(e, { ...(ref ? { ref } : {}), ...d });
    } catch {
      // Stats are never worth breaking a click over.
    }
  };
  if (typeof window.umami?.track === "function") return send(event, data);
  const script = document.getElementById("umami-tracker");
  if (!script) return;
  waiting.push([event, data]);
  if (waiting.length === 1) script.addEventListener("load", () => waiting.splice(0).forEach(([e, d]) => send(e, d)), { once: true });
}

// Outbound links are recognised by where they point, so no markup needs tagging.
let targets: Map<string, [string, string]> | undefined;
function linkEvent(a: HTMLAnchorElement): [string, Data?] | null {
  if (a.protocol === "mailto:") return ["Email clicked"];
  if (a.origin === location.origin && a.pathname.endsWith(".pdf")) return ["Résumé downloaded"];
  targets ??= new Map(
    projects.flatMap((p) => [
      [new URL(p.repo).href, ["Code opened", p.name] as [string, string]],
      ...(p.live ? [[new URL(p.live.url).href, ["Live site opened", p.name] as [string, string]] as const] : []),
    ]),
  );
  const hit = targets.get(a.href);
  return hit ? [hit[0], { project: hit[1] }] : null;
}

export function initAnalytics() {
  const q = new URLSearchParams(location.search);
  const fresh = (q.get("ref") || q.get("utm_source") || "").trim().toLowerCase().slice(0, 40);
  let saved = "";
  try {
    saved = sessionStorage.getItem(REF_KEY) ?? "";
  } catch {
    // Private windows can refuse storage; the ref then lasts until the next full reload.
  }
  if (/^[\w.-]+$/.test(fresh)) {
    ref = fresh;
    if (fresh !== saved) {
      try {
        sessionStorage.setItem(REF_KEY, fresh);
      } catch {
        // As above.
      }
      track("Arrived from link");
    }
  } else ref = saved;

  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const hit = a && linkEvent(a);
      if (hit) track(...hit);
    },
    { capture: true },
  );
}
