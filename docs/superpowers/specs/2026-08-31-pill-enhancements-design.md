# Pill UX Enhancements Design Specification

- **Date:** 2026-08-31
- **Status:** Approved
- **Scope:** Pill overlay enhancements covering Real-time word count, Animated audio-reactive recording indicator, and Cancel confirmation with countdown and "Keep recording" button.

---

## 1. Overview & Objectives

This specification defines three interconnected UX improvements for Murmur's floating pill interface:
1. **Real-time word count**: Continuous feedback to the user estimating words spoken during recording (`~12 words so far`), anchored by interior Whisper chunk decodes.
2. **Animated recording indicator**: An audio-reactive SVG microphone icon with soundwave arcs replacing the static 2s keyframe dot, scaling and pulsing smoothly with `CaptureEvent::Level` values.
3. **Cancel confirmation**: Clear countdown feedback (`Cancelling in 3...`) when Escape is pressed to arm cancellation, accompanied by the countdown line and a clickable `"Keep recording"` action to prevent accidental loss of dictation.

---

## 2. Architecture & Detailed Design

### 2.1 Real-Time Word Count

#### Data Flow & Estimation Logic
- **Voice-Activity Speech Estimation:**
  - Speech activity is tracked during active recording.
  - A speaking rate baseline (default ~140 WPM, or user-configured baseline WPM) calculates estimated words from accumulated speech duration (`estimated_words = floor(voiced_ms / 60000 * WPM)`).
- **Chunk Decode Anchoring:**
  - When interior chunks finish Whisper decoding, the actual decoded words from `Assembler` set a verified floor for the count.
  - Subsequent speech adds to this verified floor.
- **Frontend Display:**
  - Displayed concisely in the pill's timer/status area (e.g. `~12w · 0:08` or formatted `~12 words · 0:08`).
  - Uses `font-variant-numeric: tabular-nums` to prevent visual jitter.

---

### 2.2 Animated Mic Recording Indicator

#### Component Architecture (`MicIndicator`)
- Replaces the static `StateDot` on the left of the pill.
- **Visuals:**
  - Crisp SVG microphone icon with radiating waveform soundwave rings.
  - Under `ARMING` state: resting state at baseline opacity.
  - Under `RECORDING` state: soundwave arcs dynamically scale in scale/opacity based on live RMS/peak audio levels.
  - Under `FAILED` state: tints to `--danger` tone.
- **Performance & Zero-React-Rerender Contract:**
  - Subscribes to `audio-level-changed` events.
  - Updates DOM transforms and opacity directly via an imperative ref or `requestAnimationFrame` handle without triggering React component re-renders.
  - Respects `prefers-reduced-motion` token fallback.

---

### 2.3 Cancel Confirmation with "Keep Recording"

#### Workflow & State
- When the user presses Escape, the session enters `SessionState::CancelPending { remaining_ms, elapsed_ms }`.
- **Pill Content during `CANCEL_PENDING`:**
  - **Dynamic Countdown Text:** Displays `Cancelling in 3...` (or `2...`, `1...` based on `remaining_ms`).
  - **Countdown Drain Line:** Progress bar draining over the cancellation duration.
  - **Action Button:** Inline `"Keep recording"` button styled with pill design tokens (`bg-sunken`, hover states).
- **Interaction & IPC:**
  - Mouse events are handled interactively during `CancelPending`.
  - Clicking `"Keep recording"` triggers `cancel_aborted` event, aborting cancellation, refilling the line smoothly, and resuming recording.
  - Keyboard Escape remains active as a secondary toggle to abort cancellation.

---

## 3. Design System & Constraints

- **Frame Budget:** 60fps hard budget maintained during capture and whisper inference.
- **Dimensions:** Standard pill dimensions (176×36pt) respected; content gracefully adapts within padding and gap tokens.
- **Tokens Used:** All colors, transitions, and typography strictly follow `docs/04-DESIGN-SYSTEM.md` and `tokens.css`.
- **Source of Truth Headers:** Every modified or new file includes complete `SOURCE OF TRUTH KEYWORDS`, `WHAT`, `WHY`, and `WHERE` documentation blocks.
