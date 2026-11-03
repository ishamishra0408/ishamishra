import { Fragment, type ReactNode } from "react";
import { designFor } from "../data/designs";
import { projects } from "../data/projects";
import { paths } from "../router";
import { useUI } from "../ui";
import { Arrow, NewTab } from "./Home";
import { Link } from "./Link";

const STEPS = [
  { id: "requirements", label: "Requirements" },
  { id: "entities", label: "Core entities" },
  { id: "api", label: "API" },
  { id: "design", label: "High-level design" },
  { id: "deep-dives", label: "Deep dives" },
];

// Tool and field names (complete_task, next_task) set as code inside plain sentences.
function prose(text: string): ReactNode {
  return text.split(/(\b[a-z]+(?:_[a-z]+)+\b)/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>));
}

function Heading({ n, id, children }: { n: number; id: string; children: ReactNode }) {
  return (
    <h2 id={`${id}-h`} className="ds-h">
      <span className="ds-n" aria-hidden>
        {n}
      </span>
      {children}
    </h2>
  );
}

// One project's system design, in Hello Interview's order: requirements, core entities, API,
// high-level design, deep dives.
export function DesignPage({ slug }: { slug: string }) {
  const { navigate, openBooking } = useUI();
  const p = projects.find((x) => x.slug === slug)!;
  const d = designFor(slug)!;
  const here = paths.design(slug);

  const back = () => {
    if ((history.state as { internal?: boolean } | null)?.internal) history.back();
    else navigate(paths.project(slug));
  };

  return (
    <article className="ground page">
      <div className="frame narrow">
        <button className="back" onClick={back}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M12 7H2.5M6.5 3 2.5 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Back
        </button>
        <header className="pj-head">
          <p className="pj-meta">
            <span className="pill">System design</span>
            {p.coBuilders?.length ? <span>With {p.coBuilders.join(", ")}</span> : null}
            <span>{p.year}</span>
          </p>
          <h1 className="pj-title">
            {p.name}: how it's built
            <span>{d.intro}</span>
          </h1>
          <nav className="ds-steps" aria-label="On this page">
            <ol>
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <Link to={`${here}#${s.id}`}>
                    <span aria-hidden>{i + 1}</span>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <section id="requirements" className="ds-section" aria-labelledby="requirements-h">
          <Heading n={1} id="requirements">
            Requirements
          </Heading>
          <div className="ds-cols">
            <div>
              <h3 className="label">Functional</h3>
              <ol className="ds-list">
                {d.functional.map((f) => (
                  <li key={f}>{prose(f)}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="label">Non-functional</h3>
              <ul className="ds-list">
                {d.nonFunctional.map((n) => (
                  <li key={n.name}>
                    <b>{n.name}.</b> {prose(n.text)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className="label ds-out-h">Out of scope</h3>
          <ul className="ds-list ds-out">
            {d.outOfScope.map((o) => (
              <li key={o}>{prose(o)}</li>
            ))}
          </ul>
        </section>

        <section id="entities" className="ds-section" aria-labelledby="entities-h">
          <Heading n={2} id="entities">
            Core entities
          </Heading>
          <dl className="ds-entities">
            {d.entities.map((e) => (
              <div key={e.name}>
                <dt>{e.name}</dt>
                <dd>{prose(e.text)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="api" className="ds-section" aria-labelledby="api-h">
          <Heading n={3} id="api">
            API
          </Heading>
          {d.api.map((a) => (
            <div className="ds-api" key={a.title}>
              <h3 className="label">{a.title}</h3>
              {a.endpoint && <p className="ds-endpoint">{a.endpoint}</p>}
              <ul className="ds-calls">
                {a.calls.map((c) => (
                  <li key={c.sig}>
                    <code>{c.sig}</code>
                    {c.does && <span>{c.does}</span>}
                  </li>
                ))}
              </ul>
              {a.note && <p className="muted small">{a.note}</p>}
            </div>
          ))}
        </section>

        <section id="design" className="ds-section" aria-labelledby="design-h">
          <Heading n={4} id="design">
            High-level design
          </Heading>
          <figure className="ds-diagram">
            {d.diagram.map((row, i) => (
              <div key={i} className={`ds-row${row.store ? " is-store" : ""}${row.side ? " has-side" : ""}`}>
                <div className="ds-boxes">
                  {row.boxes.map((b) => (
                    <span className="ds-box" key={b}>
                      {b}
                    </span>
                  ))}
                </div>
                {row.side && <span className="ds-side">{row.side}</span>}
              </div>
            ))}
            <figcaption className="muted small">{d.caption}</figcaption>
          </figure>
          <h3 className="label ds-walk-h">{d.walkthrough.title}</h3>
          <ol className="ds-list ds-walk">
            {d.walkthrough.steps.map((s) => (
              <li key={s}>{prose(s)}</li>
            ))}
          </ol>
        </section>

        <section id="deep-dives" className="ds-section" aria-labelledby="deep-dives-h">
          <Heading n={5} id="deep-dives">
            Deep dives
          </Heading>
          <ol className="ds-dives">
            {d.deepDives.map((x) => (
              <li className="ds-dive" key={x.q}>
                <h3>{x.q}</h3>
                <span className="ds-by">{d.decidedBy}'s call</span>
                {x.considered?.map((c) => (
                  <p className="ds-opt ds-considered" key={c}>
                    <span className="label">Considered</span>
                    {prose(c)}
                  </p>
                ))}
                <p className="ds-opt ds-chose">
                  <span className="label">Chose</span>
                  {prose(x.chose)}
                </p>
                <p className="ds-opt ds-trade">
                  <span className="label">Trade-off</span>
                  {prose(x.tradeoff)}
                </p>
              </li>
            ))}
          </ol>
          {d.next.length > 0 && (
            <div className="ds-next">
              <h3 className="label">If it grows</h3>
              <ul className="ds-list">
                {d.next.map((n) => (
                  <li key={n}>{prose(n)}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <p className="muted small ds-sources">
          From the repo:{" "}
          {d.sources.map((s, i) => (
            <Fragment key={s.url}>
              {i > 0 && " · "}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
                <NewTab />
              </a>
            </Fragment>
          ))}
        </p>

        <div className="role close-tile post-end">
          <h2>Questions about the design?</h2>
          <p className="muted">Happy to go deeper on any of these calls.</p>
          <div className="actions">
            <button className="btn-w" data-booking onClick={() => openBooking()}>
              Book a call <Arrow />
            </button>
            <Link className="btn-g" to={paths.project(slug)}>
              Back to {p.name}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
