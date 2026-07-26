/**
 * The canonical Kendall product roster for the cross-product top nav. Every app
 * renders the same list; each marks its own tab active via the `current` key.
 *
 * URLs default to the known production deployments and can be overridden per app
 * (a) at the call site via `overrides`, or (b) by build-time env vars
 * (NEXT_PUBLIC_*_URL). A product with a null URL (e.g. Control-Plane, not yet
 * deployed) renders disabled instead of a dead link.
 */
export type ProductKey = "ops" | "foundry" | "control" | "dwellguide";

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
    { key: "foundry", label: "Foundry", href: pick("foundry", "NEXT_PUBLIC_FOUNDRY_URL", "https://kendall-foundry.vercel.app") },
    { key: "control", label: "Control-Plane", href: pick("control", "NEXT_PUBLIC_CONTROL_URL", null) },
    { key: "dwellguide", label: "DwellGuide", href: pick("dwellguide", "NEXT_PUBLIC_DWELLGUIDE_URL", "https://dwellguide.vercel.app") },
  ];
}
