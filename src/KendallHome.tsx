import { kendallProducts, kendallHomeBase, type CurrentApplicationKey, type ProductOverrides } from "./products";
import { ProductIcon } from "./ProductIcon";
import { StatusTab } from "./StatusTab";

/**
 * Kendall-Home — the shared cross-product top nav ("the frame") every Kendall
 * app renders at the very top of its layout. Self-contained styling (a scoped
 * <style> block + the Kendall palette) so it looks identical in every app,
 * regardless of that app's own CSS/Tailwind setup. The frame is light-mode
 * only, with the approved deep-blue navigation surface.
 *
 * Usage (in each app's root layout, above everything else):
 *   import { KendallHome } from "@kendall/home";
 *   <KendallHome current="ops" />
 *
 * Client/server split: this component itself has NO "use client" directive
 * and does no data fetching — it is fully server-renderable and behaves
 * exactly as it always has when `showStatus` is omitted (the default). The
 * only client-side code in this package lives in ./StatusTab.tsx, a small
 * "use client" leaf that is only imported into the render tree for tabs that
 * actually need a live status dot (fetchable, non-current products) when a
 * caller opts into `showStatus`. This keeps the zero-network-request,
 * zero-new-behavior guarantee intact for every existing consumer, while
 * letting the opt-in feature live right next to the component it augments
 * rather than in a second top-level export callers would have to know about.
 */
export interface KendallHomeProps {
  /** Which product this app IS — that tab renders active (non-link). */
  current: CurrentApplicationKey;
  /** Optional per-app URL overrides (else env vars, else built-in defaults). */
  overrides?: ProductOverrides;
  /**
   * Optional override for the "home base" (Control-plane) URL the brand
   * wordmark links to. Else NEXT_PUBLIC_HOME_BASE_URL, else the wordmark
   * renders as plain non-clickable text.
   */
  homeBaseOverride?: string | null;
  /**
   * Opt-in live status rollup. Default false/undefined — existing consumers
   * that don't pass this see zero behavior change and zero new network
   * requests. When true, every product tab with a non-null href (other than
   * the `current` one) gets a small colored status dot fetched from that
   * product's `/api/v1/status` endpoint, cached in sessionStorage for ~60s.
   */
  showStatus?: boolean;
}

const CSS = `
.kh-bar{display:flex;align-items:center;gap:2px;padding:0 12px;border-bottom:1px solid #1D477B;background:#24528C;color:#FFFFFF;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}
.kh-brand{margin-right:8px;padding:0 8px;font-size:13px;font-weight:700;letter-spacing:-.01em;color:#FFFFFF;user-select:none;text-decoration:none;}
a.kh-brand:hover{background:rgba(255,255,255,.08);color:#FFFFFF;text-decoration:none;}
.kh-brand.kh-brand-disabled{color:rgba(255,255,255,.72);cursor:default;}
.kh-tabs{display:flex;flex:1;align-items:center;gap:2px;overflow-x:auto;}
.kh-tab{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;border-bottom:3px solid transparent;padding:10px 12px;font-size:13px;font-weight:500;color:rgba(255,255,255,.82);text-decoration:none;transition:color .12s,border-color .12s,background .12s;}
.kh-product-icon{display:block;flex:none;color:currentColor;}
.kh-tab:hover{background:rgba(255,255,255,.08);color:#FFFFFF;border-bottom-color:rgba(255,255,255,.45);text-decoration:none;}
.kh-tab.kh-active{color:#FFFFFF;border-bottom-color:#FFFFFF;font-weight:700;cursor:default;}
.kh-tab.kh-disabled{color:rgba(255,255,255,.42);cursor:default;}
.kh-tab.kh-separated{margin-left:10px;border-left:1px solid rgba(255,255,255,.5);padding-left:20px;}
.kh-dot{display:inline-block;width:6px;height:6px;margin-left:6px;border-radius:50%;background:#8B96A3;flex:none;}
.kh-dot-ok{background:#2FA85A;}
.kh-dot-degraded{background:#D99A1E;}
.kh-dot-down{background:#D64545;}
.kh-dot-unchecked{background:#8B96A3;animation:kh-pulse 1.4s ease-in-out infinite;}
@keyframes kh-pulse{0%,100%{opacity:1;}50%{opacity:.35;}}
`;

export function KendallHome({ current, overrides, homeBaseOverride, showStatus }: KendallHomeProps) {
  const products = kendallProducts(overrides);
  const homeBase = kendallHomeBase(homeBaseOverride);
  return (
    <header className="kh-bar">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {homeBase ? (
        <a className="kh-brand" href={homeBase}>
          Kendall
        </a>
      ) : (
        <span className="kh-brand kh-brand-disabled" title="Home base not deployed yet">
          Kendall
        </span>
      )}
      <nav className="kh-tabs" aria-label="Kendall products">
        {products.map((p) => {
          if (p.key === current) {
            return (
              <span key={p.key} className={`kh-tab kh-active${p.separated ? " kh-separated" : ""}`} aria-current="page">
                {p.icon && <ProductIcon name={p.icon} />}
                <span>{p.label}</span>
              </span>
            );
          }
          if (!p.href) {
            return (
              <span key={p.key} className={`kh-tab kh-disabled${p.separated ? " kh-separated" : ""}`} title="Not deployed yet">
                {p.icon && <ProductIcon name={p.icon} />}
                <span>{p.label}</span>
              </span>
            );
          }
          if (showStatus) {
            return <StatusTab key={p.key} productKey={p.key} href={p.href} label={p.label} icon={p.icon} separated={p.separated} />;
          }
          return (
            <a key={p.key} className={`kh-tab${p.separated ? " kh-separated" : ""}`} href={p.href}>
              {p.icon && <ProductIcon name={p.icon} />}
              <span>{p.label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
