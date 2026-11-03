// System design write-ups, one per project, in Hello Interview's order: requirements, core
// entities, API, high-level design, deep dives. Every line comes from that repo's README, its
// decision logs (tira: docs/decision-log.md, packing.md; DebugAssist: the pipeline's DECISIONS.md and
// design/system-architecture-v0.md, kept outside the repo) or its code; if those change, change it here.
// The voice is neutral; `decidedBy` marks whose calls the deep dives are.

export type Design = {
  slug: string;
  intro: string;
  decidedBy: string;
  functional: string[];
  outOfScope: string[];
  nonFunctional: { name: string; text: string }[];
  entities: { name: string; text: string }[];
  api: { title: string; endpoint?: string; calls: { sig: string; does?: string }[]; note?: string }[];
  /** The diagram, top to bottom: each row's boxes, and an optional box beside the row. */
  diagram: { boxes: string[]; side?: string; store?: boolean }[];
  caption: string;
  walkthrough: { title: string; steps: string[] };
  deepDives: { q: string; considered?: string[]; chose: string; tradeoff: string }[];
  next: string[];
  sources: { label: string; url: string }[];
};

export const designs: Design[] = [
  {
    slug: "tira",
    intro: "A task board where an agent's \"done\" has to come with proof, built on a log nobody can rewrite.",
    decidedBy: "Isha",
    functional: [
      "People and agents create, start, block and complete tasks in a tree, each task under one parent.",
      "A task is done only with proof: a commit or pull request, checked on GitHub, for code; a link or a file for any other work.",
      "Every change is kept, and the board can be rewound to any earlier moment.",
      "Agents work the board through MCP, under their own names, by the same rules as people.",
      "tira says what's next, with its reasons, and closes a finished parent itself.",
      "An idea an agent files becomes a task only once a person approves it.",
      "A person can have a task's work reviewed by a second model before it's done, and keeps the final say.",
    ],
    outOfScope: [
      "Doing the work: agents build, tira tracks and checks.",
      "Forecasts, digests and push notifications.",
      "Cryptographic proof against someone with full database access rewriting the log.",
    ],
    nonFunctional: [
      { name: "Correct before fast", text: "No lost or duplicated events, and no decision made on stale state." },
      { name: "History can't change", text: "Not even by buggy code. A correction is a new event." },
      { name: "Deterministic", text: "The same log gives the same board, byte for byte, on any machine and in any time zone." },
      { name: "No way around the rules", text: "Every write, from any entry point, passes one gate, and every refusal is recorded." },
      { name: "Small on purpose", text: "One team (4 people today) and their agents, on one free Render server and a hosted Postgres." },
    ],
    entities: [
      { name: "Event", text: "One change, appended once: a global sequence number, its stream and revision, an id, a type, its data and who made it. The only thing stored." },
      { name: "Task", text: "A node in the tree, with one parent and one of five states: unstarted, in progress, blocked, done, cancelled. Never stored; folded from its events." },
      { name: "Proof", text: "The commit, pull request, link or file a done move must point to." },
      { name: "Ticket and comment", text: "What the work is, and the talk about it, kept beside the task. Every edit is a new version." },
      { name: "Idea", text: "A sentence from an agent, drafted by tira, waiting for a person's approval." },
      { name: "Actor", text: "A person (their GitHub login) or an agent (its own name and token). tira itself writes only the moves its rules call for, like closing a parent." },
      { name: "Refusal", text: "A move the rules turned down, kept with what was asked and why." },
    ],
    api: [
      {
        title: "Agents, over MCP",
        endpoint: "POST /mcp   Authorization: Bearer <agent token>",
        calls: [
          { sig: "next_task()", does: "what's in progress, what's next and why" },
          { sig: "list_tasks(state?)", does: "tasks in board order" },
          { sig: "get_task(id)", does: "ticket, state, subtasks, proof, history" },
          { sig: "start_task(id)", does: "in progress, one at a time" },
          { sig: "complete_task(id, proof, note?)", does: "done, or a refusal saying what's missing" },
          { sig: "block_task(id, reason, waits_on?)", does: "blocked" },
          { sig: "add_subtask(under, name, found?)", does: "a new task under it" },
          { sig: "file_idea(summary, why, under?)", does: "an idea waiting for a person" },
          { sig: "add_comment(id, text)", does: "a reply on the task" },
          { sig: "fill_ticket(id, title?, description?, steps?, estimate?, kind?)", does: "writes the ticket, as the agent" },
        ],
        note: "No tool cancels, reopens, unblocks or deletes: those stay with people.",
      },
      {
        title: "The event store, behind one interface",
        calls: [
          { sig: "append(stream, events, { expectedRevision })", does: "the new sequence number" },
          { sig: "readStream(stream)", does: "one stream's events" },
          { sig: "readAll({ fromSeq })", does: "every event, in order" },
          { sig: "subscribe(from, handler)", does: "new events as they land" },
        ],
        note: "Postgres in every live tira, SQLite in tests. The rules, the fold and the pages never touch storage directly.",
      },
    ],
    diagram: [
      { boxes: ["People, on the web page", "Agents, over MCP", "GitHub and Jira sync"] },
      { boxes: ["Dispatcher: every move comes in here"] },
      { boxes: ["Write path: check shape, evaluate rules, append"], side: "GitHub checks the proof; Muse reviews, if asked" },
      { boxes: ["Postgres: append-only event log"], store: true },
      { boxes: ["Fold: replay the log"] },
      { boxes: ["Board, task tree, what's next"] },
    ],
    caption: "Every move, from a person, an agent or a sync, takes the same path down.",
    walkthrough: {
      title: "An agent completes a task",
      steps: [
        "The agent calls complete_task with a pull request. Its token names the project and the agent.",
        "tira checks the pull request on GitHub, then the write path evaluates the move against the task's rule table.",
        "Allowed: one event is appended, as long as the task's stream hasn't moved since it was read. Refused: the refusal is appended instead, and the agent is told what's missing.",
        "After the write, the dispatcher folds the log. If that finish closed the last open work under the parent, tira closes the parent itself, citing the move.",
        "The next page load or next_task folds the log again. Nothing else holds the board's state.",
      ],
    },
    deepDives: [
      {
        q: "How does the board stay true to what happened?",
        considered: [
          "Build on an open-source tracker (Plane). Checked against all 11 jobs: it can hold the tree, but replay, guards and derived state are structurally impossible in its data model.",
          "Store each task's current state and update it. Fast to read, but the state can drift from what happened, and an update erases the evidence.",
        ],
        chose: "Store only events. The board, the tree and what's next are folded from the log on every request, so there is no \"current task\" field to go stale.",
        tradeoff: "Work on every read. It holds at this size: one pass over the whole log, about 2,800 events, takes 45 ms.",
      },
      {
        q: "Which database holds the log?",
        considered: [
          "SQLite on each machine. No server to run, but work could land in a file nobody else sees.",
          "KurrentDB, a database built for event logs. The right category, but it serves storage, not logic, and people, permissions and the sync queue would need a second database.",
        ],
        chose: "Postgres, hosted from day one and the only live store. One table that refuses edits, a gapless sequence, and people, projects, permissions and the GitHub and Jira sync queue in the same database. SQLite stays for tests, in memory.",
        tradeoff: "Every live command needs the database reachable. Tests need no network, and CI runs the Postgres tests against a real Postgres.",
      },
      {
        q: "How is history protected, even from tira's own code?",
        considered: ["Trust the code never to update or delete an event."],
        chose: "The database refuses: triggers abort every UPDATE, DELETE and TRUNCATE on the events table. Replay re-judges every stored event with the same rules, so a write that slipped past them shows up as an anomaly.",
        tradeoff: "No fixing a mistake in place; a correction is a new event. Tamper evidence is sequence numbers now, a hash chain later.",
      },
      {
        q: "How is \"done needs proof\" enforced with no way around it?",
        considered: [
          "Checks inside each entry point. The page, MCP and Jira sync would each need their own copy, and a new entry point could miss it.",
          "Running the rules in XState. One executable form, but a framework on the trust path.",
        ],
        chose: "One guarded write path for every caller: check the shape, evaluate the rules, append. The rules are complete state-by-event tables in JSON, run by a small runner, generated from the XState charts and checked against them in CI (282 checks). A refused move is logged with its reason.",
        tradeoff: "One gate for every write could become a bottleneck; it holds at this scale. The tables are verbose, but every pair is spelled out and reviewable.",
      },
      {
        q: "What happens when two writers move the same task at once?",
        chose: "Within one process, a queue per stream. Across processes, each append carries the revision it read; if another write got there first, tira re-reads, re-evaluates and retries with jittered backoff, up to 10 times. One counter row, locked per append, gives a gapless global order for replay. Retries are safe: an event id is unique, and resending one returns the original.",
        tradeoff: "Every append takes the same counter, so many writers would contend on it. It holds at this scale.",
      },
      {
        q: "How do agents get real power without overreaching?",
        considered: [
          "One shared bot account for every agent. The history couldn't tell agents apart.",
          "Writing the MCP protocol by hand. No new packages, but tira would track every spec change itself.",
        ],
        chose: "The official MCP TypeScript SDK, pinned. Each agent gets its own name, which must read as an agent's, and its own token; tira keeps only the token's SHA-256 fingerprint, and revoking it stops the agent at its next call. Agents can start, complete with proof, block, add subtasks, file ideas and comment, all through the same write path as people.",
        tradeoff: "Three small, pinned packages on the trust path. An agent can't undo its own block; a person unblocks it.",
      },
      {
        q: "How is \"done\" checked by someone other than the one who did it?",
        considered: ["Review every task. Thorough, but every completion pays for a model call and risks false alarms."],
        chose: "A person marks the tasks that need review. When one is completed, Muse (Meta's model) reviews the work against its ticket, work type and proof, as a checker that never did the work. Each problem becomes a fix subtask, and tira's existing rule that a task can't close with open subtasks holds it; completing it again asks for another review. The reviewer writes through the same write path as anyone: no new state, no new record type.",
        tradeoff: "Review costs and false alarms. Each review's token use is on the task, it reports at most 5 problems, and a person keeps the final say: they can complete without review, and after 3 rounds asking for changes, only a person can.",
      },
      {
        q: "Would the tests catch a real bug?",
        considered: ["Trust a green test run. A suite can pass while missing what matters."],
        chose: "Planted bugs: 1,115 of them, each breaking one rule, and each must make a test fail or the run fails. Each runs first against the test that caught it last time. In a blind round, someone else planted 10 faults; all 10 were caught.",
        tradeoff: "The full check on a pull request went from 40–50 minutes to 5–6 (measured at 425 planted bugs). Whoever plants bugs also wrote the tests, which is what the blind round is for.",
      },
    ],
    next: [
      "Copy the log nightly outside the database host before more than the first 4 people use tira. The log is never edited, so a copy is a full backup.",
      "Add a hash chain to the log, so tampering by someone with database access shows.",
      "With many writers, the single counter becomes the limit.",
    ],
    sources: [
      { label: "README", url: "https://github.com/devpath56/tira#readme" },
      { label: "Decision log", url: "https://github.com/devpath56/tira/blob/main/docs/decision-log.md" },
      { label: "Build, buy or clone", url: "https://github.com/devpath56/tira/blob/main/packing.md" },
      { label: "The long version", url: "https://github.com/devpath56/tira/blob/main/docs/ENGINEERING.md" },
    ],
  },
  {
    slug: "debugassist",
    intro: "An agent that takes a GitHub bug report to a fix proven by two tests, where code, not the model, decides every step.",
    decidedBy: "Isha",
    functional: [
      "Read a GitHub issue and decide whether it's a real bug, and how sure that is.",
      "Write a test that fails on the latest main for the issue's reason, before any fix.",
      "Name the cause as real source lines, and write the smallest fix that turns that test green with every affected suite still passing.",
      "Confirm the fix with a second test written without seeing it.",
      "Explain how the bug shipped, as conditions, never people, and add one test that guards the whole class of bug.",
      "Pause for a person's OK on the exact pull request text.",
    ],
    outOfScope: [
      "Posting to GitHub: the pipeline can only read. Publishing is the person's step.",
      "A fix for a bug it couldn't make fail: the run stops instead.",
      "Many issues at once: one run at a time.",
    ],
    nonFunctional: [
      { name: "Evidence over the model's word", text: "A fix counts only when tests that failed on main pass with it." },
      { name: "Crash-safe", text: "Every step is checkpointed; a crash resumes where it stopped, and nothing is counted twice." },
      { name: "Spend can't overrun", text: "Each call's worst case is reserved before the call, and each person has a monthly cap." },
      { name: "Contained", text: "AI-written tests run with the network off and no secrets inside." },
      { name: "Least privilege", text: "Read-only GitHub, and each person sees only their own runs." },
    ],
    entities: [
      { name: "Run", text: "One issue, from intake to the person's OK: its steps, why it stopped, who started it, and the commit of main it branched from." },
      { name: "Context pack", text: "What every later step reads: comments with names removed, linked pull requests, errors, the five best-matching files, recent changes. Cut to size and locked by SHA-256." },
      { name: "Reproduction attempt", text: "A test on one rung of the ladder (unit, recorded stream, the reporter's repro), ending red, green or error." },
      { name: "Fix", text: "Exact search-and-replace edits to source files, never tests, with the two tests that judged it." },
      { name: "Condition", text: "What let the bug ship, named and embedded, to find past bugs of the same kind." },
      { name: "Guard", text: "One parametrised test over every way the bug class can happen." },
      { name: "Meter and call", text: "Dollars and sandbox seconds reserved before use and settled after, with one row per model call." },
      { name: "Approval", text: "The person's go-word, bound to a fingerprint of the exact pull request text." },
    ],
    api: [
      {
        title: "The web app, signed in with GitHub",
        endpoint: "Allow-listed accounts only; each sees only their own runs",
        calls: [
          { sig: "POST /api/start (issue, focus?, look_in?, test_in?, ai)", does: "starts a run, if it fits the person's monthly cap" },
          { sig: "POST /api/install (run, yes | no)", does: "add a missing package to the test machine?" },
          { sig: "POST /api/answer (run, advisor | run)", does: "an advisor disagreed: whose plan to follow" },
          { sig: "POST /api/decide (run, approve | reject, fingerprint)", does: "the person's OK on the exact text" },
          { sig: "POST /api/connect (repo)", does: "set up a repo: its install, test machine and suites, proven offline" },
          { sig: "POST /hooks/github", does: "signed webhook: the debug-assist label queues a run" },
        ],
      },
      {
        title: "The same pipeline, from a terminal",
        calls: [
          { sig: "debug-assist run <issue-url>", does: "preflight first; refuses with every failing check listed" },
          { sig: "debug-assist resume <run-id>", does: "continues after the last finished step" },
          { sig: "debug-assist approve <run-id>", does: "prints the fingerprint it approves" },
          { sig: "debug-assist events <run-id>", does: "every model call, sandbox command and decision" },
        ],
        note: "Inside, one function is the only door to a generation model, and a test fails if any other code calls one.",
      },
    ],
    diagram: [
      { boxes: ["A GitHub issue, pasted or labelled", "A person, signed in with GitHub"] },
      { boxes: ["Pipeline: 10 fixed steps, each checkpointed"], side: "MongoDB: run state, spend, events" },
      { boxes: ["Laya decides: a real bug?", "Claude Opus writes: tests, cause, fix"], side: "Every call reserved against the cap first" },
      { boxes: ["Sandbox runs every test: network off, no secrets"], store: true },
      { boxes: ["The person's OK on the exact pull request text"] },
      { boxes: ["Pull request ready: the person publishes it"] },
    ],
    caption: "The models write; the sandbox's exit codes decide.",
    walkthrough: {
      title: "From an issue to the person's OK",
      steps: [
        "Laya, a triage model fine-tuned for this, decides whether the issue is a real bug. Below 0.6 confidence, the run stops for a person.",
        "Gather context, with no AI: comments without names, linked pull requests, errors and the best-matching files, locked by SHA-256. The run's copy of the code moves to main's newest commit.",
        "Climb the ladder (a unit test, then a recorded stream, then the reporter's own repro) until a test fails for the issue's reason. Nothing in 4 tries: the run stops.",
        "Claude names the cause as real lines and writes search-and-replace edits. Code applies them to source only; the failing test and every affected suite must pass, or the edits are reverted and retried, up to 3 times.",
        "A second test, written without seeing the fix, must fail on main and pass with it.",
        "The report on why it shipped is drawn from the line's GitHub history, and the guard covers the whole class.",
        "The run pauses for the person's OK on the exact pull request text, then saves it for them to publish.",
      ],
    },
    deepDives: [
      {
        q: "How can a fix a model wrote be trusted?",
        considered: ["One judge: the test that reproduced the bug. A fix that passed its one judge failed all 3 reference tests from the by-hand run."],
        chose: "Two judges. The reproducing test, plus a second test written without seeing the fix, which must fail on main and pass with it, while the affected packages' suites stay green. The fixer may call a test flawed, never edit it. A fix written after the fixer saw the second test fail counts as one judge.",
        tradeoff: "More model calls and sandbox time per fix, and both judges come from one model, so they aren't fully independent: accepted as a named gap. Against the maintainers' own fixes, 2 of 2 had the right cause and a fix too narrow; their tests caught it.",
      },
      {
        q: "How is a bug reproduced before anything is fixed?",
        considered: ["Fix after the attempt cap even without a failing test, as Uber's design does. Faster, but a fix for a bug nobody saw fail proves nothing."],
        chose: "A ladder, climbed before any fix: a unit test, then the real code path against a recorded stream, then the reporter's own repro. The first test that fails for the issue's reason becomes the judge; a crash or a wrong-reason failure doesn't count. A failure on made-up data is confirmed on a recorded stream. After 4 tries, the run stops: NEVER REPRODUCED.",
        tradeoff: "Some real bugs end without a fix. A named stop beats an unproven fix.",
      },
      {
        q: "How does each run test today's code without a slow setup?",
        considered: ["Pin every run to one prepared commit. Bugs fixed since still \"reproduced\", and fixes were written against old code."],
        chose: "Each run moves its copy of the code to main's newest commit. The test machine is rebuilt only when the lockfile changed; otherwise only the changed packages are built. The page says which commit the run branched from, and when.",
        tradeoff: "A lockfile change rebuilds the test machine, which takes minutes. Installing every package up front was not chosen.",
      },
      {
        q: "How does a crash lose neither the run nor the money?",
        considered: [
          "Temporal, a workflow engine. Durable, but a server that could be down on demo day and a core rewrite five days out.",
          "Spend kept in the run's state. LangGraph saves state only when a step finishes, so a crash mid-step forgot its calls, and the resumed run under-counted.",
        ],
        chose: "LangGraph with the MongoDB checkpointer: a run resumes after its last finished step (proven with kill -9), and the wait for the person's OK survives restarts. Spend lives apart in MongoDB: each call's worst case is reserved in one atomic update before the call, then settled, in integer micro-dollars.",
        tradeoff: "A crash between reserve and settle leaves money counted that was never spent: it fails closed, never open. Temporal comes back if it ever runs many issues at once.",
      },
      {
        q: "Which model does what?",
        considered: ["A cheaper open-weight coder for every run (Qwen3-Coder-Next, about $0.20 a fix). It needed 2–4 tries, wrote tests that couldn't pass, and its one-judge fix failed the reference tests."],
        chose: "Three roles. Laya, a small calibrated model, answers typed questions (is it a bug, what kind) in milliseconds; fine-tuned on issue data, it went from 174 to 215 of 232 right, under an adoption rule fixed before training, and is used only for triage. Claude Opus writes the tests, cause and fix. An embedding model finds past bugs of the same condition.",
        tradeoff: "Laya runs only on Apple chips, so the hosted app reaches it on a Mac through a Tailscale tunnel; while that Mac sleeps, triage can't answer. A run on Opus costs cents: $0.41 for vercel/ai #22543.",
      },
      {
        q: "How does AI-written code run safely?",
        considered: ["Docker on the server. Render's free plan can't run it."],
        chose: "Every test runs in a sandbox with the network off and no secrets inside: Docker on a Mac, E2B when hosted. An install gets the network for that one command. Every command runs under bash -o pipefail, after a run with 14 failing tests exited 0 through a pipe. A missing package is added only on the person's yes.",
        tradeoff: "The check of older code (the back-test) still runs only on the Mac; hosted runs report it as not available.",
      },
      {
        q: "How do outside advisors help without steering the run?",
        considered: ["Advice only, never changing the run (the first ruling). A disagreement was shown, but nothing could act on it."],
        chose: "Advisor seats on the Domain Expertise MCP server review triage, the cause, the report and the guard. When one disagrees, the run pauses and the person picks whose plan it follows. Only what was sent to the advisor can come back into a prompt: the repo's own files and the report's own sentences. The server was reviewed before anything connected.",
        tradeoff: "A disagreement waits for a person. An advisor that can't be reached costs the advice, never the run.",
      },
      {
        q: "How does nothing reach GitHub without a person?",
        considered: ["Let the pipeline post the pull request after approval. One less step, but a write credential on an AI pipeline."],
        chose: "The pipeline holds a read-only GitHub token, so it can't post. The OK binds to a SHA-256 fingerprint of the exact pull request text; any other text is refused, and a second tap confirms. The person then publishes it with their own login.",
        tradeoff: "One more step for the person, on purpose.",
      },
    ],
    next: [
      "Run the maintainers' fix tests against every fix before the person's OK, and show the result.",
      "A replay benchmark: closed issues with merged fixes, run from the commit before the merge with the fix hidden, scored on cause, the maintainers' tests and size.",
      "Temporal, once it runs many issues at once.",
    ],
    sources: [
      { label: "README", url: "https://github.com/ishamishra0408/DebugAssist#readme" },
      { label: "Operations", url: "https://github.com/ishamishra0408/DebugAssist/blob/main/docs/OPERATIONS.md" },
      { label: "Decision log", url: "https://github.com/ishamishra0408/DebugAssist/blob/main/docs/DECISIONS.md" },
      { label: "Results", url: "https://github.com/ishamishra0408/DebugAssist/blob/main/docs/RESULTS.md" },
      { label: "Hosting", url: "https://github.com/ishamishra0408/DebugAssist/blob/main/deploy/DEPLOY.md" },
    ],
  },
];

export const designFor = (slug: string) => designs.find((d) => d.slug === slug);
