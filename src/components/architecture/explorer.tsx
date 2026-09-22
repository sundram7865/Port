"use client";

import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { StaticDiagram } from "@/components/architecture/static-diagram";
import { createControls, DEFAULT_VIEW, type Controls } from "@/components/architecture/controls";
import { architectures } from "@/content/architecture";
import { edgeLabels, kindLabels, palettes } from "@/lib/arch-palette";
import { usePrefersReducedMotion, useInView, useResolvedTheme } from "@/lib/hooks";

/**
 * three.js is ~150 KB gzipped. Loading it on first paint would cost more than
 * the diagram is worth, so the canvas is a separate chunk that only downloads
 * once the section is close to the viewport and motion is allowed.
 */
const ArchitectureScene = dynamic(
  () => import("@/components/architecture/scene").then((module) => module.ArchitectureScene),
  { ssr: false },
);

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function ArchitectureExplorer() {
  const [activeSystem, setActiveSystem] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const controls = useRef<Controls>(createControls());
  const dragging = useRef<{ x: number; y: number } | null>(null);

  const inView = useInView(containerRef);
  const reducedMotion = usePrefersReducedMotion();
  const theme = useResolvedTheme();
  const palette = palettes[theme];

  const architecture = architectures[activeSystem] ?? architectures[0]!;
  const selectedNode = architecture.nodes.find((node) => node.id === selected) ?? null;

  useEffect(() => setWebgl(hasWebGL()), []);
  useEffect(() => setSelected(null), [activeSystem]);

  const use3D = webgl === true && !reducedMotion && inView;

  /* ---- pointer drag orbit ------------------------------------------------ */

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (!use3D) return;
    dragging.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [use3D]);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const start = dragging.current;
    if (!start) return;
    const c = controls.current;
    c.targetYaw += (event.clientX - start.x) * 0.006;
    // Clamp pitch so the graph never flips past vertical and become unreadable.
    c.targetPitch = Math.max(-0.75, Math.min(0.75, c.targetPitch + (event.clientY - start.y) * 0.004));
    c.lastInput = performance.now();
    dragging.current = { x: event.clientX, y: event.clientY };
  }, []);

  const endDrag = useCallback((event: React.PointerEvent) => {
    dragging.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const zoom = useCallback((direction: 1 | -1) => {
    const c = controls.current;
    // Limits are relative to the fitted distance, so they hold at any aspect.
    c.targetDistance = Math.max(c.fit * 0.55, Math.min(c.fit * 1.9, c.targetDistance + direction * c.fit * 0.14));
    c.lastInput = performance.now();
  }, []);

  const reset = useCallback(() => {
    const c = controls.current;
    c.targetYaw = DEFAULT_VIEW.yaw;
    c.targetPitch = DEFAULT_VIEW.pitch;
    c.targetDistance = c.fit;
    c.lastInput = performance.now();
    setSelected(null);
  }, []);

  const handleSelect = useCallback((id: string) => setSelected(id === "" ? null : id), []);
  const handleHover = useCallback(() => {}, []);

  const legendKinds = useMemo(
    () => [...new Set(architecture.nodes.map((node) => node.kind))],
    [architecture],
  );

  return (
    <div ref={containerRef} className="mt-10">
      {/* System switcher */}
      <div role="tablist" aria-label="System to explore" className="flex flex-wrap gap-2">
        {architectures.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={activeSystem === index}
            aria-controls="architecture-stage"
            onClick={() => setActiveSystem(index)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              activeSystem === index
                ? "border-accent bg-accent-wash text-fg"
                : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
            }`}
          >
            {item.project}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Stage */}
        <div id="architecture-stage" className="min-w-0">
          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ touchAction: "pan-y" }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-surface sm:aspect-[16/10] lg:aspect-[16/9]"
          >
            {/* Baseline render: server-rendered, no JavaScript required. */}
            <div className={`absolute inset-0 p-3 transition-opacity duration-500 ${use3D ? "opacity-0" : "opacity-100"}`}>
              <StaticDiagram architecture={architecture} theme={theme} />
            </div>

            {use3D ? (
              <>
                <div className="absolute inset-0" aria-hidden="true">
                  <ArchitectureScene
                    architecture={architecture}
                    palette={palette}
                    activeId={selected}
                    onSelect={handleSelect}
                    onHover={handleHover}
                    controls={controls}
                    labelRefs={labelRefs}
                    animate={inView}
                  />
                </div>

                {/* Labels live in the DOM so they stay crisp and need no font atlas. */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                  {architecture.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      ref={(element) => {
                        labelRefs.current[index] = element;
                      }}
                      style={{
                        opacity: 0,
                        willChange: "transform",
                        // Mirrors LABEL_MAX_PX / LABEL_MAX_PX_SM in scene.tsx,
                        // which the camera fit reserves room for.
                        maxWidth: "var(--label-max)",
                      }}
                      className="absolute left-0 top-0 truncate rounded bg-bg/80 px-1.5 py-0.5 font-mono text-[10px] leading-tight text-fg backdrop-blur-[2px] [--label-max:74px] sm:text-[11px] sm:[--label-max:104px]"
                    >
                      {node.label}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {/* Controls */}
            {use3D ? (
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => zoom(-1)}
                  aria-label="Zoom in"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-bg/80 text-fg-muted backdrop-blur hover:text-fg"
                >
                  <Plus aria-hidden className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => zoom(1)}
                  aria-label="Zoom out"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-bg/80 text-fg-muted backdrop-blur hover:text-fg"
                >
                  <Minus aria-hidden className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset view"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-bg/80 text-fg-muted backdrop-blur hover:text-fg"
                >
                  <RotateCcw aria-hidden className="size-3.5" />
                </button>
              </div>
            ) : null}

            {use3D ? (
              <p className="pointer-events-none absolute left-3 top-3 hidden items-center gap-1.5 rounded-md bg-bg/70 px-2 py-1 font-mono text-[10px] text-fg-subtle backdrop-blur sm:inline-flex">
                <Maximize2 aria-hidden className="size-3" />
                Drag to orbit · click a node
              </p>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-fg-muted">{architecture.caption}</p>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {legendKinds.map((kind) => (
              <span key={kind} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-subtle">
                <span
                  aria-hidden
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: palette.node[kind] }}
                />
                {kindLabels[kind]}
              </span>
            ))}
            <span className="text-fg-subtle/50" aria-hidden>
              |
            </span>
            {(["sync", "async", "data"] as const).map((kind) => (
              <span key={kind} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-subtle">
                <span aria-hidden className="h-px w-4" style={{ backgroundColor: palette.edge[kind] }} />
                {edgeLabels[kind]}
              </span>
            ))}
          </div>
        </div>

        {/* Detail panel — also the keyboard path into the diagram. */}
        <div className="min-w-0">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              {architecture.title}
            </h3>

            <div className="mt-3 min-h-[92px]" aria-live="polite">
              {selectedNode ? (
                <>
                  <p className="text-sm font-semibold text-fg">{selectedNode.label}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">
                    {kindLabels[selectedNode.kind]}
                    {selectedNode.metric ? ` · ${selectedNode.metric}` : ""}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{selectedNode.detail}</p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-fg-muted">
                  Select a component to see what it does and why it is there.
                </p>
              )}
            </div>
          </div>

          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {architecture.nodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => setSelected(selected === node.id ? null : node.id)}
                  aria-pressed={selected === node.id}
                  className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selected === node.id
                      ? "border-accent bg-accent-wash text-fg"
                      : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
                  }`}
                >
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: palette.node[node.kind] }}
                  />
                  <span className="truncate">{node.label}</span>
                  {node.metric ? (
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-fg-subtle">{node.metric}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
