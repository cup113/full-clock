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
Server timestamp minus local timestamp (ms). Positive means the local clock is behind the server.
_Avoid_: Drift, skew

**errorMargin**:
Half of the HTTP round-trip time (ms). Measures how confident we are in the offset — smaller is better.
_Avoid_: Jitter, latency

**NEGLIGIBLE_THRESHOLD**:
500 ms. If `|offset|` is below this, the sync result is auto-applied without user confirmation.

**wakeLock**:
Screen Wake Lock API state machine. Values: `inactive`, `active`, `unsupported`, `denied`.

**syncStatus**:
Time calibration state machine. Values: `idle` → `computing` → `done` or `applied`.

## Relationships

- **secondStyle**=`bar` paired with **barPosition** determines where the progress bar renders (fullscreen, top, or bottom)
- **offset** > **NEGLIGIBLE_THRESHOLD** requires user confirmation; below it, sync is auto-applied
- **errorMargin** maps to precision color: `<500` green, `<1000` yellow, `>=1000` red
- A sync result is **unreliable** when `2 × errorMargin > |offset|` — noise exceeds signal
- **wakeLock** is bound to `prefs.keepScreenOn`; enabling/disabling transitions the state

## Example dialogue

> **Dev:** "When **offset** is below **NEGLIGIBLE_THRESHOLD**, do we still show the precision indicator?"
> **Domain expert:** "No — it's auto-applied silently. The indicator only appears when the user needs to review and confirm."

## Flagged ambiguities

- "sync" was used to mean both the HTTP fetch process (`syncTime`) and the applied state (`syncStatus === 'applied'`) — resolved: `syncStatus` tracks the full state machine
- "bar" could be confused with a navigation or menu bar — resolved: in this project "bar" always refers to the second progress bar
