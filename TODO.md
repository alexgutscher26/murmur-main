# Murmur — Feature & Improvement Backlog

> Organized by area. Items are roughly priority-ordered within each section.
> Prefix legend: [BUG] · [PERF] · [FEAT] · [DX] · [UX] · [INFRA] · [WIN] · [SEC]

## Core Reliability & Habit Formation (Activation & Daily Habit)

- [x] [UX] 5-minute "first wow" onboarding flow: mic permissions -> model weight download -> first in-app dictation test without opening external editors.
- [x] [WIN] Push-to-talk reliability: dedicated low-latency keyboard hook with modifier tap/hold detection (Alt+Space / Option+Space).
- [x] [WIN] Non-conflicting shortcut handler: suppress system menu conflict (WM_SYSCOMMAND SC_KEYMENU) when target focus is Win32.
- [x] [UX] Safe microphone status: live audio level visualization in floating pill + instant silence warning.
- [x] [UX] Fast audio error recovery: auto-reopen stream on device switch within 500ms before failing session.
- [x] [FEAT] Low-end hardware presets: downloadable Tiny & Base Q5_0 quantizations for budget laptops without dedicated GPUs.
- [ ] [FEAT] Interruption & backtracking correction: detect voice backtracks ("no wait", "scratch that") and scrub previous segment in memory before injection.
- [ ] [UX] First-run interactive dictation tutorial: guided step-by-step practice dictating a messy thought into a clean formatted email or commit.

---

## Windows-Specific


- [x] [BUG] [WIN] Text injection fails in elevated-privilege apps (e.g. Task Manager, regedit). SendInput is blocked by UIPI when the target process runs at a higher integrity level. Need UAC elevation detection and a graceful fallback message.
- [x] [BUG] [WIN] Clipboard not restored when target app does a fast Ctrl+V itself — arboard sets the clipboard, a race with the target app's own paste listener can clear it before Ctrl+V fires. Investigate using SetClipboardData with a delayed-render owner.
- [x] [BUG] [WIN] Alt+Space conflicts with the Windows system menu shortcut (WM_SYSCOMMAND SC_KEYMENU) in some legacy apps. Should detect when the app receiving focus is a Win32 window and optionally suppress the system menu.
- [x] [BUG] [WIN] Sound adapter uses MessageBeep (modal) — PlaySound with SND_ASYNC | SND_MEMORY would be non-blocking and allow custom WAV assets.
- [x] [WIN] [FEAT] DirectML / CUDA backend for Whisper — whisper.cpp has CUDA and DirectML build options. On NVIDIA/AMD GPUs this would bring realtime_factor well below 0.1. Add a GPU detection step during onboarding and expose a "Use GPU acceleration" toggle in settings.
- [x] [WIN] [FEAT] Windows Accessibility API injection — For apps that block SendInput + clipboard, implement IUIAutomation::SetFocus + ITextProvider::InsertText as a secondary delivery method.
- [x] [WIN] [FEAT] Windows Hello / Credential Manager integration — Store encryption keys for any future audio export in Windows Credential Manager rather than AppData.
- [x] [WIN] [UX] Windows 11 notification toasts — Replace tray-only feedback with Windows.UI.Notifications toast cards for transcription delivery and errors.
- [x] [WIN] [UX] System tray context menu keyboard navigation — Current menu is click-only; add keyboard shortcuts for open dashboard, pause, quit.
- [x] [WIN] [INFRA] MSIX packaging — Build an MSIX bundle (alongside the current NSIS installer) for distribution through the Microsoft Store and enterprise MDM.
- [x] [WIN] [INFRA] Fix pnpm tauri build on Windows — [EPERM] on node_modules/.bin/tauri.EXE unlink fails when Bun lockfile-cached binary is in use. Investigate switching to bun tauri build exclusively or adding a pre-build script that kills stale handles.
- [x] [WIN] [PERF] WASAPI exclusive-mode capture — Current CPAL setup uses shared mode (WASAPI shared), which adds ~10 ms of audio latency. Exclusive-mode gives sub-millisecond capture latency at the cost of stealing the device; expose as an advanced setting.
- [x] [WIN] [PERF] Promote [profile.dev.package."*"] opt-level = 3 to the project README so other Windows contributors don't hit 20-second Whisper decode times in debug builds.

---

## Audio Capture & VAD

- [x] [BUG] CPAL stream error on device switch — When Windows switches the default audio device (e.g. plugging in headphones), CPAL reports AudioDeviceLost. The session actor sends DeviceLost, which currently terminates the session. Instead, attempt to reopen the stream on the new default device within 500 ms and send ArmingFailed only if that also fails.
- [x] [FEAT] Per-session audio device locking — Once arming succeeds, pin the capture to that specific device for the session's lifetime so that Windows default device changes mid-sentence do not interrupt recording.
- [x] [FEAT] Multiple microphone support — The INPUT_DEVICE setting key exists but is not surfaced in onboarding. Wire up device enumeration in the UI: show a dropdown of available WASAPI input endpoints with their friendly names.
- [x] [FEAT] Speaker diarization — For multi-speaker environments, integrate a speaker-tracking build and prefix each paragraph with a speaker label.
- [x] [FEAT] Background noise profile — Capture a 1-second ambient baseline at session start and subtract it from subsequent chunks to improve VAD accuracy in noisy rooms.
- [x] [FEAT] Adjustable VAD sensitivity — Expose earshot VAD threshold as a user-visible setting (slider from Sensitive to Aggressive) so users in noisy environments can tune how much silence is trimmed.
- [x] [PERF] VAD-gated chunking — Only submit a chunk to the ASR worker if the VAD reports speech in it; currently interior chunks with only silence still go through engine.transcribe() which does a digital-silence fast-path but still allocates.
- [x] [PERF] Streaming / partial transcription display — Feed intermediate Whisper beam outputs back to the pill UI every 1-2 seconds so users see a live partial transcript instead of waiting for the tail decode. Requires whisper.cpp partial-decode callback support.
- [x] [UX] Waveform visualizer in the pill — Show a live audio waveform during recording using CaptureEvent::Level data already emitted so the user can see the mic is picking up their voice.
- [x] [UX] Silence warning — If peak_amplitude == 0.0 for more than 1 second, show a brief "No microphone signal detected" error inside the pill rather than silently failing.
- [x] [UX] Auto-detect mono vs stereo — If the user's mic sends stereo, down-mix to mono before feeding Whisper to avoid stereo-channel phasing artifacts.

---

## Transcription Engine

- [x] [FEAT] DirectML encoder for Windows — The codebase has a coreml feature gate. Add a parallel directml gate that uses whisper.cpp's WHISPER_DIRECTML build to offload the encoder to the GPU, matching the macOS CoreML speedup.
- [x] [FEAT] Faster-Whisper / CTranslate2 backend — Implement a second TranscriptionEngine variant backed by faster-whisper via subprocess or Python FFI. At batch size 1, faster-whisper is 2-4x faster than whisper.cpp for the same model.
- [x] [FEAT] Online model registry — Instead of hard-coding model download URLs, fetch a models.json manifest from a CDN so new model releases appear in the UI without an app update.
- [x] [FEAT] Model download resume — If a model download is interrupted, resume from the last byte offset rather than starting over. reqwest supports Range headers.
- [x] [FEAT] Model integrity re-check on startup — Compute the SHA-256 of each model file at launch and compare to the stored hash. If corrupted, delete and re-download automatically.
- [x] [FEAT] Quantization options per model — For each model (e.g. large-v3-turbo), offer multiple quantizations: q4_0, q5_0, q8_0, f16. Show estimated size, speed, and quality trade-offs in the UI.
- [x] [FEAT] Parallel decode for interior chunks — Spawn a second ASR worker thread so interior chunks submitted while still recording can decode concurrently with the previous chunk, cutting overall latency on long dictations.
- [x] [FEAT] Whisper token timestamps — Enable token_timestamps = true in build_full_params and use per-word timestamps to build a word-level confidence map. Highlight low-confidence words in the history view.
- [x] [PERF] Persistent WhisperState across sessions — Currently states.acquire() creates a new state for each chunk. Reusing a single persistent state (resetting it between chunks) would save ~5 ms per chunk on allocation overhead.
- [x] [PERF] Thread count auto-tuning — decode_thread_count() is currently a fixed heuristic. Measure transcription speed during the prepare() warmup across 1-N threads and pick the fastest count automatically.
- [x] [BUG] Hallucination filter misses multi-sentence hallucinations — The blocklist drops a segment only when it is the entire segment text. Whisper sometimes emits "[BLANK_AUDIO] Thank you. [BLANK_AUDIO]" as one segment; the prefix/suffix noise bypasses the exact-match check. Add a strip-and-retry path.

---

## Text Enhancement & Post-Processing

- [x] [FEAT] LLM post-processing pass — Add an optional pipeline step that sends the raw transcript through a local LLM (e.g. llama.cpp with a small 1B model) to fix grammar, remove fillers, and restructure run-on sentences. Toggle in settings.
- [x] [FEAT] Application-aware formatting — Detect the frontmost app via frontmost_app() and apply app-specific rules: e.g. in VS Code, auto-format code identifiers as camelCase; in Slack, trim trailing punctuation.
- [x] [FEAT] Custom substitutions / shortcuts — Let users define text expansions: "my address" to a full address. These would be stored in services/dictionary.rs and applied during the rules pass.
- [x] [FEAT] Per-language punctuation normalization — The NORMALISE_PUNCTUATION rule is language-agnostic. Apply locale-correct quote marks for French, German, etc. based on the detected language.
- [x] [FEAT] Spoken command expansion — Extend SPOKEN_COMMANDS beyond basic formatting to include insertion commands: "new line", "new paragraph", "open bracket", "close bracket", "delete last word".
- [x] [FEAT] Markdown mode — A toggle that reformats dictated text as Markdown: "heading level 2 best practices" becomes ## Best Practices, "bullet point foo" becomes - foo.
- [x] [FEAT] Email / message mode — Strip filler words and structure the output as a professional email draft with subject, greeting, body, and sign-off detection.
- [x] [FEAT] Named entity normalization — Detect proper nouns from the user's dictionary and apply their canonical capitalization (e.g. always correct "iphone" to "iPhone", "openai" to "OpenAI").
- [x] [FEAT] Correction learning — When the user edits a Murmur-typed string immediately after paste detected via accessibility APIs, record the before/after pair and auto-add it to the corrections dictionary.
- [x] [UX] Inline correction UI — After pasting, show a 3-second floating undo button ("Undo dictation") that restores the pre-paste clipboard content and removes the typed text.

---

## Clipboard & Delivery

- [x] [BUG] Clipboard restore races with password managers — Some password managers (1Password, Bitwarden) monitor clipboard changes. When Murmur sets the clipboard and then restores it, some managers capture the interim transcript. Add a delay or use SetClipboardData with GMEM_DDESHARE to suppress clipboard history capture.
- [x] [FEAT] Delivery method: direct keyboard simulation — Instead of clipboard-paste, use SendInput with KEYEVENTF_UNICODE to inject text character-by-character. Slower but works in apps that disable paste (some security tools, game launchers).
- [x] [FEAT] Delivery method: Windows Accessibility API — IUIAutomation SetValue on the focused element as a third delivery tier for apps that support neither paste nor SendInput unicode.
- [x] [FEAT] Delivery confirmation — After paste, verify the text landed by reading the focused element's value via UIA and comparing. Surface a "Delivery failed" notification if it does not match.
- [x] [FEAT] Queue mode — A setting where transcription results are queued and delivered only when the user presses a separate "flush" hotkey, allowing multi-sentence dictation without interrupting typing.
- [x] [FEAT] Draft mode — Instead of pasting immediately, accumulate multiple recording sessions into a draft buffer. Show a floating mini-window with the accumulated draft and a "Send" button.
- [x] [UX] Paste delay calibration wizard — Detect the current system responsiveness and auto-suggest an optimal paste_delay_ms. Some apps (terminal emulators, Electron apps) need higher delays.

---

## UI — Pill

- [x] [FEAT] Real-time word count in pill — Show the live word count ("~12 words so far") in the pill to give the user feedback while speaking.
- [x] [FEAT] Animated recording indicator — Replace the static icon with a pulsing waveform or animated mic icon that reacts to the CaptureEvent::Level values.
- [x] [FEAT] Cancel confirmation — When the user presses Escape (cancel-arm), show a brief countdown in the pill ("Cancelling in 3...") with a "Keep recording" button to prevent accidental cancellations.
- [x] [FEAT] Partial transcript preview in pill — Show the last few decoded words in the pill as they come in from interior chunk decodes so the user can confirm the model is understanding them.
- [x] [UX] Pill position memory — Remember the last position the user dragged the pill to and restore it on next session, per-display.
- [x] [UX] Pill opacity setting — Let users dial the pill background opacity from 30%-100% for use on dark or busy backgrounds.
- [x] [UX] Pill size / compact mode — Offer a compact (icon-only) pill mode for minimal visual interruption.
- [x] [UX] Multi-display awareness — Show the pill on the same display as the frontmost window, not always the primary display.
- [x] [UX] Accessibility: screen reader announcements — Post a live region update via UIA when recording starts/stops so screen reader users get audio feedback.

---

## UI — Dashboard / Settings

- [x] [FEAT] History export — Export the full session history as CSV, JSON, or plaintext. Button in the History view.
- [x] [FEAT] History search — Full-text search across all recorded transcripts using SQLite FTS5. The search_sessions function stub exists in services/sessions.rs.
- [x] [FEAT] History bulk delete — Checkbox multi-select in History view with "Delete selected" and "Delete all" options.
- [x] [FEAT] Per-session playback — If audio recording is ever added (opt-in), allow playback of a session from the history view with word-level highlighting synchronized to timestamps.
- [x] [FEAT] Stats dashboard charts — Add line charts (words per day, sessions per week, average latency over time) using a lightweight charting library.
- [x] [FEAT] WPM baseline calibration wizard — Walk the user through reading a passage to measure their actual speaking rate and set BASELINE_WPM accurately.
- [x] [FEAT] App profile manager UI — The services/profiles.rs and ipc/commands/profiles.rs exist. Build a proper UI: list of app profiles, per-app overrides for language, mode, hotkey, and enhancement rules.
- [x] [FEAT] Settings import/export — Serialize all settings to a JSON file for backup or transfer to another machine.
- [x] [FEAT] Keyboard shortcut reference panel — A "Keyboard shortcuts" page in the dashboard listing all hotkeys and their functions.
- [x] [UX] Settings search — A search bar at the top of the Settings view that filters the setting list in real-time.
- [x] [UX] Dark / light / system theme — Add an explicit theme override in General settings.
- [x] [UX] Onboarding re-run — A "Run setup again" button in General settings to redo the microphone and hotkey test without reinstalling.
- [x] [UX] Dashboard window remember position/size — Persist the last dashboard window bounds and restore on next open.
- [x] [UX] Tooltips on all advanced settings — Every advanced setting in the registry has a description; surface it as a hover tooltip next to the label.

---

## Hotkeys

- [x] [FEAT] Multiple hotkey bindings — Allow assigning two hotkeys (e.g. Alt+Space and a mouse button via raw input) so laptop and desktop workflows can each have a comfortable binding.
- [x] [FEAT] Per-app hotkey override — For apps that capture Alt+Space themselves (e.g. some games, terminals), allow a different hotkey to be used only when that app is frontmost.
- [x] [FEAT] Hotkey conflict detection — During registration, check if the requested hotkey is already registered by another app via RegisterHotKey return value on Windows and warn the user with alternatives.
- [x] [FEAT] Push-to-talk mouse button support — Let any mouse button (captured via raw input hook) act as the push-to-talk trigger.
- [x] [FEAT] Double-tap hotkey mode — Double-tapping the hotkey within 300 ms activates a "high-priority" session that skips the queue and pastes immediately.
- [x] [FEAT] Hotkey-to-command mapping — Allow additional hotkeys to trigger specific commands: e.g. Alt+Shift+Space = open dashboard, Alt+Escape = cancel and clear.
- [x] [BUG] [WIN] HOTKEY_HELD AtomicBool is process-global — If the app is ever extended to support multiple simultaneous recording modes (e.g. per-app sessions), a single global flag will not be correct. Refactor to a per-session or per-binding held-state tracker.

---

## Privacy & Security

- [x] [SEC] Transcript encryption at rest — Encrypt session raw_text and final_text columns in SQLite using SQLCipher or an application-level AES-256-GCM key stored in Windows Credential Manager.
- [x] [SEC] Auto-purge on lock screen — When Windows locks, automatically clear the in-memory transcript buffer and the clipboard if it contains a Murmur-set value.
- [x] [FEAT] Configurable data retention — The RETENTION_DAYS key exists. Build a background job that runs purge_older_than() on launch and on a daily timer.
- [x] [FEAT] Audit log — Write an append-only log separate from the sessions table recording session timestamps, durations, and delivery outcomes but never the transcript text for enterprise compliance.
- [x] [FEAT] Remote wipe / data clear — A "Delete all data" option in settings that drops all sessions, dictionary entries, and resets all settings to defaults in one step.
- [x] [UX] Privacy policy in onboarding — Link to a local privacy.md during onboarding that explains exactly what data stays on device.

## Developer Beachhead & Code-Aware Dictation

- [x] [FEAT] Code casing voice directives — Convert spoken voice cues into programming casing styles (`camelCase`, `PascalCase`, `snake_case`, `SCREAMING_SNAKE_CASE`, `kebab-case`, inline backticks).
- [x] [FEAT] GitHub Issue, PR & Markdown voice macros — Dictate markdown scaffolding (`issue title`, `steps to reproduce`, `expected behavior`, `acceptance criteria`, `pr description`, `todo item`, `code block <lang>`).
- [x] [FEAT] Developer technical vocabulary pack — Expanded named entity normalization with 60+ frameworks, databases, and languages (`Next.js`, `TypeScript`, `PostgreSQL`, `FastAPI`, `PyTorch`, `Docker`, `Kubernetes`, `Tauri`, etc.).
- [x] [FEAT] 1-Click Codebase & Repository Symbol Importer — Parse `package.json`, `Cargo.toml`, and source code to batch-import project identifiers, functions, and types into local dictionary.
- [x] [FEAT] Developer domain packs — React/Web, Backend/Rust/Python, and Git/Cloud/DevOps 1-click domain dictionary presets in Settings.

---

## Internationalization & Languages

- [FEAT] UI localization — Externalize all UI strings to a locales/\*.json structure and ship with English, Spanish, French, German, Japanese, and Simplified Chinese to start.
- [FEAT] Right-to-left layout support — For Arabic and Hebrew transcription, flip the pill and history view layout to RTL.
- [FEAT] Language auto-detection confidence display — Show the detected language and its confidence score in the History view per session.
- [FEAT] Multilingual session — Allow Whisper language = None (auto-detect) and pin the detected language from the first interior chunk to subsequent chunks via the existing detected_language pinning mechanism.
- [x] [FEAT] Language-specific filler word lists — The STRIP_FILLERS rule currently only handles English fillers ("um", "uh", "like"). Add curated lists for each supported language.
- [FEAT] Romanization mode — For CJK input, add an option to output pinyin/romaji alongside or instead of the native script.

---

## Updates & Distribution

- [FEAT] Delta updates — Instead of downloading the full installer on each update, compute a binary diff (bsdiff or similar) and ship only changed bytes. Tauri's updater supports a custom archive format.
- [FEAT] Update channel selection — Add a "Beta" update channel option in General settings that points to a separate update manifest URL for pre-release builds.
- [FEAT] Offline update bundle — Allow the user to manually point the updater at a local .msi/.exe file for air-gapped enterprise deployments.
- [INFRA] Signed Windows installer — The current build produces an unsigned NSIS installer. Obtain a code signing certificate and integrate signtool.exe into the CI build pipeline.
- [INFRA] GitHub Actions Windows build — Add a windows-latest runner to the CI matrix that builds, signs, and uploads the Windows bundle as a release artifact.
- [INFRA] Winget package — Submit a winget package manifest so users can install/update via winget install murmur.
- [INFRA] Chocolatey package — Publish a Chocolatey package for enterprise environments.

---

## Architecture & Reliability

- [INFRA] Crash reporter — Integrate sentry-rust or a local crash dump writer using MiniDumpWriteDump to capture panics and unhandled errors with a stack trace. Gate behind a user opt-in during onboarding.
- [INFRA] Health-check endpoint — Expose a local HTTP endpoint (e.g. localhost:PORT/health) so OS-level monitoring scripts can verify Murmur is alive without the GUI.
- [INFRA] Structured logging with log rotation — The current tracing-appender setup writes to a single log file. Add rolling file appender with size-based rotation and keep only the last 5 files.
- [INFRA] Metrics export — Emit session latency, word count, and decode time metrics to a local Prometheus-compatible endpoint for power users who run local monitoring stacks.
- [DX] Integration test harness for Windows — The e2e tests in session/e2e_tests.rs mock audio. Add a real-audio integration test that captures from a virtual audio device (VB-Audio Cable or similar) on CI.
- [DX] Benchmark suite — A cargo bench target that runs Whisper on a fixed audio fixture and reports decode time. Gate CI failures on a regression threshold (e.g. +-15% from baseline).
- [DX] Database migration framework — Currently SQLite schema changes require manual version bumps. Add a migration runner (e.g. rusqlite_migration) that applies numbered .sql files at startup.
- [DX] Settings schema version — Add a schema_version row to the settings table so old settings can be migrated or deprecated cleanly across app versions.
- [DX] IPC contract tests — Auto-generate TypeScript types from the specta bindings and add a test that the generated bindings.ts matches the Rust side on every build.
- [INFRA] Plugin architecture — Extract delivery methods (clipboard, accessibility, keyboard) and enhancement rules into a plugin trait so third-party developers can add delivery backends without forking the core.

---

## Privacy & Auditable Security

- [x] [SEC] Public plain-English Privacy Architecture page with data boundary flow, outbound network disclosures, and audit recipes.
- [x] [SEC] Explicit outbound network statement: only optional model downloads and GitHub release checks.
- [x] [SEC] Zero account architecture — fully operational out of the box with 0 accounts, 0 logins, and 0 tokens.
- [x] [SEC] Zero telemetry by default — no tracking SDKs, no beacons, no word counts or app analytics transmitted.
- [x] [SEC] Incognito mode & local retention policies (0-day auto-purge, instant full database wipe).
- [ ] [SEC] In-app "Air-Gap / Hardware Isolation Mode" hard kill-switch that closes any sockets and disables all outbound networking in the binary.
- [ ] [SEC] SQLite database encryption at rest using OS Keychain / Windows DPAPI master keys.
- [ ] [SEC] Reproducible network demo video & third-party security verification badge on landing page.

---

## Latency & Performance Benchmarks

- [x] [PERF] Published dated, reproducible latency comparison matrix on website (speech end -> insertion tail latency).
- [ ] [PERF] Automated CI latency & WER benchmark harness — Cargo bench target measuring insertion latency, sustained WPM, and technical WER on a fixed 500-sample audio dataset.
- [ ] [PERF] Per-device resource profiling dashboard — Live telemetry in settings showing CPU/GPU VRAM footprint and Real-Time Factor (RTF) across M-series & DirectML.
- [ ] [PERF] Always-ready warm background worker — Maintain warm Whisper VRAM state with zero idle CPU burn for sub-5ms session wakeups.
- [ ] [PERF] Laptop battery efficiency mode — Dynamically downshift decode thread pool on battery power to preserve <1.2% / hour discharge rate.
- [ ] [PERF] Low-bandwidth / offline verification guide — Documented test suite confirming identical sub-200ms latency in air-gapped / airplane mode.

---

## Power-User Customization & Vocabulary Ownership

- [x] [FEAT] Smart per-app context formatting engine (Slack, Cursor, Notion, Gmail).
- [ ] [FEAT] Voice-triggered text-expander snippets & macros — Speak trigger words (e.g. "bug template", "status update") to instantly insert structured markdown schemas.
- [ ] [FEAT] Portable dictionary export/import (`.json` / `.csv`) — "Your vocabulary is an asset you own—not a training signal for someone else's model."
- [ ] [FEAT] Project & workspace-scoped dictionaries — Auto-load `.murmur/dictionary.json` from the active git repository or workspace folder.
- [ ] [FEAT] Local AI pipeline chaining — Dictate -> local lightweight LLM (llama.cpp) summarize/reformat -> paste to active cursor.
- [ ] [FEAT] Developer-first keyboard command palette — Fast shortcut-driven dictionary management and model switching without mouse interaction.
- [ ] [FEAT] Bring-Your-Own-Model (BYOM) loader — Allow power users to load custom fine-tuned GGUF / whisper.cpp model weights.

---

## High-Intent SEO & Trust-Earning Content

- [x] [SEO] Generated 10 high-intent programmatic comparison & use-case pages (`/wispr-flow-alternative`, `/private-dictation-app`, `/offline-voice-to-text-for-mac`, `/offline-voice-to-text-for-windows`, `/local-whisper-dictation`, `/voice-dictation-for-developers`, `/hipaa-friendly-local-dictation`, `/dictation-for-lawyers`, `/dictation-without-cloud-upload`, `/best-private-ai-dictation`).
- [x] [SEO] Added JSON-LD Schema markup (`SoftwareApplication` & `FAQPage`) and canonical meta tags across all comparison routes.
- [x] [CONTENT] Published 6 trust-earning technical articles addressing buyer anxieties, legal privilege risks, developer privacy, and hardware benchmarks.
- [ ] [MARKETING] Record and publish short outcome-driven demonstration clips for X, LinkedIn, Reddit, and Product Hunt: "Dictating a full GitHub issue in Airplane Mode with 0 bytes sent."

---

## Sustainable Commercialization & Product Virality

- [x] [BIZ] Hybrid pricing model: Free Starter + $49 Core Lifetime perpetual license + $8/mo / $49/yr Pro tier + $119 Privacy Professional tier.
- [x] [BIZ] Student and Open Source Developer 50% discount program ($29 Core Lifetime).
- [x] [BIZ] Switcher acquisition offer: 40% off first year / $20 off Lifetime for users migrating from Wispr Flow or Superwhisper.
- [x] [VIRALITY] Shareable custom vocabulary and voice-command packs (`.murmur/pack.json`) with community pack directory.
- [ ] [VIRALITY] In-app post-activation referral trigger: prompt users with personal referral invite only after 50 successful dictations (never during onboarding).
- [ ] [VIRALITY] "Made with local dictation" exportable badge templates for GitHub issues, PRs, and documentation.
- [ ] [SEC] Privacy Professional tamper-evident local audit logger & OS Keychain encrypted configuration export.

---

## Known Bugs & Tech Debt

- [BUG] modifier_tap.rs uses static mut with mutable references — Three warn(static_mut_refs) warnings exist. Refactor DETECTOR_STATE, DETECTOR_CALLBACK, and HOOK_HANDLE into a Mutex<Option<...>> or OnceLock to be Rust 2024 compliant and sound.
- [BUG] PillMetrics.exit_ms and exit_travel are dead code — Remove or wire up the animation fields in tray.rs.
- [BUG] Updater endpoint 404 on dev builds — Two ERROR tauri_plugin_updater lines appear on every dev launch because the update URL points to a production endpoint. Add a TAURI_UPDATER_DISABLE=1 env var check in bootstrap.rs when running in debug mode.
- [BUG] Session orphan recovery runs before audio device is available — find_orphans at startup can try to finalize a session before CPAL initializes. Add a device readiness check before running recovery.
- [TECH DEBT] bootstrap.rs is 2000+ lines — Extract window sizing, tray construction, hotkey registration, and engine warm-up into separate bootstrap/ submodules.
- [TECH DEBT] registry/mod.rs is 727 lines — The capability and setting definitions should be split into per-capability files under registry/capabilities/.
- [TECH DEBT] adapters/rules/text.rs is 39 KB — The filler, correction, and punctuation logic should be split into separate files under adapters/rules/.
- [TECH DEBT] No API versioning on IPC commands — If the Tauri frontend and backend get out of sync during an update, commands silently fail. Add an api_version field to all IPC responses.
- [TECH DEBT] tauri.conf.json resources: [] — Emptied to fix Windows build. Re-add model bundling support using Tauri's $APPDATA resolver so packaged releases can ship with a bundled tiny model.

---

## Analytics & Stats

- [FEAT] Daily/weekly summary notification — Optionally show a Windows toast at end-of-day: "You dictated 1,240 words today across 14 sessions, saving ~8 minutes of typing."
- [FEAT] WPM vs typing speed comparison — Compare the user's dictation WPM against their BASELINE_WPM to show how much faster they speak than type.
- [FEAT] App breakdown stats — In the stats dashboard, show which apps received the most dictated words (already tracked via app_bundle_id on each session).
- [FEAT] Error rate tracking — Track how often sessions end in Failed, Orphaned, or Cancelled states and surface them in the stats view as a reliability metric.
- [FEAT] Latency percentile dashboard — Show p50/p90/p99 of TailDecode and TotalFinalize latencies from the services/metrics.rs data in the stats view.

---

## Integrations

- [FEAT] Browser extension — A Chrome/Edge extension that lets the dictation pill appear inside browser text fields (contenteditable, textarea) without the clipboard round-trip, using the extension's input event injection API.
- [FEAT] VS Code extension — Trigger Murmur from VS Code's command palette and have the transcript inserted at the cursor via the VS Code extension API (editor.edit).
- [FEAT] REST / WebSocket API — Expose a local WebSocket server so third-party apps can subscribe to transcript events in real time (e.g. for streaming captions on OBS).
- [FEAT] AutoHotkey / PowerShell trigger — Document and expose a named pipe or local socket that external scripts can write to in order to start/stop sessions programmatically.
- [FEAT] Whisper API compatibility layer — Expose a local HTTP endpoint that accepts audio files and returns transcripts in the OpenAI Whisper API format, so existing tools (Raycast, Obsidian plugins) can use Murmur as a local Whisper backend.
