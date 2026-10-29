# Full Clock

A full-screen, ad-free configurable web clock — PWA with offline support, time sync, and zh/en localization.

## Language

**secondStyle**:
How seconds are displayed alongside the main clock.
_Values_: `bar` (progress bar), `digital` (digits), `off`

**barPosition**:
Where the second progress bar is placed.
_Values_: `fullscreen` (fills entire screen), `top` (fixed 48px), `bottom` (fixed 48px)

**titleStyle**:
What the title bar above the clock shows.
_Values_: `date` (formatted date), `custom` (user-defined text), `off`

**colorProgress**:
Hex color of the second progress bar, distinct from background and foreground.

**progressOpacity**:
Opacity 0–100 of the second progress bar.

**offset**:
Server timestamp minus local midpoint timestamp (ms). Positive means the local clock is behind the server.
_Avoid_: Drift, skew

**errorMargin**:
Result of inverse-variance weighted average across all successful provider measurements. Measures how confident we are in the combined offset — smaller is better.
_Avoid_: Jitter, latency

**syncMode**:
How time synchronization is triggered.
_Values_: `auto` (on page load), `manual` (on demand via settings), `off` (disabled)

**syncStatus**:
Time calibration state machine. Values: `idle` → `syncing` → `synced` or `error`.

**syncBadge**:
Icon in the title bar reflecting `syncStatus`. Uses shape-only encoding (no hardcoded colors) to avoid theme conflicts.

- `syncing`: spinning partial ring
- `synced`: checkmark
- `error`: warning triangle
- `idle`: two-arrow static ring (manual mode only)

**wakeLock**:
Screen Wake Lock API state machine. Values: `inactive`, `active`, `unsupported`, `denied`.
`denied` is transient, not a permission verdict — wake locks have no permission prompt, so a request refused while the document was hidden is retried once it is visible again.

**wakeLockBadge**:
Coffee-cup icon in the title bar (left group, innermost) showing whether the screen is being kept on. Always visible and clickable — it toggles `keepScreenOn` directly, so it is both indicator and control. Hidden only when the browser has no Wake Lock API (`unsupported`).
_Encoding_: the shape never changes; opacity carries the state (`active` opaque, off dimmed, pending dimmed and pulsing), `denied` told apart by its tooltip alone. Reuses the icon of the "keep screen on" switch in Settings — one concept, one metaphor. Not a sun: a sun reads as a light/dark theme toggle.

**keep screen on**:
The user preference `keepScreenOn`, exposed in Settings and on the `wakeLockBadge`.
_Avoid_: 屏幕常量 (typo for 屏幕常亮), always-on display

## Relationships

- **secondStyle**=`bar` paired with **barPosition** determines where the progress bar renders (fullscreen, top, or bottom)
- **syncStatus** is driven by **syncManager**, which fires parallel requests with 1.5s timeout and combines results via inverse-variance weighted average
- the provider set depends on the runtime: the web build always queries the three HTTP APIs, while the desktop build appends four NTP providers (`ntp_query` over UDP 123, measured in Rust). **offset** and **errorMargin** keep their meaning either way
- **wakeLock** is bound to `prefs.keepScreenOn`; enabling/disabling transitions the state
- **wakeLockBadge** reflects **wakeLock**, never `keepScreenOn` alone: the two diverge while a request is pending and when the lock was dropped
- the browser releases the **wakeLock** whenever the document is hidden, so it is re-acquired on return; without that, the preference stays on while the lock is silently gone

## Example dialogue

> **Dev:** "When does auto-sync run?"
> **Domain expert:** "Only on page load. There's no periodic re-sync — the offset stays applied until the next page load or manual trigger."

> **Dev:** "What does the badge show in manual mode before the first sync?"
> **Domain expert:** "A static two-arrow ring (idle state). It means 'ready to sync' without suggesting anything is happening."

## Flagged ambiguities

- "sync" was used to mean both the HTTP fetch process (`syncTime`) and the applied state (`syncStatus === 'synced'`) — resolved: `syncStatus` tracks the full state machine
- "bar" could be confused with a navigation or menu bar — resolved: in this project "bar" always refers to the second progress bar
- "NEGLIGIBLE_THRESHOLD" was removed in v1.3 — sync results are always auto-applied; user confirmation step eliminated
- "unreliable" signal was removed — cross-validation between providers was found redundant since all query the same NTP source; inverse-variance weighting is sufficient
- "屏幕常量" was a recurring typo/mishearing of 屏幕常亮 — canonical term is **keep screen on / 保持亮屏**
- the indefinite "保持亮屏请求中…" that survived a tab switch was not a stuck request: the browser had already dropped the lock and nothing re-acquired it — `wakeLock` now treats a hidden-then-visible document as a fresh request
