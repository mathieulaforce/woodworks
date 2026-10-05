/** All lengths are stored in millimetres; units only matter for input and display. */
export type LengthUnit = "mm" | "cm" | "in";

const MM_PER: Record<LengthUnit, number> = { mm: 1, cm: 10, in: 25.4 };

export function toMm(value: number, unit: LengthUnit): number {
  return value * MM_PER[unit];
}

export function fromMm(mm: number, unit: LengthUnit): number {
  return mm / MM_PER[unit];
}

/**
 * Format a length the way woodworkers read it: whole millimetres or fractional
 * inches rounded to the nearest 1/`denominator` (e.g. 1/16").
 */
export function formatLength(mm: number, unit: LengthUnit, denominator = 16): string {
  if (unit !== "in") {
    const value = fromMm(mm, unit);
    return `${Number(value.toFixed(unit === "mm" ? 1 : 2))} ${unit}`;
  }
  const sign = mm < 0 ? "-" : "";
  const sixteenths = Math.round(Math.abs(fromMm(mm, "in")) * denominator);
  const whole = Math.floor(sixteenths / denominator);
  let num = sixteenths % denominator;
  let den = denominator;
  while (num > 0 && num % 2 === 0 && den % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  if (num === 0) return `${sign}${whole}"`;
  return whole === 0 ? `${sign}${num}/${den}"` : `${sign}${whole} ${num}/${den}"`;
}
