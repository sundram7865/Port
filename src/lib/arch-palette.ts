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
  /**
   * Stroke and fill weights per theme. A 14% fill reads as solid volume on a
   * near-black background and all but disappears on a near-white one, so these
   * are not shared.
   */
  weight: {
    fill: number;
    fillActive: number;
    fillFaded: number;
    line: number;
    lineFaded: number;
    edge: number;
  };
};

export const palettes: Record<"light" | "dark", Palette> = {
  dark: {
    background: "#0b0e14",
    // Desaturated on purpose. Nine fully saturated hues in one diagram reads as
    // a toy; these are separable but stay in the same tonal family as the UI.
    node: {
      client: "#8e9bad",
      edge: "#7aa2f7",
      service: "#5bbfb0",
      worker: "#a390d8",
      queue: "#d6a44a",
      datastore: "#6bb2e0",
      storage: "#78839a",
      guard: "#d97f8c",
      external: "#aab4c4",
    },
    edge: { sync: "#7aa2f7", async: "#d6a44a", data: "#6bb2e0" },
    dim: "#212936",
    weight: { fill: 0.14, fillActive: 0.34, fillFaded: 0.05, line: 0.72, lineFaded: 0.18, edge: 0.9 },
  },
  light: {
    background: "#fcfcfd",
    node: {
      client: "#5c6676",
      edge: "#2b5cb8",
      service: "#1c6f68",
      worker: "#61499b",
      queue: "#8c5c18",
      datastore: "#1d5c87",
      storage: "#4e586a",
      guard: "#9c3a49",
      external: "#48525f",
    },
    edge: { sync: "#2b5cb8", async: "#8c5c18", data: "#1d5c87" },
    dim: "#cbd2db",
    weight: { fill: 0.24, fillActive: 0.48, fillFaded: 0.08, line: 0.92, lineFaded: 0.26, edge: 1 },
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
