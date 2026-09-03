# Murmur Privacy Architecture & Data Boundary

Murmur is built on a **local-first, zero-cloud architecture**. Your voice, your transcripts, and your personal data never leave your computer.

---

## 🔒 The Local Data Boundary

| Data Type | Storage Location | Cloud Transmission | Retention & Erasure |
| :--- | :--- | :--- | :--- |
| **Microphone Audio** | Temporary System Memory (RAM) | **0 Bytes (Never)** | Purged immediately from RAM once transcription finishes |
| **Transcripts & Text** | Local SQLite (`sessions.db`) | **0 Bytes (Never)** | User-controlled retention (e.g. 7 days, 30 days, or auto-wipe) |
| **Custom Dictionary** | Local SQLite (`dictionary` table) | **0 Bytes (Never)** | Fully editable & erasable on demand |
| **User Settings & Hotkeys**| Local SQLite (`settings` table) | **0 Bytes (Never)** | Revertable with "Delete all data" |
| **Compliance Audit Log** | Local SQLite (`audit_log` table) | **0 Bytes (Never)** | Contains only timestamps & event types (no text or audio) |
| **AI Model Weights** | Local Disk Storage (`~/.murmur/models`) | **0 Bytes (Download once)**| Fully offline open-weights Whisper models |

---

## 🛡️ Core Privacy Guarantees

### 1. 100% On-Device Transcription
Murmur runs open-weights OpenAI Whisper models locally using `whisper.cpp` with native hardware acceleration (Apple Silicon Metal / Windows MSVC). Audio processing happens entirely within your CPU/GPU.

### 2. Zero Telemetry & Zero Trackers
There are no analytics beacons, usage trackers, or marketing SDKs inside the Murmur binary. We do not track words spoken, dictation duration, or the applications you paste into.

### 3. Incognito Mode & Automatic Data Retention
- **Incognito Mode:** Transcripts are pasted directly into your active window and immediately discarded from memory without writing a single byte to disk.
- **Configurable Retention:** Configure `privacy.retention_days` in Settings to have Murmur automatically purge older transcripts on launch and every 6 hours.
- **Auto-Purge on Lock:** When enabled, locking your computer wipes any in-memory transcript buffers and clears the clipboard.

### 4. Complete Data Eradication ("Delete All Data")
At any time, you can execute a full factory wipe from **Settings > Privacy > Delete all data**. This instantly drops all session history, wipes your custom dictionary entries, and resets all settings to defaults.
