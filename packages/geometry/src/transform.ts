import type { Vec3 } from "./vec3";

/**
 * 4x4 affine matrix, row-major: element (row r, column c) is at index r * 4 + c.
 * Points are column vectors, so `apply(m, p)` computes m · [x, y, z, 1].
 */
export type Mat4 = readonly number[];

export type Axis = "x" | "y" | "z";
export type Plane = "xy" | "yz" | "xz";
export type Sign = 1 | -1;

/**
 * One step in a drawing's transformation stack. Steps are applied in order,
 * so `[translate, mirror]` first moves the drawing and then mirrors the result.
 */
export type TransformStep =
  | { kind: "translate"; offset: Vec3 }
  | { kind: "rotate"; axis: Axis; degrees: number; about?: Vec3 }
  | { kind: "scale"; factor: Vec3; about?: Vec3 }
  /** Mirror across a plane through `through` (defaults to the origin). */
  | { kind: "mirror"; plane: Plane; through?: Vec3 }
  /**
   * Re-express coordinates for a machine whose origin sits at `origin` and whose
   * axes may run negative (e.g. a CNC where Z goes from 0 down to -depth).
   */
  | { kind: "machineFrame"; origin: Vec3; direction: { x: Sign; y: Sign; z: Sign } };

export const IDENTITY: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Array<number>(16).fill(0);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[r * 4 + k]! * b[k * 4 + c]!;
      out[r * 4 + c] = sum;
    }
  }
  return out;
}

export function apply(m: Mat4, p: Vec3): Vec3 {
  const [x, y, z] = p;
  return [
    m[0]! * x + m[1]! * y + m[2]! * z + m[3]!,
    m[4]! * x + m[5]! * y + m[6]! * z + m[7]!,
    m[8]! * x + m[9]! * y + m[10]! * z + m[11]!,
  ];
}

function translation([x, y, z]: Vec3): Mat4 {
  return [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
}

function diagonal([x, y, z]: Vec3): Mat4 {
  return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
}

function rotation(axis: Axis, degrees: number): Mat4 {
  const t = (degrees * Math.PI) / 180;
  // Snap to exact values so quarter turns don't leave 6e-17 noise behind.
  const c = round(Math.cos(t));
  const s = round(Math.sin(t));
  switch (axis) {
    case "x":
      return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
    case "y":
      return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
    case "z":
      return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
}

function round(n: number): number {
  const r = Math.round(n);
  return Math.abs(n - r) < 1e-12 ? r : n;
}

/** Conjugate `m` so it acts around `pivot` instead of the origin. */
function around(pivot: Vec3 | undefined, m: Mat4): Mat4 {
  if (!pivot) return m;
  const [x, y, z] = pivot;
  return multiply(translation(pivot), multiply(m, translation([-x, -y, -z])));
}

const MIRROR_FACTORS: Record<Plane, Vec3> = {
  xy: [1, 1, -1],
  yz: [-1, 1, 1],
  xz: [1, -1, 1],
};

export function stepMatrix(step: TransformStep): Mat4 {
  switch (step.kind) {
    case "translate":
      return translation(step.offset);
    case "rotate":
      return around(step.about, rotation(step.axis, step.degrees));
    case "scale":
      return around(step.about, diagonal(step.factor));
    case "mirror":
      return around(step.through, diagonal(MIRROR_FACTORS[step.plane]));
    case "machineFrame": {
      const [ox, oy, oz] = step.origin;
      const { x, y, z } = step.direction;
      return multiply(diagonal([x, y, z]), translation([-ox, -oy, -oz]));
    }
  }
}

/** Collapse a stack of steps into a single matrix, applying them in order. */
export function compose(steps: readonly TransformStep[]): Mat4 {
  return steps.reduce<Mat4>((acc, step) => multiply(stepMatrix(step), acc), IDENTITY);
}

/**
 * True when the stack flips handedness (an odd number of mirrors or negative
 * axes). Renderers need this to flip face winding, and it tells a CNC export
 * that a left-hand part became a right-hand one.
 */
export function isMirrored(m: Mat4): boolean {
  const det =
    m[0]! * (m[5]! * m[10]! - m[6]! * m[9]!) -
    m[1]! * (m[4]! * m[10]! - m[6]! * m[8]!) +
    m[2]! * (m[4]! * m[9]! - m[5]! * m[8]!);
  return det < 0;
}
