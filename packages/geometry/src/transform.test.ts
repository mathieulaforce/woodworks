import { describe, expect, it } from "vitest";
import { apply, compose, isMirrored, type TransformStep } from "./index";

const run = (steps: TransformStep[], p: [number, number, number]) => apply(compose(steps), p);

describe("compose", () => {
  it("is the identity for an empty stack", () => {
    expect(run([], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("applies steps in order", () => {
    const steps: TransformStep[] = [
      { kind: "translate", offset: [10, 0, 0] },
      { kind: "rotate", axis: "z", degrees: 90 },
    ];
    // Move to (11, 0, 0) first, then rotate a quarter turn around Z.
    expect(run(steps, [1, 0, 0])).toEqual([0, 11, 0]);
  });

  it("mirrors across a plane through a point", () => {
    const steps: TransformStep[] = [{ kind: "mirror", plane: "yz", through: [100, 0, 0] }];
    expect(run(steps, [90, 5, 5])).toEqual([110, 5, 5]);
  });

  it("rotates around a pivot", () => {
    const steps: TransformStep[] = [{ kind: "rotate", axis: "z", degrees: 180, about: [50, 50, 0] }];
    expect(run(steps, [60, 50, 0])).toEqual([40, 50, 0]);
  });

  it("maps a design into a CNC frame where Z runs from 0 to negative", () => {
    // Board top surface at z = 18 is the machine's Z zero; cutting goes down.
    const steps: TransformStep[] = [
      { kind: "machineFrame", origin: [0, 0, 18], direction: { x: 1, y: 1, z: 1 } },
    ];
    expect(run(steps, [20, 30, 18])).toEqual([20, 30, 0]);
    expect(run(steps, [20, 30, 12])).toEqual([20, 30, -6]);
  });

  it("flips an axis for a machine that counts the other way", () => {
    const steps: TransformStep[] = [
      { kind: "machineFrame", origin: [600, 0, 0], direction: { x: -1, y: 1, z: 1 } },
    ];
    expect(run(steps, [550, 10, 0])).toEqual([50, 10, 0]);
  });
});

describe("isMirrored", () => {
  it("detects an odd number of mirrors", () => {
    expect(isMirrored(compose([{ kind: "mirror", plane: "xy" }]))).toBe(true);
    expect(
      isMirrored(
        compose([
          { kind: "mirror", plane: "xy" },
          { kind: "mirror", plane: "yz" },
        ]),
      ),
    ).toBe(false);
  });

  it("is false for rotations and translations", () => {
    const m = compose([
      { kind: "rotate", axis: "x", degrees: 37 },
      { kind: "translate", offset: [1, 2, 3] },
    ]);
    expect(isMirrored(m)).toBe(false);
  });
});
