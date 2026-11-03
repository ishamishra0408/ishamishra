import { designs } from "../data/designs";
import { projects } from "../data/projects";
import { POST } from "../data/views";
import { paths } from "../router";
import { Arrow } from "./Home";
import { Link } from "./Link";

// The Engineering Blog: each project's system design, then the essay on the calls behind them.
export function BlogPage() {
  const posts = [
    ...designs.map((d) => {
      const p = projects.find((x) => x.slug === d.slug)!;
      return {
        key: d.slug,
        to: paths.design(d.slug),
        kind: "System design",
        title: `${p.name}: how it's built`,
        text: d.intro,
        meta: [p.coBuilders?.length ? `With ${p.coBuilders.join(", ")}` : "", p.year].filter(Boolean).join(" · "),
      };
    }),
    { key: "calls", to: paths.writing, kind: "Essay", title: POST.title, text: POST.description, meta: POST.dateLabel },
  ];

  return (
    <article className="ground page">
      <div className="frame narrow">
        <header className="pj-head">
          <h1 className="pj-title">
            Engineering Blog
            <span>How the projects are built: requirements, design and the calls behind them, in Hello Interview's format.</span>
          </h1>
        </header>
        <ul className="blog-list">
          {posts.map((x) => (
            <li key={x.key}>
              <Link className="blog-post" to={x.to}>
                <span className="label">{x.kind}</span>
                <span className="blog-title">
                  {x.title} <Arrow />
                </span>
                <span className="blog-text">{x.text}</span>
                {x.meta && <span className="muted small">{x.meta}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
