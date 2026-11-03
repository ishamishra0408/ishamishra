import { RESUME_PDF } from "../config";
import { education, profile, roles, skills } from "../data/profile";
import { projects } from "../data/projects";
import { Link } from "./Link";

// A printable résumé built from the same data as the site. Deliberately has no phone number.
export function ResumePage() {
  const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "");

  return (
    <article className="ground page">
      <div className="frame narrow">
      <div className="resume-bar no-print">
        <Link className="ln" to="/">
          Home
        </Link>
        <div className="resume-actions">
          <a className="btn-w btn-sm" href={RESUME_PDF} download>
            Download PDF
          </a>
          <button className="btn-g btn-sm" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <div className="resume">
        <header className="r-head">
          <h1>{profile.name}</h1>
          <p className="r-title">
            {profile.title}, {profile.location}
          </p>
          <p className="r-contact">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.links.linkedin}>{host(profile.links.linkedin)}</a>
            <a href={profile.links.github}>{host(profile.links.github)}</a>
          </p>
          <p className="r-note">
            Now: {profile.now.role}, {profile.now.org}. Open to {profile.seeking.role} roles, {profile.seeking.where}. {profile.workAuth}.
          </p>
        </header>

        <section>
          <h2>Summary</h2>
          <p>{profile.summary}</p>
        </section>

        <section>
          <h2>Experience</h2>
          {roles.map((r) => (
            <div className="r-role" key={r.id}>
              <div className="r-row">
                <h3>
                  {r.role}, {r.companyFull}, {r.place}
                </h3>
                <span className="r-dates">
                  {r.start} – {r.end}
                </span>
              </div>
              <p className="r-context">{r.context}</p>
              <ul>
                {r.resume.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2>Selected projects</h2>
          <ul>
            {projects.map((p) => (
              <li key={p.slug}>
                <b>{p.name}</b>
                {p.coBuilders?.length ? ` (with ${p.coBuilders.join(", ")})` : ""}: {p.summary}{" "}
                <a className="r-link" href={p.repo}>
                  {host(p.repo)}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Skills</h2>
          {Object.entries(skills).map(([g, list]) => (
            <p key={g} className="r-skill">
              <b>{g}:</b> {list.join(", ")}
            </p>
          ))}
        </section>

        <section>
          <h2>Education</h2>
          {education.map((e) => (
            <div className="r-row" key={e.school}>
              <span>
                <b>{e.degree}</b>, {e.school}, {e.note}
              </span>
              <span className="r-dates">{e.years}</span>
            </div>
          ))}
        </section>
      </div>
      </div>
    </article>
  );
}
