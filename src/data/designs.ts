// System design write-ups, one per project, in Hello Interview's order: requirements, core
// entities, API, high-level design, deep dives. Every line comes from that repo's README, its
// decision logs (docs/decision-log.md, packing.md) or its code; if those change, change it here.
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
];

export const designFor = (slug: string) => designs.find((d) => d.slug === slug);
