# Relay — project plan

Production is a **new build**. The prototype (`Relay-handoff/source/relay/`) specifies screens, copy, and the step machine. It does not ship.

This client follows `.cursor/rules/frontend-rule.mdc`. The API is the source of truth for stage, approvals, files, listings, sends, and spend. The browser renders the thread and never invents sales or research numbers.

## Current baseline (done in this setup)

- Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- Folder layout: `components/{core,common,layouts,ui}`, `shared/{hooks,services,queries,stores}`, `features/*`, `app/{config,api}`, `routes`, `styles`
- Providers: React Router, TanStack Query, Axios instance
- **Fixed dark theme** (Sora + prototype tokens); ThemeProvider removed
- Shell routes: Start, My products, Partners, Connections

## Delivery phases (from the PRD)

Phase 1 is the product. Phase 2 is the growth loop.

### Phase 1 — Build, Sources, Whop

**Exit:** a subscriber uploads two documents, gets a cited workbook with real files, and a real Whop checkout link takes a real payment that appears in Relay.

Frontend work:

1. Auth, trial via Stripe Checkout, account shell
2. Connections: text + image (later video/voice) provider keys; Whop OAuth; encrypted keys never shown again in full
3. Start: Guided / Fast, add sources, trending ideas (from API), agency modal
4. Product thread UI: plan panel, spend meter, sticky actions, step cards
5. Build steps 1–7: source read card, pockets, type, structure, manuscript + citations, branding, Ready downloads
6. Publish: Whop preselected as main store; listings; live checkout card
7. My products list + overview (metrics from webhooks, not estimates)

### Phase 2 — Partners

**Exit:** twenty real emails from a real mailbox; a reply labelled; a partner product live on Whop with the split.

Frontend work:

1. Scout results (YouTube first) with list-mention and business-email requirements
2. Own-list paste / CSV with confirmation
3. Template + split + live preview + send confirmation
4. Status rows, reply modal, correctable labels
5. Build their product (agency start + partner attached)
6. Partner share on product overview

### Phase 3 — Distribute

**Exit:** a product shows visits, leads and sales from real platform data; a weekly batch posts.

Frontend work: channel cards, UTM-aware metrics, “Approve this week’s batch”, no promised-traffic copy.

### Phase 4 — Promote and breadth

**Exit:** ten videos scheduled from one product; an Etsy listing created through the API.

Frontend work: promo grid, first-video gate, schedule; Etsy / Gumroad OAuth; Payhip / KDP guided steps; Instagram via owner approval.

## Frontend conventions for every feature

| Concern | Rule |
| --- | --- |
| Server data | TanStack Query in `shared/queries/*.query.ts`; invalidate keys in the mutation hook |
| HTTP | Axios in `shared/services/*.service.ts`; shared client in `app/api/` |
| Client-only UI state | Local state first; Zustand only when prop drilling hurts |
| Forms | react-hook-form + zod for more than one or two fields |
| Copy | `t('namespace:key')`; add `en` / `my` / `th` / `zh` together |
| Files | kebab-case files, named exports, `<Name>Props` interfaces |
| Color | Semantic tokens only (see [project-theme.md](./project-theme.md)) |

## Suggested first implementation slices

1. Auth + subscription gate (trial / paid / none) on the shell
2. Start page + create-product mutation
3. Product thread layout (stage bar, messages, action bar, side plan)
4. Sources upload / links + read-profile card
5. Remaining build steps behind the same action bar
6. Whop connect + publish step
7. Partners screen as its own feature folder

## Out of scope for production paths

Seeded demo accounts, fake timers for “reading” or “sending”, invented marketplace scores, scraping, Relay-owned sending domains, and deleting anything in a connected platform when a product is deleted here.

## Success path to instrument later

Trial → first source → first pocket → first section approved → Ready → live on Whop → first sale → second product. Target time to Ready: under 40 minutes of user attention.
