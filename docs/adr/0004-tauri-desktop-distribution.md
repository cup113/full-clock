# 4. Desktop Shell — Tauri over the Existing Static Build

**Date**: 2026-10-29
**Status**: Accepted

## Context

The web build already runs offline thanks to the service worker, but installing it as an app on Windows is still a browser negotiation (Chrome/Edge "install", or a shortcut to a hosted URL). Exam-hall and kiosk machines often cannot rely on that, and are frequently offline by policy. There is a second, harder limit: time sync can only use HTTP APIs, because a page cannot open a UDP socket, so `offset` accuracy is capped by the latency and timestamp resolution of remote JSON endpoints.

## Decision

### One frontend, two distributions

The desktop app wraps the same `adapter-static` output (`build/`) in a **Tauri v2** shell; the Netlify + PWA deployment is unchanged. Every UI change therefore ships to both, and `<path>.html` fallback resolution in Tauri's asset protocol makes the prerendered routes (`/zh`, `/about`, …) work as-is.

Two Windows artifacts come out of `pnpm tauri build`:

- **NSIS installer** — for normal installs, and able to bootstrap WebView2 when it is missing.
- **Portable `full-clock.exe`** — unzip and run, matching the "borrowed exam machine" case. Requires the system WebView2 runtime (preinstalled on Windows 10/11).

### NTP lives in the shell, not in the page

`ntp_query` (Rust, `rsntp`, 1.2 s cap per server) runs SNTP against `ntp.aliyun.com`, `ntp.tencent.com`, `time.windows.com` and `pool.ntp.org`. The frontend only discovers it at runtime — `isTauri()` checks for `__TAURI_INTERNALS__` — and appends one provider per server to the existing parallel set. No new state, no new UI: the measurements flow through the same inverse-variance weighting described in ADR 0003, where a ±2 ms SNTP sample naturally outvotes a ±100 ms HTTP sample.

This keeps a useful failure mode: if UDP 123 is blocked, every NTP provider fails, the HTTP APIs still answer, and sync behaves exactly as on the web.

### Registration and reachability are the shell's business

- **Service worker off**: Tauri assets are embedded in the executable, so a cache-first worker could only pin stale files across upgrades. `svelte.config.js` disables `serviceWorker.register` when `TAURI_ENV_PLATFORM` is set (injected by the Tauri CLI into `beforeDevCommand`/`beforeBuildCommand`); the web build is untouched.
- **CSP instead of a feature flag**: the shell's CSP allows only `'self'`, the three time APIs, and Tauri's `ipc:` channel, so the umami script is blocked by the browser rather than by an `if`. `dangerousDisableAssetCspModification` is on because Tauri's injected nonce would otherwise disable `'unsafe-inline'` and take `app.html`'s language-detect IIFE down with it.
- **Version**: `tauri.conf.json` omits `version`, so Tauri reads it from `Cargo.toml`; `package.json`, `src/lib/version.ts` and `Cargo.toml` are kept in sync by a unit test.
- **Release**: `.github/workflows/desktop-release.yml` builds on a `v*` tag and attaches both artifacts to the GitHub release; `workflow_dispatch` runs upload artifacts only.

## Consequences

- The desktop app is Windows-only for now; macOS/Linux would need their own bundle targets and NTP verification.
- The portable binary is unsigned, so SmartScreen warns on first launch.
- `@tauri-apps/api` is imported lazily inside the NTP provider, so the web bundle never evaluates it.
- Sync result persistence is still per-run (ADR 0003); the desktop shell adds no state.
- A blocked UDP port degrades accuracy but never breaks the clock — the HTTP providers remain the floor.
