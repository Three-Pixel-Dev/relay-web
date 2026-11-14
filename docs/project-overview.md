# Relay — project overview

Relay is a digital product assistant. The user gives it what they know, their documents, or a creator’s YouTube or Instagram link. Relay reads those sources, finds a profitable angle, writes and designs a selling-ready PDF that cites the sources, lists it on Whop, runs channels that bring buyers, and makes promo videos. With Partners, Relay finds creators who have an email list and no product, sends a partnership offer from the user’s mailbox, and builds the product for those who say yes.

**Promise:** Build it. Sell it. Get it seen. Alone or with a creator.

This repository is the production **web client**. The clickable prototype in the handoff pack is the behaviour and screen reference; it is not copied forward. Production is a new React app on the stack in `.cursor/rules/frontend-rule.mdc`.

## What this product does

| Stage | What happens | Who does it |
| --- | --- | --- |
| **Build** | Sources and input → profitable pockets → product type → structure → manuscript → branding → ready files | Relay writes and designs; the user chooses and approves |
| **Publish** | Choose where to sell → listing copy and price → product created on each connected platform | Relay through the user’s accounts |
| **Distribute** | Channels on/off, weekly batch approval, visits / leads / sales | Relay runs; the user approves weekly |
| **Promote** | Short videos and graphics from the product, scheduled | Relay generates; the user approves the first |

Every product has an **agent thread**. Relay posts what it will do next and what it costs in AI. A step card sits under the message. A sticky action bar offers Proceed, Suggest a change, or Cancel (plus Stop, Looks good, and gate actions depending on state). No model call, send, or external create happens without a recorded Proceed.

## Users

| Role | Jobs |
| --- | --- |
| Subscriber | Add sources, build products, publish, distribute, promote, run partner outreach, see sales |
| Agency user (same account) | Build products for a client or creator from their content |
| Admin | See subscribers, products built, listing and first-sale rates, outreach volumes |

## Pricing and market

- Relay: **$19/month** or **$149/year**, 7-day trial, **Stripe only**
- AI usage runs on the **user’s own provider keys**. Relay does not resell AI and takes no cut of sales
- Whop and other marketplaces charge their own fees
- Market: international, **English first**. This client is set up for i18n (`en`, `my`, `th`, `zh`); the UI language switcher starts with `en` and `my`

## Main surfaces (from the prototype)

- **Start** — “What do you know, care about, or want to help people with?” Guided or Fast mode, Add sources, Trending ideas, “I’m building for someone else”
- **My products** — list and product overview (stage, files, Whop card, partner share, sources)
- **Partners** — find creators, outreach template, replies, “Build their product”
- **Connections** — Whop (main store), other marketplaces, mailbox, reach, leads, AI keys, subscription
- **Product thread** — Build / Publish / Distribute / Promote behind a stage bar

## Platform rules that the UI must respect

- YouTube: public data and captions, not scraping
- Instagram: no scraping; owner-approved login or user-uploaded media
- Web pages: fetched once, robots.txt respected
- Outreach: user’s Gmail or Outlook only; confirmation, daily cap, suppression, stop on reply
- Delete in Relay never deletes listings or files in connected accounts
- Production paths must not include seeded data, simulated runs, or demo connects

## This frontend

Vite + TypeScript + Tailwind CSS + shadcn/ui. React Router, TanStack Query, Axios, Zustand, react-hook-form + zod, Framer Motion, react-i18next.

The visual system is a **single dark indigo theme** (Sora, sun / mint / coral / lilac). There is no light mode and no theme switcher. See [project-theme.md](./project-theme.md). Delivery order is in [project-plan.md](./project-plan.md).

Handoff sources (behaviour only): `Relay-handoff/START-HERE.md`, `docs/Relay-PRD.md`, `docs/TECHNICAL-HANDOFF.md`, `source/relay/`.
