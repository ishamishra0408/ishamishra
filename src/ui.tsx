import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { track } from "./analytics";
import { normalize, parse, type Route } from "./router";
import { routeMeta } from "./seo";

const isBrowser = typeof window !== "undefined";
const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

type UI = {
  route: Route;
  path: string;
  navigate: (to: string) => void;
  goTo: (sectionId: string) => void;
  bookingOpen: boolean;
  /** True once a visitor has shown intent to book; the calendar starts loading then. */
  bookingWarm: boolean;
  setBookingOpen: (open: boolean) => void;
  bookingSlug: string | null;
  openBooking: (slug?: string) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  mounted: boolean;
  toast: (msg: string) => void;
};

const Ctx = createContext<UI | null>(null);

export function useUI() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI outside provider");
  return v;
}

// Native scrolling only: no scroll hijacking, and no smooth jumps for reduced-motion visitors.
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function applyScroll(t: { y?: number; hash?: string }) {
  if (typeof t.y === "number") window.scrollTo({ top: t.y, behavior: "instant" });
  else scrollToHash(t.hash ?? "", false);
}

function scrollToHash(hash: string, smooth: boolean) {
  const id = hash.replace(/^#/, "");
  const el = id ? document.getElementById(id) : null;
  if (el) el.scrollIntoView({ behavior: smooth && !reducedMotion() ? "smooth" : "instant", block: "start" });
  else window.scrollTo({ top: 0, behavior: "instant" });
}

export function UIProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(() => normalize(initialPath));
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingWarm, setBookingWarm] = useState(false);
  const [bookingSlug, setBookingSlug] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  // Where to scroll once the next page has rendered: a saved position (back/forward) or a #hash.
  const pendingScroll = useRef<{ y?: number; hash?: string } | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;
  const route = parse(path);

  useEffect(() => setMounted(true), []);

  // History: real URLs, back/forward, and scroll restored per entry.
  useEffect(() => {
    history.scrollRestoration = "manual";
    const onPop = (e: PopStateEvent) => {
      const next = normalize(location.pathname);
      const y = (e.state as { y?: number } | null)?.y;
      const target = { y: typeof y === "number" ? y : undefined, hash: location.hash };
      if (next === pathRef.current) applyScroll(target);
      else {
        pendingScroll.current = target;
        setPath(next);
      }
    };
    window.addEventListener("popstate", onPop);
    if (location.hash) scrollToHash(location.hash, false);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // After a route change renders: scroll where the link pointed, then keep the tab title in step.
  useIsoLayoutEffect(() => {
    if (pendingScroll.current) {
      applyScroll(pendingScroll.current);
      pendingScroll.current = null;
    }
  }, [path]);

  useEffect(() => {
    document.title = routeMeta(route).title;
    const robots = document.querySelector('meta[name="robots"]');
    if (route.name === "notfound" && !robots) {
      const m = document.createElement("meta");
      m.name = "robots";
      m.content = "noindex";
      document.head.appendChild(m);
    } else if (route.name !== "notfound") robots?.remove();
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useCallback(
    (to: string) => {
      const url = new URL(to, location.href);
      const next = normalize(url.pathname);
      setPaletteOpen(false);
      setBookingOpen(false);
      if (next === path) {
        if (url.hash) {
          history.pushState({}, "", url.pathname + url.hash);
          scrollToHash(url.hash, true);
        } else window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" });
        return;
      }
      history.replaceState({ ...(history.state || {}), y: window.scrollY }, "");
      history.pushState({ internal: true }, "", next + url.hash);
      pendingScroll.current = { hash: url.hash };
      setPath(next);
    },
    [path],
  );

  const goTo = useCallback((id: string) => navigate(`/#${id}`), [navigate]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const openBooking = useCallback((slug?: string) => {
    setPaletteOpen(false);
    setBookingSlug(slug ?? null);
    setBookingWarm(true); // keep the calendar loaded after this first opening
    setBookingOpen(true);
    track("Book a call opened");
  }, []);

  // Pointing at, focusing or touching any [data-booking] control starts loading the calendar,
  // so it's usually ready by the click. Nobody who never reaches for it downloads it.
  useEffect(() => {
    if (bookingWarm) return;
    const onIntent = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-booking]")) setBookingWarm(true);
    };
    const opts = { passive: true, capture: true };
    for (const t of ["pointerover", "focusin", "touchstart"]) document.addEventListener(t, onIntent, opts);
    return () => {
      for (const t of ["pointerover", "focusin", "touchstart"]) document.removeEventListener(t, onIntent, opts);
    };
  }, [bookingWarm]);

  // Cmd/Ctrl+K or "/" opens search; Escape closes whatever is on top.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setBookingOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider
      value={{
        route,
        path,
        navigate,
        goTo,
        bookingOpen,
        bookingWarm,
        setBookingOpen,
        bookingSlug,
        openBooking,
        paletteOpen,
        setPaletteOpen,
        mounted,
        toast,
      }}
    >
      {children}
      {toastMsg && (
        <div className="toast" role="status">
          {toastMsg}
        </div>
      )}
    </Ctx.Provider>
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
