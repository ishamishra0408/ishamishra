import { useEffect, useMemo, useState } from "react";
import { track } from "../analytics";
import { MEETINGS, bookingUrl, embedUrl } from "../config";
import { profile } from "../data/profile";
import { useUI } from "../ui";
import { Modal } from "./Modal";

// The "Book a call" sheet. It mounts (hidden) as soon as a visitor points at, focuses or touches a
// "Book a call" button, so the calendar is usually loaded by the time they click, and it stays
// mounted after closing so reopening is instant. Until the calendar has drawn itself, a dark
// placeholder shows instead of the embed's white page.
export function BookingSheet() {
  const ui = useUI();
  const [ready, setReady] = useState(false);
  const warm = ui.bookingWarm || ui.bookingOpen;
  const src = bookingUrl(ui.bookingSlug);
  const frameSrc = useMemo(() => (warm ? embedUrl(src) : ""), [warm, src]);

  // Calendly's embed posts "calendly.*" messages once its page is up, and one more when a call is booked.
  useEffect(() => {
    if (!warm) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com" || typeof e.data?.event !== "string" || !e.data.event.startsWith("calendly.")) return;
      setReady(true);
      if (e.data.event === "calendly.event_scheduled") track("Call booked");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [warm]);
  useEffect(() => setReady(false), [frameSrc]);

  if (!warm) return null;

  const subject = encodeURIComponent("Let's talk");
  const body = encodeURIComponent("Hi Isha,\n\nI'd like to chat about …\n\nTimes that work for me (with time zone):\n- \n- \n");

  return (
    <Modal label="Book a call" open={ui.bookingOpen} onClose={() => ui.setBookingOpen(false)} className="sheet">
      <button className="sheet-close btn btn-quiet" onClick={() => ui.setBookingOpen(false)}>
        Close
      </button>
      <h2 className="sheet-title">Book a call</h2>
      {MEETINGS.length > 0 && (
        <div className="end-row">
          {MEETINGS.map((m) => (
            <button
              key={m.id}
              className={`btn ${ui.bookingSlug === m.slug ? "btn-accent" : "btn-quiet"}`}
              onClick={() => ui.openBooking(m.slug)}
            >
              {m.minutes} min, {m.title.toLowerCase()}
            </button>
          ))}
        </div>
      )}
      <div className={`booking ${ready ? "is-ready" : ""}`}>
        <div className="booking-wait" aria-hidden={ready}>
          <span className="spinner" />
          Loading calendar…
        </div>
        {/* aria-label rather than title: a title shows as a tooltip over the calendar. Providers
            that post no messages are shown shortly after their page loads. */}
        <iframe
          className="booking-frame"
          src={frameSrc}
          aria-label="Booking calendar"
          onLoad={() => window.setTimeout(() => setReady(true), 1500)}
        />
      </div>
      <p className="muted small">
        Calendar not loading?{" "}
        <a href={src} target="_blank" rel="noreferrer">
          Open it in a new tab
        </a>{" "}
        or <a href={`mailto:${profile.email}?subject=${subject}&body=${body}`}>email me times</a>.
      </p>
    </Modal>
  );
}
