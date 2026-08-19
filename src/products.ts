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
 * The visible roster is deliberately small and ordered. Dwell Guide is the
 * final, separated destination because it is a distinct product experience.
 */
export type ProductKey = "ops" | "control" | "foundry" | "studio" | "capability" | "logix" | "dwellguide";
export type ProductAccent = "blue" | "orange" | "red" | "green" | "purple";
export type ProductIconName = "gauge" | "warehouse" | "flask" | "blocks" | "graduationCap" | "network";
export type LegacyApplicationKey = "builder" | "boundary";
export type CurrentApplicationKey = ProductKey | LegacyApplicationKey;

export interface KendallProduct {
  key: ProductKey;
  label: string;
  href: string | null;
  icon?: ProductIconName;
  accent?: ProductAccent;
  separated?: boolean;
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
    { key: "ops", label: "Ops Dashboard", href: pick("ops", "NEXT_PUBLIC_OPS_URL", "https://kendall-ops.vercel.app"), icon: "gauge", accent: "blue" },
    { key: "control", label: "Warehouse", href: pick("control", "NEXT_PUBLIC_CONTROL_URL", "https://kp-context-warehouse.vercel.app"), icon: "warehouse", accent: "green" },
    { key: "foundry", label: "Foundry", href: pick("foundry", "NEXT_PUBLIC_FOUNDRY_URL", "https://kendall-foundry.vercel.app"), icon: "flask", accent: "red" },
    { key: "studio", label: "Context Block Studio", href: pick("studio", "NEXT_PUBLIC_STUDIO_URL", "https://context-block-studio.vercel.app"), icon: "blocks", accent: "purple" },
    { key: "capability", label: "Capability", href: pick("capability", "NEXT_PUBLIC_CAPABILITY_URL", "https://kendall-capability.vercel.app"), icon: "graduationCap", accent: "orange" },
    { key: "logix", label: "Logix", href: pick("logix", "NEXT_PUBLIC_LOGIX_URL", "https://kendall-logix.vercel.app"), icon: "network", accent: "purple" },
    { key: "dwellguide", label: "Dwell Guide", href: pick("dwellguide", "NEXT_PUBLIC_DWELLGUIDE_URL", "https://dwellguide.ai"), separated: true },
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
