import type { Project, SecondaryProject } from "./types";

/**
 * Featured work, ordered by depth of the engineering rather than recency.
 *
 * Every figure in `metrics` and `impact` is a measured number from the shipped
 * system. Where a number does not exist, the sentence does not claim one.
 */
export const projects: Project[] = [
  {
    slug: "shramik-sathi",
    name: "Shramik Sathi",
    tagline: "Multi-tenant workforce compliance, built to survive a labour inspection",
    summary:
      "A statutory compliance platform that turns attendance into legally-defensible payroll for 600+ users — and refuses to produce a run that would break the law.",
    period: "March 2026 — Present",
    role: "Founding Engineer",
    stack: [
      "TypeScript",
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Prisma",
      "BullMQ",
      "Redis",
      "Next.js",
      "AWS EC2",
      "Docker",
      "Jest",
    ],
    live: "https://shramiksathi.com/",
    architecture: "shramik-sathi",
    metrics: [
      { value: "600+", label: "users" },
      { value: "224", label: "REST APIs" },
      { value: "66", label: "tables" },
      { value: "2,152", label: "tests / 77% stmts" },
    ],
    problem: [
      "Indian labour law requires an employer to keep a muster roll, a wage register and a grievance trail, and to produce them on demand when an inspector asks. Most small and mid-size contractors keep these in paper ledgers or in a spreadsheet that one person owns. When an inspection happens, the records either do not reconcile or do not exist.",
      'The work was not "build a payroll app". It was: make the correct record the easiest record to produce, make it impossible to generate an illegal one, and prove after the fact that nobody quietly edited history.',
    ],
    constraints: [
      "Statutory output format is fixed. 11 registers have a legally-prescribed shape — the schema has to serve the form, not the other way round.",
      "Two hard legal ceilings: total deductions may not exceed 50% of wages (Payment of Wages Act) and basic pay may not fall below 50% of the total (Code on Wages). These are not warnings.",
      "Multi-tenant from day one. One contractor must never see another's roll, and a bug in a query must not be the only thing standing between them.",
      'Audit trail must be non-repudiable — an inspector\'s question is "who changed this, and when", not "what does it say now".',
      "Single founding engineer, early-stage budget. No managed queue, no managed cache, no observability vendor.",
    ],
    approach: [
      {
        heading: "Model the statute, not the convenience",
        body: [
          "The 66-table PostgreSQL schema on Prisma is normalised around the legal entities — establishment, contractor, worker, attendance period, wage component, deduction, register — rather than around the screens. 51 Next.js screens read from that model; none of them own state.",
          "224 REST APIs sit on Express and TypeScript. The API surface is wide because the domain is wide: each statutory register, each wage component and each approval transition is an explicit endpoint rather than an overloaded generic mutation. That is a deliberate trade — see below.",
        ],
      },
      {
        heading: "Make illegal states unrepresentable at run time",
        body: [
          "The payroll engine converts attendance into wages across PF, ESI, professional tax, overtime, fines and arrears. Before a run is allowed to commit, it is checked against the two statutory ceilings: if total deductions would breach the 50% cap, or basic pay would fall under the 50% floor, the run is blocked rather than flagged.",
          "This matters more than it sounds. A warning gets clicked through under deadline pressure. A block does not. The engine produces 11 inspector-ready registers, and the guarantee is that every register it has ever produced was legal at the moment it was produced.",
        ],
      },
      {
        heading: "Move the slow, failure-prone work off the request path",
        body: [
          "Payroll runs, exports and PDF generation are asynchronous jobs on BullMQ backed by Redis. The HTTP layer accepts, enqueues and returns; a dedicated worker container does the work.",
          "PDF rendering was the specific failure. Payslips were rendered by launching a headless Chromium per document — for a 200-worker establishment that is 200 process launches in one run, and it reliably hit render timeouts. Replacing per-document launches with a pooled browser instance took that to a single launch per payslip run and the timeouts stopped.",
        ],
      },
      {
        heading: "Defence in depth on tenancy and identity",
        body: [
          "Access control is layered rather than trusted to one check: JWT rotation with token-family revocation so a stolen refresh token invalidates its whole lineage; tenant-scoped middleware that constrains the query before a handler runs; and a 7-role RBAC model with scoping so a role means different things in different establishments.",
          'History is append-only. Records are never updated destructively — the audit log is the source of truth for "who changed what", which is precisely the question an inspection asks.',
          "This is the part of the system that is verified rather than assumed: 2,152 Jest tests across 37 suites hold 77% statement coverage, weighted towards the payroll maths and the authorisation boundary.",
        ],
      },
      {
        heading: "Deploy small, deliberately",
        body: [
          "The whole system runs on a single AWS EC2 host as a 5-container Docker Compose stack — Nginx, API, web, worker and Redis — with RDS for PostgreSQL and S3 for generated documents.",
          "Redis is co-located on the box rather than run as managed ElastiCache. At this scale the queue is not the bottleneck and the durability requirement is weak: a lost job is re-runnable from the attendance data, which lives in RDS. That saves ₹1,320/month, which at an early stage is a real number.",
        ],
      },
    ],
    tradeoffs: [
      {
        heading: "224 endpoints instead of a generic API",
        body: [
          "A narrower, more generic surface would have been less code. I chose explicitness because in a compliance domain the endpoint name is documentation — an approve-wage-run endpoint has an auditable meaning that a generic resource PATCH does not, and authorisation rules attach cleanly to specific transitions.",
          "The cost is real: 224 endpoints is a lot of surface to keep consistent, and it is the main reason the test count is as high as it is.",
        ],
      },
      {
        heading: "Co-located Redis over managed ElastiCache",
        body: [
          "Saving ₹1,320/month means accepting that a host failure takes the queue with it, and that the queue competes with the API for the same memory and CPU.",
          "That is acceptable here specifically because jobs are idempotent and re-derivable from RDS. If the queue ever held the only copy of something, this would be the wrong call and I would move it.",
        ],
      },
      {
        heading: "Blocking runs rather than warning on them",
        body: [
          'Hard-blocking a payroll run is an aggressive product decision — it means the system can tell a business owner "no" at the worst possible moment.',
          "I took it because the alternative is generating a document that becomes evidence against the user in an inspection. A blocked run is an inconvenience; an illegal register is a liability.",
        ],
      },
    ],
    retrospective: [
      "Pooling Chromium fixed the symptom, not the cause. A browser is a heavy, stateful dependency to have on the critical path of a legally-required document. Given the time I would render the statutory registers with a typed PDF writer against the fixed statutory layouts and remove Chromium from the payslip path entirely — the layouts are prescribed and do not need a rendering engine.",
      "The schema grew around the 11 register shapes. That got the compliance output right quickly, but it means adding a twelfth register touches more of the model than it should. I would extract register generation into a declarative spec — columns, sources and aggregations as data — so a new statutory form is a definition rather than a migration.",
      "Tenant isolation is enforced in middleware. It works, and the tests cover it, but it is still application-layer enforcement. PostgreSQL row-level security would put the boundary in the database, where a missed WHERE clause cannot bypass it. That is the change I would most want to make before the next order of magnitude of users.",
    ],
    impact: [
      "600+ users operating on digitised muster roll, wage register and grievance records.",
      "11 statutory registers generated in inspector-ready form; no run can be committed that breaches the 50% deduction cap or the 50% basic-pay floor.",
      "Payslip rendering reduced from 200 Chromium launches per run to 1, eliminating render timeouts.",
      "₹1,320/month of managed-cache spend removed by co-locating the queue.",
      "2,152 Jest tests at 77% statement coverage across 37 suites.",
    ],
  },

  {
    slug: "supportpilot",
    name: "SupportPilot",
    tagline: "An agentic support platform built on the assumption the model will be wrong",
    summary:
      "A multi-tenant AI support platform where a 15-node LangGraph pipeline can retrieve, reason and recommend — but cannot issue a refund the backend has not already authorised.",
    period: "Personal project",
    role: "Sole engineer",
    stack: [
      "Python",
      "FastAPI",
      "LangGraph",
      "PostgreSQL",
      "pgvector",
      "Redis",
      "WebSockets",
      "Next.js",
      "Docker",
    ],
    live: "https://support-pilot-lovat.vercel.app/",
    repo: "https://github.com/sundram7865/SupportPilot",
    architecture: "supportpilot",
    metrics: [
      { value: "15", label: "node agent graph" },
      { value: "100%", label: "context precision" },
      { value: "5", label: "guardrail layers" },
      { value: "500+", label: "automated tests" },
    ],
    problem: [
      "An AI support agent that can only answer questions is a search box. An agent that can act — issue a refund, change an order, escalate — is useful, and is also a system where a confident hallucination becomes a financial event.",
      "The interesting problem is not making the model good. It is designing the surrounding system so that the model being wrong, or being deliberately manipulated by the customer it is talking to, stays contained.",
    ],
    constraints: [
      "The untrusted input is the conversation itself. A support channel is an open prompt-injection surface by definition — the attacker is the user you are obliged to serve.",
      "Agent runs are long and multi-step, so a process restart mid-run must not lose or duplicate the work.",
      "Multi-tenant: retrieval must never cross a tenant boundary, including through the vector index.",
      "Support is real-time. Message delivery has to survive reconnects without gaps or repeats.",
      "Personal project — infrastructure that bills while idle was not acceptable.",
    ],
    approach: [
      {
        heading: "A graph, not a prompt",
        body: [
          "The agent is a 15-node LangGraph pipeline rather than one large prompt: classification, risk detection, retrieval, groundedness checking and policy decisions are separate nodes with separate contracts.",
          "The important word is deterministic. Policy decisions are not asked of the model — the model produces a recommendation, and a deterministic node decides. That means the same case produces the same outcome regardless of sampling.",
          "Runs are checkpointed to PostgreSQL, so a run interrupted by a deploy resumes from its last completed node instead of restarting and re-executing side effects.",
        ],
      },
      {
        heading: "Five layers of guardrail, because one is a single point of failure",
        body: [
          "Prompt-injection sanitisation on the way in; groundedness checks that test whether an answer is actually supported by retrieved context; a backend tool gateway that mediates every action; human-in-the-loop approval for the cases risk detection flags; and server-side refund bounds.",
          "The refund bound is the clearest statement of the design: the maximum refund is enforced in the backend, not in the prompt. An agent that has been fully talked into issuing a large refund still cannot issue one, because the number is checked somewhere the conversation cannot reach.",
        ],
      },
      {
        heading: "Retrieval that is measured, not assumed",
        body: [
          "RAG search runs over a 19-table PostgreSQL schema with pgvector, scoped by tenant and by RBAC.",
          "Retrieval quality is evaluated with RAGAS rather than judged by eye: 100% context precision, 97% context recall and 93% answer relevancy. Groundedness checking downstream depends on retrieval actually being right, so this number is load-bearing.",
        ],
      },
      {
        heading: "Real-time messaging with no gaps",
        body: [
          "80 REST and WebSocket endpoints carry the product. Delivery is zero-loss by construction: clients hold a monotonic cursor and replay from it on reconnect, so a dropped socket resumes exactly where it left off rather than guessing.",
          "Circuit breakers isolate a failing downstream instead of letting it saturate the pool, and anything that cannot be delivered lands in a dead-letter path rather than disappearing. 500+ automated tests cover the pipeline and the delivery guarantees.",
        ],
      },
    ],
    tradeoffs: [
      {
        heading: "Cron-driven jobs instead of Celery",
        body: [
          "The original design used Celery. A Celery worker is a process that costs money continuously whether or not there is work, and on a personal project that idle cost dominated everything else. Replacing it with cron-driven jobs removed always-on infrastructure entirely.",
          "What I gave up is backpressure. A queue tells you how deep it is; cron tells you nothing. At this volume that is fine, but the moment ingest becomes bursty the cron design stops being able to tell me it is behind — and that is a monitoring blind spot, not just a throughput one.",
        ],
      },
      {
        heading: "Deterministic policy over model judgement",
        body: [
          "Letting the model decide policy would handle edge cases more gracefully and need far less code.",
          'I chose deterministic decisions because support actions are financial and auditable. A system that produces different outcomes for identical inputs cannot be reasoned about after the fact, and "the model decided" is not an answer anyone accepts in a dispute.',
        ],
      },
      {
        heading: "15 nodes is more surface than one prompt",
        body: [
          "A decomposed graph costs latency at each hop and is meaningfully more code to maintain than a single well-written prompt.",
          "It buys the ability to test and measure each stage independently — which is what makes the 500+ test suite possible at all. A monolithic prompt can only be evaluated end to end.",
        ],
      },
    ],
    retrospective: [
      "The five guardrail layers are independent, which is good, but their failure signals are not aggregated anywhere. Today a blocked injection attempt and a failed groundedness check look like unrelated events. I would emit both into one security timeline per conversation — the pattern across layers is far more informative than any single layer's verdict.",
      "Checkpointing to PostgreSQL makes runs resumable but also makes the run table the hottest write path in the system. I would move checkpoints for completed runs out to cheaper storage and keep only in-flight state hot.",
      "Retrieval is measured with RAGAS on a fixed evaluation set. That validates the pipeline, but it does not catch drift once real tickets stop looking like the set. I would sample production retrievals back into the evaluation loop so the metric stays honest over time.",
    ],
    impact: [
      "80 REST and WebSocket APIs over a 19-table PostgreSQL schema with tenant-scoped RBAC.",
      "RAG retrieval at 100% context precision, 97% recall and 93% answer relevancy, measured with RAGAS.",
      "15-node LangGraph pipeline with PostgreSQL checkpointing for resumable runs.",
      "Zero-loss WebSocket delivery via monotonic cursor replay, circuit breakers and dead-lettering.",
      "Always-on infrastructure cost eliminated by replacing Celery with cron-driven jobs.",
      "500+ automated tests.",
    ],
  },

  {
    slug: "agentlens",
    name: "AgentLens",
    tagline: "LLM observability where the ingestion path is the hard part",
    summary:
      "A distributed tracing platform for LLM agents that adds 29 µs at p99, sustains 744 events/s with zero loss, and never double-counts a trace across a worker restart.",
    period: "Personal project",
    role: "Sole engineer",
    stack: [
      "Python",
      "FastAPI",
      "Redis Streams",
      "PostgreSQL",
      "Next.js",
      "TypeScript",
      "Docker",
      "GitHub Actions",
    ],
    live: "https://agentt-lovat.vercel.app/",
    repo: "https://github.com/sundram7865/AgentLens-Platform",
    architecture: "agentlens",
    metrics: [
      { value: "29 µs", label: "p99 added latency" },
      { value: "744/s", label: "events sustained" },
      { value: "0", label: "events lost" },
      { value: "312", label: "tests in CI" },
    ],
    problem: [
      "An LLM agent that fails in production fails invisibly. There is no stack trace for a model that retrieved the wrong document, or a graph that took a branch nobody expected — the run simply produces a bad answer and exits successfully.",
      "Making that visible means instrumenting the agent, and instrumentation has a hard constraint most observability write-ups skip: the tracing path is now inside the latency budget of the thing it is watching. If it is slow, it changes the behaviour it is supposed to measure. If it drops events, the trace is a lie.",
    ],
    constraints: [
      "Added latency has to be small enough to be irrelevant to the host application, measured at the tail rather than the mean.",
      "Transport is at-least-once. Redis Streams with consumer groups will redeliver on restart — so duplicates are guaranteed, not hypothetical.",
      "Workers get restarted: deploys, scaling, OOM. A restart must not lose in-flight events or duplicate persisted ones.",
      "Traces carry whatever the agent saw, which means they carry PII and untrusted model input by default.",
      "LLM-as-judge evaluation costs money per call, and a runaway evaluator on a multi-tenant system is an unbounded bill.",
    ],
    approach: [
      {
        heading: "Get off the caller's thread immediately",
        body: [
          "The SDK instruments LangChain and LangGraph agents and streams traces into Redis Streams. The only work on the application's thread is the enqueue — everything else happens in consumers.",
          "Measured at the tail, that costs 29 µs at p99 while sustaining 744 events/s. The p99 figure is the one that matters: a mean would hide exactly the stalls that would make this unusable.",
          "Three consumer groups read the same stream independently — ingestion, evaluation and guardrail processing — so a slow evaluator cannot block trace persistence.",
        ],
      },
      {
        heading: "Treat duplicates as normal operation",
        body: [
          "At-least-once delivery means the system will see the same event twice, and the correct response is to make that boring rather than to try to prevent it.",
          "Ingestion is idempotent end to end: unique constraints in PostgreSQL define what identity means, ON CONFLICT upserts make a replay a no-op rather than an error, dead-letter queues capture what genuinely cannot be processed, and SIGTERM draining lets a worker finish in-flight messages before it exits.",
          "The result is that a worker restart or a redeploy — the two most common causes of redelivery — produce no duplicate rows and no lost events.",
        ],
      },
      {
        heading: "Assume the payload is hostile",
        body: [
          "Traces are exactly where PII and prompt-injection attempts end up, because they record what the model was actually given.",
          "Guardrails run checksum-validated PII and prompt-injection detection over ingested traces at 100% recall with 0% false positives on the evaluation set. Recall is the metric that was optimised: in this context a missed detection writes sensitive data to durable storage, while a false positive only costs a redaction.",
          "Access is JWT/OIDC with Argon2id password hashing and RBAC over tenants.",
        ],
      },
      {
        heading: "Bound the cost of evaluation",
        body: [
          "Quality scoring uses a batched LLM-as-judge evaluator. Batching amortises the per-call overhead, and per-tenant budget caps mean one tenant's traffic spike cannot consume another's evaluation budget or produce an unbounded bill.",
          "312 tests run on every push through GitHub Actions, covering the idempotency guarantees specifically — those are the properties most likely to silently regress.",
        ],
      },
    ],
    tradeoffs: [
      {
        heading: "Redis Streams instead of Kafka",
        body: [
          "Kafka is the obvious answer for an append-only event log and gives durable, disk-backed retention. Redis Streams gave me consumer groups, at-least-once delivery and acknowledgement semantics with a fraction of the operational weight, on infrastructure already present.",
          "The cost is that retention is memory-bound. Stream trimming is not a tuning knob here — it is a data-retention policy, and at 744 events/s a consumer that falls far enough behind turns trimming into data loss.",
        ],
      },
      {
        heading: "Idempotency in the database, not the transport",
        body: [
          "I could have chased exactly-once semantics at the transport layer. Instead the database defines identity and absorbs replays through unique constraints and ON CONFLICT.",
          "That pushes load onto PostgreSQL and means every event pays an index cost on write. In exchange the correctness argument is simple enough to test — and 312 CI tests can actually assert it.",
        ],
      },
      {
        heading: "Optimising guardrails for recall",
        body: [
          "Tuning for 100% recall usually means accepting false positives. On this evaluation set it did not, but the tuning target was chosen knowing it might.",
          "The asymmetry justifies it: a false negative persists PII into durable storage where it is expensive to unwind. A false positive redacts something that did not need redacting.",
        ],
      },
    ],
    retrospective: [
      "Retention is the weakest part of the design. Memory-bound streams mean the system's worst failure mode is quiet — a lagging consumer plus trimming loses data without an error anywhere. I would tier cold traces to object storage behind the same read API, so retention stops being a memory budget, and alert on consumer lag as a first-class signal rather than a dashboard number.",
      "The three consumer groups are independent but share one Redis instance, so they share a failure domain. That undercuts part of the point of separating them. Splitting evaluation onto its own instance would make the isolation real rather than logical.",
      "Guardrail accuracy is reported against a fixed evaluation set. 100% recall on a static set is a weaker claim than it sounds, because prompt-injection technique moves. I would want an adversarial set that gets updated, and I would report the metric with its set version attached.",
    ],
    impact: [
      "29 µs p99 added latency at 744 events/s sustained, with zero event loss.",
      "Idempotent ingestion over at-least-once delivery — no duplicates across worker restarts or redeploys.",
      "PII and prompt-injection guardrails at 100% recall and 0% false positives on the evaluation set.",
      "JWT/OIDC, Argon2id and tenant RBAC across the platform.",
      "Batched LLM-as-judge evaluation with per-tenant budget caps.",
      "312 tests running in GitHub Actions CI.",
    ],
  },
];

/**
 * Earlier work. Kept deliberately short — these are listed for completeness,
 * not argued for. A link is omitted where a working one does not exist, rather
 * than pointed at a profile page.
 */
export const secondaryProjects: SecondaryProject[] = [
  {
    name: "FinFlowAI",
    summary:
      "AI financial assistant that parses bank statements, extracts transactions and answers natural-language questions over them.",
    stack: ["Python", "FastAPI", "PostgreSQL", "LangGraph", "RAG"],
    live: "https://fin-flow-ai-tau.vercel.app/dashboard",
    repo: "https://github.com/sundram7865/finflowai",
  },
  {
    name: "ZapAI",
    summary:
      "PERN SaaS platform with AI article generation, resume analysis and image processing, behind authentication and subscription gating.",
    stack: ["PostgreSQL", "Express", "React", "Node.js", "Gemini API"],
    live: "https://zap-ai.vercel.app",
    repo: "https://github.com/sundram7865/zapai",
  },
  {
    name: "MetroNova",
    summary: "Real-estate platform with a Prisma/PostgreSQL backend and role-based access control.",
    stack: ["Next.js", "Prisma", "PostgreSQL", "AWS S3"],
    live: "https://metro-nova.vercel.app/",
  },
  {
    name: "Doclino CMS",
    summary:
      "Clinic management system with separate patient, doctor and admin roles, appointment booking and payment integration.",
    stack: ["MongoDB", "Express", "React", "Node.js"],
    repo: "https://github.com/sundram7865/CMS",
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);
