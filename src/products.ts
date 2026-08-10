/**
 * The canonical Kendall product roster for the cross-product top nav. Every app
 * renders the same list; each marks its own tab active via the `current` key.
 *
 * URLs default to the known production deployments and can be overridden per app
 * (a) at the call site via `overrides`, or (b) by build-time env vars
 * (NEXT_PUBLIC_*_URL). A product with a null URL (not yet deployed, or a
 * consuming app hasn't repinned to this version yet) renders disabled instead
 * of a dead link.
 *
 * The `control` key is Context Warehouse (2026-08-10, ADR-011): Kendall
 * Control's registry/governance responsibilities converge into the Context
 * Warehouse per the portfolio architecture decision — same nav slot, same
 * `ProductKey`/env var name (`NEXT_PUBLIC_CONTROL_URL`) to avoid a breaking
 * rename, new label and target. `control-plane` (the architecture-dashboard
 * repo) is a separate, still-live app — this slot no longer points to it.
 */
export type ProductKey = "ops" | "builder" | "foundry" | "control" | "dwellguide" | "logix" | "studio";

export interface KendallProduct {
  key: ProductKey;
  label: string;
  href: string | null;
}

export type ProductOverrides = Partial<Record<ProductKey, string | null>>;

const env = (k: string): string | undefined => {
  const p = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return p?.env?.[k] || undefined;
};

export function kendallProducts(overrides: ProductOverrides = {}): KendallProduct[] {
  const pick = (key: ProductKey, envKey: string, fallback: string | null): string | null =>
    key in overrides ? overrides[key]! : env(envKey) ?? fallback;
  return [
    { key: "ops", label: "Ops-Dashboard", href: pick("ops", "NEXT_PUBLIC_OPS_URL", "https://kendall-ops.vercel.app") },
    { key: "builder", label: "Builder", href: pick("builder", "NEXT_PUBLIC_BUILDER_URL", "https://kendall-foundry.vercel.app/builder") },
    { key: "foundry", label: "Foundry", href: pick("foundry", "NEXT_PUBLIC_FOUNDRY_URL", "https://kendall-foundry.vercel.app") },
    { key: "control", label: "Context Warehouse", href: pick("control", "NEXT_PUBLIC_CONTROL_URL", null) },
    { key: "dwellguide", label: "DwellGuide", href: pick("dwellguide", "NEXT_PUBLIC_DWELLGUIDE_URL", "https://dwellguide.vercel.app") },
    { key: "logix", label: "Kendall Logix", href: pick("logix", "NEXT_PUBLIC_LOGIX_URL", null) },
    { key: "studio", label: "Context Block Studio", href: pick("studio", "NEXT_PUBLIC_STUDIO_URL", "https://context-block-studio.vercel.app") },
  ];
}

/**
 * The Control-plane "home base" URL — the central architecture/status
 * dashboard the brand wordmark in <KendallHome> links to. Same pick()-style
 * resolution as the per-product URLs above: an explicit override (including
 * an explicit `null`) wins, else the env var, else `null`. A `null` result
 * means "not deployed yet" — the wordmark renders as plain, non-clickable
 * text (the same disabled treatment as a product with no href) instead of a
 * dead link.
 */
export function kendallHomeBase(override?: string | null): string | null {
  return override !== undefined ? override : env("NEXT_PUBLIC_HOME_BASE_URL") ?? null;
}
