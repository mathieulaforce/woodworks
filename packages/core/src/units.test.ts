import { describe, expect, it } from "vitest";
import { formatLength, fromMm, toMm } from "./units";

describe("units", () => {
  it("converts to and from millimetres", () => {
    expect(toMm(1, "in")).toBe(25.4);
    expect(fromMm(254, "in")).toBe(10);
    expect(toMm(2.5, "cm")).toBe(25);
  });

  it("formats metric lengths", () => {
    expect(formatLength(18, "mm")).toBe("18 mm");
    expect(formatLength(18, "cm")).toBe("1.8 cm");
  });

  it("formats fractional inches", () => {
    expect(formatLength(25.4, "in")).toBe('1"');
    expect(formatLength(19.05, "in")).toBe('3/4"');
    expect(formatLength(41.275, "in")).toBe('1 5/8"');
    expect(formatLength(-12.7, "in")).toBe('-1/2"');
  });
});
