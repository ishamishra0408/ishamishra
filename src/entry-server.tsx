// Build-time entry used by scripts/prerender.mjs to write static HTML for every page.
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { parse } from "./router";
import { headTags, llmsTxt, robotsTxt, routeMeta, sitemapXml } from "./seo";

export { allPaths } from "./router";
export { llmsTxt, robotsTxt, sitemapXml };

export function render(path: string): { html: string; head: string } {
  const html = renderToString(
    <StrictMode>
      <App path={path} />
    </StrictMode>,
  );
  return { html, head: headTags(routeMeta(parse(path))) };
}
