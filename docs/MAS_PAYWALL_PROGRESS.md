# MAS Paywall Progress

**Last Updated**: 2026-03-18
**Current Phase**: MAS package built for 1.3.5, submission acceptance pending

## Tracking Rules

- This file is the only progress log for the MAS paywall migration.
- A phase is complete only after implementation, command validation, manual checks, and notes are updated here.

## Phase 0

### Goal
- Create a dedicated progress file for the MAS paywall migration.

### Change Scope
- Added `docs/MAS_PAYWALL_PROGRESS.md` and moved this workstream off the shared `docs/PROGRESS.md`.

### Validation Commands
- None.

### Manual Acceptance
- Confirmed this file exists under `docs/`.

### Remaining Risks
- None.

### Next Entry
- Replace the session mock backend with a main-process license service.

## Phase 1

### Goal
- Replace the session mock backend with a main-process license service and preload IPC bridge.

### Change Scope
- Added `src/shared/license.ts` as the shared contract for provider, status, and structured purchase/restore results.
- Added `electron/licenseService.ts` with provider split: `mas`, `dev-stub`, `unsupported`.
- Added `electron/licenseService.test.ts`.
- Registered `license:check-status`, `license:purchase-pro`, `license:restore-purchases` in `electron/main.ts`.
- Exposed `window.license` in `electron/preload.ts` and `src/vite-env.d.ts`.

### Validation Commands
- `npx vitest run electron/licenseService.test.ts`
- `npx vitest run src/services/LicenseManager.test.ts`
- `npx tsc --noEmit`

### Manual Acceptance
- Not run in a live window yet.

### Remaining Risks
- MAS receipt parsing is still intentionally out of scope for this v1. Cross-device or reinstall recovery depends on explicit `Restore Purchase`.

### Next Entry
- Refactor renderer-side `LicenseManager` and all paywall entry points.

## Phase 2

### Goal
- Refactor renderer license flows and remove all mock UI entry points.

### Change Scope
- Rebuilt `src/services/LicenseManager.ts` around async `initialize()`, `purchasePro()`, and `restorePurchases()` with cached provider/state sync from preload.
- Updated `src/components/PaywallDialog.tsx` for async purchase/restore flows, loading states, and structured error handling.
- Replaced direct mock unlock callbacks in `src/App.tsx`, `src/components/ChatPanel.tsx`, `src/components/PolishButton.tsx`, `src/components/TitlePolishButton.tsx`, and `src/components/Settings.tsx`.
- Removed “reset settings clears Pro state” behavior from settings reset.
- Removed the settings-page testing license switch and replaced it with official purchase/restore controls plus inline feedback.
- App bootstrap now calls `LicenseManager.initialize()` from `src/App.tsx`.

### Validation Commands
- `npx tsc --noEmit`
- `npx vitest run electron/licenseService.test.ts src/services/LicenseManager.test.ts`

### Manual Acceptance
- Pending live verification for:
  - Settings → License tab
  - Chat paywall
  - Title polish paywall
  - Body polish paywall
  - Smart continuation paywall
  - Export paywall

### Remaining Risks
- Live UI verification is still required for purchase button disabled states, close behavior, and restore messaging.

### Next Entry
- Remove user-visible mock/test wording and finalize non-MAS messaging across locales.

## Phase 3

### Goal
- Remove user-visible mock/test wording and add official purchase/restore copy across locales.

### Change Scope
- Updated all 12 locale files under `src/locales/`.
- Removed `paywall.planProMock`, `paywall.testControlsTitle`, `paywall.testToggleTitle`, `paywall.testToggleHint`, `paywall.mockUpgradeNow`, and `paywall.mockHint` from every locale.
- Added official purchase/restore copy, including non-MAS guidance, cancellation copy, and restore success copy.
- Updated `settings.licenseTabHint` and `paywall.planProDesc` across locales.

### Validation Commands
- `npm run i18n:audit`
- `rg -n "planProMock|testControlsTitle|testToggleTitle|testToggleHint|mockUpgradeNow|mockHint|setProStatus\\(|resetProStatus\\(" src/components src/services src/locales --glob '!*.backup'`

### Manual Acceptance
- Locale rendering in the live app is still pending.

### Remaining Risks
- There are still unrelated `test` strings elsewhere in the product, for example “Test connection” in engine settings. They are outside the paywall scope and were not changed.

### Next Entry
- Add MAS audit scripts and evidence outputs.

## Phase 4

### Goal
- Add MAS audit scripts, reports, and evidence checklist generation.

### Change Scope
- Added package scripts: `typecheck`, `test:license`, `mas:metadata:lint`, `mas:url:health`, `mas:check`, `mas:check:ci`, `mas:evidence`.
- Added `package.json > masReview` as the current source of truth for MAS support/privacy URL configuration.
- Added `scripts/mas/common.js`, `metadata-lint.js`, `url-health.js`, `runtime-guard.js`, `check.js`, `evidence.js`.
- Generated reports under `reports/mas/`:
  - `metadata-lint-report.json`
  - `url-health-report.json`
  - `runtime-guard-report.json`
  - `check-report.json`
  - `evidence-checklist.md`

### Validation Commands
- `npm run mas:metadata:lint` → passed
- `npm run mas:url:health` → failed as expected because `masReview.supportUrl` and `masReview.privacyUrl` are empty
- `npm run mas:check` → failed as expected because URL health is red; typecheck, license tests, i18n audit, metadata lint, and runtime guard all passed
- `npm run mas:evidence` → passed

### Manual Acceptance
- Pending deployment of real Support/Privacy URLs and re-run.

### Remaining Risks
- External blocker: `package.json > masReview.supportUrl` is empty.
- External blocker: `package.json > masReview.privacyUrl` is empty.

### Next Entry
- Final verification and MAS sandbox acceptance.

## Phase 5

### Goal
- Publish dedicated Support and Privacy pages for MAS review metadata and remove the last URL configuration blocker.

### Change Scope
- Added `docs/support.html` as the official support page for App Store review and customer contact.
- Added `docs/privacy.html` as the web privacy policy page.
- Updated `docs/index.html` footer to point to the new Support and Privacy pages.
- Added `footer-support` translations to `docs/assets/i18n.js`.
- Set `package.json > masReview.supportUrl` and `package.json > masReview.privacyUrl` to the official GitHub Pages URLs.

### Validation Commands
- `npm run mas:url:health`
- `npm run mas:check`
- `npm run mas:evidence`

### Manual Acceptance
- Pending deployed page smoke check on the public site.

### Remaining Risks
- GitHub Pages must publish the new `support.html` and `privacy.html` pages before App Store Connect metadata is updated.

### Next Entry
- Final verification and MAS sandbox acceptance.

## Phase 6

### Goal
- Produce the signed MAS installer package and verify the packaging path end to end.

### Change Scope
- Fixed `package.json > build.mas.identity` so electron-builder can resolve both the MAS app-signing identity and the MAS installer identity during the same build.
- Bumped release metadata and About-facing version references to `1.3.5`.
- Moved `scripts/build-mas.sh` to a preflight-first flow: MAS audit runs before cleanup and packaging.
- Re-ran the MAS gate and generated the signed MAS installer package at `release/mas-arm64/WitNote-1.3.5-arm64.pkg`.

### Validation Commands
- `npm run build:mas`
- `bash scripts/build-mas.sh`

### Manual Acceptance
- Package generated locally, but App Store Connect upload and MAS Sandbox purchase/restore acceptance are still pending.

### Remaining Risks
- Public GitHub Pages smoke check for `support.html` and `privacy.html` is still pending.
- MAS Sandbox purchase and restore still require live validation in the built app.

### Next Entry
- Upload the MAS package and complete sandbox acceptance.

## Final Verification

### Passed
- `npx tsc --noEmit`
- `npx vitest run electron/licenseService.test.ts src/services/LicenseManager.test.ts`
- `npm run i18n:audit`
- `npm run mas:metadata:lint`
- `npm run mas:url:health`
- `npm run mas:check`
- `npm run mas:evidence`
- `npm run build:mas`
- `bash scripts/build-mas.sh`

### Blocked By Environment
- `npm run build`

`npm run build` was not re-run in this round. The MAS packaging path was validated with `bash scripts/build-mas.sh`.

### Manual Acceptance Still Required
- Upload `release/mas-arm64/WitNote-1.3.5-arm64.pkg` to App Store Connect
- End-to-end purchase flow in MAS Sandbox
- End-to-end restore flow in MAS Sandbox
- Local window-level UI acceptance for all paywall entry points

### External Blockers
- Publish the updated GitHub Pages site so `support.html` and `privacy.html` are reachable from the production domain
