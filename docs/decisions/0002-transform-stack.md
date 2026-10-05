# 0002. Drawings carry an ordered stack of transformation steps

- Status: accepted
- Date: 2026-10-05

## Context

Designs get mirrored, rotated and moved, often several times, and the result
has to match the machine it is cut on. CNC machines disagree on where zero is
and on whether an axis runs from 0 to positive or 0 to negative.

## Decision

A drawing stores its model plus a list of `TransformStep`s
(`packages/geometry`): `translate`, `rotate`, `scale`, `mirror` (across a plane
through a point) and `machineFrame` (new origin and per-axis direction). Steps
are applied in order and composed into one 4x4 matrix. The steps are kept, not
baked into the model, so they can be edited or reordered later.

## Consequences

- Undo and "what if I mirror it here instead" are cheap: edit the list.
- `isMirrored` tells renderers to flip face winding and tells exports that a
  left-hand part became a right-hand one.
- The same steps run in web, mobile and any future export or CAM tooling.
