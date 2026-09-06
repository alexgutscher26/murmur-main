# Pill Compact Mode, Multi-Display & A11y Design Specification

- **Date:** 2026-08-31
- **Status:** Approved
- **Scope:** Pill overlay enhancements covering Compact Mode (icon-only), Multi-Display Active Window Awareness, and Screen Reader Announcements.

---

## 1. Features & Architecture

### 1.1 Compact Mode (`ui.pill_compact`)

- **Registry Setting:** `keys::PILL_COMPACT = "ui.pill_compact"` (Boolean toggle under General Settings, default `false`).
- **Styling & Metrics:** `--pill-width-compact: 48px;` in `tokens.css`.
- **Behavior:**
  - When compact mode is enabled, `Pill.tsx` renders a sleek 48×36pt capsule with the reactive `MicIndicator`.
  - If a failure (`FAILED`) or cancellation countdown (`CANCEL_PENDING`) occurs, it expands to show the essential message or keep action.

### 1.2 Multi-Display Awareness

- **Active Window Detection:** In `tray.rs`, detect the monitor containing the active foreground window (or cursor fallback) so the pill always appears on the display where the user is currently working.

### 1.3 Accessibility & Screen Reader Live Region

- **Live Announcements:** An `aria-live="polite"` / `aria-atomic="true"` announcement container in `Pill.tsx` announces state transitions ("Recording started", "Cancelling in X seconds", "Recording completed", "Error: ...") ensuring screen reader users (NVDA, JAWS, Narrator, VoiceOver) receive immediate auditory feedback.
