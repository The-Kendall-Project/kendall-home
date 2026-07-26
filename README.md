# @kendall/home

The shared **cross-product top nav** ("the frame") that every Kendall app renders
at the very top of its layout — so Ops · Foundry · Control-Plane · DwellGuide are
reachable from anywhere, at all times.

It's a single React component with **self-contained styling** (scoped `<style>` +
the Kendall palette, light & dark), so it looks identical in every app regardless
of that app's own CSS/Tailwind. Product URLs are built in (overridable).

## Install (each app is a separate deployment → git dependency)

```bash
npm install github:kendallproject/kendall-home
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
        <KendallHome current="ops" />   {/* foundry | control | dwellguide */}
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
DwellGuide → dwellguide.vercel.app · Control-Plane → *disabled until deployed*.

Override per app, either via `<KendallHome current=… overrides={{ control: "https://…" }} />`
or build-time env vars `NEXT_PUBLIC_OPS_URL` / `NEXT_PUBLIC_FOUNDRY_URL` /
`NEXT_PUBLIC_CONTROL_URL` / `NEXT_PUBLIC_DWELLGUIDE_URL`.

When `kendall-control` is deployed, set `NEXT_PUBLIC_CONTROL_URL` (or add its
default here) and the Control-Plane tab lights up everywhere.
