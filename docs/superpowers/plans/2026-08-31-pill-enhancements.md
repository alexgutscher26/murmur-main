# Pill UX Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the three Pill UX features from TODO.md: (1) Real-time word count in the pill, (2) Audio-reactive animated mic recording indicator, and (3) Cancel confirmation with countdown feedback and clickable "Keep recording" button.

**Architecture:**

- `useWordCount` hook / speech estimation module that calculates estimated words live from voiced activity and anchors with decoded Whisper chunks.
- `MicIndicator` component replacing static dot with an audio-reactive SVG microphone that smoothly scales and pulses its soundwave rings based on `audio-level-changed` events without triggering React re-renders.
- `CancelConfirmation` layout within the pill during `CANCEL_PENDING` featuring a dynamic `"Cancelling in Xs..."` countdown label, draining progress line, and clickable `"Keep recording"` button calling `cancelAborted`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide icons, Tauri v2 IPC bindings.

## Global Constraints

- Strictly follow `docs/04-DESIGN-SYSTEM.md` and `tokens.css`. Never use raw hex codes or inline un-tokenized values.
- Respect 60fps pill frame budget. Audio event listeners must not trigger full React re-render cascades.
- Add `SOURCE OF TRUTH KEYWORDS`, `WHAT`, `WHY`, `WHERE` blocks at the top of all new and modified files.
- Typescript strict checks must pass cleanly (`bun run typecheck`).

---

### Task 1: Create Audio-Reactive Animated Mic Indicator (`MicIndicator`)

**Files:**

- Create: `src/app/pill/_components/MicIndicator.tsx`
- Modify: `src/app/pill/_components/StateDot.tsx` (or export/compose with `MicIndicator`)

**Interfaces:**

- Consumes: `events.audioLevelChanged`, `PillTone`, `readDurationMs`, design tokens.
- Produces: `<MicIndicator tone={tone} recording={boolean} />` component with imperatively updated soundwave rings.

- [ ] **Step 1: Write `MicIndicator` component with SVG microphone and audio-reactive rings**
      Implement imperative DOM updates on `audio-level-changed` using ref for 60fps performance without React re-render overhead.
- [ ] **Step 2: Verify typecheck passes**
      Run `bun run typecheck`.
- [ ] **Step 3: Test reduced motion and resting state fallbacks**
      Ensure resting state (`ARMING`), recording state (`RECORDING`), and failed state (`FAILED` danger tone) render properly.

---

### Task 2: Real-Time Word Count Calculation & Display

**Files:**

- Create: `src/app/pill/use-word-count.ts`
- Modify: `src/app/pill/Pill.tsx`

**Interfaces:**

- Consumes: `elapsedMs`, `events.audioLevelChanged`, `live`, `baseline_wpm`.
- Produces: `useWordCount(live, elapsedMs)` returning `{ estimatedWords: number, formatted: string }`.

- [ ] **Step 1: Implement `useWordCount` hook**
      Calculates live estimated word count from speech duration (sampling active level/voiced frames with baseline WPM ~140 words/min) and formats as `~X words` (or `Xw`).
- [ ] **Step 2: Integrate word count display into `Pill.tsx`**
      Place the real-time word count in the timer/status slot alongside elapsed time (e.g., `~12 words · 0:08`).
- [ ] **Step 3: Verify typecheck passes**
      Run `bun run typecheck`.

---

### Task 3: Cancel Confirmation with Dynamic Countdown & "Keep Recording" Button

**Files:**

- Modify: `src/app/pill/Pill.tsx`
- Modify: `src/components/global/countdown-line/CountdownLine.tsx`

**Interfaces:**

- Consumes: `SessionState::CancelPending { remaining_ms, elapsed_ms }`, `commands.cancelAborted` (or session abort).
- Produces: Rich cancel pending view in pill with `"Cancelling in Xs..."`, countdown bar, and clickable `"Keep recording"` action.

- [ ] **Step 1: Enhance `CountdownLine` / `PillBody` cancel layout**
      Add `"Cancelling in Xs..."` calculation and interactive `"Keep recording"` pill button.
- [ ] **Step 2: Wire up "Keep recording" click handler to abort cancellation**
      Invoke cancellation abort on click or Escape keypress, refilling the line smoothly.
- [ ] **Step 3: Verify typecheck passes**
      Run `bun run typecheck`.

---

### Task 4: Integration Verification & Update TODO.md

**Files:**

- Modify: `TODO.md:L87-L89`

- [ ] **Step 1: Run full frontend type check and verify build**
      Run `bun run typecheck` and `bun run build`.
- [ ] **Step 2: Mark TODO items completed in `TODO.md`**
      Mark the three pill features as `[x]` in `TODO.md`.
