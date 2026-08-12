"use client";

import { useEffect, useState } from "react";
import { isKendallStatusPayload, type KendallStatusLevel, type KendallStatusMetric } from "./status";
import { ProductIcon } from "./ProductIcon";
import type { ProductIconName } from "./products";

/**
 * Client-only leaf used by <KendallHome> for one fetchable, non-current tab
 * when `showStatus` is on. Kept as its own component (rather than folding the
 * fetch logic into KendallHome itself) so that:
 *   - KendallHome stays a plain server component with zero client JS when
 *     `showStatus` is false/undefined (the default) — existing consumers see
 *     no behavior change and no new bundle weight.
 *   - Only the tabs that actually need a live dot pay for the "use client"
 *     boundary; the brand link, the active tab, and disabled tabs never
 *     import this module's fetch/state logic at all.
 */

const FETCH_TIMEOUT_MS = 3000;
const CACHE_TTL_MS = 60_000;
const CACHE_PREFIX = "kh-status:";

type DotState = "unchecked" | KendallStatusLevel | "unreachable";

interface CacheEntry {
  cachedAt: number;
  status: KendallStatusLevel;
  metrics: KendallStatusMetric[];
}

function readCache(productKey: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + productKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (typeof parsed.cachedAt !== "number" || Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    // sessionStorage unavailable (privacy mode, SSR-ish edge cases) or bad JSON — just skip the cache.
    return null;
  }
}

function writeCache(productKey: string, entry: CacheEntry): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + productKey, JSON.stringify(entry));
  } catch {
    // Storage full/unavailable — caching is a nice-to-have, never let it break rendering.
  }
}

export interface StatusTabProps {
  productKey: string;
  href: string;
  label: string;
  icon?: ProductIconName;
  separated?: boolean;
}

export function StatusTab({ productKey, href, label, icon, separated }: StatusTabProps) {
  const [state, setState] = useState<DotState>("unchecked");
  const [metrics, setMetrics] = useState<KendallStatusMetric[]>([]);

  useEffect(() => {
    const cached = readCache(productKey);
    if (cached) {
      setState(cached.status);
      setMetrics(cached.metrics);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetch(`${href}/api/v1/status`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        if (!isKendallStatusPayload(data)) throw new Error("unexpected /api/v1/status shape");
        setState(data.status);
        setMetrics(data.metrics);
        writeCache(productKey, { cachedAt: Date.now(), status: data.status, metrics: data.metrics });
      })
      .catch(() => {
        // Fetch threw, timed out, or didn't parse as the expected shape — all
        // treated the same: an unreachable product, shown identically to "down".
        if (!cancelled) setState("unreachable");
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [productKey, href]);

  const dotClass =
    state === "ok"
      ? "kh-dot-ok"
      : state === "degraded"
        ? "kh-dot-degraded"
        : state === "down" || state === "unreachable"
          ? "kh-dot-down"
          : "kh-dot-unchecked";

  const title =
    metrics.length > 0
      ? metrics.map((m) => `${m.label}: ${m.value}`).join(" · ")
      : state === "unchecked"
        ? "Checking status…"
        : "Status unavailable";

  return (
    <a className={`kh-tab${separated ? " kh-separated" : ""}`} href={href} title={title}>
      {icon && <ProductIcon name={icon} />}
      <span>{label}</span>
      <span className={`kh-dot ${dotClass}`} aria-hidden="true" />
    </a>
  );
}
