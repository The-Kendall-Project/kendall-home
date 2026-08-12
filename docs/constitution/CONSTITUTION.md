# Kendall Home Constitution

> This is a static mirror of the org-wide AOS (AI Operating Standard) pattern.
> For the canonical definition of the pattern itself — the 9-part numbering,
> why every repo carries one, and why this is a plain file rather than a row
> in Control's database — see the **"AOS — the portable Constitution
> pattern"** section of `control-plane`'s
> `docs/architecture/target-architecture.md`. Read that section, then this
> file, before reading `AGENTS.md`.
>
> `@kendall/home` is a UI/nav module, not an AI application, so several parts
> below are intentionally thin or marked not applicable — the AOS BOM
> describes any organizational system, model or no model, and a module that
> never calls an LLM still gets a Constitution.

## AOS-100 — Foundations

**What this module is for.** `@kendall/home` (package name `@kendall/home`,
Kendall part number `KP-MODULE-HOME`) is the shared cross-product top nav —
"the frame" — that every `KP-APP-*` product renders at the very top of its
layout, so Ops, Foundry, DwellGuide, and the rest of the roster are reachable
from anywhere in the system. It exists so that "one connected system" is
something a user can *see*, not just something true in an architecture
diagram.

## AOS-200 — Roles & Relationships (core)

Role definitions are canonical at the org level — Drive AOS-200 / the
`kendall-ops` System Context page — and this repo does not restate them.
`@kendall/home` has no role model of its own: it renders whichever product
and whichever signed-in user is looking at it, without knowing or caring who
that is. The only "relationship" this repo encodes is structural, not
human: every `KP-APP-*` product is a consumer of this package, and this
package has no consumers of its own (it depends on nothing product-specific).
Stating that plainly, rather than inventing nav-bar-specific roles, is the
correct AOS-200 answer for a module like this.

## AOS-300 — Problems & AI Use-Cases (core)

**The problem this repo solves.** Without a shared nav frame, every Kendall
product either has no cross-product navigation at all, or each one
reimplements a top bar slightly differently — different product lists,
different styling, different logic for "which tab is active" — and a user
moving between Ops, Foundry, and DwellGuide has no visual cue that they're in
one connected system rather than several unrelated apps that happen to share
a brand name. `@kendall/home` exists so that improving the nav once improves
it everywhere, and so the "am I in one system?" question is answered by the
UI itself.

There is no AI use-case here: this module contains no model calls, no
prompts, and no agent behavior. The one feature that could be mistaken for
one — `showStatus`'s live status dots — is a plain `fetch()` against each
product's own `/api/v1/status` endpoint, not an AI feature.

## AOS-400 — Rules & Policies (core)

Rules actually evidenced in the code and README, not aspirational ones:

- **Self-contained styling.** The component ships its own scoped `<style>`
  block (the `CSS` constant in `src/KendallHome.tsx`) using the Kendall
  light-only palette, so it renders identically regardless of the host
  app's own CSS/Tailwind setup. Nothing in this package should come to depend
  on a consuming app's global styles.
- **`ProductKey` must stay in sync with the visible roster.** `src/products.ts`
  defines `ProductKey` and `kendallProducts()` as the single ordered navigation
  roster every app renders. Internal applications that consume the frame but
  are not visible in the roster use `LegacyApplicationKey`, so they do not
  create an unapproved tab. Adding, removing, or renaming a visible product
  means updating the roster and `ProductKey` together — see AOS-500.
- **No dead links.** A product with a `null` href (not yet deployed —
  currently `boundary`) renders as a disabled, non-clickable tab rather than
  a link to nowhere. The "Ops" suite label
  wordmark follows the same rule against `NEXT_PUBLIC_HOME_BASE_URL` /
  `homeBaseOverride`.
- **`showStatus` must not change default behavior.** The live-status feature
  (`src/StatusTab.tsx`) is opt-in only. Omitting `showStatus` (or passing
  `false`) must remain byte-for-byte the old behavior: `KendallHome` itself
  stays a plain server component with zero client JS and zero network
  requests unless a caller explicitly opts in.
- **`/api/v1/status` is a fixed, shared contract** (`src/status.ts`): `{
  system, status: "ok"|"degraded"|"down", version, metrics[], checkedAt }`.
  This shape is implemented independently by each product; do not change the
  field names or shape here without coordinating that change with them.
  Fetched JSON is treated as untrusted until it passes
  `isKendallStatusPayload`.
- **Status fetches must not block the bar.** Each product's status fetch
  races a 3-second timeout (`FETCH_TIMEOUT_MS`) and is cached in
  `sessionStorage` for ~60 seconds (`CACHE_TTL_MS`) per product, so one slow
  or hung product can't hold up the rest of the nav, and repeat navigation
  within an app doesn't refetch every product on every render.

## AOS-500 — Operating Processes (core)

**Adding a new product to the roster:**

1. Add the new key to the `ProductKey` union in `src/products.ts`.
2. Add a matching entry to the array returned by `kendallProducts()` — label,
   and href resolved via `pick()` (explicit override, else
   `NEXT_PUBLIC_<PRODUCT>_URL`, else a built-in default or `null` if not yet
   deployed).
3. Each consuming app renders `<KendallHome current="..." />` with its own
   key — that's the only per-app difference; nothing else in a consumer needs
   to change.
4. When a previously-`null` product gets a real deployment, set its env var
   (or update the built-in default here) and its tab lights up in every app
   that renders this package, with no per-app change required.

**Publishing a new version — intended process vs. current reality.** The
intended process (per `README.md` and `.github/workflows/release.yml`) is:
bump `version` in `package.json`, tag it (`git tag vX.Y.Z && git push origin
vX.Y.Z`), and CI publishes to GitHub Packages using the workflow's own
`GITHUB_TOKEN` with `packages: write`.

**As of this writing, that publish step is broken at the org level**: the
last three tag pushes (`v0.2.0`, `v0.3.0`, `v0.4.0`) each triggered the
`Publish @kendall/home` workflow, and each run failed identically —
`npm error code E403` / `403 Forbidden ... Permission permission_denied: The
requested installation does not exist.` This is an org-level GitHub Packages
permission issue (the installation doesn't exist for this registry/scope), not
a bug in this repo's workflow file or `package.json`. Do not "fix" this by
changing the workflow's auth strategy without confirming the org-level
permission has actually been granted — retrying with the same token shape
will fail the same way.

**Practical consequence:** no version of `@kendall/home` is actually
installable from `https://npm.pkg.github.com` today, despite `README.md`
describing that as the supported install path. Until the org-level
permission is fixed and a publish run succeeds, consuming apps should pin
this package via a GitHub-tarball reference (e.g.
`github:The-Kendall-Project/kendall-home#<commit-sha>`) rather than a semver
range against the registry, and should re-pin to a new commit SHA on update
rather than expecting `npm install @kendall/home@^0.4.0` to resolve. This is a
placeholder workaround, not the desired end state — replace it with a normal
semver-pinned registry install as soon as a publish run actually succeeds.

## AOS-600 — Products, Solutions & Deliverables (core)

The deliverable is the `@kendall/home` package itself (`KP-MODULE-HOME`),
consisting of:

- **`KendallHome`** (`src/KendallHome.tsx`) — the nav component. Props:
  `current` (which product this app is — renders active), `overrides`
  (per-app URL overrides), `homeBaseOverride` (override for the brand link
  target), `showStatus` (opt-in live status rollup).
- **The product roster** (`src/products.ts`) — `ProductKey`, `KendallProduct`,
  `kendallProducts()`, `kendallHomeBase()`. The single source of truth for
  which products exist and where they live.
- **The status-rollup feature** (`src/StatusTab.tsx`, `src/status.ts`,
  introduced v0.4.0) — opt-in per-tab colored status dots (green/amber/red/
  grey-pulsing) sourced from each product's own `/api/v1/status`, with a
  native tooltip on hover/focus showing that product's metrics.
- **Public exports** (`src/index.ts`) — `KendallHome`, `KendallHomeProps`,
  `kendallProducts`, `kendallHomeBase`, `KendallProduct`, `ProductKey`,
  `ProductOverrides`, and the status types (`KendallStatusLevel`,
  `KendallStatusMetric`, `KendallStatusPayload`).

## AOS-700 — Assets & Sources

Not applicable. This module owns no data assets, no external data sources,
and holds no credentials — it renders a static roster and, when opted in,
reads (never writes) each product's own public `/api/v1/status` endpoint.

## AOS-800 — AI Applications

Not applicable. No model calls, prompts, or agent behavior live in this
package. See AOS-300 above.

## AOS-900 — Governance & Auditing

Not applicable today. There is no separate audit trail for this module
beyond normal git history and GitHub Actions run history (see AOS-500 for
the current, broken publish-run history as an example of the latter). If
Control's `modules_registry` (see `control-plane`'s
`docs/architecture/target-architecture.md`) later indexes this module's
certification/freshness, that entry lives in Control's database, not here —
per the DB-vs-repo rule described in that document.
