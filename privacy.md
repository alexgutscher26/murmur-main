# Murmur Privacy Architecture & Data Boundary

Murmur is built on a **local-first, zero-cloud architecture**. Your voice, your transcripts, and your personal data never leave your computer. We turn "trust me" into **"verify me"**.

---

## 🔒 1. The Local Data Boundary Ledger

| Data Type                         | Storage Location                         | Outbound Network Egress                     | Retention & Erasure Policy                                           |
| :-------------------------------- | :--------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------- |
| **Microphone Audio**              | Temporary System Memory (RAM)            | **0 Bytes (Never)**                         | Purged immediately from RAM once transcription finishes              |
| **Transcripts & Pasted Text**     | Local SQLite (`sessions.db`) or RAM-only | **0 Bytes (Never)**                         | User-controlled retention (0 days, 7 days, 30 days, or instant wipe) |
| **Custom Dictionary**             | Local SQLite (`dictionary` table)        | **0 Bytes (Never)**                         | Fully editable & erasable on demand                                  |
| **Window Context (App Title/ID)** | Ephemeral memory buffer                  | **0 Bytes (Never)**                         | Discarded after formatting rule evaluation                           |
| **User Account & Identity**       | None (Zero accounts or logins required)  | **0 Bytes (No auth service)**               | N/A — 100% anonymous & local                                         |
| **Telemetry & Crash Reports**     | None (Zero tracking SDKs)                | **0 Bytes (Never)**                         | N/A — No analytics beacons exist                                     |
| **AI Model Weights**              | Local Disk Storage (`~/.murmur/models`)  | **1-time download from HuggingFace/GitHub** | Fully offline permanent storage                                      |
| **App Update Checks**             | None                                     | **GitHub Releases API (Query only)**        | Can be toggled OFF in Settings                                       |

---

## 🛡️ 2. Data Flow Architecture

```text
[ Microphone Audio Stream ]
            │
            ▼ (Volatile RAM Buffer — zero disk writes)
[ Local whisper.cpp Engine ] (Metal / DirectML / CUDA hardware acceleration)
            │
            ▼ (Raw Decoded Tokens)
[ Local Context Rules & Bias Engine ] (Regex formatting, filler removal, phonetic dictionary)
            │
            ▼ (Formatted Text)
[ Native OS Window Injection ] (Directly typed/pasted into active cursor)
            │
            ├──► Audio buffer immediately freed from RAM
            └──► Optional: Persist transcript to local SQLite (disabled in Incognito)
```

---

## 🌐 3. Explicit Outbound Network Request Disclosure

Murmur makes **only two optional network requests**:

1. **Model Weight Download:** When you download a model (e.g., `whisper-base-q5_0.bin`), Murmur fetches the model directly from HuggingFace or official GitHub release assets. Once downloaded, it never connects again.
2. **Version Check:** If enabled in Settings, Murmur checks `api.github.com/repos/alexgutscher26/murmur/releases/latest` to notify you if an update is available.

**Zero other network requests exist in the codebase.** If you block Murmur in your firewall, all dictation, formatting, and history features continue operating with 100% functionality.

---

## 🧪 4. Reproducible Verification Recipes

You can independently audit Murmur using standard packet capture and network monitoring utilities:

### A. macOS (Little Snitch / LuLu)

1. Install [LuLu](https://objective-see.org/products/lulu.html) or [Little Snitch](https://www.obdev.at/products/littlesnitch/).
2. Launch Murmur and dictate a 5-minute paragraph.
3. Observe the rule monitor: **0 connection attempts** are initiated during dictation or text delivery.

### B. Windows (Wireshark / Pktmon)

1. Run Windows Packet Monitor:
   ```powershell
   pktmon filter add -n murmur
   pktmon start --etw
   ```
2. Dictate continuously across multiple applications.
3. Stop the trace and inspect the output:
   ```powershell
   pktmon stop
   pktmon pcapng pktmon.etl -o murmur_audit.pcapng
   ```
4. Verify that zero audio or HTTP packets were emitted.

### C. Linux / Cross-Platform (NetHogs)

1. Run `sudo nethogs` and isolate the Murmur process PID.
2. Observe bandwidth during active transcription: `0.000 KB/s SENT` / `0.000 KB/s RECV`.

---

## ⚔️ 5. The Competitive Trust Wedge: Murmur vs. Cloud Dictation

| Privacy Dimension      | Murmur (Local-First)                                | Cloud Dictation (e.g. Wispr Flow, Cloud APIs)         |
| :--------------------- | :-------------------------------------------------- | :---------------------------------------------------- |
| **Trust Model**        | **Verifiable Architecture** (0 bytes leave machine) | Policy-based ("We promise not to train on your data") |
| **Network Egress**     | 0 bytes audio / 0 bytes text                        | Continuous WebSocket audio stream                     |
| **Account Required**   | **No (Works out of the box)**                       | Yes (Mandatory email/Google auth)                     |
| **Offline Support**    | **100% offline ready (Air-gap mode)**               | Fails completely without internet                     |
| **Transcript Storage** | Local SQLite on device (or Incognito)               | Remote cloud server storage                           |
| **Telemetry**          | **Zero trackers / Zero beacons**                    | Analytics SDKs & product event tracking               |
| **Auditability**       | Open-source binary & reproducible network recipe    | Closed cloud infrastructure                           |
