# Contributing

## Branches and commits

- Branch from `main`: `feature/P2-07-people-directory`, `fix/P1-17-lockout-message`.
- Start each commit message with the ticket ID: `P2-07: add directory search`.
- Open a pull request that says `Closes #<issue number>`. `main` is protected: one approval and green CI are required.

## Security rules

- The browser is never trusted. Hiding a button is for comfort; the server is the real guard.
- Never store tokens in `localStorage`, `sessionStorage` or URLs.
- Never use `dangerouslySetInnerHTML`.
- Never put secrets in `VITE_*` variables: they are public in the bundle.
- Money is an integer number of paise; show it with `formatInr` from `domain/money.ts`.

## Code rules (enforced by `npm run check` in CI)

| Rule                                 | Check         |
| ------------------------------------ | ------------- |
| No source file over 400 lines        | `check:lines` |
| File and folder naming               | `check:names` |
| No unused CSS class                  | `check:css`   |
| No unused file, export or dependency | `check:dead`  |

If a file nears 300 lines, split it by responsibility (a component per file, rules into `domain/`, calls into `api.ts`).

## Naming

| Kind                           | Convention                               | Example                          |
| ------------------------------ | ---------------------------------------- | -------------------------------- |
| Folders                        | `kebab-case`                             | `people-plus/`, `ui-kit/`        |
| React component file           | `PascalCase.tsx`, one main component     | `AccountsPage.tsx`               |
| Module with several components | `kebab-case.tsx`                         | `data-table.tsx`                 |
| Hooks                          | `useThing.ts`                            | `useDebounce.ts`                 |
| Everything else (ts, css, mjs) | `kebab-case`                             | `route-table.tsx`, `money.ts`    |
| Components and types           | `PascalCase`                             | `StatusPill`, `AdminUser`        |
| Functions and variables        | `camelCase`                              | `formatInr`, `summarizeAccounts` |
| Constants                      | `UPPER_SNAKE_CASE`                       | `MODULE_STUBS`                   |
| CSS classes                    | `kebab-case`, feature prefix             | `pp-card`, `stat-tile`           |
| API fields                     | as the backend sends them (`snake_case`) | `must_change_password`           |
| Permissions                    | `resource:action[:scope]`                | `users:manage`                   |

Tests sit beside the file they test: `money.ts` and `money.test.ts`.

## Layers (what may import what)

`domain/` imports nothing from React. `api/` and `features/*/api.ts` call the server. Components render props and call hooks. Pages live in `features/`; the URL table lives in `routes/route-table.tsx`.

## Every page needs

- Loading, empty and error states (use `DataTable`, `Alert`, `Spinner`).
- A permission guard in the route table when it is not for everyone.
- Server errors shown with the server's message, never a stack trace.
- Unexpected crashes are caught by `ErrorBoundary`; report them through `lib/report-error.ts`.

## Commands

`npm run dev` · `lint` · `format` · `typecheck` · `test` · `test:e2e` · `gen:api` · `check`
