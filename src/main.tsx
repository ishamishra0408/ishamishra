import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { initAnalytics } from "./analytics";
import App from "./App";
import { normalize } from "./router";
import "./styles.css";

initAnalytics();

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App path={location.pathname} />
  </StrictMode>
);

// Pre-rendered pages hydrate the HTML they shipped with. The 404 fallback (served for unknown
// paths) and the dev server render fresh instead.
if (root.dataset.ssrPath && normalize(root.dataset.ssrPath) === normalize(location.pathname)) hydrateRoot(root, app);
else createRoot(root).render(app);
