import { kendallProducts, type ProductKey, type ProductOverrides } from "./products";

/**
 * Kendall-Home — the shared cross-product top nav ("the frame") every Kendall
 * app renders at the very top of its layout. Self-contained styling (a scoped
 * <style> block + the Kendall palette) so it looks identical in every app,
 * regardless of that app's own CSS/Tailwind setup, in light and dark themes.
 *
 * Usage (in each app's root layout, above everything else):
 *   import { KendallHome } from "@kendall/home";
 *   <KendallHome current="ops" />   // foundry | control | dwellguide
 */
export interface KendallHomeProps {
  /** Which product this app IS — that tab renders active (non-link). */
  current: ProductKey;
  /** Optional per-app URL overrides (else env vars, else built-in defaults). */
  overrides?: ProductOverrides;
}

const CSS = `
.kh-bar{display:flex;align-items:center;gap:2px;padding:0 12px;border-bottom:1px solid #E1E6ED;background:#F3F6FA;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;}
.kh-brand{margin-right:8px;padding:0 8px;font-size:13px;font-weight:700;letter-spacing:-.01em;color:#1A1A1A;user-select:none;}
.kh-tabs{display:flex;flex:1;align-items:center;gap:2px;overflow-x:auto;}
.kh-tab{white-space:nowrap;border-bottom:2px solid transparent;padding:10px 12px;font-size:13px;font-weight:500;color:#55606E;text-decoration:none;transition:color .12s,border-color .12s;}
.kh-tab:hover{color:#1A1A1A;border-bottom-color:rgba(0,0,0,.12);}
.kh-tab.kh-active{color:#306EBB;border-bottom-color:#306EBB;font-weight:600;cursor:default;}
.kh-tab.kh-disabled{color:rgba(0,0,0,.28);cursor:default;}
@media (prefers-color-scheme: dark){
  .kh-bar{background:#111826;border-bottom-color:#26303F;}
  .kh-brand{color:#EAEEF4;}
  .kh-tab{color:#93A0B2;}
  .kh-tab:hover{color:#EAEEF4;border-bottom-color:rgba(255,255,255,.15);}
  .kh-tab.kh-active{color:#5E97D8;border-bottom-color:#5E97D8;}
  .kh-tab.kh-disabled{color:rgba(255,255,255,.25);}
}
`;

export function KendallHome({ current, overrides }: KendallHomeProps) {
  const products = kendallProducts(overrides);
  return (
    <header className="kh-bar">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="kh-brand">Kendall</span>
      <nav className="kh-tabs" aria-label="Kendall products">
        {products.map((p) => {
          if (p.key === current) {
            return (
              <span key={p.key} className="kh-tab kh-active" aria-current="page">
                {p.label}
              </span>
            );
          }
          if (!p.href) {
            return (
              <span key={p.key} className="kh-tab kh-disabled" title="Not deployed yet">
                {p.label}
              </span>
            );
          }
          return (
            <a key={p.key} className="kh-tab" href={p.href}>
              {p.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
