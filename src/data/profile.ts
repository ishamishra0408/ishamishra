// Every fact here comes from the October 2026 résumé (IM Resume - Oct26.pdf), except the
// "AI systems" skills, which also draw on the GitHub project READMEs. `wins` are short tiles for
// the home page; `resume` holds the full bullets for the /resume page and PDF.
// The phone number on the PDF is deliberately never used anywhere on the site.

export const profile = {
  name: "Isha Mishra",
  title: "Senior Software Engineer",
  location: "San Francisco, CA",
  yearsExperience: 5,
  tagline: "I build AI agents you can trust.",
  proof: "5 years of backend work at Oracle, WNS and two startups. Now building AI agents with checks that stop mistakes before they reach people.",
  summary:
    "Senior software engineer with 5 years of backend and platform experience across Oracle, WNS and startups, now building retrieval systems and AI agents with deterministic guardrails.",
  workAuth: "Work authorized for 3 years (STEM OPT)",
  /** Current status, as Isha gave it (Nov 2026). */
  now: { role: "Data Fellow", org: "Chicago Education Advocacy Cooperative" },
  seeking: { role: "Senior Software Engineer", where: "Bay Area, CA" },
  email: "ishamishra041996@gmail.com",
  links: {
    github: "https://github.com/ishamishra0408",
    linkedin: "https://linkedin.com/in/ishamishracalifornia",
  },
  githubUser: "ishamishra0408",
};

/** Three headline numbers, each straight from a résumé bullet. */
export const highlights = [
  { metric: "0.88", label: "context recall on construction plans, up from 0.68", where: "Quotr" },
  { metric: "~80k", label: "orders allocated a month", where: "LetsTransport" },
  { metric: "~1.4x", label: "Monte Carlo analysis throughput", where: "Oracle" },
];

export type Role = {
  id: string;
  company: string;
  companyFull: string;
  role: string;
  place: string;
  start: string;
  end: string;
  context: string;
  headline: string;
  wins: { metric: string; label: string }[];
  resume: string[];
  stack: string[];
  /** The company's own logo (public/logos), drawn white in the strip under the hero. Size is display px.
   *  `withName` adds the name beside it when the logo is a mark only. */
  logo: { src: string; width: number; height: number; withName?: boolean };
};

export const roles: Role[] = [
  {
    id: "quotr",
    logo: { src: "/logos/quotr.svg", width: 84, height: 26 },
    company: "Quotr",
    companyFull: "Quotr",
    role: "AI Engineer Intern",
    place: "Berkeley, CA",
    start: "Nov 2025",
    end: "Mar 2026",
    context: "Construction estimation and procurement platform for GCs, backed by Berkeley SkyDeck; seed startup (raised $4M)",
    headline: "Made construction plans searchable.",
    wins: [
      { metric: "0.88", label: "context recall, from 0.68" },
      { metric: "0.84", label: "precision@10, from 0.61" },
    ],
    resume: [
      "Built hybrid retrieval for construction plans, using OCR on PDF drawings, metadata-based chunking by sheet, trade and system hierarchy, and FAISS + BM25 hybrid search, improving context recall from 0.68 to 0.88.",
      "Built precision-ranking for estimator review, using confidence scoring on retrieved chunks, metadata-based deduplication, and top-k reranking to improve context precision@10 from 0.61 to 0.84.",
    ],
    stack: ["OCR", "FAISS", "BM25", "Reranking"],
  },
  {
    id: "letstransport",
    logo: { src: "/logos/letstransport.svg", width: 22, height: 26, withName: true },
    company: "LetsTransport",
    companyFull: "LetsTransport",
    role: "Senior Software Engineer",
    place: "Bangalore, India",
    start: "Jul 2022",
    end: "Nov 2023",
    context: "End-to-end logistics services for enterprises, e-commerce and retail; Series E startup (raised $84M)",
    headline: "Verified drivers fast and matched orders at scale.",
    wins: [
      { metric: "~80k", label: "orders allocated a month" },
      { metric: "< 24 hr", label: "p90 driver onboarding" },
    ],
    resume: [
      "Built a driver verification triage workflow, using an OPA/Rego decision contract and RabbitMQ notifications to drivers, routing missing or low-confidence cases for human review, to achieve p90 onboarding TAT under 24 hours.",
      "Integrated MongoDB with Elasticsearch via Monstache for near real-time sync, keeping MongoDB as the single write path and ES as a secondary search index for a selected query set, bringing query latency under 300 ms.",
      "Built a replica-read path for the driver-allocation service to cut latency during dispatch peaks, moving geospatial reads off the primary DB to a same-AZ replica, capping and pooling connections per pod, and guarding reads with a replica-lag threshold, to reduce p99 latency under 400 ms.",
      "Built the allocation matching engine, filtering drivers on vehicle type, capacity and availability, selecting a scored pool, and broadcasting concurrently with atomic first-acceptance, to allocate ~80k orders a month.",
    ],
    stack: ["OPA / Rego", "RabbitMQ", "MongoDB", "Elasticsearch"],
  },
  {
    id: "wns",
    logo: { src: "/logos/wns.png", width: 58, height: 30 },
    company: "WNS",
    companyFull: "WNS Global Services",
    role: "Senior Software Engineer",
    place: "Bangalore, India",
    start: "Aug 2021",
    end: "Jun 2022",
    context: "Customer Insights Platform, BFSI vertical",
    headline: "Led a self-serve customer insights platform.",
    wins: [
      { metric: "40%", label: "less reporting effort" },
      { metric: "7 → 2", label: "days release lead time" },
    ],
    resume: [
      "Led end-to-end development of a self-serve customer insights platform for BFSI business users with Spring Boot and Angular, replacing manual report preparation and cutting reporting effort by 40%.",
      "Architected and optimized RESTful APIs, reducing average response time by 30% across multiple client-facing applications.",
      "Built automated build-and-deploy pipelines with Jenkins and Docker, containerising services into versioned images and gating releases on automated tests, to cut release lead time from 7 days to 2.",
    ],
    stack: ["Spring Boot", "Angular", "Jenkins", "Docker"],
  },
  {
    id: "oracle",
    logo: { src: "/logos/oracle.svg", width: 123, height: 16 },
    company: "Oracle",
    companyFull: "Oracle",
    role: "Senior Software Engineer",
    place: "Bangalore, India",
    start: "Jan 2019",
    end: "Aug 2021",
    context: "Oracle Primavera Cloud risk engine for F500 Construction & Engineering (fast-track promotion in 15 months)",
    headline: "Scaled the Monte Carlo risk engine.",
    wins: [
      { metric: "~1.4x", label: "analysis throughput" },
      { metric: "15 mo", label: "to fast-track promotion" },
    ],
    resume: [
      "Built weather-data idempotent import in the risk register with Kafka, keying versioned upserts on riskID and reconciling row counts on every run, favouring correctness over freshness, to keep p95 register sync lag under 10 minutes.",
      "Built the Monte Carlo rollout for risk simulation, distributing per-worker seeding for reproducible sampling and reducing results without shared mutable state, to batch-schedule ~10k activities at ~10k runs per analysis.",
      "Built qualitative risk matrices, computing pre- and post-response scores against probability and impact thresholds and normalising scores for program-level rollup, with zero gaps or double counting per program.",
      "Parallelized the Monte Carlo risk engine by chunking iterations across threads, seeding each iteration and merging per-thread results, achieving ~1.4x analysis throughput with results identical to sequential runs.",
      "Designed and implemented the weather rules engine in the Risk Module: definitions and validation, mapping weather events to non-working days, and configs by region and season.",
    ],
    stack: ["Kafka", "Monte Carlo simulation", "Rules engines"],
  },
];

export const education = [
  { school: "Westcliff University, San Francisco", degree: "M.S. Computer Science", years: "2024 – 2026", note: "GPA 4.0 / 4" },
  {
    school: "Vellore Institute of Technology (VIT), India",
    degree: "B.Tech, Electrical, Electronics & Communication Engineering",
    years: "2015 – 2019",
    note: "GPA 3.83 / 4",
  },
];

export const skills: Record<string, string[]> = {
  Languages: ["Java", "JavaScript", "TypeScript", "Python", "Kotlin", "C++"],
  Technologies: ["Zookeeper", "Kafka", "Redis", "Jenkins", "Docker", "Kubernetes", "GCP", "MongoDB", "Postgres", "Oracle DB"],
  Frameworks: ["Spring Boot", "Node.js", "NestJS", "JUnit", "Angular", "REST", "SOAP", "FastAPI", "GraphQL", "Integration"],
  "AI systems": ["RAG", "FAISS", "BM25", "OCR", "MCP", "OPA / Rego", "Evals"],
};
