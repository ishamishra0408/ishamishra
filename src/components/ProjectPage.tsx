import { KycDemo } from "../demos/KycDemo";
import { NoLeakDemo } from "../demos/NoLeakDemo";
import { designFor } from "../data/designs";
import { projects } from "../data/projects";
import { TechChips } from "./TechChips";
import { paths } from "../router";
import { useUI } from "../ui";
import { Arrow, NewTab, Star } from "./Home";
import { Link } from "./Link";

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

// One URL per project: what it solves, the live web page, the numbers, a picture, the demo.
export function ProjectPage({ slug }: { slug: string }) {
  const { openBooking, navigate } = useUI();
  const i = projects.findIndex((x) => x.slug === slug);
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  // Back returns to the exact spot on the previous page when we came from inside the site;
  // from a shared link it goes to the projects on the home page.
  const back = () => {
    if ((history.state as { internal?: boolean } | null)?.internal) history.back();
    else navigate("/#projects");
  };

  const screen = (
    <>
      <span className="browser-bar">
        <span className="browser-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="browser-url">{p.live ? host(p.live.url) : "localhost"}</span>
        <span className="browser-open">
          {p.live ? (
            <>
              Open live site <Arrow />
            </>
          ) : (
            "Runs locally, not deployed yet"
          )}
        </span>
      </span>
      <img src={p.screen.src} alt={p.screen.alt} width={p.screen.width} height={p.screen.height} loading="lazy" decoding="async" />
    </>
  );

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
            <span className="pill">{p.hackathon?.event ? `Hackathon · ${p.hackathon.event}` : p.hackathon ? "Hackathon build" : "Personal project"}</span>
            {p.coBuilders?.length ? <span>With {p.coBuilders.join(", ")}</span> : null}
            <span>{p.year}</span>
          </p>
          <h1 className="pj-title">
            {p.name}
            <span>{p.tagline}</span>
          </h1>
          <div className="stack">
            <p className="label">Built with</p>
            <TechChips stack={p.stack} />
          </div>
          <div className="actions">
            {/* A live link visitors can't fully use (invite only) steps back; the code leads. */}
            {p.live && !p.live.note && (
              <a className="btn-w" href={p.live.url} target="_blank" rel="noreferrer">
                {p.live.label} <Arrow />
                <NewTab />
              </a>
            )}
            <a className={p.live && !p.live.note ? "btn-g" : "btn-w"} href={p.repo} target="_blank" rel="noreferrer">
              Code <Arrow />
              <NewTab />
            </a>
            {p.live?.note && (
              <a className="btn-g" href={p.live.url} target="_blank" rel="noreferrer">
                {p.live.label} ({p.live.note}) <Arrow />
                <NewTab />
              </a>
            )}
            <button className="btn-g" data-booking onClick={() => openBooking()}>
              Ask me about it
            </button>
          </div>
          {p.live && host(p.live.url).endsWith("onrender.com") && (
            <p className="muted small wake">Hosted on a free plan: after a quiet spell, the first visit can take about 30 seconds to wake up.</p>
          )}
        </header>

        <section className="solves" aria-label="What it solves">
          <div className="solves-problem">
            <h2 className="label">The problem</h2>
            <p>{p.problem}</p>
          </div>
          <div className="solves-answer">
            <h2 className="label">What it does</h2>
            <p>{p.summary}</p>
          </div>
        </section>

        <figure className="browser">
          {p.live ? (
            <a href={p.live.url} target="_blank" rel="noreferrer" aria-label={`Open the live site, ${host(p.live.url)} (opens in a new tab)`}>
              {screen}
            </a>
          ) : (
            <div>{screen}</div>
          )}
          {p.screen.caption && <figcaption className="muted small">{p.screen.caption}</figcaption>}
        </figure>

        <h2 className="sr-only">Results</h2>

        <ul className="feats pj-results">
          {p.results.map((r) => (
            <li key={r.label}>
              <Star />
              <b>{r.value}</b>
              <p className="muted">{r.label}</p>
            </li>
          ))}
        </ul>
        {p.caveat && <p className="muted small pj-caveat">Caveat: {p.caveat}</p>}

        {designFor(p.slug) && (
          <Link className="pj-design" to={paths.design(p.slug)}>
            <span className="label">System design</span>
            <span className="pj-design-name">
              How it's built <Arrow />
            </span>
            <span className="muted small">Requirements, core entities, API, high-level design and the trade-offs</span>
          </Link>
        )}

        {p.image && (
          <figure className="pj-shot">
            <img
              src={p.image.src}
              alt={p.image.alt}
              loading="lazy"
              decoding="async"
              onError={(e) => ((e.currentTarget.parentElement as HTMLElement).hidden = true)}
            />
            <figcaption className="muted small">{p.image.alt}</figcaption>
          </figure>
        )}

        {p.demo && (
          <section className="pj-demo" id="demo" aria-labelledby="demo-h">
            <h2 className="label" id="demo-h">
              Try it here
            </h2>
            {p.demo === "noleak" && <NoLeakDemo />}
            {p.demo === "kyc" && <KycDemo />}
          </section>
        )}

        <Link className="pj-next" to={paths.project(next.slug)}>
          <span className="label">Next project</span>
          <span className="pj-next-name">
            {next.name} <Arrow />
          </span>
        </Link>
      </div>
    </article>
  );
}
