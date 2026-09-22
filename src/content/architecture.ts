import type { Architecture } from "./types";

/**
 * Topologies for the 3D architecture explorer.
 *
 * These are the real shapes of the systems, not illustrations. Positions are
 * hand-placed in scene units rather than force-directed: a layout you can read
 * beats one that is technically optimal and lands differently every load.
 *
 * Convention: +x is the direction of flow, +y is tier, +z is depth.
 */
export const architectures: Architecture[] = [
  {
    id: "shramik-sathi",
    project: "Shramik Sathi",
    title: "Single-host deployment topology",
    caption:
      "Five containers on one EC2 instance. The request path stays synchronous; payroll, exports and PDF rendering are pushed onto a queue the same box hosts.",
    nodes: [
      {
        id: "browser",
        label: "Browser",
        kind: "client",
        position: [-7.4, 0, 0],
        detail: "Contractors, supervisors and administrators across 7 scoped roles.",
      },
      {
        id: "nginx",
        label: "Nginx",
        kind: "edge",
        position: [-4.6, 0, 0],
        detail: "TLS termination and reverse proxy. Container 1 of 5.",
      },
      {
        id: "web",
        label: "Next.js web",
        kind: "service",
        position: [-1.8, 2.0, -0.9],
        detail: "51 screens. Holds no state of its own; every view reads through the API.",
        metric: "51 screens",
      },
      {
        id: "api",
        label: "Express API",
        kind: "service",
        position: [-1.8, -0.2, 0.9],
        detail:
          "224 REST endpoints in TypeScript. Tenant-scoped middleware constrains the query before any handler runs.",
        metric: "224 APIs",
      },
      {
        id: "redis",
        label: "Redis / BullMQ",
        kind: "queue",
        position: [1.2, -1.9, 0.4],
        detail:
          "Co-located rather than managed ElastiCache. Jobs are idempotent and re-derivable from RDS, so the weaker durability is affordable.",
        metric: "₹1,320/mo saved",
      },
      {
        id: "worker",
        label: "Worker",
        kind: "worker",
        position: [4.0, -1.9, 0.4],
        detail: "Runs payroll, exports and document generation off the request path. Container 4 of 5.",
      },
      {
        id: "chromium",
        label: "Chromium pool",
        kind: "worker",
        position: [6.6, -0.4, -1.0],
        detail:
          "Pooled instead of launched per document. 200 launches per payslip run became 1, and render timeouts stopped.",
        metric: "200 → 1",
      },
      {
        id: "payroll",
        label: "Payroll engine",
        kind: "guard",
        position: [1.4, 1.4, -1.4],
        detail:
          "PF, ESI, professional tax, overtime, fines and arrears. Blocks any run breaching the 50% deduction cap or the 50% basic-pay floor.",
        metric: "11 registers",
      },
      {
        id: "rds",
        label: "RDS PostgreSQL",
        kind: "datastore",
        position: [4.2, 1.6, 1.2],
        detail: "66 tables through Prisma, modelled on the statutory entities. Writes are append-only.",
        metric: "66 tables",
      },
      {
        id: "s3",
        label: "S3",
        kind: "storage",
        position: [7.4, -2.4, 0.8],
        detail: "Generated payslips and statutory registers, kept out of the application's disk.",
      },
    ],
    edges: [
      { from: "browser", to: "nginx", kind: "sync" },
      { from: "nginx", to: "web", kind: "sync" },
      { from: "nginx", to: "api", kind: "sync" },
      { from: "web", to: "api", kind: "sync" },
      { from: "api", to: "payroll", kind: "sync" },
      { from: "payroll", to: "rds", kind: "data" },
      { from: "api", to: "redis", kind: "async", label: "enqueue" },
      { from: "redis", to: "worker", kind: "async", label: "consume" },
      { from: "worker", to: "chromium", kind: "async", label: "render" },
      { from: "chromium", to: "s3", kind: "data" },
      { from: "worker", to: "rds", kind: "data" },
      { from: "api", to: "rds", kind: "data" },
    ],
  },

  {
    id: "agentlens",
    project: "AgentLens",
    title: "Trace ingestion path",
    caption:
      "The tracing path sits inside the host application's latency budget, so the only synchronous work is the enqueue. Everything after it is at-least-once, and the database decides identity.",
    nodes: [
      {
        id: "sdk",
        label: "Agent SDK",
        kind: "external",
        position: [-7.6, 0.4, 0],
        detail: "Instruments LangChain and LangGraph agents in the host process.",
        metric: "29 µs p99",
      },
      {
        id: "ingest",
        label: "FastAPI ingest",
        kind: "service",
        position: [-4.4, 0.4, 0],
        detail: "Accepts and enqueues. Nothing else happens on the caller's thread.",
      },
      {
        id: "stream",
        label: "Redis Streams",
        kind: "queue",
        position: [-1.4, 0.4, 0],
        detail:
          "Consumer groups and at-least-once delivery without Kafka's operational weight. Retention is memory-bound, which makes trimming a data policy.",
        metric: "744 events/s",
      },
      {
        id: "cg-ingest",
        label: "Ingestion group",
        kind: "worker",
        position: [1.8, 2.4, -0.4],
        detail: "Persists traces. SIGTERM draining lets in-flight messages finish before exit.",
      },
      {
        id: "cg-eval",
        label: "Evaluation group",
        kind: "worker",
        position: [1.8, 0.2, 1.4],
        detail:
          "Batched LLM-as-judge scoring behind per-tenant budget caps, so one tenant cannot consume another's budget.",
      },
      {
        id: "cg-guard",
        label: "Guardrail group",
        kind: "guard",
        position: [1.8, -2.2, -0.4],
        detail:
          "Checksum-validated PII and prompt-injection detection. Tuned for recall: a miss writes sensitive data to durable storage.",
        metric: "100% recall",
      },
      {
        id: "pg",
        label: "PostgreSQL",
        kind: "datastore",
        position: [5.4, 1.4, 0.2],
        detail:
          "Unique constraints define identity and ON CONFLICT upserts absorb replays, so redelivery is a no-op rather than a duplicate.",
        metric: "0 duplicates",
      },
      {
        id: "judge",
        label: "LLM judge",
        kind: "external",
        position: [5.4, -0.6, 1.8],
        detail: "Called in batches to amortise per-request overhead.",
      },
      {
        id: "dlq",
        label: "Dead letter",
        kind: "queue",
        position: [5.4, -2.6, -0.6],
        detail: "Anything genuinely unprocessable is captured rather than dropped silently.",
      },
    ],
    edges: [
      { from: "sdk", to: "ingest", kind: "sync", label: "enqueue" },
      { from: "ingest", to: "stream", kind: "async", label: "XADD" },
      { from: "stream", to: "cg-ingest", kind: "async" },
      { from: "stream", to: "cg-eval", kind: "async" },
      { from: "stream", to: "cg-guard", kind: "async" },
      { from: "cg-ingest", to: "pg", kind: "data", label: "upsert" },
      { from: "cg-guard", to: "pg", kind: "data" },
      { from: "cg-eval", to: "judge", kind: "sync", label: "batched" },
      { from: "cg-ingest", to: "dlq", kind: "async" },
      { from: "cg-guard", to: "dlq", kind: "async" },
    ],
  },

  {
    id: "supportpilot",
    project: "SupportPilot",
    title: "Agent pipeline and guardrails",
    caption:
      "A 15-node graph, shown here as its decision path. The model recommends; a deterministic node decides; and the actions it can take are bounded server-side, outside the conversation.",
    nodes: [
      {
        id: "customer",
        label: "Customer",
        kind: "client",
        position: [-7.8, 0.2, 0],
        detail: "Untrusted input by definition: the attacker is the user you are obliged to serve.",
      },
      {
        id: "ws",
        label: "WebSocket gateway",
        kind: "edge",
        position: [-5.2, 0.2, 0],
        detail:
          "Clients hold a monotonic cursor and replay from it on reconnect, so a dropped socket resumes without gaps or repeats.",
      },
      {
        id: "sanitize",
        label: "Sanitisation",
        kind: "guard",
        position: [-2.8, 2.0, -0.4],
        detail: "Layer 1 of 5. Prompt-injection sanitisation before anything reaches the model.",
      },
      {
        id: "classify",
        label: "Classification",
        kind: "service",
        position: [-0.6, 2.0, 0.9],
        detail: "Routes the ticket. One node of the 15-node LangGraph pipeline.",
      },
      {
        id: "risk",
        label: "Risk detection",
        kind: "guard",
        position: [1.8, 2.0, -0.4],
        detail: "Layer 4 trigger. Flags cases that require human approval before any action.",
      },
      {
        id: "retrieve",
        label: "RAG retrieval",
        kind: "service",
        position: [-0.6, -0.8, -1.2],
        detail: "Tenant-scoped retrieval over pgvector, measured at 100% context precision with RAGAS.",
        metric: "97% recall",
      },
      {
        id: "pgvector",
        label: "pgvector",
        kind: "datastore",
        position: [-3.0, -2.4, -0.8],
        detail: "19-table PostgreSQL schema. Retrieval never crosses a tenant boundary, including via the index.",
        metric: "19 tables",
      },
      {
        id: "ground",
        label: "Groundedness",
        kind: "guard",
        position: [1.8, -0.8, 0.9],
        detail: "Layer 2. Tests whether the answer is actually supported by what was retrieved.",
      },
      {
        id: "policy",
        label: "Policy decision",
        kind: "service",
        position: [4.2, 0.6, 0],
        detail:
          "Deterministic, not model-decided. Identical inputs produce identical outcomes regardless of sampling.",
      },
      {
        id: "gateway",
        label: "Tool gateway",
        kind: "guard",
        position: [6.6, 2.0, -0.2],
        detail:
          "Layer 3 and 5. Every action is mediated here, and refund bounds are enforced in the backend where the conversation cannot reach them.",
      },
      {
        id: "human",
        label: "Human approval",
        kind: "external",
        position: [6.6, -1.4, 0.8],
        detail: "Layer 4. The escape hatch for anything risk detection flagged.",
      },
      {
        id: "ckpt",
        label: "Checkpointer",
        kind: "datastore",
        position: [4.2, -2.6, -0.8],
        detail:
          "PostgreSQL checkpointing. A run interrupted by a deploy resumes from its last completed node instead of re-executing side effects.",
      },
    ],
    edges: [
      { from: "customer", to: "ws", kind: "sync" },
      { from: "ws", to: "sanitize", kind: "sync" },
      { from: "sanitize", to: "classify", kind: "sync" },
      { from: "classify", to: "risk", kind: "sync" },
      { from: "classify", to: "retrieve", kind: "sync" },
      { from: "retrieve", to: "pgvector", kind: "data" },
      { from: "retrieve", to: "ground", kind: "sync" },
      { from: "risk", to: "policy", kind: "sync" },
      { from: "ground", to: "policy", kind: "sync" },
      { from: "policy", to: "ckpt", kind: "data", label: "checkpoint" },
      { from: "policy", to: "gateway", kind: "sync" },
      { from: "policy", to: "human", kind: "async", label: "escalate" },
      { from: "gateway", to: "ws", kind: "sync", label: "action" },
    ],
  },
];

export const architectureById = (id: string): Architecture | undefined =>
  architectures.find((architecture) => architecture.id === id);
