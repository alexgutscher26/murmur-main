# Marketing Plan — Private AI Dictation

## Executive Summary: Privacy as Proof

"Private" is a crowded claim in AI software. Nearly every cloud dictation tool claims to "respect your privacy" through fine-print Terms of Service, SOC2 checkboxes, or enterprise data pledges. Yet every one of them continues to stream raw microphone audio over WebSockets to third-party GPU clusters.

**Our primary differentiator is verifiability**: we make the promise technically provable, not merely marketing language. Cloud tools protect data with legal policies and organizational controls; we protect it by keeping dictation strictly on the physical device in the first place.

---

## 1. Core Messaging Hierarchy

### Landing Page Hero Copy

- **Primary Headline:**
  > **Speak naturally. Write anywhere.**
  > **Keep it private.**

- **Subheadline:**
  > **Turn your voice into polished text in any app — processed locally on your PC or Mac.**

- **Trust Pillars (Badges):**
  - **No uploaded audio.**
  - **No cloud transcript history.**
  - **No selling your data.**

- **Primary Call-to-Action:**
  > **[Download free]** *(Platform detected: macOS / Windows)*

---

## 2. Features That Sell (Outcome-Driven Framing)

We do not market a long, dry feature list. We market jobs people pay to complete — each feature framed as an outcome a real user cares about.

| User Job | Feature to Emphasize | Marketing Language | Target Audience |
|:---|:---|:---|:---|
| **Write emails faster** | Clean-up and formatting | *"Speak the messy first draft. Paste the polished version."* | Operators, executives, consultants |
| **Dictate in every app** | Global hotkey + universal insertion | *"One shortcut works wherever you write."* | Slack, Cursor, Word, Notion & Gmail users |
| **Protect sensitive ideas** | Fully local processing | *"Your client notes and private thoughts stay yours."* | Lawyers, therapists, founders, engineers |
| **Work while traveling** | Offline dictation | *"Dictate on a plane, in a hotel, or anywhere Wi-Fi fails."* | Frequent travelers, commuters, secure sites |
| **Handle jargon correctly** | Custom vocabulary / dictionary | *"Teach it client names, code terms, medications, or product names."* | Software engineers, medical staff, domain specialists |
| **Use multiple languages** | Local language models | *"Private dictation in the languages you actually use."* | Multilingual teams, international professionals |

---

## 3. Pricing & Monetization Strategy

Use a **hybrid model**: a genuinely useful free tier, an affordable perpetual license, and an optional subscription for ongoing premium value. 

Because users supply their own hardware and audio never needs cloud processing, subscription-only pricing feels misaligned unless it pays for continuous value such as model updates, advanced workflows, or business support.

### Pricing Structure

| Plan | Price | Included Value & Capabilities | Target Segment |
|:---|:---|:---|:---|
| **Free** | **$0** | Local dictation, basic quantized model (Base), standard weekly use, one language, standard punctuation / raw text insertion | Evaluators, lightweight users |
| **Pro Lifetime** | **$79–$149 one time**<br>*(Launch deal: **$89**; Regular: **$129**)* | Unlimited dictation, premium models (Large v3 Turbo & Medium), custom vocabulary, per-app formatting, 100% offline use, **1–2 devices**, **1 full year of all updates included** | High-output professionals, privacy purists |
| **Pro Annual** | **$39–$59/year**<br>*(Billed at **$49/year**)* | Same core Pro features plus **all continuous updates while active** (new model drops, OS driver tuning, text commands) | Daily power users who want continuous updates |
| **Pro Monthly** | **$6–$10/month**<br>*(Billed at **$8/month**)* | Optional lower-commitment path — not the headline plan | Short-term project workers |
| **Team / Business** | **$10–$25/user/month**<br>*(Billed at **$15–$19/user/month**)* | Admin deployment (MSIX & PKG), centralized preferences, shared team vocabularies, priority support, signed security documentation | Law firms, medical practices, enterprise eng |

### Launch Offer: Founding Pro
- **Offer:** **$79–$99 once** (e.g. **$89**) — strictly limited to the first **100–300 customers**.
- **Scope:** Private dictation forever, plus all updates for **one full year**.
- **Post-Launch:** Regular Pro at **$129 one time**, with an optional **$29–$49/year update pass** for new models and major releases.
- **Critical Policy:** **Avoid promising "lifetime updates"** — it creates an unsustainable, unlimited support obligation for a one-time payment. Users retain the version they bought forever with zero ongoing fees, and pay only when they choose to upgrade to future major versions.

### What to Gate (Pro Features vs. Free Core Promise)
**Do not cripple the core promise** — local and private transcription — behind a paywall. Charge for power-user outcomes instead.

#### Good Pro Gates:
- Unlimited dictation or transcription (vs. standard weekly caps on free tier)
- Larger / faster local models and automatic model selection (Whisper Large v3 Turbo)
- Custom vocabulary for client names, products, acronyms, and technical terms
- Per-app writing profiles: concise Slack, polished email, code-aware formatting
- Voice commands, text transformations, multiple languages, auto-language detection
- Local meeting transcription with speaker labeling, searchable archives, multiple-device activation
- Commercial-use rights and priority support

### Recurring Revenue That Makes Sense
Even without cloud transcription, users will happily pay recurring fees when they receive new, ongoing value — not for access to text they can already generate on their own machine:
1. **New local models and better accuracy:** Packaging and quantizing newer open-source architectures (e.g. Whisper v4, Distil-Whisper, Qwen-Audio).
2. **OS compatibility, driver fixes, and performance tuning:** Regular optimizations for new macOS versions, Apple Metal updates, Windows DirectML improvements, and Qualcomm Snapdragon X Elite NPU offload.
3. **Premium voice commands and writing workflows; new languages:** Multi-lingual automatic switching and voice snippet macros.
4. **Optional cross-device encrypted sync:** Offered strictly as an opt-in, end-to-end encrypted sync service for custom vocabularies and snippets.
5. **Domain-specific vocabulary packs:** Curated phonetic dictionaries for legal, medical, coding, sales, and real estate.
6. **Team management and enterprise features:** Centralized deployment, MDM configs, and local meeting transcription upgrades.

---

## 4. Privacy Architecture Page Specifications

A dedicated public page (`/privacy`) providing plain-language, audit-ready answers to every question a privacy-minded buyer, security officer, physician, or attorney will ask:

| # | Question | Direct Plain-Language Answer | Technical Audit Status |
|:---|:---|:---|:---|
| **1** | **Is audio ever uploaded?** | **No. Never.** Voice recorded from your microphone is held temporarily in volatile system RAM while being transcribed and is immediately wiped when decoding completes. | `0 Bytes Outbound` |
| **2** | **Are transcripts ever uploaded?** | **No. Never.** Transcripts are typed directly into your focused cursor via native OS input events. Murmur has no cloud backend, account database, or synchronization servers. | `0 Cloud Transcripts` |
| **3** | **Does the product work with no internet connection?** | **Yes, 100%.** Once model weights are downloaded to your disk, Murmur operates completely offline with no network connection required. Dictate on airplanes or in air-gapped facilities. | `100% Offline Capable` |
| **4** | **What data leaves the device for licensing, updates, or error reporting?** | **Zero licensing or error data.** Murmur is free and open source (MIT license), with no seat tracking or activation calls. Software updates perform an optional read-only query to the GitHub Releases API (can be disabled in Settings). Zero crash logs or diagnostics leave your machine. | `Zero Licensing Telemetry` |
| **5** | **Is analytics disabled by default?** | **Yes.** Analytics is zero by default—Murmur contains no analytics SDKs, telemetry beacons, Google Analytics, PostHog, or third-party tracking scripts. | `Zero Analytics by Default` |
| **6** | **Can users delete all local history?** | **Yes.** Dictation history is stored in an on-device SQLite database. Users can wipe all history with 1 click, set auto-purge retention rules (24h, 7d, 30d), or use Incognito Mode so transcripts are never written to disk. | `1-Click Wipe & Incognito` |
| **7** | **What model runs locally?** | Optimized open-source **OpenAI Whisper models** (Tiny, Base, Small, Medium, Large-v3-Turbo) running via `whisper.cpp` with Apple Metal (macOS) and DirectML/CUDA (Windows) hardware acceleration. | `Open-Source Whisper Models` |
| **8** | **Can advanced users block the app's network access and retain core functionality?** | **Yes.** Users can block Murmur in their firewall (Windows Defender Firewall, Little Snitch, LuLu, pf) or toggle the in-app "Air-Gap Mode". Dictation, custom dictionaries, and context-aware formatting work with 100% functionality. | `Firewall & Air-Gap Friendly` |

---

## 5. Proof Assets Portfolio

To turn "Trust Me" into "Verify Me", we deploy five tangible proof assets across all marketing channels:

### Asset 1: 10–20 Second Micro-Demo GIF / Simulator
- **Scenario:** Global hotkey (`Alt+Space` or `Option+Space`) &rarr; user speaks naturally &rarr; instant polished text appears in target application.
- **Target Apps:** Slack, Email (Mail/Outlook), VS Code / Cursor, and ChatGPT.
- **Key Visuals:** Real-time green audio waveform pill, instantaneous punctuation, zero clipboard pollution.

### Asset 2: On-Device Processing Diagram
- **Topology:** `Microphone → Your Computer (whisper.cpp in RAM) → Any App`
- **Data Boundary Callout:** A physical dashed red perimeter indicating 0 network packets leave the machine interface.

### Asset 3: Wi-Fi Disabled / Airplane Mode Live Demo
- **Proof Mechanism:** A video recording showing macOS / Windows with Wi-Fi completely turned off and Ethernet disconnected (`0 KB/s` throughput).
- **Action:** User speaks complex technical sentences and code snippets. Text types instantaneously into the active window.
- **Impact:** Irrefutable visual evidence that proves the claim instead of asking users to trust marketing rhetoric.

### Asset 4: Comparison Matrix ("Cloud Dictation vs. Local Dictation")
- **Competitors:** Wispr Flow, Superwhisper, Cloud Speech APIs, OS Built-In.
- **Comparison Dimensions:**
  - *Data Boundary:* 100% on-device vs. remote GPU streaming.
  - *Privacy Guarantee:* Physical architecture (0 bytes) vs. policy documents.
  - *Offline Availability:* Works offline vs. internet-dependent.
  - *Latency:* Sub-180ms local GPU vs. 300–700ms network roundtrips.
  - *Pricing:* Free core + perpetual lifetime options vs. $144/year subscription models.

### Asset 5: Hardware Requirements & Realistic Performance Expectations
Plain-language hardware matrix stating exact memory and GPU expectations:
- **Whisper Base (`~90 MB`):** Runs smoothly on any modern laptop, older dual-core CPUs, <250 MB RAM, ~95ms latency.
- **Whisper Small (`~190 MB`):** Recommended sweet spot for software engineers, <450 MB RAM, ~160ms latency.
- **Whisper Large-v3-Turbo (`~574 MB`):** Apple Silicon (M1/M2/M3/M4) or modern Windows discrete GPU with DirectML/CUDA, ~190ms latency, 99.7% transcription accuracy.

---

## 6. Credibility Escalation Roadmap

To continually deepen competitive trust over time:
1. **Third-Party Privacy Review:** Engage independent privacy researchers to publish formal reviews of Murmur's local data lifecycle.
2. **Open-Source Components:** Maintain fully transparent open-source builds on GitHub, allowing any developer to inspect audio pipelines and build from source.
3. **Reproducible Network Tests:** Publish copy-paste terminal audit recipes for Wireshark, Windows `pktmon`, Little Snitch, LuLu, and `tcpdump`.
4. **Independent Security Audit:** Conduct periodic external security audits verifying local SQLite encryption and zero telemetry egress.
