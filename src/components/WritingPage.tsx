import { useState } from "react";
import { projects } from "../data/projects";
import { POST, views } from "../data/views";
import { paths } from "../router";
import { useUI } from "../ui";
import { Arrow, Star } from "./Home";
import { Link } from "./Link";
import { QuizSheet } from "./Thinking";

// The calls behind the projects, written out as one post. Each call links to where it shows up.
export function WritingPage() {
  const { navigate } = useUI();
  const [quiz, setQuiz] = useState(false);
  const noStop = (s: string) => s.replace(/\.$/, "");

  const back = () => {
    if ((history.state as { internal?: boolean } | null)?.internal) history.back();
    else navigate(paths.blog);
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
            <span className="pill">Engineering Blogs</span>
            <time dateTime={POST.date}>{POST.dateLabel}</time>
          </p>
          <h1 className="pj-title">
            {POST.title}
            <span>{POST.description}</span>
          </h1>
        </header>

        <ol className="calls">
          {views.map((v) => {
            const p = v.seen && projects.find((x) => x.slug === v.seen!.slug);
            return (
              <li className="call" key={v.id}>
                <Star />
                <h2>{noStop(v.title)}</h2>
                <p className="call-body">{v.body}</p>
                <p className="call-example">
                  <span className="label">For example</span>
                  {v.scenario.prompt} {v.scenario.reveal}
                </p>
                {p && (
                  <p className="call-seen">
                    <span className="label">In practice</span>
                    <Link to={paths.project(p.slug)}>{p.name}</Link>: {v.seen!.note}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="role close-tile post-end">
          <h2>Would you make the same calls?</h2>
          <p className="muted">Six quick scenarios. Pick a call, then see mine and why.</p>
          <div className="actions">
            <button className="btn-w" onClick={() => setQuiz(true)}>
              Take the quiz <Arrow />
            </button>
            <Link className="btn-g" to={paths.section("projects")}>
              See the projects
            </Link>
          </div>
        </div>
      </div>
      {quiz && <QuizSheet onClose={() => setQuiz(false)} />}
    </article>
  );
}
