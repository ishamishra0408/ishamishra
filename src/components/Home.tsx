import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { education, profile, roles } from "../data/profile";
import { projects, type Project } from "../data/projects";
import { designs } from "../data/designs";
import { paths } from "../router";
import { useUI } from "../ui";
import { Link } from "./Link";
import { TechChips } from "./TechChips";
import { QuizSheet } from "./Thinking";

export const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
] as const;

const HUES = [0, -14, 12, -26, 6]; // small shifts so the cards read as a set, all blue-teal
const COUNT = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** The small curved arrow deccan.ai-style buttons carry. */
export function Arrow() {
  return (
    <svg className="arrow" width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M2 10c0-4 2.5-6.5 7-6.5M6.5 1.5 9 3.5 6.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Read after a link's text by screen readers, since the arrow icon is decorative. */
export function NewTab() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

/** Six-spoke asterisk used to mark list items. */
export function Star() {
  return (
    <svg className="star" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1.5v13M2.4 4.75l11.2 6.5M2.4 11.25l11.2-6.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/** A tile that leans toward the pointer and catches a warm light where it points. `lean`
 *  scales the tilt (wide tiles lean less). Mouse and trackpad only; touch and reduced motion
 *  get a still tile. */
function Tile({
  as: Tag = "li",
  lean = 1,
  className,
  style,
  children,
}: {
  as?: "li" | "div";
  lean?: number;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const x = (last.clientX - r.left) / r.width;
      const y = (last.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${((0.5 - y) * 8 * lean).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * 10 * lean).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      el.classList.add("is-tilted");
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      cancelAnimationFrame(raf);
      raf = 0;
      el.classList.remove("is-tilted");
      for (const p of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(p);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [lean]);
  return (
    <Tag ref={ref as React.RefObject<never>} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** The deployment (when there is one) and the code. */
function ProjectLinks({ p }: { p: Project }) {
  return (
    <p className="links">
      {p.live && (
        <a href={p.live.url} target="_blank" rel="noreferrer">
          {p.live.label}
          {p.live.note ? ` (${p.live.note})` : ""} <Arrow />
          <NewTab />
        </a>
      )}
      <a href={p.repo} target="_blank" rel="noreferrer">
        Code <Arrow />
        <NewTab />
      </a>
    </p>
  );
}

// Laid out like deccan.ai: a full-screen hero on the binary field and a strip of employer logos,
// then the work itself (every role's impact at a glance), then the projects in Isha's order.
export function Home() {
  const ui = useUI();
  const [quiz, setQuiz] = useState(false);

  return (
    <>
      <section className="hero" aria-labelledby="hero-h">
        <div className="frame hero-copy">
          <p className="pill">
            {profile.name} · {profile.title}
          </p>
          <h1 className="hero-title" id="hero-h">
            <span className="sr-only">{profile.name}: </span>I build AI agents you can <em>trust</em>
          </h1>
          <p className="hero-sub">
            5 years of backend work at Oracle, WNS and two startups. Now, in San Francisco, I build AI agents with checks
            that stop mistakes before they reach people.
          </p>
          <div className="hero-status">
            <p className="status-open">
              <span className="status-dot" aria-hidden />
              <span>
                Open to {profile.seeking.role} roles <span className="status-where">· {profile.seeking.where}</span>
              </span>
            </p>
            <p className="status-now">
              Now: {profile.now.role}, {profile.now.org}
            </p>
          </div>
          <div className="actions">
            <button className="btn-w" data-booking onClick={() => ui.openBooking()}>
              Book a call <Arrow />
            </button>
            <Link className="btn-g" to={paths.resume}>
              Résumé
            </Link>
          </div>
        </div>
        <div className="names">
          <p className="frame label" id="worked-h">
            Where I've worked
          </p>
          <div className="marquee" role="list" aria-labelledby="worked-h">
            {/* Four logos don't fill a wide screen, so each track repeats them; only the first set is announced. */}
            {[0, 1].map((track) => (
              <div className="marquee-track" key={track} aria-hidden={track === 1 || undefined}>
                {[0, 1, 2].map((rep) =>
                  roles.map((r) => (
                    <span
                      className="logo"
                      key={`${rep}-${r.id}`}
                      role={track === 0 && rep === 0 ? "listitem" : undefined}
                      aria-hidden={track === 0 && rep === 0 ? undefined : true}
                    >
                      <img src={r.logo.src} alt={r.logo.withName ? "" : r.company} width={r.logo.width} height={r.logo.height} />
                      {r.logo.withName && <span>{r.company}</span>}
                    </span>
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ground">
        <section className="sec frame" id="experience" aria-labelledby="xp-h">
          <div className="sec-head reveal">
            <h2 id="xp-h">
              Work experience
              <span>5 years of backend engineering, from Oracle to startups.</span>
            </h2>
            <Link className="btn-g" to={paths.resume}>
              Full résumé <Arrow />
            </Link>
          </div>
          <p className="now">
            <span className="label">Now</span>
            <span>
              {profile.now.role}, {profile.now.org}
            </span>
          </p>
          <ul className="roles">
            {roles.map((r, i) => (
              <Tile className="role tile-in" style={{ "--i": i } as CSSProperties} key={r.id}>
                <span className="logo role-logo" aria-hidden>
                  <img src={r.logo.src} alt="" width={r.logo.width} height={r.logo.height} />
                  {r.logo.withName && <span>{r.company}</span>}
                </span>
                <h3>
                  <span className="sr-only">{r.company}: </span>
                  {r.role}
                </h3>
                <p className="muted small">
                  {r.start} – {r.end} · {r.place}
                </p>
                <p className="muted small role-ctx">{r.context}</p>
                <ul className="impact">
                  {r.wins.map((w) => (
                    <li key={w.label}>
                      <b>{w.metric}</b>
                      <span className="muted">{w.label}</span>
                    </li>
                  ))}
                </ul>
              </Tile>
            ))}
          </ul>
          <Tile as="div" lean={0.2} className="role edu tile-in">
            <h3 className="label">Education</h3>
            <ul className="edu-list">
              {education.map((e) => (
                <li key={e.school}>
                  <h4 className="edu-school">{e.school.split(",")[0]}</h4>
                  <p className="muted small">
                    {e.degree} · {e.years.replace(/\s*–\s*(\d\d)/, "–")}
                  </p>
                  <p className="small edu-gpa">
                    GPA <b>{e.note.match(/[\d.]+/)?.[0]}</b>
                    <span className="muted"> / 4</span>
                  </p>
                </li>
              ))}
            </ul>
          </Tile>
        </section>

        <section className="sec frame reveal" id="projects" aria-labelledby="pj-h">
          <div className="sec-head">
            <h2 id="pj-h">
              Projects I've built
              <span>Agents with guardrails, shipped and measured.</span>
            </h2>
            <a className="btn-w" href={profile.links.github} target="_blank" rel="noreferrer">
              All on GitHub <Arrow />
              <NewTab />
            </a>
          </div>
          <ul className="cards">
            {projects.map((p, i) => (
              <li className="card" key={p.slug}>
                <Link className="card-art" to={paths.project(p.slug)} style={{ "--hue": `${HUES[i % HUES.length]}deg` } as CSSProperties} tabIndex={-1} aria-hidden>
                  <span className="art-stat">
                    <b>{p.results[0].value}</b>
                    <small>{p.results[0].label}</small>
                  </span>
                </Link>
                <h3>
                  <Link to={paths.project(p.slug)}>{p.name}</Link>
                </h3>
                <p className="muted">
                  {p.tagline}
                  {p.coBuilders?.length ? ` With ${p.coBuilders.join(", ")}.` : ""}
                </p>
                <TechChips stack={p.stack} small />
                <ProjectLinks p={p} />
              </li>
            ))}
          </ul>
        </section>

        {/* The close: two tiles side by side, in the same style as the work tiles. */}
        <section className="sec frame closing" id="contact" aria-label="How I think, and how to reach me">
          <Tile as="div" lean={0.4} className="role close-tile tile-in" style={{ "--i": 0 } as CSSProperties}>
            <p className="label">Engineering Blog</p>
            <h2 id="th-h">How the projects are built</h2>
            <p className="muted">
              System designs in Hello Interview's format: requirements, the design, and the calls behind it.{" "}
              {COUNT[designs.length] ?? designs.length} so far.
            </p>
            <div className="actions">
              <Link className="btn-w" to={paths.blog}>
                Read the blog <Arrow />
              </Link>
              <button className="btn-g" onClick={() => setQuiz(true)}>
                Take the quiz
              </button>
            </div>
          </Tile>
          <Tile as="div" lean={0.4} className="role close-tile tile-in" style={{ "--i": 1 } as CSSProperties}>
            <p className="label">Contact</p>
            <h2 id="ct-h">Let's talk</h2>
            <p className="muted">Hiring for AI systems, or building one? Email is quickest.</p>
            <div className="actions">
              <a className="btn-w" href={`mailto:${profile.email}`}>
                Email me <Arrow />
              </a>
              <button className="btn-g" data-booking onClick={() => ui.openBooking()}>
                Book a call
              </button>
            </div>
            <a className="close-email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </Tile>
        </section>
      </div>
      {quiz && <QuizSheet onClose={() => setQuiz(false)} />}
    </>
  );
}
