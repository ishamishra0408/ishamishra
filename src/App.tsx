import { Component, useEffect, useState, type ReactNode } from "react";
import { BinaryField } from "./components/BinaryField";
import { BlogPage } from "./components/BlogPage";
import { CommandPalette } from "./components/CommandPalette";
import { DesignPage } from "./components/DesignPage";
import { BookingSheet } from "./components/Contact";
import { Arrow, Home, NewTab, SECTIONS } from "./components/Home";
import { Link } from "./components/Link";
import { Modal } from "./components/Modal";
import { NotFound } from "./components/NotFound";
import { ProjectPage } from "./components/ProjectPage";
import { ResumePage } from "./components/ResumePage";
import { WritingPage } from "./components/WritingPage";
import { UMAMI_ID } from "./config";
import { profile } from "./data/profile";
import { paths } from "./router";
import { UIProvider, useUI } from "./ui";

/** Decoration only: if it ever fails, drop it and keep the page. */
class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Page() {
  const { route } = useUI();
  if (route.name === "project") return <ProjectPage key={route.slug} slug={route.slug} />;
  if (route.name === "design") return <DesignPage key={route.slug} slug={route.slug} />;
  if (route.name === "resume") return <ResumePage />;
  if (route.name === "writing") return <WritingPage />;
  if (route.name === "blog") return <BlogPage />;
  if (route.name === "notfound") return <NotFound />;
  return <Home />;
}

// Name, a few links, one white button. Clear over the hero; solid once the page scrolls.
// On phones the links move into a Menu sheet.
function Nav() {
  const ui = useUI();
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setSolid(ui.route.name !== "home" || window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [ui.route.name]);

  return (
    <header className={`nav no-print ${solid ? "is-solid" : ""}`}>
      <div className="frame nav-row">
        <Link className="wordmark" to={paths.home}>
          {profile.name}
        </Link>
        <nav className="nav-links" aria-label="Sections">
          {SECTIONS.map((s) => (
            <Link key={s.id} to={paths.section(s.id)}>
              {s.label}
            </Link>
          ))}
          <Link to={paths.blog}>Engineering Blog</Link>
          <Link to={paths.resume}>Résumé</Link>
        </nav>
        <div className="nav-actions">
          <button className="btn-g btn-sm nav-menu" onClick={() => setMenu(true)} aria-haspopup="dialog">
            Menu
          </button>
          <button className="btn-w btn-sm" data-booking onClick={() => ui.openBooking()}>
            Book a call <Arrow />
          </button>
        </div>
      </div>
      {menu && (
        <Modal label="Menu" onClose={() => setMenu(false)} className="sheet menu-sheet">
          <button className="sheet-close btn btn-quiet" onClick={() => setMenu(false)} autoFocus>
            Close
          </button>
          <nav className="menu-links" aria-label="Sections">
            {SECTIONS.map((s) => (
              <Link key={s.id} to={paths.section(s.id)} onClick={() => setMenu(false)}>
                {s.label}
              </Link>
            ))}
            <Link to={paths.blog} onClick={() => setMenu(false)}>
              Engineering Blog
            </Link>
            <Link to={paths.resume} onClick={() => setMenu(false)}>
              Résumé
            </Link>
          </nav>
        </Modal>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="foot no-print">
      <div className="frame foot-row">
        <div className="foot-id">
          <span className="foot-name">{profile.name}</span>
          <span suppressHydrationWarning>
            {profile.workAuth} · © {new Date().getFullYear()}
          </span>
          {UMAMI_ID && <span>Visit stats are anonymous and cookie-free.</span>}
        </div>
        <nav className="foot-links" aria-label="Elsewhere">
          <a href={`mailto:${profile.email}`}>Email</a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <NewTab />
          </a>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
            <NewTab />
          </a>
          <Link to={paths.resume}>Résumé</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function App({ path }: { path: string }) {
  return (
    <UIProvider initialPath={path}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Optional>
        <BinaryField />
      </Optional>
      <Nav />
      <main id="main">
        <Page />
      </main>
      <Footer />
      <BookingSheet />
      <CommandPalette />
    </UIProvider>
  );
}
