import type { Experience, Link, Metric, SkillGroup } from "./types";

export const site = {
  name: "Sundram Mishra",
  shortName: "Sundram",
  /** Positioning line. Concrete about the work, not about adjectives. */
  role: "Backend & distributed systems engineer",
  location: "Bengaluru, India",
  email: "mishrasundram091@gmail.com",
  phone: "+91 93347 42924",
  url: "https://port-l7q5.vercel.app",
  resume: "/sundram-mishra-resume.pdf",
  description:
    "Backend engineer working on multi-tenant compliance systems, agentic AI platforms and LLM observability. Founding engineer at Shramik Sathi.",
} as const;

export const socials: Link[] = [
  { label: "GitHub", href: "https://github.com/sundram7865" },
  { label: "LinkedIn", href: "https://linkedin.com/in/sundram1mishra" },
  { label: "LeetCode", href: "https://leetcode.com/u/ripper321" },
  { label: "Email", href: `mailto:${site.email}` },
];

/** Surfaced under the hero. Each one is defended in a case study. */
export const headlineMetrics: Metric[] = [
  {
    value: "600+",
    label: "users on a system I architected",
    detail: "Shramik Sathi, multi-tenant workforce compliance",
  },
  {
    value: "2,152",
    label: "Jest tests at 77% statement coverage",
    detail: "37 suites across the Shramik Sathi backend",
  },
  {
    value: "744/s",
    label: "trace events sustained at zero loss",
    detail: "AgentLens ingestion, 29 µs p99 added latency",
  },
  {
    value: "₹1,320",
    label: "monthly infra cost removed",
    detail: "Co-located the job queue instead of managed ElastiCache",
  },
];

export const experience: Experience[] = [
  {
    company: "Shramik Sathi",
    role: "Founding Engineer",
    period: "March 2026 — Present",
    location: "Remote",
    href: "https://shramiksathi.com/",
    current: true,
    bullets: [
      "Architected and shipped a multi-tenant workforce compliance platform serving 600+ users, digitising the statutory muster roll, wage register and grievance trail across 224 REST APIs, a 66-table PostgreSQL schema on Prisma ORM and 51 Next.js screens.",
      "Implemented the payroll engine converting attendance into wages with PF, ESI, professional tax, overtime, fines and arrears — generating 11 inspector-ready statutory registers and blocking any run that breaches the 50% deduction cap (Payment of Wages Act) or the 50% basic-pay floor (Code on Wages).",
      "Engineered asynchronous payroll, export and PDF processing on BullMQ and Redis, and pooled Chromium instead of launching it per document — cutting 200 launches to 1 per payslip run and eliminating render timeouts.",
      "Secured the backend through JWT rotation with token-family revocation, tenant-scoped middleware, 7-role RBAC with scoping and append-only audit logging, verified by 2,152 Jest tests at 77% statement coverage across 37 suites.",
      "Deployed on AWS EC2 as a 5-container Docker Compose stack (Nginx, API, web, worker, Redis) with RDS PostgreSQL and S3, co-locating the job queue to save ₹1,320/month versus managed ElastiCache.",
    ],
    stack: ["Node.js", "Express.js", "TypeScript", "PostgreSQL", "Prisma", "BullMQ", "Redis", "Next.js", "AWS", "Docker", "Jest"],
  },
  {
    company: "Dataline Advertisers",
    role: "SDE Intern",
    period: "August 2025 — February 2026",
    location: "Remote",
    bullets: [
      "Developed 30+ production-grade REST and WebSocket APIs in Python and FastAPI with async webhook handling and event-driven call state management for an enterprise AI voice-calling product, achieving 99.9% API uptime.",
      "Designed a custom RAG pipeline on OpenAI embeddings and a Firestore vector database, implementing a scalable retrieval architecture that improved search accuracy by 40%.",
    ],
    stack: ["Python", "FastAPI", "WebSockets", "OpenAI", "Firestore", "RAG"],
  },
];

export const education = {
  institution: "Indian Institute of Information Technology, Nagpur",
  degree: "B.Tech, Electronics and Communication Engineering",
  period: "July 2022 — July 2026",
  location: "Nagpur, India",
} as const;

export const achievements = [
  {
    value: "Knight",
    label: "LeetCode rank",
    detail: "Top 4.4% globally",
  },
  {
    value: "880th",
    label: "LeetCode Biweekly Contest 154",
    detail: "Top 2.7% globally",
  },
  {
    value: "1,000+",
    label: "DSA problems solved",
    detail: "LeetCode, CodeChef, GeeksforGeeks, Codeforces",
  },
];

export const skills: SkillGroup[] = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
  {
    label: "Backend & AI",
    items: ["Node.js", "Express.js", "FastAPI", "JWT", "RBAC", "RAG", "RAGAS", "LangChain", "LangGraph", "Celery"],
  },
  {
    label: "APIs, queues & testing",
    items: ["REST APIs", "WebSockets", "Prisma ORM", "BullMQ", "Redis Streams", "OpenAI API", "Jest", "Postman"],
  },
  {
    label: "Distributed systems & AI safety",
    items: ["Event-driven architecture", "PII redaction", "Prompt-injection defence", "LLM evaluation"],
  },
  {
    label: "Databases",
    items: ["PostgreSQL", "pgvector", "MongoDB", "Redis", "MySQL", "Firebase", "Firestore", "Pinecone"],
  },
  { label: "Frontend", items: ["React.js", "Next.js", "Redux Toolkit", "Tailwind CSS", "TanStack Query"] },
  {
    label: "Cloud & DevOps",
    items: ["AWS (EC2, RDS, S3)", "Docker", "Nginx", "Vercel", "Render", "CI/CD", "GitHub Actions", "Git"],
  },
];
