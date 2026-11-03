import { visitRef } from "./analytics";

// The site's public address, set at build time from the host (see vite.config.ts). Every absolute
// URL (canonical links, preview images, structured data, sitemap) is built from it.
declare const __SITE_URL__: string;
export const SITE_URL: string = __SITE_URL__;

// Booking page embedded in the "Book a call" sheet: Isha's Calendly intro call.
// VITE_BOOKING_URL (in .env, or the host's environment variables) overrides it.
export const BOOKING_URL: string =
  (import.meta.env.VITE_BOOKING_URL as string | undefined)?.trim() || "https://calendly.com/ishamishra0408/intro-call-isha";

// Optional meeting types, shown as buttons above the calendar; each `slug` is appended to
// BOOKING_URL (e.g. a Cal.com profile + "15min"). Empty because the link above is already
// one specific meeting.
export const MEETINGS: { id: string; slug: string; minutes: number; title: string }[] = [];

export function bookingUrl(slug?: string | null): string {
  if (!BOOKING_URL) return "";
  const m = slug ? MEETINGS.find((x) => x.slug === slug) : undefined;
  return m ? `${BOOKING_URL.replace(/\/+$/, "")}/${m.slug}` : BOOKING_URL;
}

/** The same page set up for embedding. Calendly's inline mode takes the host page and,
 *  on paid plans, colours (ignored otherwise); other providers get the link as is. */
export function embedUrl(url: string): string {
  if (!/^https:\/\/calendly\.com\//.test(url) || typeof location === "undefined") return url;
  const u = new URL(url);
  u.searchParams.set("embed_domain", location.host);
  u.searchParams.set("embed_type", "Inline");
  u.searchParams.set("background_color", "0b1c29");
  u.searchParams.set("text_color", "eef3f6");
  u.searchParams.set("primary_color", "5cc8f0");
  // A visit from an application link (?ref=stripe) shows on the booking in Calendly as its UTM source.
  if (visitRef()) u.searchParams.set("utm_source", visitRef());
  return u.toString();
}

export const RESUME_PDF = "/isha-mishra-resume.pdf";

// Umami website ID for visit stats, read from VITE_UMAMI_ID at build time (see vite.config.ts and
// src/analytics.ts). Empty means no tracking.
declare const __UMAMI_ID__: string;
export const UMAMI_ID: string = __UMAMI_ID__;
