# Pill Preview, Position Memory & Opacity Design Specification

- **Date:** 2026-08-31
- **Status:** Approved
- **Scope:** Pill overlay enhancements covering Partial Transcript Preview, Per-Display Position Memory, and Pill Background Opacity Setting.

---

## 1. Overview & Objectives

This specification covers three high-impact UI/UX features for Murmur's floating pill:

1. **Partial transcript preview in pill**: As interior Whisper chunks decode in the background, surface the latest decoded words (e.g. `"...schedule the meeting"`) in the center slot of the pill.
2. **Pill position memory (per-display)**: Allow dragging the pill and remember its position on a per-display basis across dictation sessions.
3. **Pill opacity setting**: Add a `ui.pill_opacity` registry setting (30%–100%) and apply it to the pill's backdrop.

---

## 2. Architecture & Detailed Design

### 2.1 Partial Transcript Preview

- **Backend Event / State**:
  - As interior chunks complete decoding in `SessionActor::handle_decode`, emit partial transcript segments / text updates via `events.partialTranscript` or include `partial_text` in session state.
- **Frontend Display**:
  - If `partialText` is available during `RECORDING`, render the trailing ~3–5 words with smooth truncation/fade (`text-label text-text-primary truncate`).
  - If no chunks have decoded yet, display the live audio-reactive `PillWaveform`.

### 2.2 Pill Position Memory

- **Dragging & Persistence**:
  - Add `data-tauri-drag-region` on the pill panel.
  - When the user moves the pill window, capture position `(x, y)` and current monitor name/ID.
  - Save `ui.pill_position_<display_id>` into settings or memory cache.
  - In `tray.rs::fit_pill_to_state`, check if a saved position exists for the current monitor; if so, position the pill at `(saved_x, saved_y)` rather than default bottom-center.

### 2.3 Pill Opacity Setting

- **Registry Definition**:
  - Add `keys::PILL_OPACITY = "ui.pill_opacity"` with default `1.0` (range `0.3` to `1.0`, step `0.05`, unit `"%"`).
- **Frontend Integration**:
  - Subscribes to settings; updates CSS variable `--pill-opacity` or styles on `GlassPanel` material="pill".
