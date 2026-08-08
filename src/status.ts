/**
 * Shared shape of the `/api/v1/status` contract every Kendall product exposes.
 * This is a fixed contract several other pieces of work implement in parallel
 * — do not change field names/shape here without coordinating those too.
 */
export interface KendallStatusMetric {
  label: string;
  value: string | number;
}

export type KendallStatusLevel = "ok" | "degraded" | "down";

export interface KendallStatusPayload {
  system: string;
  status: KendallStatusLevel;
  version: string | null;
  metrics: KendallStatusMetric[];
  checkedAt: string;
}

/** Runtime shape guard — fetched JSON is untrusted until checked. */
export function isKendallStatusPayload(value: unknown): value is KendallStatusPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.status !== "ok" && v.status !== "degraded" && v.status !== "down") return false;
  if (!Array.isArray(v.metrics)) return false;
  return v.metrics.every(
    (m) =>
      m &&
      typeof m === "object" &&
      typeof (m as Record<string, unknown>).label === "string" &&
      (typeof (m as Record<string, unknown>).value === "string" ||
        typeof (m as Record<string, unknown>).value === "number"),
  );
}
