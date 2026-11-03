import { useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../data/profile";
import { projects } from "../data/projects";
import { paths } from "../router";
import { copyText, useUI } from "../ui";
import { Modal } from "./Modal";
import { SECTIONS } from "./Home";

type Cmd = { id: string; label: string; group: string; run: () => void; keywords?: string };

export function CommandPalette() {
  const ui = useUI();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const cmds = useMemo<Cmd[]>(
    () => [
      { id: "book", label: "Book a call", group: "Action", run: () => ui.openBooking(), keywords: "calendar meet schedule" },
      { id: "email", label: "Copy email", group: "Action", run: async () => ui.toast((await copyText(profile.email)) ? "Email copied" : profile.email) },
      ...SECTIONS.map((s) => ({ id: `go-${s.id}`, label: s.label, group: "Section", run: () => ui.goTo(s.id) })),
      { id: "resume", label: "Résumé", group: "Page", run: () => ui.navigate(paths.resume), keywords: "cv resume pdf" },
      { id: "writing", label: "Six calls I make when building AI agents", group: "Writing", run: () => ui.navigate(paths.writing), keywords: "views principles how i think post" },
      { id: "d1", label: "Leak a key through Slack", group: "Demo", run: () => ui.navigate(`${paths.project("noleak-mcp")}#demo`), keywords: "security mcp" },
      { id: "d3", label: "Approve a driver", group: "Demo", run: () => ui.navigate(`${paths.project("agent-kyc")}#demo`), keywords: "policy rego" },
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        label: p.name,
        group: "Project",
        run: () => ui.navigate(paths.project(p.slug)),
        keywords: `${p.tagline} ${p.stack.join(" ")}`,
      })),
      { id: "gh", label: "GitHub", group: "Link", run: () => window.open(profile.links.github, "_blank", "noopener") },
      { id: "li", label: "LinkedIn", group: "Link", run: () => window.open(profile.links.linkedin, "_blank", "noopener") },
    ],
    [ui],
  );

  const results = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return cmds;
    return cmds.filter((c) => {
      const hay = `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [q, cmds]);

  useEffect(() => {
    if (ui.paletteOpen) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [ui.paletteOpen]);
  useEffect(() => setActive(0), [q]);

  if (!ui.paletteOpen) return null;

  const exec = (c: Cmd) => {
    ui.setPaletteOpen(false);
    setTimeout(c.run, 10);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      exec(results[active]);
    }
  };

  return (
    <Modal label="Search" onClose={() => ui.setPaletteOpen(false)} className="palette" sheet={false} zIndex={71}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search projects, demos, sections"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
        />
        <ul id="palette-list" role="listbox">
          {results.length === 0 && (
            <li className="faint" style={{ padding: 14 }}>
              No results
            </li>
          )}
          {results.map((c, i) => (
            <li key={c.id} role="option" id={`cmd-${c.id}`} aria-selected={i === active}>
              <button data-active={i === active} onMouseEnter={() => setActive(i)} onClick={() => exec(c)}>
                {c.label}
                <span className="group">{c.group}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="palette-foot">
          <span>
            <span className="kbd">↑↓</span> move
          </span>
          <span>
            <span className="kbd">↵</span> open
          </span>
          <span>
            <span className="kbd">esc</span> close
          </span>
        </div>
    </Modal>
  );
}
