# Pill Preview, Position Memory & Opacity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Partial transcript preview in the pill, Per-display position memory for dragging, and Pill opacity slider setting.

**Architecture:**
- **Partial Transcript Preview:** In `SessionActor`, emit `partial-transcript` on interior chunk decode with the accumulated text, and render the trailing snippet in `Pill.tsx` when present.
- **Pill Position Memory:** Enable drag regions on the pill, track position changes per display, and restore saved positions in `tray.rs`.
- **Pill Opacity:** Add `ui.pill_opacity` in registry and apply dynamic opacity styling to the pill overlay.

## Global Constraints
- Adhere strictly to `docs/04-DESIGN-SYSTEM.md` and `CLAUDE.md`.
- All TypeScript strict checks (`bun run typecheck`) and Rust checks (`cargo check`) must pass.

---

### Task 1: Add `ui.pill_opacity` Setting to Registry & Apply to Pill

**Files:**
- Modify: `src-tauri/src/registry/keys.rs`
- Modify: `src-tauri/src/registry/mod.rs`
- Modify: `src/app/pill/Pill.tsx`

- [ ] **Step 1: Add `PILL_OPACITY` key and setting definition to registry**
  Define `ui.pill_opacity` with type `Number`, default `1.0`, min `0.3`, max `1.0`, step `0.05`.
- [ ] **Step 2: Read setting in `Pill.tsx` and apply opacity style**
  Apply opacity style/token dynamically to the `GlassPanel` overlay.
- [ ] **Step 3: Verify with typecheck and cargo check**
  Run `bun run typecheck`.

---

### Task 2: Implement Partial Transcript Preview in Pill

**Files:**
- Modify: `src-tauri/src/ports/events.rs`
- Modify: `src-tauri/src/adapters/events.rs`
- Modify: `src-tauri/src/session/actor.rs`
- Modify: `src/app/pill/Pill.tsx`

- [ ] **Step 1: Wire `partial_transcript` event in event port and session actor**
  When `self.assembler.push_segments(&decode.segments)` runs during active capture, emit the accumulated text.
- [ ] **Step 2: Render trailing decoded text in `Pill.tsx`**
  Display the trailing words (`...last few words`) in `PillBody` when available.
- [ ] **Step 3: Verify with typecheck and cargo check**
  Run `bun run typecheck`.

---

### Task 3: Implement Pill Position Memory Per-Display

**Files:**
- Modify: `src-tauri/src/tray.rs`
- Modify: `src/app/pill/Pill.tsx`

- [ ] **Step 1: Add drag region support to `Pill.tsx`**
  Add `data-tauri-drag-region` on the container.
- [ ] **Step 2: Track and restore display positions in `tray.rs`**
  Persist and check monitor-specific positions on `fit_pill_to_state`.
- [ ] **Step 3: Verify with typecheck and cargo check**
  Run `cargo check` and `bun run typecheck`.

---

### Task 4: Integration Verification & Update `TODO.md`

**Files:**
- Modify: `TODO.md:L90-L92`

- [ ] **Step 1: Run full verification suite**
  Run `cargo check` and `bun run typecheck` and `bun run build`.
- [ ] **Step 2: Mark TODO items completed in `TODO.md`**
  Mark lines 90–92 as checked `[x]`.
