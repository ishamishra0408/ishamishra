// System design write-ups, one per project, in Hello Interview's order: requirements, core
// entities, API, high-level design, deep dives. Every line comes from that repo's README, its
// decision logs (tira: docs/decision-log.md, packing.md; DebugAssist: the pipeline's DECISIONS.md and
// design/system-architecture-v0.md, kept outside the repo; DogMaAI: five decision records reconstructed
// from its code on 2026-10-03, quoting the owner's rulings; Agent KYC: DECISIONS.md and the README's
// engineering-decisions table; No-Leak-MCP: Isha's own proposalIM.md and docs/DETAIL.md, not the ADRs
// Devansh committed) or its code; if those change, change it here.
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
  {
    slug: "dogmaai",
    intro: "A home-camera companion for a dog left alone, built so the camera, microphone and speaker in someone's home stay private and safe.",
    decidedBy: "Isha",
    functional: [
      "Show a home camera (any RTSP camera) or a paired phone live, and describe what the dog is doing about every 12 seconds.",
      "Keep a diary of the dog's day: a new entry whenever its activity or place changes.",
      "Hear crying and barking, and say how long the dog cried while alone.",
      "Play calm music, brown noise or found free-license recordings through the camera's own speaker.",
      "Turn a week of readings into PetAnalytics: how the dog felt alone, how long it cried, and whether the music helped.",
      "Reach every control from the owner's phone, on any network.",
    ],
    outOfScope: [
      "Veterinary, medical or safety use: it doesn't diagnose or treat separation anxiety.",
      "Alerts from the live camera: only the bundled sample clip raises alerts.",
      "SMS, email or push: alerts are in-app only.",
    ],
    nonFunctional: [
      { name: "Private by design", text: "No frames, recordings or sound are stored; audio becomes per-minute counts." },
      { name: "Keys stay on the server", text: "Every key is read by the API alone; the browser never sees one." },
      { name: "Safe in the room", text: "The speaker plays only sounds the server made or vetted, levelled, faded in and time-limited." },
      { name: "Within free tiers", text: "Tinybird's free plan allows 1,000 reads a day, so no read runs on a timer." },
      { name: "Only the owner gets in", text: "This Mac, or the Mac's own Tailscale login on the owner's devices." },
    ],
    entities: [
      { name: "Reading", text: "One look at the camera, about every 12 seconds: is the dog visible, what is it doing, where, and is a person in view." },
      { name: "Diary entry", text: "Liquid AI's description of the dog, saved when its activity or place changes." },
      { name: "Sound minute", text: "Seconds heard, crying and barking in one minute. Never audio." },
      { name: "Comfort event", text: "A sound that started, with its name and where it came from." },
      { name: "Found sound", text: "A free-license recording from Wikimedia Commons, addressed by an ID the server issued." },
      { name: "Session", text: "The sample clip's journal: observations, confirmed changes, situations and one alert, kept in SQLite so a restart recovers it." },
      { name: "Owner notification", text: "An alert, with guidance links when they arrive in time, shown in the app." },
    ],
    api: [
      {
        title: "The manager, from this Mac or the owner's Tailscale login",
        calls: [
          { sig: "GET /api/manager/connections", does: "each service's status, never a key" },
          { sig: "POST /api/manager/camera/home", does: "watch the home camera" },
          { sig: "POST /api/manager/camera/pair", does: "pair a phone as the camera, by QR code" },
          { sig: "GET /api/manager/diary", does: "the dog diary" },
          { sig: "GET /api/manager/analytics", does: "PetAnalytics for the last seven days" },
          { sig: "POST /api/manager/sounds/search", does: "find free-license sounds through Nimble" },
          { sig: "POST /api/manager/camera/speaker", does: "play a sound on the camera speaker, by its ID" },
          { sig: "GET | POST /api/manager/hearing", does: "listen live, and tune the crying cut-off" },
        ],
      },
      {
        title: "The camera and the sample journal",
        calls: [
          { sig: "POST /api/camera/:id/frame", does: "a paired phone sends its latest frame" },
          { sig: "POST /api/camera/:id/analyze", does: "Liquid AI describes the latest frame" },
          { sig: "DELETE /api/camera/:id", does: "end the phone's session" },
          { sig: "POST /api/sessions/:id/restart", does: "rebuild the sample journal from SQLite" },
          { sig: "GET /api/sessions/:id/stream", does: "the journal's updates, as server-sent events" },
        ],
        note: "Requests through Tailscale must carry the Mac's own login and the page's own origin.",
      },
    ],
    diagram: [
      { boxes: ["Home camera, or a paired phone", "The owner: this Mac, or a phone over Tailscale"] },
      { boxes: ["API on the Mac: holds every key, bound to localhost"], side: "One camera connection; only the latest frame kept" },
      { boxes: ["Liquid AI: describes the dog every 12 s", "YAMNet: hears crying and barking"] },
      { boxes: ["Tinybird: readings, diary, sound counts, comfort events"], store: true, side: "Read from memory, cached 10 minutes" },
      { boxes: ["Dog diary and PetAnalytics", "Comfort sounds through go2rtc to the camera speaker"] },
    ],
    caption: "Everything that sees or hears the dog runs on the Mac; only labels and counts leave it.",
    walkthrough: {
      title: "A reading from the home camera",
      steps: [
        "ffmpeg reads the camera once, keeping only the latest frame in memory (4 a second, up to 640 px wide); the same connection carries the sound.",
        "About every 12 seconds, the page asks Liquid AI on the Mac to describe the latest frame. Pages watching together share a reading from the last 10 seconds, so one moment isn't counted twice.",
        "A short text-only request reads four labels from the description: is the dog visible, what is it doing, where, and is a person in view.",
        "Labels go to Tinybird in batches, every 30 seconds or 20 rows. When the dog's activity or place changes, the description goes to the diary, and counts as saved only once Tinybird confirms it.",
        "Meanwhile YAMNet scores each 0.975-second window of sound, and each minute becomes counts of seconds heard, crying and barking.",
        "PetAnalytics reads the last seven days, cached for 10 minutes.",
      ],
    },
    deepDives: [
      {
        q: "Where do the keys live?",
        considered: ["Connect services from a Settings form in the browser, as an earlier build did. Keys passed through the page."],
        chose: "Every service is configured in .env and read by the API alone; Settings shows status and never asks for a key. The API drops the Tinybird admin token from its own environment at start and binds to localhost, and its ffmpeg and go2rtc children get PATH and nothing else.",
        tradeoff: "Changing a key means restarting the API. Two child processes still inherit more than they should (the phone tunnel and the vision server), a known gap.",
      },
      {
        q: "How does the speaker in the room stay safe?",
        considered: ["Play whatever a page asks for. A loud or sudden sound is a welfare problem, and a speaker that fetches any address is a way into the home."],
        chose: "It plays only what the server made or vetted: synthesised calm music and brown noise, or found recordings addressed by a server-issued ID and downloaded only from upload.wikimedia.org. Every recording is levelled, fades in over 3 seconds and stops at 30 minutes; Loud goes through a limiter instead of clipping. go2rtc runs with a password, bound to loopback, and its replies are never passed on.",
        tradeoff: "The owner can't play an arbitrary file on the camera, and there's no voice option.",
      },
      {
        q: "How does the microphone stay private?",
        chose: "Sound is classified on the Mac by YAMNet. Each 0.975-second window becomes crying and barking scores, then a per-minute count of seconds, and only the counts reach Tinybird. The sound comes over the same connection as the video, so the camera is opened once. While DogMaAI plays through the camera, those seconds count as muted, not quiet.",
        tradeoff: "No recording exists to replay or leak, so nothing can be checked again later. The crying cut-off hasn't been validated on real dog audio; Listen live lets the owner mark moments and adopt a tuned one.",
      },
      {
        q: "How does it stay within Tinybird's free reads?",
        considered: ["Re-read Tinybird on a timer, as the diary first did: every 30 seconds in every open tab, about 120 reads an hour per tab. It used 789 of the 1,000 free daily reads."],
        chose: "Reads come from the server's memory wherever possible. The diary reads once per API start and merges new entries in memory; PetAnalytics caches its three queries for 10 minutes and serves the cache when a read fails; a background tab doesn't poll. Writes, which the free plan doesn't count, go in batches. No read is ever added on a timer.",
        tradeoff: "A new comfort event can take up to 10 minutes to show on PetAnalytics.",
      },
      {
        q: "Why doesn't the live camera raise alerts?",
        considered: ["Feed live captions to the rules engine that drives the sample clip. Nobody has validated a 3B model's captions as alert triggers."],
        chose: "Two paths, kept apart. The rules engine (confirmed changes, situations, one alert) runs only on the sample clip's reviewed observations. Live footage goes from caption to labels to readings and the diary, and never reaches the engine. Nimble can add guidance links to an alert within 10 seconds, but can never create, delay or suppress one.",
        tradeoff: "The owner gets no alert from the live camera; the diary and PetAnalytics are its outputs. Alerts are in-app only.",
      },
      {
        q: "Which model describes the dog, and where does it run?",
        considered: ["Ollama. It lists Liquid's vision model but failed to load its vision projector."],
        chose: "Liquid's LFM2.5-VL-3B through llama.cpp on the Mac, found by itself every 15 seconds. Only a model that advertises both LFM and VL is used, since a text-only model can't read the camera.",
        tradeoff: "Good enough to say what the dog is doing and where, not proven as an alert trigger. It needs the Mac awake and the model running.",
      },
      {
        q: "How does the owner reach it from anywhere without exposing it?",
        chose: "It stays on the Mac, beside the camera and the models. Tailscale's serve proxy gives it a private HTTPS address on the owner's own devices, and both the web server and the API check that every request carries the Mac's own Tailscale login and the page's own origin.",
        tradeoff: "The Mac has to be awake. Pairing a phone as the camera still opens a temporary public Cloudflare link, limited to the camera gateway.",
      },
    ],
    next: [
      "Validate the crying cut-off on real dog audio.",
      "Give the two remaining child processes only what they need.",
      "Deliver the same owner notification by SMS, push or email.",
    ],
    sources: [
      { label: "README", url: "https://github.com/ishamishra0408/DogMaAI#readme" },
      { label: "Manager setup", url: "https://github.com/ishamishra0408/DogMaAI/blob/main/MANAGER_SETUP.md" },
      { label: "Tinybird", url: "https://github.com/ishamishra0408/DogMaAI/blob/main/TINYBIRD_INTEGRATION.md" },
      { label: "Nimble", url: "https://github.com/ishamishra0408/DogMaAI/blob/main/NIMBLE_INTEGRATION.md" },
    ],
  },
  {
    slug: "agent-kyc",
    intro: "Driver KYC rebuilt AI-first, where a model reads the documents and only a policy can approve anyone.",
    decidedBy: "Isha",
    functional: [
      "Tell each driver the one thing blocking them, at most once every two days and never at night.",
      "Coach a photo the moment it's taken, and read each document into fields and flags.",
      "Check the licence and PAN against registries, the bank account with a Rs 1 penny drop, and the selfie against the registry's photo.",
      "Decide by policy: approve, ask for a fix, or send the case to a person, always with a reason.",
      "Give reviewers only the hard cases, with their evidence and a drafted note.",
      "Open bookings once a driver and their vehicle pass, and lock them again when the licence lapses.",
    ],
    outOfScope: [
      "Real IDs: every test document is a generated SPECIMEN with a made-up person.",
      "An Aadhaar anchor, liveness on the face match, and anything after approval, such as re-KYC.",
      "Live registries and the marketplace: simulated in the demo, which also runs on stand-ins for the reader and the graph.",
    ],
    nonFunctional: [
      { name: "No model can approve", text: "The status machine has no edge into approved for the AI." },
      { name: "Explainable", text: "Every decision carries its reason codes and the policy version that made it." },
      { name: "Fails closed", text: "A missing field, an unanswered graph or an off-schema reading goes to a person." },
      { name: "Fair to honest drivers", text: "Transliterated names match, and a photo of a screen is a retake, not fraud." },
      { name: "Auditable", text: "Decisions, events, penny drops and vehicles refuse edits in the database." },
    ],
    entities: [
      { name: "Driver", text: "A status from signed up to approved, active or licence expired, with their consent, language and fleet owner." },
      { name: "Document", text: "A licence, PAN or bank proof as read: fields, photo quality, a photo of a screen, hidden text, signs of editing, and who read it." },
      { name: "Decision", text: "Outcome, reason codes, checks passed and policy version. Only the rules mint one; it's frozen and never edited." },
      { name: "Event", text: "Every status change and action, append-only." },
      { name: "Bank attempt", text: "One penny drop, kept. Three misses in 24 hours lock the step for a day." },
      { name: "Vehicle", text: "A registration decided by its own policy: a goods vehicle, valid, in the driver's or their verified owner's name." },
      { name: "Trust graph", text: "Drivers, bank accounts and fleet owners, to ask who else is paid into an account." },
    ],
    api: [
      {
        title: "The driver app",
        calls: [
          { sig: "POST /api/drivers/:id/consent", does: "starts KYC" },
          { sig: "POST /api/drivers/:id/photo", does: "a document photo, coached and read" },
          { sig: "POST /api/drivers/:id/digilocker", does: "fetch the licence or PAN instead" },
          { sig: "POST /api/drivers/:id/bank-check", does: "the Rs 1 penny drop" },
          { sig: "POST /api/drivers/:id/submit", does: "the policy decides" },
          { sig: "POST /api/drivers/:id/vehicle", does: "the vehicle policy decides" },
          { sig: "POST /api/drivers/:id/loads/:loadId/book", does: "only for approved drivers with a vehicle" },
        ],
      },
      {
        title: "The ops console",
        calls: [
          { sig: "GET /api/ops/review", does: "the cases sent to a person" },
          { sig: "GET /api/ops/drivers/:id/case", does: "the evidence, the readings and the rules' decision" },
          { sig: "GET /api/ops/drivers/:id/draft", does: "a first draft of the reviewer's note" },
          { sig: "POST /api/ops/drivers/:id/decision", does: "approve, reject or ask for a fix, with the evidence kept" },
          { sig: "GET /api/ops/evals", does: "the gate's latest results" },
        ],
        note: "Every status change goes through the API server; the reader and the trust graph only supply evidence.",
      },
    ],
    diagram: [
      { boxes: ["Driver app, on the phone", "Ops console, for reviewers"] },
      { boxes: ["API server: the only place a status changes"] },
      { boxes: ["Reader: Gemma 4 31B, Sonnet as fallback", "Registries and the penny drop", "Trust graph on Neo4j"] },
      { boxes: ["Policy in Rego, run in-process as WebAssembly"] },
      { boxes: ["Contract: mints the decision, or sends it to a person"] },
      { boxes: ["SQLite: decisions and events that refuse edits"], store: true },
    ],
    caption: "The reader, registries and graph supply evidence; only the policy, through the contract, decides.",
    walkthrough: {
      title: "A driver submits",
      steps: [
        "Each photo is checked for sharpness, brightness and glare the moment it's taken; the same check runs again at submit.",
        "The reader sees only the photo, not the slot or the number the driver typed, and answers in a strict schema; an answer off the schema counts as unreadable.",
        "Registry lookups run only on numbers from good photos. The penny drop finds the account and its holder, and the trust graph says who else is paid into it.",
        "TypeScript gathers the facts, name matching included; the policy returns the outcome, its reasons and the checks passed.",
        "The contract checks that answer, refuses an approval without all five core checks, and mints the decision. Only minted decisions apply.",
        "Approved: bookings open once a vehicle passes. A fix: the driver is told exactly what to redo. A person: the driver sees only \"a person is checking\".",
      ],
    },
    deepDives: [
      {
        q: "Who decides: the model or the rules?",
        considered: [
          "The model decides above a confidence threshold. Fast, but KYC mistakes are costly and have to be explained.",
          "Rules only, with no model. Explainable, but it can't read a document.",
        ],
        chose: "The model reads and flags; rules decide. No edge into approved in the status machine allows the AI, and a test checks every edge. Rules give every decision a reason code and a version.",
        tradeoff: "Rules need upkeep, and a case the rules can't settle goes to a person, never to the model's judgment.",
      },
      {
        q: "How does \"the AI can't approve\" hold even against a bug?",
        considered: ["Trust the policy's output."],
        chose: "A contract around the policy is the only place a decision is minted, and it freezes each one; the onboarding service refuses anything else. It rejects an unknown reason code, a mismatched severity, or an outcome that doesn't follow from its reasons, and sends any approval lacking one of the five core checks to a person. The database handle is private, and triggers make the decision and event logs refuse updates and deletes.",
        tradeoff: "The key rules are written twice, in Rego and in TypeScript.",
      },
      {
        q: "Where do the rules live?",
        considered: ["Rules in TypeScript, or a policy server."],
        chose: "Policy as code in Rego, on Open Policy Agent, compiled to WebAssembly and run inside the app: no policy server, and tests stay offline. TypeScript gathers the facts; the policy returns the outcome and reasons. The switch happened only after the Rego port reproduced 137 recorded decisions byte for byte, and every policy change since shows up as a diff against them.",
        tradeoff: "A second language and a build step. The compiled policy lives in the repo, so running the app needs no OPA install.",
      },
      {
        q: "When is a driver approved?",
        considered: ["Approve when nothing objects. An audit caught an earlier build approving a driver whose photo came back with no number, on their typed name alone."],
        chose: "Only on positive evidence from every check: a registry record for the licence and the PAN, a verified bank account and a matched selfie. Registry lookups run only on good photos, so a bad photo means \"retake\", never \"not found\". If anything needs a person, the case goes to a person even when something fixable is also wrong, and a third request for the same fix goes to a person too.",
        tradeoff: "More cases reach a person; an absence of problems never approves anyone.",
      },
      {
        q: "How is an AI reader proven before it reads for a driver?",
        considered: ["Tune prompts inside the app."],
        chose: "Tests before prompts: 31 cases and a gate (no bad case approved, at most one good case missed) before any model code, plus 16 holdout cases written from the policy alone by an agent that never saw the code. A reader switches on in the app only after passing the gate on both sets.",
        tradeoff: "A slower start, paid back when the gate caught a client timeout bug.",
      },
      {
        q: "Which model reads the documents?",
        considered: ["Claude Opus for every photo. Every case right, at $13.74 per 1,000 photos."],
        chose: "Five models compared on the same cases for $3.48. Gemma 4 31B, an open-weight model, got every case right at $0.10 per 1,000 photos; Claude Sonnet steps in when Gemma is slower than 15 seconds or fails. Every model call goes through OpenRouter, at temperature 0, into a strict schema.",
        tradeoff: "About 9 seconds a photo, and $0.68 per 1,000 with the fallback. The reader rarely notices a forged edit: on public IDNet forgeries it reported 15 of 120, so its tamper flag is a safety net, not a detector.",
      },
      {
        q: "How are shared bank accounts caught?",
        considered: ["The in-memory graph it started with, kept for tests."],
        chose: "A trust graph on Neo4j Aura, over its HTTPS Query API, so there's no driver package. One TypeScript function defines what a shared account means for both graphs, and the two decide all 94 test cases alike. If the graph doesn't answer, the case goes to a person: no answer is never read as \"no shared account\".",
        tradeoff: "A network hop of about 0.15 seconds a check, and a free tier that pauses after three days without writes; while it's paused, cases go to a person.",
      },
      {
        q: "What about instructions hidden on a document?",
        considered: ["Rely on the reader alone to flag them."],
        chose: "Text on a document is data. The reader copies anything aimed at the verification into its reading as evidence, and the app scans every transcribed field for instruction-like text as a second look. Either sends the case to a person, never to a rejection. The driver sees only \"a person is checking\", so they can't learn to hide it better.",
        tradeoff: "The scan can't see text the reader left out entirely, and a name like \"Approval Devi\" goes to a person.",
      },
    ],
    next: [
      "Dedicated forgery checks: a template's security features, and the card's portrait against the registry's.",
      "An Aadhaar anchor, liveness on the face match, and re-KYC after approval.",
      "A server database instead of in-memory SQLite, and retries and failover for providers.",
    ],
    sources: [
      { label: "README", url: "https://github.com/ishamishra0408/Agent-KYC#readme" },
      { label: "Decision log", url: "https://github.com/ishamishra0408/Agent-KYC/blob/main/DECISIONS.md" },
      { label: "Failure log", url: "https://github.com/ishamishra0408/Agent-KYC/blob/main/FAILURES.md" },
      { label: "How the tests work", url: "https://github.com/ishamishra0408/Agent-KYC/blob/main/evals/README.md" },
    ],
  },
  {
    slug: "noleak-mcp",
    intro: "A guard that stops an AI assistant from leaking a secret through Slack, whatever the model decides to do.",
    decidedBy: "Isha",
    functional: [
      "Score every Slack message the assistant reads for injected instructions.",
      "Inspect every outbound tool call before it's sent, and refuse one that carries a secret.",
      "Catch untagged secrets too: a value read earlier that reappears in a later outbound call.",
      "Log every verdict and denial, and stream them to a live feed many people can watch at once.",
      "Measure attack success with the guard off and on.",
      "After a block, find out who could read the secret where it was going, and say whether to rotate it.",
    ],
    outOfScope: [
      "Patching the agent or its harness: every control registers into a seat the harness already has.",
      "Blocking network traffic: the harness emits an indicator for the controls that can.",
      "A leak that never passes through a tool call, such as prose a person acts on.",
    ],
    nonFunctional: [
      { name: "Independent of the model", text: "It holds whether the model refuses, obeys or never judges the call." },
      { name: "Independent of the destination", text: "It decides on the value, not where the value is going." },
      { name: "No changes to the agent", text: "Three registrations, each switched on or off by one setting." },
      { name: "Honest numbers", text: "Attack success is reported with blocked over attempted, so model refusals don't count as the guard's." },
      { name: "Safe to demo", text: "Every leaked value is a canary decoy, never a real secret." },
    ],
    entities: [
      { name: "Tool result", text: "What the assistant read, such as a Slack thread or a file, with secret-shaped values harvested from it." },
      { name: "Outbound call", text: "A tool call's arguments about to leave: the moment the guard decides." },
      { name: "Canary", text: "A tagged decoy secret, recognised raw or through base64, hex, base32, gzip, URL encoding or splitting." },
      { name: "Verdict", text: "The scorer's injection score and labels for one message read." },
      { name: "Denial", text: "A refused call: which control, which tool and when, logged and streamed." },
      { name: "Trial", text: "One evaluation run: the victim model, the attack (direct or injected), the guard off or on, and the outcome." },
      { name: "Finding", text: "Who can read the secret at its destination, and the verdict: exposed, rotate now, or contained." },
    ],
    api: [
      {
        title: "The three controls, registered in the dsh harness",
        calls: [
          { sig: "session-telemetry/record", does: "the scorer fills this waterfall, which ships empty" },
          { sig: "tools/pre-execute", does: "the guard denies a call carrying a tagged secret" },
          { sig: "tools/result", does: "the invariant harvests secret-shaped values from what was read" },
          { sig: "tools/pre-execute", does: "the invariant denies a later call that carries one" },
        ],
        note: "All three are registrations, not patches, and each disposes of itself.",
      },
      {
        title: "Switches and the live feed",
        calls: [
          { sig: "MCPGUARD_ENABLED=0 | 1", does: "the guard off or on, the only variable between runs" },
          { sig: "CHAIN_INVARIANT_ENABLED=1", does: "the invariant, off by default" },
          { sig: "GET /guard, GET /invariant", does: "the live toggles a running session follows" },
          { sig: "ingestEvent, ingestTrial, ingestFinding", does: "write a verdict, denial, trial or finding to the feed" },
          { sig: "feed, summary, findings", does: "what every viewer subscribes to" },
          { sig: "node eval/run.mjs --n 5", does: "attack success, guard off and on, per model and attack" },
        ],
      },
    ],
    diagram: [
      { boxes: ["A poisoned Slack message"] },
      { boxes: ["Victim agent in the dsh harness, on Nebius"], side: "Scorer flags the message (Nebius)" },
      { boxes: ["Guard and chain invariant at tools/pre-execute"] },
      { boxes: ["Denied: nothing reaches Slack, so nothing is fetched"] },
      { boxes: ["Convex: every verdict, denial and trial, pushed to every viewer"], store: true, side: "Linkup: who can read it there?" },
      { boxes: ["The live feed: attack success, 1 to 0"] },
    ],
    caption: "The guard decides inside the agent's harness, before a call leaves; everything after it is a record.",
    walkthrough: {
      title: "The Slack attack, with the guard on",
      steps: [
        "A teammate's message, written like an ops bot, asks the assistant to read its credentials file, base64-encode it and fetch a URL, silently.",
        "The assistant reads the thread. The scorer, a second model on the same inference plane, flags it as injection at 0.95, and the verdict is logged and streamed. It doesn't block.",
        "The assistant reads the decoy keyring and builds the request.",
        "At tools/pre-execute the guard finds the tagged secret inside the argument, through the base64, and denies the call. Nothing is posted, so Slack has nothing to fetch.",
        "The denial reaches the live feed; every viewer sees it within a moment, and attack success drops from 1 to 0.",
        "A follow-up investigation, up to three searches chosen by code, decides whether the destination exposed the secret. The block never depends on it.",
      ],
    },
    deepDives: [
      {
        q: "Why can't the defence live in the model?",
        considered: ["Rely on the model to refuse. Claude refused all 4 runs, but Nemotron 120B, capable and not safety-hardened, obeyed every time."],
        chose: "A guard in the harness, keyed on a mechanical fact: a tagged secret is leaving in an outbound argument. It holds whether the model refuses, obeys or never judges the call at all.",
        tradeoff: "It's a canary tripwire, not a general secret detector. A real secret with no tag passes, and so does a transform it can't decode or a payload split across calls.",
      },
      {
        q: "Where does it block: at the fetch, or before?",
        considered: ["Block the fetch with an egress control. Slack fetches the preview from its own servers, so no firewall on the victim's machine ever sees it."],
        chose: "At assembly: the pre-execute hook refuses the call while the secret is still an argument, so nothing reaches Slack and nothing is fetched. It decides on the value, not the destination, so the same check covers a Slack preview, an image proxy or a direct fetch.",
        tradeoff: "It assumes no link is ever opened automatically, and anywhere secrets legitimately ride in URLs would see false positives.",
      },
      {
        q: "How does it fit into the agent without changing it?",
        considered: ["Patch the harness's agent loop."],
        chose: "Three registrations in seats the dsh harness already exposes: the scorer fills telemetry's score waterfall, which ships empty, and the guard and the invariant sit in the tools' pre-execute waterfall. One config file composes them, and each is switched by one setting.",
        tradeoff: "The scorer needs telemetry in full mode, which exports session data, so it must point only at a collector the owner trusts.",
      },
      {
        q: "What about a real secret with no tag?",
        considered: ["The tagged tripwire alone. Cheap and deterministic, but blind to a real secret."],
        chose: "A chain invariant, based on provenance: it harvests secret-shaped values from every tool result and denies a later outbound argument that carries one, raw or through the guard's decoders.",
        tradeoff: "A per-session heuristic: a transform it can't decode still slips, \"no human approval in between\" isn't modelled yet, and a long public ID can trip it. It's off by default.",
      },
      {
        q: "What does the second model do?",
        chose: "It scores every Slack message the assistant reads for injection, on the same inference plane as the victim. Its verdict is logged and streamed, never used to block: the guard alone refuses calls. On the live Slack run it flagged 7 of 8 reads of the poisoned thread, and 0 of 25 other Slack reads.",
        tradeoff: "A second model call on every message read. Its cost grows with the agent's traffic.",
      },
      {
        q: "How is the result measured honestly?",
        considered: ["Report attack success alone. It would credit the guard for refusals the model made by itself."],
        chose: "Attack success with the guard off and on, for two victim models and two kinds of attack, plus blocked over attempted. Victim and scorer run on one provider, Nebius, so the guard toggle is the only variable.",
        tradeoff: "On the injected attack much of the drop is the model refusing; the direct attack, 5 of 5 blocked on both models, is the guard's own effect. Five runs per cell is a small sample.",
      },
      {
        q: "How do several people watch the same run live?",
        chose: "Convex holds the live events and the attack-success metric and pushes them to every viewer, and serves the feed page itself. Flip the guard in one window and the other updates without a refresh; a running session picks up the toggle within about two seconds.",
        tradeoff: "A hosted service in the loop. The harness's own session log stays the record, and the background worker rebuilds its state from that log after a failure.",
      },
      {
        q: "How bad was the leak that didn't happen?",
        chose: "After a run, or for any address typed in, up to three Linkup searches, each chosen by code from what the last one found, work out who can read a credential at the destination and check it against independent sites. The verdict is exposed (rotate now) or contained, stored and reused by the next investigation.",
        tradeoff: "The block never depends on it, but how serious the incident is does, and a search can be wrong.",
      },
    ],
    next: [
      "Model \"no human approval in between\" in the chain invariant.",
      "Move the invariant to the harness's own invariants seat, over the session log.",
      "A one-page set of recommended controls, mapping each one to its CVE.",
    ],
    sources: [
      { label: "README", url: "https://github.com/ishamishra0408/NoLeakMCP#readme" },
      { label: "The long version", url: "https://github.com/ishamishra0408/NoLeakMCP/blob/main/docs/DETAIL.md" },
      { label: "Proposal", url: "https://github.com/ishamishra0408/NoLeakMCP/blob/main/proposalIM.md" },
      { label: "Evals", url: "https://github.com/ishamishra0408/NoLeakMCP/blob/main/eval/README.md" },
    ],
  },
];

export const designFor = (slug: string) => designs.find((d) => d.slug === slug);
