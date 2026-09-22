import type { Architecture } from "@/content/types";
import { palettes } from "@/lib/arch-palette";

/**
 * Server-rendered isometric projection of the same graph.
 *
 * This is the default render, not a placeholder. It is what ships without
 * JavaScript, what reduced-motion visitors keep, and what appears before the
 * WebGL canvas mounts — so the section is never empty and never shifts layout.
 */

const VIEW_W = 960;
const VIEW_H = 520;

function project(position: readonly [number, number, number]) {
  const [x, y, z] = position;
  return {
    x: (x - z * 0.55) * 52 + VIEW_W / 2,
    y: (-y + z * 0.3) * 52 + VIEW_H / 2,
    depth: z,
  };
}

export function StaticDiagram({ architecture, theme = "dark" }: { architecture: Architecture; theme?: "light" | "dark" }) {
  const palette = palettes[theme];
  const points = new Map(architecture.nodes.map((node) => [node.id, project(node.position)]));

  // Painter's algorithm: draw far nodes first so near ones overlap correctly.
  const ordered = [...architecture.nodes].sort(
    (a, b) => (points.get(a.id)?.depth ?? 0) - (points.get(b.id)?.depth ?? 0),
  );

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full"
      role="img"
      aria-label={`${architecture.project}: ${architecture.title}. ${architecture.caption}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {architecture.edges.map((edge, index) => {
          const from = points.get(edge.from);
          const to = points.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}-${index}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={palette.edge[edge.kind]}
              strokeWidth={1.4}
              strokeOpacity={0.55}
              strokeDasharray={edge.kind === "async" ? "5 5" : undefined}
            />
          );
        })}
      </g>

      <g>
        {ordered.map((node) => {
          const point = points.get(node.id);
          if (!point) return null;
          const color = palette.node[node.kind];
          return (
            <g key={node.id}>
              <rect
                x={point.x - 38}
                y={point.y - 16}
                width={76}
                height={32}
                rx={6}
                fill={color}
                fillOpacity={0.14}
                stroke={color}
                strokeWidth={1.2}
                strokeOpacity={0.8}
              />
              <text
                x={point.x}
                y={point.y + 4}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-mono-stack), monospace"
                fill={theme === "dark" ? "#e8ecf1" : "#14181d"}
              >
                {node.label.length > 13 ? `${node.label.slice(0, 12)}…` : node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
