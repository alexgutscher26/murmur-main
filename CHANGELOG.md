# Changelog

All notable changes to **Murmur** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-31

### Added
- **100% On-Device Whisper Inference**:
  - `small-q5_1` (190 MB) as the new default Starter tier model for fast, low-memory transcription.
  - `base-q5_1` (90 MB) for instant lightweight decodes on constrained hardware.
  - `large-v3-turbo` (q4_0, q5_0, q8_0) precision models unlocked under the **Murmur Pro** tier.
- **Hardware GPU Acceleration**:
  - Windows DirectML execution provider for DirectX 12 GPUs.
  - macOS Apple Silicon Metal acceleration with sub-200ms latency.
- **Advanced Global Hotkeys & Mouse Triggers**:
  - **Multiple Bindings**: Assign primary (`dictation.hotkey`) and secondary (`dictation.secondary_hotkey`) shortcuts for laptop and desktop setups.
  - **Mouse Push-to-Talk**: Support binding auxiliary mouse buttons (Middle Click, Mouse 4 Back, Mouse 5 Forward) for push-to-talk.
  - **Double-Tap Fast Dictation**: Double-tapping the shortcut within 300 ms triggers immediate high-priority audio processing.
  - **Command Shortcuts**: Global triggers for `Option/Alt + Shift + Space` (Toggle Dashboard) and `Option/Alt + Escape` (Instant Discard & Cancel).
  - **Conflict Detection**: Interactive detection in Settings warning against colliding OS shortcuts (`Cmd+C/V/Q`, `Alt+F4`) with available alternatives.
  - **Per-App Overrides**: Custom shortcuts configured for specific apps via App Profiles.
  - **Per-Binding State Tracking**: Thread-safe tracker maintaining isolated held state and press timing per shortcut.
- **Real-Time Settings Search**:
  - Live filter input searching setting labels, descriptions, registry keys, and sections in real time.
- **Adaptive Theme Switcher**:
  - System, Light, and Dark interface options in General Settings with adaptive dark obsidian glass window tinting.
- **Settings Backup & Migration**:
  - One-click JSON export and import for all global settings, per-app profiles, and custom dictionary entries.
- **Keyboard Shortcuts & Voice Commands Reference Panel**:
  - In-app modal accessible via `?` or header action with styled keycap badges.
- **In-App Changelog Modal**:
  - "What's new in Murmur" release notes dialog accessible from the dashboard header and settings.
- **App Profile Manager**:
  - Quick-add preset chips for VS Code, Cursor, Slack, Notion, and Terminal with sparse override settings.
- **Window Bounds Persistence**:
  - Automatically saves and restores dashboard window size and screen coordinates across launches.
- **Feature Gating & Murmur Pro Licensing**:
  - Free Starter tier ($0 forever) with 25 dictionary words and 100 history items.
  - Murmur Pro ($8/mo or $149 Lifetime) unlocking Large Turbo, Smart Context Engine, and Filler Word Stripper.
  - Team tier ($15/user/mo) with centralized team dictionary sync and fleet management.

### Fixed
- Fixed dark theme contrast and window translucency by applying dynamic `background: var(--surface-glass)` and explicit `color-scheme` declarations.
- Corrected type signature of `descriptor_for` in `http_models/catalog.rs`.
- Fixed desktop billing view to use native design system tokens (`bg-surface`, `hairline`, `text-text-primary`).
- Aligned default onboarding download target to Whisper Small (`small-q5_1`).
