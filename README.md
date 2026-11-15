# Relay Web (`relay-web`)

React + TypeScript + Vite frontend for Relay.

## Backend & Catalog

- **Live Spring backend required**: All HTTP requests go directly to `relay-server` (via the Vite `/api` proxy to `http://localhost:8080/api` or `VITE_API_BASE_URL`). There is no mock HTTP adapter.
- **Static Catalog**: Service definitions, build step labels, palettes, and trending prompts live in `src/shared/catalog/relay-catalog.ts` and are read synchronously in-process (`useCatalogQuery`) with zero network calls.
- **Implemented API surface**:
  - `/api/auth/*` (signup, login, Google Sign-In, refresh, profile, logout)
  - `/api/subscription/*` (plans, subscribe, current subscription, cancel/resume, history)
  - `/api/workspace/*` (workspace state, onboarding flag, service credential connections)
  - `/api/products/*` through Step 0 (CRUD, source links, multipart file uploads, `proceed`, `approve`, `suggest`, `cancel`, `resume`)

## Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start `relay-server` on port `8080`.
3. Run the web app:
   ```bash
   npm install
   npm run dev
   ```
