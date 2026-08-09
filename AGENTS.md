# AGENTS.md — @kendall/home

Read `docs/constitution/CONSTITUTION.md` first — it's this repo's instance of
the org-wide AOS (AI Operating Standard) pattern and gives the context needed
to work in this repo sensibly.

This repo is `kendall-order-02` in the org-wide reading order — right after
`control-plane` (00, the architecture map) and `kendall-control` (01, the
registry root), and before every individual product app — because it's the
shared nav frame every product renders, so it needs to be understood before
the products that consume it. See `control-plane`'s
`docs/architecture/target-architecture.md` for the full sequence.

## What this repo owns / does not own

**Owns:**
- The shared cross-product top nav component (`KendallHome`,
  `src/KendallHome.tsx`) that every `KP-APP-*` product renders at the top of
  its layout.
- The canonical product roster (`src/products.ts`) — the single list of
  which Kendall products exist, their keys, labels, and default URLs.
- The opt-in live status-rollup feature (`src/StatusTab.tsx`, `src/status.ts`)
  and the shared `/api/v1/status` contract shape it depends on.

**Does not own:**
- Any product's actual page content or business logic. This package renders
  only the frame at the top of the page; everything below it belongs to the
  consuming app.
- Role/user definitions — those are canonical at the org level (Drive
  AOS-200 / `kendall-ops` System Context page). This repo just renders
  whoever is using the product, without a role model of its own.
- The `/api/v1/status` implementation itself for any given product — this
  repo only defines and consumes the contract shape; each product implements
  its own endpoint.

## Prohibited shortcuts

- Don't let a consuming product's page-specific styling leak into
  `KendallHome`'s shared `<style>` block, and don't make the shared component
  depend on any host app's CSS/Tailwind setup — the whole point of the
  self-contained styling is that it renders identically everywhere.
- Don't add a new product to `kendallProducts()` without also adding its key
  to the `ProductKey` union (or vice versa) — they must stay in sync; see
  AOS-400/500 in the Constitution.
- Don't change the `/api/v1/status` response shape in `src/status.ts` without
  coordinating with the products that implement it — it's a fixed, shared
  contract, not something this repo can unilaterally change.
