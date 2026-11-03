import { Link } from "./Link";

export function NotFound() {
  return (
    <article className="ground page">
      <div className="frame narrow">
        <p className="pill">404</p>
        <h1 className="pj-title">
          Page not found<span>The link may be old or mistyped.</span>
        </h1>
        <div className="actions">
          <Link className="btn-w" to="/">
            Go home
          </Link>
          <Link className="btn-g" to="/#projects">
            See the work
          </Link>
        </div>
      </div>
    </article>
  );
}
