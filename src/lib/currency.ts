// Nigerian Naira formatting helpers — PHASE 1 demo values only.
export const NAIRA = "₦";

export function ngn(value: number, fractionDigits = 0) {
  const n = Number.isFinite(value) ? value : 0;
  return (
    NAIRA +
    n.toLocaleString("en-NG", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  );
}

/** Compact form for large stat figures, e.g. ₦59.9M */
export function ngnCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${NAIRA}${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${NAIRA}${(value / 1_000).toFixed(1)}K`;
  return ngn(value);
}
