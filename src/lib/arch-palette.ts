import type { ArchEdge, NodeKind } from "@/content/types";

/**
 * Colours for the architecture explorer.
 *
 * Kept as literals rather than read from CSS variables: the scene needs numeric
 * colours every frame, and re-parsing computed styles per frame is wasteful.
 * Both sets are checked against their own background so the legend text that
 * uses them stays legible.
 */
export type Palette = {
  background: string;
  node: Record<NodeKind, string>;
  edge: Record<ArchEdge["kind"], string>;
  dim: string;
};

export const palettes: Record<"light" | "dark", Palette> = {
  dark: {
    background: "#0a0c10",
    node: {
      client: "#94a3b8",
      edge: "#60a5fa",
      service: "#2dd4bf",
      worker: "#a78bfa",
      queue: "#fbbf24",
      datastore: "#38bdf8",
      storage: "#64748b",
      guard: "#fb7185",
      external: "#cbd5e1",
    },
    edge: { sync: "#2dd4bf", async: "#fbbf24", data: "#38bdf8" },
    dim: "#1e242d",
  },
  light: {
    background: "#fbfbfa",
    node: {
      client: "#64748b",
      edge: "#2563eb",
      service: "#0b6e66",
      worker: "#7c3aed",
      queue: "#b45309",
      datastore: "#0369a1",
      storage: "#475569",
      guard: "#be123c",
      external: "#475569",
    },
    edge: { sync: "#0b6e66", async: "#b45309", data: "#0369a1" },
    dim: "#cfd3d8",
  },
};

export const kindLabels: Record<NodeKind, string> = {
  client: "Client",
  edge: "Edge",
  service: "Service",
  worker: "Worker",
  queue: "Queue",
  datastore: "Datastore",
  storage: "Object storage",
  guard: "Guardrail",
  external: "External",
};

export const edgeLabels: Record<ArchEdge["kind"], string> = {
  sync: "Synchronous",
  async: "Queued",
  data: "Persistence",
};
