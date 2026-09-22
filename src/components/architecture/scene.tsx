"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { Architecture, ArchNode } from "@/content/types";
import type { Palette } from "@/lib/arch-palette";
import { DEFAULT_VIEW, type Controls } from "./controls";

const NODE_SIZE: [number, number, number] = [1.15, 0.62, 1.15];

/** World-space drop from a node centre to its label anchor. */
const LABEL_DROP = NODE_SIZE[1] / 2 + 0.26;

/** Label width caps, mirrored in the overlay's CSS so the fit maths matches reality. */
export const LABEL_MAX_PX = 104;
export const LABEL_MAX_PX_SM = 74;

/* -------------------------------------------------------------------------- */

function NodeMesh({
  node,
  color,
  active,
  faded,
  weight,
  onSelect,
  onHover,
}: {
  node: ArchNode;
  color: string;
  active: boolean;
  faded: boolean;
  weight: Palette["weight"];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(...NODE_SIZE), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      edges.dispose();
    };
  }, [geometry, edges]);

  // Scale is eased on the GPU-facing object rather than through state, so hover
  // never triggers a React render of the whole graph.
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = active ? 1.22 : 1;
    const current = group.current.scale.x;
    const next = current + (target - current) * Math.min(1, delta * 12);
    group.current.scale.setScalar(next);
  });

  const fillOpacity = active ? weight.fillActive : faded ? weight.fillFaded : weight.fill;
  const lineOpacity = active ? 1 : faded ? weight.lineFaded : weight.line;

  return (
    <group
      ref={group}
      position={node.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(node.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
    >
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={fillOpacity} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={lineOpacity} />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */

/** All edges in one draw call. Emphasis is applied by rewriting vertex colours. */
function Edges({
  architecture,
  palette,
  activeId,
  positions,
}: {
  architecture: Architecture;
  palette: Palette;
  activeId: string | null;
  positions: Map<string, THREE.Vector3>;
}) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    for (const edge of architecture.edges) {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      if (!from || !to) continue;
      points.push(from.x, from.y, from.z, to.x, to.y, to.z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(points.length), 3));
    return geo;
  }, [architecture, positions]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const attribute = geometry.getAttribute("color") as THREE.BufferAttribute;
    const base = new THREE.Color();
    const dim = new THREE.Color(palette.dim);

    architecture.edges.forEach((edge, index) => {
      const connected = !activeId || edge.from === activeId || edge.to === activeId;
      base.set(palette.edge[edge.kind]);
      const color = connected ? base : base.clone().lerp(dim, 0.82);
      attribute.setXYZ(index * 2, color.r, color.g, color.b);
      attribute.setXYZ(index * 2 + 1, color.r, color.g, color.b);
    });

    attribute.needsUpdate = true;
  }, [geometry, architecture, palette, activeId]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={palette.weight.edge} />
    </lineSegments>
  );
}

/* -------------------------------------------------------------------------- */

const PACKETS_PER_EDGE = 2;

/** Packets travelling along each edge, drawn as a single instanced mesh. */
function Packets({
  architecture,
  palette,
  positions,
  activeId,
  animate,
}: {
  architecture: Architecture;
  palette: Palette;
  positions: Map<string, THREE.Vector3>;
  activeId: string | null;
  animate: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = architecture.edges.length * PACKETS_PER_EDGE;

  const lanes = useMemo(
    () =>
      architecture.edges.flatMap((edge, edgeIndex) => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return [];
        return Array.from({ length: PACKETS_PER_EDGE }, (_, slot) => ({
          from,
          to,
          edge,
          // Deterministic offsets: the scene must look identical on every load.
          phase: (slot / PACKETS_PER_EDGE + edgeIndex * 0.137) % 1,
          speed: edge.kind === "sync" ? 0.42 : edge.kind === "async" ? 0.26 : 0.32,
        }));
      }),
    [architecture, positions],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!mesh.current) return;
    const color = new THREE.Color();
    lanes.forEach((lane, index) => {
      color.set(palette.edge[lane.edge.kind]);
      mesh.current?.setColorAt(index, color);
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [lanes, palette]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    if (animate) elapsed.current += delta;

    lanes.forEach((lane, index) => {
      const t = (lane.phase + elapsed.current * lane.speed) % 1;
      scratch.lerpVectors(lane.from, lane.to, t);
      dummy.position.copy(scratch);

      const connected = !activeId || lane.edge.from === activeId || lane.edge.to === activeId;
      // Fade in and out at the ends so packets appear to enter and leave a node.
      const fade = Math.sin(t * Math.PI);
      dummy.scale.setScalar(connected ? 0.1 * fade + 0.02 : 0.03 * fade);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial transparent opacity={0.95} toneMapped={false} />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Projects each node to screen space and writes the result straight onto the
 * overlay DOM nodes. Labels stay crisp browser text (no SDF atlas to download)
 * and this never re-renders React at 60fps.
 */
function Labels({
  nodes,
  labelRefs,
  group,
  connected,
}: {
  nodes: ArchNode[];
  labelRefs: React.RefObject<Array<HTMLDivElement | null>>;
  group: React.RefObject<THREE.Group | null>;
  /** Ids in the selected node's neighbourhood, or null when nothing is selected. */
  connected: Set<string> | null;
}) {
  const { camera, size } = useThree();
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const elements = labelRefs.current;
    if (!elements || !group.current) return;

    for (let index = 0; index < nodes.length; index += 1) {
      const element = elements[index];
      const node = nodes[index];
      if (!element || !node) continue;

      // Anchor below the box rather than at its centre, so the label never sits
      // on top of the node it names. Offsetting in world space keeps the gap
      // perspective-correct as the graph rotates.
      scratch
        .set(node.position[0], node.position[1] - LABEL_DROP, node.position[2])
        .applyMatrix4(group.current.matrixWorld)
        .project(camera);

      const x = (scratch.x * 0.5 + 0.5) * size.width;
      const y = (-scratch.y * 0.5 + 0.5) * size.height;
      const behind = scratch.z > 1;

      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)`;

      // Depth cue: labels further from the camera recede rather than compete.
      const depth = Math.max(0.3, 1 - (scratch.z - 0.9) * 7);
      // Selecting a node pushes the rest of the labels back, which is what makes
      // the dense middle of these graphs readable on a phone.
      const focus = !connected || connected.has(node.id) ? 1 : 0.18;
      element.style.opacity = behind ? "0" : String(depth * focus);
      // Nearer labels paint over farther ones, so overlaps resolve front-to-back
      // instead of in DOM order.
      element.style.zIndex = String(Math.round((1 - scratch.z) * 1000));
    }
  });

  return null;
}

/* -------------------------------------------------------------------------- */

function Rig({
  controls,
  autoRotate,
  group,
  bounds,
}: {
  controls: React.RefObject<Controls>;
  autoRotate: boolean;
  group: React.RefObject<THREE.Group | null>;
  bounds: { radiusXZ: number; halfY: number };
}) {
  const { camera, size } = useThree();

  /**
   * Fit the camera to the graph's real extents.
   *
   * A bounding sphere is the easy answer and it is badly wrong here: these
   * topologies are wide and flat, so the sphere is dominated by the x extent
   * and the framing ends up ~40% of the canvas. Instead: the worst-case
   * horizontal half-width under free yaw is hypot(maxX, maxZ), and the vertical
   * half-height at the resting pitch is halfY*cos(p) + radius*sin(p). Fit both
   * against the frustum and take whichever is binding.
   */
  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const tan = Math.tan(((perspective.fov ?? 42) * Math.PI) / 360);

    const pitch = DEFAULT_VIEW.pitch;
    const halfW = bounds.radiusXZ;
    const halfH = bounds.halfY * Math.cos(pitch) + bounds.radiusXZ * Math.sin(pitch) + LABEL_DROP;

    const solve = (padWorld: number) =>
      Math.max(
        ((halfH + padWorld * 0.5) * 1.12) / tan,
        ((halfW + padWorld) * 1.06) / (tan * aspect),
      );

    /**
     * Labels are DOM elements measured in pixels, but the frame is solved in
     * world units, and the conversion depends on the distance being solved for.
     * Solve once without them, convert the label half-width at that distance,
     * then solve again with the pad. One iteration converges well inside a
     * pixel here, and without it the outermost labels clip on narrow canvases.
     */
    const first = solve(0);
    const unitsPerPixel = (2 * first * tan * aspect) / Math.max(1, size.width);
    const labelHalfWidth = (size.width < 520 ? LABEL_MAX_PX_SM : LABEL_MAX_PX) / 2;
    const fit = Math.max(8, solve(labelHalfWidth * unitsPerPixel));

    const c = controls.current;
    c.fit = fit;
    c.distance = fit;
    c.targetDistance = fit;
  }, [size.width, size.height, controls, camera, bounds]);

  useFrame((state, delta) => {
    const c = controls.current;
    const step = Math.min(1, delta * 6);

    if (autoRotate && state.clock.elapsedTime * 1000 - c.lastInput > 2400) {
      c.targetYaw += delta * 0.075;
    }

    c.yaw += (c.targetYaw - c.yaw) * step;
    c.pitch += (c.targetPitch - c.pitch) * step;
    c.distance += (c.targetDistance - c.distance) * step;

    if (group.current) {
      group.current.rotation.y = c.yaw;
      group.current.rotation.x = c.pitch;
    }

    camera.position.set(0, 0, c.distance);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* -------------------------------------------------------------------------- */

export function ArchitectureScene({
  architecture,
  palette,
  activeId,
  onSelect,
  onHover,
  controls,
  labelRefs,
  animate,
}: {
  architecture: Architecture;
  palette: Palette;
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  controls: React.RefObject<Controls>;
  labelRefs: React.RefObject<Array<HTMLDivElement | null>>;
  animate: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    for (const node of architecture.nodes) map.set(node.id, new THREE.Vector3(...node.position));
    return map;
  }, [architecture]);

  const bounds = useMemo(() => {
    let radiusXZ = 0;
    let halfY = 0;
    for (const [x, y, z] of architecture.nodes.map((node) => node.position)) {
      radiusXZ = Math.max(radiusXZ, Math.hypot(x, z));
      halfY = Math.max(halfY, Math.abs(y));
    }
    // Half a node, so the box edge is inside the frame rather than on it.
    return { radiusXZ: radiusXZ + NODE_SIZE[0] / 2, halfY: halfY + NODE_SIZE[1] / 2 };
  }, [architecture]);

  const connected = useMemo(() => {
    if (!activeId) return null;
    const set = new Set<string>([activeId]);
    for (const edge of architecture.edges) {
      if (edge.from === activeId) set.add(edge.to);
      if (edge.to === activeId) set.add(edge.from);
    }
    return set;
  }, [architecture, activeId]);

  return (
    <Canvas
      camera={{ fov: 42, position: [0, 0, 22], near: 0.1, far: 120 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // Render only when something changed; `animate` drives the loop when packets move.
      frameloop={animate ? "always" : "demand"}
      onPointerMissed={() => onSelect("")}
    >
      <Rig controls={controls} autoRotate={animate} group={group} bounds={bounds} />
      <group ref={group}>
        <Edges architecture={architecture} palette={palette} activeId={activeId} positions={positions} />
        <Packets
          architecture={architecture}
          palette={palette}
          positions={positions}
          activeId={activeId}
          animate={animate}
        />
        {architecture.nodes.map((node) => (
          <NodeMesh
            key={node.id}
            node={node}
            color={palette.node[node.kind]}
            weight={palette.weight}
            active={activeId === node.id}
            faded={Boolean(connected) && !connected?.has(node.id)}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </group>
      <Labels nodes={architecture.nodes} labelRefs={labelRefs} group={group} connected={connected} />
    </Canvas>
  );
}
