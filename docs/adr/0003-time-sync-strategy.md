# 3. Time Sync Strategy

**Date**: 2026-05-29
**Status**: Accepted

## Context

The original time sync implementation used a single HTTP request to `api.shijian.online`, required manual user confirmation for offsets above 500ms, and had no retry or timeout mechanism. User feedback reported that the API could become unresponsive, leaving the sync in a stuck state.

## Decision

### Parallel providers with inverse-variance weighting

Instead of querying a single API sequentially (with fallback), we fire all configured providers **in parallel** with a shared 1.5s `AbortController` timeout. Successful responses are combined using **inverse-variance weighted averaging**, where each result's weight is `1 / errorMargin²`. This is the statistically optimal unbiased estimator for independent measurements with different precisions.

**Why not sequential fallback?** Parallel requests complete in the time of the fastest successful response, not the sum of all attempts.

**Why not median or min-RTT?** Weighted average minimizes the combined variance (Cramér–Rao bound), giving more influence to low-latency measurements while still incorporating all available data.

### Three-mode sync (auto / manual / off)

The previous "always prompt" flow (`idle → computing → done/applied ↔ user clicks Apply`) is replaced by a persistent mode selector:
- **Auto**: Syncs once on page load. Results are applied silently.
- **Manual**: Syncs only when the user clicks "Sync Now" in settings.
- **Off**: No sync at all; badge hidden from title bar.

### Title bar status badge

A shape-only icon in the title bar tells the current sync state at a glance:
- Syncing → spinning partial ring
- Synced → checkmark
- Error → warning triangle
- Idle (manual, unsynced) → static two-arrow ring

Colors are deliberately **not** used (green/red/etc.) to avoid clashing with the user's custom color theme.

### Removed concepts

- **NEGLIGIBLE_THRESHOLD (500ms)**: No longer meaningful since sync is always auto-applied.
- **unreliable flag**: Cross-validation between providers was found redundant (all query the same NTP source; weighted average handles variance).
- **User confirmation step**: The badge replaces the "Apply / Re-calibrate" button flow.

## Consequences

- Timeout failures are visible immediately via the badge; the user can retry via "Sync Now" in manual mode, or simply reload in auto mode.
- Sync state (`offset`, `errorMargin`) is **not** persisted — it is recalculated on each auto-sync (page load) or manual trigger.
- Adding a new provider requires only adding one entry in the `providers` array in `time.ts` — no changes to the state machine or UI.
- The badge uses `currentColor` and adapts to any theme without special styling per preset.
