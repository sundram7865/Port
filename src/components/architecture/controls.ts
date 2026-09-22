/**
 * Camera and interaction state for the architecture explorer.
 *
 * Deliberately in its own module with no three.js import: the explorer needs
 * this on first render, and importing it from the scene file would pull the
 * whole WebGL bundle into the initial page chunk and defeat the lazy load.
 */
export type Controls = {
  yaw: number;
  pitch: number;
  targetYaw: number;
  targetPitch: number;
  distance: number;
  targetDistance: number;
  /** Distance the graph was fitted to; zoom limits are relative to it. */
  fit: number;
  /** Timestamp of the last user interaction; auto-rotation resumes after a pause. */
  lastInput: number;
};

export const DEFAULT_VIEW = { yaw: 0.34, pitch: 0.2, distance: 22 } as const;

export function createControls(): Controls {
  return {
    yaw: DEFAULT_VIEW.yaw,
    pitch: DEFAULT_VIEW.pitch,
    targetYaw: DEFAULT_VIEW.yaw,
    targetPitch: DEFAULT_VIEW.pitch,
    distance: DEFAULT_VIEW.distance,
    targetDistance: DEFAULT_VIEW.distance,
    fit: DEFAULT_VIEW.distance,
    lastInput: 0,
  };
}
