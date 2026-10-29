# People Plus task delivery

Reviewed: 19 October 2026
Branch: `feat/people-plus-production-hardening`

This checklist describes the frontend work in this branch and links it to the shared backend tasks. “Implemented” means code is present; it does not mean the full workflow has production sign-off.

| Task | Frontend work in this branch | Remaining verification or decision |
|---|---|---|
| PGS-02 — GitHub project, API docs, frontend types | OpenAPI-generated API declarations, API client integration, and CI checks for generated contract drift. Backend repository contains the docs publishing workflow and GitHub project setup files. | Enable Pages and configure the organization project and labels. |
| PGS-05 — Forgot password and HR account tools | Forgot/reset password screens, authenticated session flow, account/security controls, and integration with exposed account APIs. | Verify end-to-end against the live backend and configured mail delivery. |
| PGS-08 — Record registry and validation engine | Typed API client foundations and reusable feature/domain structure. Registry and validation APIs are implemented in Brightcone-HR-API. | Product owner must confirm the record catalog before broad access. |
| PGS-09 — Generic CRUD, archive/restore, history | Modular route, API, and shared UI foundations for People Plus features. Generic CRUD/history APIs are implemented in Brightcone-HR-API. | Complete module-specific screens after backend scopes and retention policies are approved. |
| PGS-10 — CSV export and backup/restore | API contract/type generation supports the backend export endpoints. Export/import APIs are implemented in Brightcone-HR-API. | Verify the UI against the live API after database and security review. |
| PGS-11 — Rules engine and six-role access control | Session and role-aware frontend foundations; notification API client and top-bar notification integration. Authorization and event processing are implemented in Brightcone-HR-API. | Verify notification and role workflows with the live backend and queue. |

## Verification snapshot

- Source limit, naming, CSS usage, dead-code checks, lint, and TypeScript check passed on 19 October 2026.
- Production build passed.
- Tests passed: 16 files and 69 tests.
- Live backend/database integration was not exercised in this environment. Unsupported module workflows remain marked as unavailable instead of presenting fake records.

See `STATUS.md`, `docs/architecture.md`, and `docs/api-migration.md` for frontend structure and implementation notes.
