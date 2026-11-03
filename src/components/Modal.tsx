import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

let openCount = 0;

/** Freezes page scrolling while a sheet is open. */
function lockScroll(locked: boolean) {
  document.body.style.overflow = locked ? "hidden" : "";
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

/**
 * A modal layer: scrim, focus trapped inside, focus returned on close, and (for sheets)
 * a grabber you can drag down to dismiss, as on iOS.
 *
 * Pass `open` to keep the layer mounted while closed (hidden, out of reach of clicks and
 * focus), so what's inside, like the booking calendar's iframe, stays loaded between openings.
 */
export function Modal({
  label,
  onClose,
  className,
  sheet = true,
  zIndex,
  open = true,
  children,
}: {
  label: string;
  onClose: () => void;
  className: string;
  sheet?: boolean;
  zIndex?: number;
  open?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // Captured during the render that opens the layer, before any autoFocus inside moves focus.
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  if (open && !wasOpen.current) opener.current = document.activeElement as HTMLElement | null;
  wasOpen.current = open;

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>("[autofocus], input") ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    openCount++;
    lockScroll(true);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) lockScroll(false);
      const back = opener.current;
      if (back && back.isConnected) back.focus({ preventScroll: true });
    };
  }, [open]);

  // A sheet dragged away is put back in place once hidden, ready for next time.
  useEffect(() => {
    if (!open && ref.current) {
      ref.current.style.transition = "none";
      ref.current.style.translate = "0 0";
    }
  }, [open]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    ref.current.style.transition = "none";
    ref.current.style.translate = `0 ${drag.current.dy}px`;
  };
  const onUp = () => {
    if (!drag.current || !ref.current) return;
    const { dy } = drag.current;
    drag.current = null;
    ref.current.style.transition = "translate 0.35s cubic-bezier(0.32, 1.25, 0.5, 1)";
    if (dy > 110) onClose();
    else ref.current.style.translate = "0 0";
  };

  const hidden = open ? "" : " is-hidden";
  // Rendered at <body> level so sheets never inherit a section's colours.
  return createPortal(
    <>
      <div className={`scrim${hidden}`} style={zIndex ? { zIndex: zIndex - 1 } : undefined} onClick={onClose} />
      <div ref={ref} className={`${className}${hidden}`} style={zIndex ? { zIndex } : undefined} role="dialog" aria-modal="true" aria-label={label}>
        {sheet && (
          <div className="grabber-zone" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden>
            <div className="grabber" />
          </div>
        )}
        {children}
      </div>
    </>,
    document.body,
  );
}
