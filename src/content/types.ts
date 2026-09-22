/**
 * Content model.
 *
 * Everything rendered on this site is typed data in `src/content`, not JSX.
 * That keeps copy reviewable in one place and makes it impossible to ship a
 * project card whose live link or metric silently went missing.
 */

export type Link = {
  label: string;
  href: string;
};

/** A headline number. `source` records where it came from so nothing is unattributable. */
export type Metric = {
  value: string;
  label: string;
  detail?: string;
};

export type CaseStudySection = {
  heading: string;
  body: string[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  /** Short framing used on cards. One sentence, no adjectives. */
  summary: string;
  period: string;
  role: string;
  stack: string[];
  live?: string;
  repo?: string;
  /** Headline numbers surfaced on the card and at the top of the case study. */
  metrics: Metric[];
  /** The case-study body: problem -> constraints -> approach -> tradeoffs -> retro. */
  problem: string[];
  constraints: string[];
  approach: CaseStudySection[];
  tradeoffs: CaseStudySection[];
  retrospective: string[];
  impact: string[];
  /** Key into `architectures` for the 3D explorer. Absent = no diagram. */
  architecture?: string;
};

export type SecondaryProject = {
  name: string;
  summary: string;
  stack: string[];
  live?: string;
  repo?: string;
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  href?: string;
  current?: boolean;
  bullets: string[];
  stack: string[];
};

export type Note = {
  slug: string;
  title: string;
  dek: string;
  readingTime: string;
  /** Which system the decision was made in. */
  context: string;
  body: CaseStudySection[];
};

export type SkillGroup = {
  label: string;
  items: string[];
};

/* -------------------------------------------------------------------------- */
/* 3D architecture explorer                                                    */
/* -------------------------------------------------------------------------- */

export type NodeKind =
  | "client"
  | "edge"
  | "service"
  | "worker"
  | "queue"
  | "datastore"
  | "storage"
  | "guard"
  | "external";

export type ArchNode = {
  id: string;
  label: string;
  kind: NodeKind;
  /** Layout position in scene units. x = flow direction, y = tier, z = depth. */
  position: [number, number, number];
  /** One factual sentence about this node, drawn from the shipped system. */
  detail: string;
  metric?: string;
};

export type ArchEdge = {
  from: string;
  to: string;
  /** sync = request/response, async = queued, data = persistence or egress. */
  kind: "sync" | "async" | "data";
  label?: string;
};

export type Architecture = {
  id: string;
  project: string;
  title: string;
  caption: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
};
