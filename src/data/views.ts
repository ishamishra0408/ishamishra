// DRAFT: distilled from principles that repeat across Isha's READMEs. Edit freely.
// Each view is a short call plus a two-choice scenario for the quiz. `seen` points at the project
// where the call shows up, in words taken from that project's README.

export type View = {
  id: string;
  title: string;
  body: string;
  scenario: { prompt: string; options: { label: string; agree: boolean }[]; reveal: string };
  seen?: { slug: string; note: string };
};

/** The post that collects the calls, at paths.writing. */
export const POST = {
  title: "Six calls I make when building AI agents",
  description: "What I decide the same way every time I build an agent, and where each call shows up in my projects.",
  date: "2026-11-02",
  dateLabel: "November 2026",
};

export const views: View[] = [
  {
    id: "policy-decides",
    title: "The model proposes. A policy decides.",
    body: "Models read well and judge poorly. Decisions belong in code you can test.",
    scenario: {
      prompt: "Your model is 99% accurate. Should it approve drivers?",
      options: [
        { label: "Yes, 99% is plenty", agree: false },
        { label: "No, a policy approves", agree: true },
      ],
      reveal: "At scale, 1% is a lot of bad approvals, with no reason attached.",
    },
    seen: { slug: "agent-kyc", note: "A model reads the documents into fields and flags; a Rego policy approves, asks for a fix, or escalates. 0 of 31 bad test drivers were approved." },
  },
  {
    id: "unflattering-number",
    title: "Report the number that wouldn't flatter you.",
    body: "Put the measurement that could embarrass a result right beside it.",
    scenario: {
      prompt: "Your AI fix passes your tests but fails 3 of the maintainers'. What do you publish?",
      options: [
        { label: "Our tests: 100% pass", agree: false },
        { label: "Both, and the lesson", agree: true },
      ],
      reveal: "The failures showed the fix was too narrow, and that changed the method.",
    },
    seen: { slug: "debugassist", note: "Both bugs were traced to the cause the maintainers found, and neither fix passed all of their tests. The page says so." },
  },
  {
    id: "fail-closed",
    title: "Fail closed, then recover.",
    body: "If it can't be confirmed, it doesn't ship. Then re-plan around just what broke.",
    scenario: {
      prompt: "6am. A competitor page your report cites won't load. Ship it?",
      options: [
        { label: "Ship, it was right last night", agree: false },
        { label: "Refuse, then re-plan", agree: true },
      ],
      reveal: "Trust belongs to the moment of action, not the moment of retrieval.",
    },
    seen: { slug: "tira", note: "Nothing is marked done without proof. Done without proof is refused, and the refusal is logged too." },
  },
  {
    id: "people-hard-cases",
    title: "People decide the hard cases.",
    body: "Automate the easy ones so humans can focus on judgement calls.",
    scenario: {
      prompt: "A driver's bank account is shared with 3 strangers. Everything else passes.",
      options: [
        { label: "Auto-reject", agree: false },
        { label: "Send to a person", agree: true },
      ],
      reveal: "It might be fraud, or it might not. A human decides, with the evidence attached.",
    },
    seen: { slug: "agent-kyc", note: "A trust graph flags bank accounts shared between drivers, and those cases go to a person." },
  },
  {
    id: "pay-once",
    title: "Pay for reasoning once.",
    body: "A first failure is worth a model call. A repeat is a lookup.",
    scenario: {
      prompt: "The same error hits your agent for the 40th time. What should it cost?",
      options: [
        { label: "Another model call", agree: false },
        { label: "Zero tokens", agree: true },
      ],
      reveal: "Diagnose each error class once, then resolve repeats by rule.",
    },
  },
  {
    id: "conditions-not-people",
    title: "Fix the conditions, not the people.",
    body: "Ask what let a bug ship, then guard the whole class.",
    scenario: {
      prompt: "A bug shipped. The post-mortem asks who wrote the line.",
      options: [
        { label: "Find the author", agree: false },
        { label: "Find the condition", agree: true },
      ],
      reveal: "One guard test covers every way that kind of bug can happen.",
    },
    seen: { slug: "debugassist", note: "Each fix comes with the conditions that let the bug ship, and a guard for the whole bug class." },
  },
];
