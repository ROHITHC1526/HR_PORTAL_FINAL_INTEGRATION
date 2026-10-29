# Frontend architecture

## Layers

```text
 routes/route-table.tsx        every URL, its permission guard and error boundary
        |
 features/<module>/            pages, hooks, feature API calls, feature CSS
        |                      (accounts, audit, auth, dashboard, modules, ui-kit)
        +--> components/ui/    shared kit: Button, DataTable, StatTile, StatusPill, overlays
        +--> domain/           pure rules and wording: money, dates, people, permissions, status
        +--> api/              fetch client (token + silent refresh), pagination, generated types
 auth/                         session state, route guard
 config/env.ts                 validated configuration, the only reader of import.meta.env
 lib/report-error.ts           one place for unexpected errors
```

## State management

| Kind of state                      | Tool                                               |
| ---------------------------------- | -------------------------------------------------- |
| Server data (lists, balances, ...) | TanStack Query: caching, retries, invalidation     |
| Sign-in session and permissions    | `AuthContext` (access token in memory only)        |
| Forms                              | React Hook Form + zod                              |
| UI state (modals, tabs, filters)   | local `useState`; put shareable filters in the URL |
| Preferences (theme)                | `localStorage`, harmless values only               |

There is no global client-side store. If cross-feature client state ever appears that TanStack Query cannot cover, add Zustand then, not before.

## Data flow for a live page (portal accounts)

1. `route-table.tsx` renders `AccountsPage` inside `RequireAuth` and an `ErrorBoundary`.
2. `AccountsPage` asks `can('users:manage')` (from `domain/permissions.ts`). Without it, no request is sent.
3. `useAccounts()` calls `GET /api/admin/users` through `api/client.ts`, which adds the bearer token and, on a `401`, refreshes the session once and retries.
4. Rows are shown with `DataTable`; numbers come from `summarizeAccounts` and status colours from `StatusPill` (both pure, tested in `domain/`).
5. The server stays the real guard: hiding the page is for comfort only.

## Error handling

- `ApiError` carries `status`, a safe `message` and a machine `code` (`account_locked`).
- Pages show the server's message in an `Alert`; lists have loading, empty and error states.
- `ErrorBoundary` wraps every route and the app root, so one broken page cannot blank the app.
- `lib/report-error.ts` is the single hook for a future monitoring service.

## Configuration

All variables are declared in `.env.example` and validated by `config/env.ts` when the app starts. A missing or malformed value fails immediately with a message naming the variable. Business settings that vary per company (financial year, notice period, shifts) belong in the database and the Settings screen (ticket P8-03), not in the frontend.

## Growth

A new module touches only its own `features/<module>/` folder plus one line in `routes/route-table.tsx` and one change in `docs/api-migration.md`. Employee and admin variants of a page are thin wrappers over shared components, not copies.
