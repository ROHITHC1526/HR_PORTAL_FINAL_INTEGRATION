# Changelog

## Unreleased

### Added

- `src/config/env.ts`: validated configuration, the only reader of `import.meta.env`.
- `src/domain/`: pure, tested logic for money (paise), dates, people, permissions, status tones and password rules.
- `StatusPill`, and `DataTable` / `StatTile` used by the portal accounts page.
- `ErrorBoundary` on every route and the app root, and `lib/report-error.ts`.
- `routes/route-table.tsx`: every URL in one data-driven table.
- `features/` folders: `accounts`, `audit`, `auth`, `dashboard`, `modules`, `ui-kit`.
- CI structure checks: 400-line limit, naming conventions, unused CSS, dead code (knip).
- `docs/architecture.md` and `docs/api-migration.md`.

### Changed

- "Coming soon" pages are generated from `features/modules/modules.ts` instead of twenty near-identical components.
- Portal accounts use the generated API types and the shared table instead of a hand-written one.
- The UI-kit page is only routed in development (or with `VITE_ENABLE_UI_KIT=true`).
- README and CONTRIBUTING describe the real structure and conventions.
- Renamed `ToastContext.ts` to `toast-context.ts` and `fakeApi.ts` to `fake-api.ts` to follow the naming rule.

### Removed

- Unused: legacy `AppShell`, `HomePage` (with invented statistics), `useToast` shim, `people-plus/views.tsx`, duplicate helpers, unused exports.
- About 130 dead CSS rules (roughly 370 lines) from the old views and shell.

## Earlier

See git history on `feat/people-plus-production-hardening` and `STATUS.md`.
