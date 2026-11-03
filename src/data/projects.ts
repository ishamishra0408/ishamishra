// The five projects on the site, in the order Isha chose. Every result comes from that repo's own
// README; if a README changes, change it here. `year` is the year the repo was created on GitHub.
// Cards show `tagline` and the first result; the rest appears on each project's page.

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  problem: string;
  how: string[];
  results: { value: string; label: string }[];
  caveat?: string;
  stack: string[];
  repo: string;
  /** `note` qualifies a live link the visitor can't fully use (e.g. "invite only"); Code becomes the main button. */
  live?: { label: string; url: string; note?: string };
  demo?: "noleak" | "kyc";
  credit?: string;
  coBuilders?: string[];
  /** A real screenshot from the project's own repo, served from jsDelivr's GitHub CDN. */
  image?: { src: string; alt: string };
  /** Hackathon builds: the event (as named in the README, when it names one) and a few words on what's at the links. */
  hackathon?: { event?: string; there: string };
  /** A picture of the live web page (public/shots), shown in a browser frame that links to it.
   *  For a project with no deployment it shows the app running locally. */
  screen: { src: string; width: number; height: number; alt: string; caption?: string };
  year: string;
};

const gh = (r: string) => `https://github.com/ishamishra0408/${r}`;
const shot = (repoPath: string) => `https://cdn.jsdelivr.net/gh/ishamishra0408/${repoPath}`;

export const projects: Project[] = [
  {
    // Lives in Devansh's GitHub account; its README says "Built by Isha Mishra and Devansh Pathak".
    slug: "tira",
    name: "tira",
    tagline: "Agents say done. tira asks for the proof.",
    summary: "A multiplayer task board for AI agents and the people they work with: nothing is marked done without proof (a real commit or pull request, checked on GitHub), and every move is written once to a log nobody can rewrite.",
    problem: "Devansh runs a software factory where AI agents do the building. Tracking their work became a second job, and twice it went wrong: a quiet session was assumed stopped while it was still running, and work was marked done after skipping every check.",
    how: ["Every change is one event in a Postgres log that refuses edits", "The board is recomputed from the log on every request", "Done without proof is refused, and the refusal is logged", "Agents work the board through MCP"],
    results: [
      { value: "1,115 / 1,115", label: "planted bugs caught" },
      { value: "542", label: "tests pass on Postgres, 0 fail" },
      { value: "2 / 2", label: "replayed incidents refused" },
    ],
    stack: ["TypeScript", "Node.js", "Postgres", "MCP", "XState"],
    repo: "https://github.com/devpath56/tira",
    live: { label: "Live board", url: "https://tira-xags.onrender.com" },
    image: {
      src: "/shots/tira-graph.jpg",
      alt: "The same board as a graph: the task tree top-down, each task coloured by its state, and the parents tira closed marked with a bolt",
    },
    credit: "With Devansh Pathak",
    coBuilders: ["Devansh Pathak"],
    screen: {
      src: "/shots/tira.jpg",
      width: 1400,
      height: 972,
      alt: "A tira board as Kanban: an idea an agent filed waits for approval, a task in progress is marked Now, and finished parents carry tira's bolt",
      caption: "The board, after signing in with GitHub.",
    },
    year: "2026",
  },
  {
    slug: "debugassist",
    name: "DebugAssistAgent",
    tagline: "Bug report in, tested fix out.",
    summary: "Writes a failing test, finds the cause, fixes it, and guards the whole bug class. You approve before anything posts.",
    problem: "AI fixers stop at a patch that passes the reporter's example. Too narrow, and nobody learns why it shipped.",
    how: ["Reproduce with a failing test", "Fix, confirmed by a second blind test", "Explain the conditions that let it ship", "Wait for your OK"],
    results: [
      { value: "2 / 2", label: "bugs traced to the right lines" },
      { value: "$0.41", label: "one run (vercel/ai#22543)" },
      { value: "Off", label: "network during tests" },
    ],
    caveat: "Neither fix passed all of the maintainers' tests: right cause, fix too narrow.",
    stack: ["Python", "LangGraph", "Claude Opus", "MCP", "MongoDB", "E2B", "Docker"],
    repo: gh("DebugAssist"),
    image: { src: "/shots/debugassist-signin.jpg", alt: "The live sign-in page, with the five steps from a GitHub issue to a fix you approve" },
    live: { label: "Live app", url: "https://debugassistagent.onrender.com", note: "invite only" },
    screen: {
      src: "/shots/debugassist.jpg",
      width: 1400,
      height: 940,
      alt: "A DebugAssistAgent run on vercel/ai#22543: ten steps, waiting for approval",
      caption: "A run on vercel/ai#22543, after signing in. The live app is invite only.",
    },
    year: "2026",
  },
  {
    slug: "dogmaai",
    name: "DogMaAI",
    tagline: "How your dog copes when you're out.",
    summary: "A home-camera companion: how a dog felt alone, how long it cried, and whether calm music helped.",
    problem: "You can't see how your dog copes alone, or what helps.",
    how: ["Liquid AI describes the dog every 12 s", "Calm sounds through the camera speaker", "A weekly PetAnalytics view", "Private phone access via Tailscale"],
    results: [
      { value: "Every 12 s", label: "Liquid AI checks on the dog" },
      { value: "Any camera", label: "an RTSP home camera, or a paired phone" },
    ],
    caveat: "A hackathon demo, not a veterinary device.",
    hackathon: { there: "The camera app, runnable locally with a sample clip." },
    stack: ["TypeScript", "Liquid AI", "Tinybird", "Tailscale"],
    repo: gh("DogMaAI"),
    screen: { src: "/shots/dogmaai.jpg", width: 1200, height: 483, alt: "DogMaAI running locally on its bundled kennel clip: the live view, what the dog is doing, and the comfort tools" },
    year: "2026",
  },
  {
    slug: "agent-kyc",
    name: "Agent KYCReady",
    tagline: "A model reads. A policy decides.",
    summary: "Driver KYC rebuilt AI-first: a model reads the documents, a Rego policy decides, people take the hard cases.",
    problem: "Drivers get stuck at KYC and never book a load. I owned this flow at a logistics marketplace.",
    how: ["Nudge each driver about one blocker", "Read documents into fields and flags", "Policy approves, asks for a fix, or escalates", "Trust graph flags shared bank accounts"],
    results: [
      { value: "0 / 31", label: "bad drivers approved in tests" },
      { value: "16 / 16", label: "honest test drivers approved" },
      { value: "$0.10", label: "per 1,000 photos, Gemma in evals" },
    ],
    caveat: "Measured on 47 made-up test cases, not production. Forged documents remain the weak spot.",
    stack: ["TypeScript", "React 19", "Express 5", "OPA / Rego", "Neo4j"],
    repo: gh("Agent-KYC"),
    image: { src: shot("Agent-KYC@main/public/og.jpg"), alt: "A driver's phone with a licence reminder beside the ops console routing a shared-account case to a person" },
    live: { label: "Live demo", url: "https://agent-kycready.onrender.com" },
    demo: "kyc",
    screen: { src: "/shots/agent-kyc.jpg", width: 1200, height: 750, alt: "Agent KYCReady's live demo: a model reads the documents, a policy decides, people decide the hard cases" },
    year: "2026",
  },
  {
    slug: "noleak-mcp",
    name: "No-Leak-MCP",
    tagline: "Stops agents leaking keys through Slack.",
    summary: "One poisoned Slack message can make an assistant leak your keys through a link preview. This blocks it before it leaves.",
    problem: "Slack fetches link previews from its own servers, so a secret can leave without anyone clicking (CVE-2025-34072).",
    how: ["Score every message the assistant reads", "Inspect every outbound tool call", "Refuse any call carrying a secret", "Stream each denial to a live feed"],
    results: [
      { value: "100% → 0%", label: "attack success, once guarded" },
      { value: "5 / 5", label: "direct attacks blocked" },
      { value: "55", label: "offline tests" },
    ],
    caveat: "On injected attacks, much of the drop is the model refusing on its own.",
    stack: ["Node.js", "MCP", "Convex", "Nebius", "Linkup"],
    repo: gh("NoLeakMCP"),
    image: { src: shot("NoLeakMCP@main/site/assets/slack-thread.png"), alt: "The poisoned Slack thread beside the standup recap that never mentions it" },
    live: { label: "Run the attack", url: "https://noleak-arena-n14r.onrender.com/arena" },
    demo: "noleak",
    credit: "With Devansh Pathak at Burning Token 2026",
    hackathon: { event: "Burning Token 2026", there: "A live attack arena you can run, and the evals." },
    coBuilders: ["Devansh Pathak"],
    screen: { src: "/shots/noleak-mcp.jpg", width: 1200, height: 750, alt: "No-Leak-MCP's live arena, where you replay or run the Slack attack with the guard off or on" },
    year: "2026",
  },
];
