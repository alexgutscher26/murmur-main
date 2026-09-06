# Pill Compact Mode, Multi-Display & A11y Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Compact (icon-only) pill mode, Multi-display foreground window awareness, and Screen reader live region announcements.

---

### Task 1: Add `ui.pill_compact` Setting & Tokens

**Files:**

- Modify: `src-tauri/src/registry/keys.rs`
- Modify: `src-tauri/src/registry/mod.rs`
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Add `PILL_COMPACT` setting to registry**
- [ ] **Step 2: Add `--pill-width-compact: 48px;` token to `tokens.css`**
- [ ] **Step 3: Verify with `cargo check`**

---

### Task 2: Implement Multi-Display Foreground Window Detection in `tray.rs`

**Files:**

- Modify: `src-tauri/src/tray.rs`

- [ ] **Step 1: Detect display of foreground window or cursor in `fit_pill_to_state`**
- [ ] **Step 2: Support compact width in `pill_points` calculation**
- [ ] **Step 3: Verify with `cargo check`**

---

### Task 3: Implement Compact Mode & Screen Reader Announcements in `Pill.tsx`

**Files:**

- Modify: `src/app/pill/Pill.tsx`

- [ ] **Step 1: Render compact pill layout when `ui.pill_compact` is enabled**
- [ ] **Step 2: Add `sr-only` aria-live region announcing state transitions**
- [ ] **Step 3: Verify with `bun run typecheck` and `bun run build`**

---

### Task 4: Full Suite Verification & Update `TODO.md`

**Files:**

- Modify: `TODO.md:L93-L95`

- [ ] **Step 1: Run full verification suite (`cargo check --tests`, `bun run typecheck`, `bun run build`)**
- [ ] **Step 2: Mark TODO items completed `[x]` in `TODO.md`**
