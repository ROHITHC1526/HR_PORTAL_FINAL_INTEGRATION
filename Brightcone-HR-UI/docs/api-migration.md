# From prototype data to backend endpoints

The original prototype (`Brightcone People Plus.html`) kept every record in the browser. In the real app each area switches to a backend endpoint as its phase is built. Until then the page is a "Coming soon" stub (see `src/features/modules/modules.ts`) and shows no invented data.

**Rule for each migration:** build the endpoint and its tests, add it to `src/openapi.rs` in the backend, copy `openapi.json` here, run `npm run gen:api`, create `src/features/<module>/` with a typed `api.ts`, point the route in `route-table.tsx` at it, delete its stub line, and mark it Live below.

## Live now

| Screen                  | Endpoint                                      | Permission     | Ticket         |
| ----------------------- | --------------------------------------------- | -------------- | -------------- |
| Sign in / out / refresh | `POST /api/auth/login`, `/logout`, `/refresh` | none           | P1-04 to P1-06 |
| Forgot / reset password | `POST /api/auth/forgot`, `/reset`             | none           | P1-11          |
| Session and permissions | `GET /api/me`                                 | any signed-in  | P1-07          |
| Change password         | `PUT /api/me/password`                        | any signed-in  | P1-07          |
| Portal accounts         | `GET /api/admin/users`                        | `users:manage` | P1-11          |
| Audit log               | `GET /api/audit`                              | `audit:read`   | P1-09          |
| Connection badge        | `GET /api/health`                             | none           | P0-01          |

## Waiting for a backend

| Route(s)                          | Prototype data replaced      | Endpoint(s) to build                                 | Phase / ticket |
| --------------------------------- | ---------------------------- | ---------------------------------------------------- | -------------- |
| `/people-dashboard`, `/directory` | employees, org chart         | `/api/employees`, `/api/directory`, `/api/org-chart` | P2-02, P2-05   |
| `/profile`                        | my profile, dependents       | `/api/me/profile`, `/api/me/dependents`              | P2-08          |
| `/attendance`, `/roster`          | clock records, shifts        | `/api/attendance/*`, `/api/shifts`                   | P3-02, P3-01   |
| `/leave`                          | leaves, balances, holidays   | `/api/leaves`, `/api/leave-types`, `/api/holidays`   | P3-05          |
| `/approvals`                      | pending requests             | `/api/approvals`                                     | P1-13          |
| `/expenses`                       | expense claims               | `/api/expenses`                                      | P4-01          |
| `/feed`                           | announcements                | `/api/announcements`                                 | P4-04          |
| `/payroll`                        | payroll runs, payslips       | `/api/payroll/runs`, `/api/me/payslips`              | P5-02, P5-03   |
| `/recruitment`                    | jobs, candidates, offers     | `/api/jobs`, `/api/candidates`                       | P6-01          |
| `/learn`                          | courses, progress            | `/api/courses`                                       | P6-04          |
| `/sign`                           | policies, letters, documents | `/api/policies`, `/api/letters`                      | P7-02          |
| `/reports`                        | dashboard numbers            | `/api/reports/*`                                     | P8-01          |
| `/settings`                       | company profile, workflows   | `/api/settings`                                      | P8-03          |

Aliases (`/careers`, `/pay`, `/my-expenses`, `/my-sign`, `/my-learning`, `/my-schedule`) show the same page as their target.

## Rules that stay on the server

Leave balance and day counting, salary and tax, approval routing, and every permission check run on the backend. The frontend may preview a result only by calling a preview endpoint, so the two can never disagree.
