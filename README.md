# TrimStack

Centralized SaaS spend visibility for finance teams: subscription registry, waste-detection engine, optimization alerts, dashboard, CSV export.

## Local development

```bash
npm install                # install both workspaces (server + web)
npm run dev:server         # API on http://localhost:3001 (orchestrator starts this)
npm run dev:web            # web on http://localhost:5173, /api proxied to :3001
```

## Full local gate (same as CI)

```bash
npm run verify            # typecheck → lint → unit tests → build
```

Workspaces: `server/` (Express 5 + TypeScript + better-sqlite3 + Zod) and `web/` (React 19 + Vite + Tailwind v4).

Docs: `project-specs/` (spec) · `project-docs/` (DESIGN.md, API contract, frontend design spec) · `project-tasks/` (task list, sprint plan).
