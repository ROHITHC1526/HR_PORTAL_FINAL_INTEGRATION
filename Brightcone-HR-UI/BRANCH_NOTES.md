# Branch notes — People Plus UI

## Included

- Rework the frontend into shared API/auth/UI components, route-level screens, suite navigation, and reusable People Plus views.
- Match the supplied Brightcone references for the login screen, dashboard, shell, logo assets, icons, colors, and navigation.
- Connect supported account, authentication, and audit flows to backend APIs; keep unsupported HR data areas clearly marked “Coming soon.”
- Remove unsupported Careers role/pay claims and update authentication browser expectations.
- Replace stale completion claims with current UI scope and run instructions.

## Validation

- `npm run lint`: passed.
- `npm test`: passed, 2 files / 16 tests.
- `npm run build`: passed.
- Playwright E2E did not complete on the audit host; the isolated retry produced no result.
