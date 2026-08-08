# @kendall/home

The shared **cross-product top nav** ("the frame") that every Kendall app renders
at the very top of its layout — so Ops · Foundry · Control-Plane · DwellGuide are
reachable from anywhere, at all times.

It's a single React component with **self-contained styling** (scoped `<style>` +
the Kendall palette, light & dark), so it looks identical in every app regardless
of that app's own CSS/Tailwind. Product URLs are built in (overridable).

## Install (published to GitHub Packages)

This package is published to the private **GitHub Packages** registry under the
`@kendall` scope. Each consuming app needs an `.npmrc` pointing the scope at that
registry, plus a token with `read:packages` in its build environment:

```ini
# .npmrc
@kendall:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
npm install @kendall/home
```

Do **not** install it as a raw GitHub tarball (`github:…/archive/<sha>.tar.gz`) —
that has no real version, breaks builds when GitHub is unavailable, and silently
drifts. Pin a semver version instead.

### Publishing a new version

Bump `version` in `package.json`, then push a matching tag — CI publishes it:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

Because the package ships TypeScript source, tell Next to transpile it —
`next.config.ts`:

```ts
const nextConfig = { transpilePackages: ["@kendall/home"] };
export default nextConfig;
```

## Use — render it once, at the top of the root layout

```tsx
import { KendallHome } from "@kendall/home";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <KendallHome current="ops" />   {/* foundry | control | dwellguide | logix | studio */}
        {children}
      </body>
    </html>
  );
}
```

Each app passes its own `current` so its tab renders active. That's the only
per-app difference.

## URLs

Defaults: Ops → kendall-ops.vercel.app · Foundry → kendall-foundry.vercel.app ·
DwellGuide → dwellguide.vercel.app · Control-Plane, Kendall Logix, and Context
Block Studio → *disabled until deployed*.

Override per app, either via `<KendallHome current=… overrides={{ control: "https://…" }} />`
or build-time env vars `NEXT_PUBLIC_OPS_URL` / `NEXT_PUBLIC_FOUNDRY_URL` /
`NEXT_PUBLIC_CONTROL_URL` / `NEXT_PUBLIC_DWELLGUIDE_URL` / `NEXT_PUBLIC_LOGIX_URL` /
`NEXT_PUBLIC_STUDIO_URL`.

When `kendall-control`, Kendall Logix, or Context Block Studio get a public
deployment, set the matching env var (or add its default here) and that tab
lights up everywhere.

## Brand link → "home base" (v0.4.0+)

The "Kendall" wordmark links to the Control-plane home-base app once it's
deployed. Same pattern as the product URLs above: set `NEXT_PUBLIC_HOME_BASE_URL`
(or pass `homeBaseOverride` to `<KendallHome>`). Until then it renders as plain,
non-clickable text — no dead link.

```ini
# .env
NEXT_PUBLIC_HOME_BASE_URL=https://control.kendall.example
```

```tsx
<KendallHome current="ops" homeBaseOverride="https://control.kendall.example" />
```

## Live status dots (v0.4.0+, opt-in via `showStatus`)

Pass `showStatus` to have every fetchable, non-current tab show a small colored
status dot — green (`ok`) / amber (`degraded`) / red (`down` or unreachable) /
grey pulsing (not yet checked) — sourced from that product's own
`` `${href}/api/v1/status` `` endpoint. Hover (or focus) a tab to see its
metrics as a native tooltip.

```tsx
import { KendallHome } from "@kendall/home";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <KendallHome current="ops" showStatus />
        {children}
      </body>
    </html>
  );
}
```

Notes:
- **Default is off.** Omitting `showStatus` (or passing `false`) is byte-for-byte
  the old behavior — no fetches, no client-side JS pulled in for this feature.
- Each fetch races a 3s timeout; a slow or hung product's dot just shows
  "down" without blocking the rest of the bar.
- Successful responses are cached in `sessionStorage` per product for ~60s, so
  navigating between pages in the same app/tab within that window doesn't
  refetch every product's status on every render.
- Expected response shape from `/api/v1/status` (a fixed contract shared with
  the products themselves):
  ```json
  {
    "system": "logix",
    "status": "ok",
    "version": null,
    "metrics": [{ "label": "Active projects", "value": 12 }],
    "checkedAt": "2026-08-08T22:14:00.000Z"
  }
  ```

**Manual verification (no runnable app in this repo):** once a consuming app
picks up `^0.4.0` and renders `<KendallHome current="..." showStatus />`, check
in a browser that: (1) tabs for products with a real deployment show a dot that
settles from grey/pulsing to green/amber/red within ~3s; (2) hovering a dot (or
its tab) shows a tooltip with metrics like `Active projects: 12`; (3) a product
whose API is down or slow still lets the rest of the bar settle within 3s; (4)
reloading the page within ~60s reuses the cached dot color instantly instead of
re-showing the grey pulse; (5) the "Kendall" wordmark is a working link once
`NEXT_PUBLIC_HOME_BASE_URL` is set, and plain dimmed text when it isn't.
