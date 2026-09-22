"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { Architecture, ArchNode } from "@/content/types";
import type { Palette } from "@/lib/arch-palette";
import type { Controls } from "./controls";

const NODE_SIZE: [number, number, number] = [1.15, 0.62, 1.15];

/* -------------------------------------------------------------------------- */

function NodeMesh({
  node,
  color,
  active,
  faded,
  onSelect,
  onHover,
}: {
  node: ArchNode;
  color: string;
  active: boolean;
  faded: boolean;
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

  const fillOpacity = active ? 0.34 : faded ? 0.05 : 0.14;
  const lineOpacity = active ? 1 : faded ? 0.18 : 0.72;

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
      <lineBasicMaterial vertexColors transparent opacity={0.9} />
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
}: {
  nodes: ArchNode[];
  labelRefs: React.RefObject<Array<HTMLDivElement | null>>;
  group: React.RefObject<THREE.Group | null>;
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

      scratch.set(...node.position).applyMatrix4(group.current.matrixWorld).project(camera);

      const x = (scratch.x * 0.5 + 0.5) * size.width;
      const y = (-scratch.y * 0.5 + 0.5) * size.height;
      const behind = scratch.z > 1;

      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      // Depth cue: labels further from the camera recede rather than compete.
      element.style.opacity = behind ? "0" : String(Math.max(0.35, 1 - (scratch.z - 0.9) * 6));
    }
  });

  return null;
}

/* -------------------------------------------------------------------------- */

function Rig({
  controls,
  autoRotate,
  group,
}: {
  controls: React.RefObject<Controls>;
  autoRotate: boolean;
  group: React.RefObject<THREE.Group | null>;
}) {
  const { camera, size } = useThree();

  // Fit the graph to the viewport on resize rather than assuming a desktop aspect.
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const fitted = aspect < 1.1 ? 34 : aspect < 1.6 ? 27 : 22;
    controls.current.distance = fitted;
    controls.current.targetDistance = fitted;
  }, [size.width, size.height, controls]);

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
      <Rig controls={controls} autoRotate={animate} group={group} />
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
            active={activeId === node.id}
            faded={Boolean(connected) && !connected?.has(node.id)}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </group>
      <Labels nodes={architecture.nodes} labelRefs={labelRefs} group={group} />
    </Canvas>
  );
}
