# HushWrite Public Open Beta Program

Welcome to the **HushWrite Open Beta Program**. By participating in the beta, you help test new speech-to-text models, bleeding-edge GPU acceleration backends (DirectML / Metal), and local LLM voice transformations before they ship to the stable channel.

---

## 1. Release Channel Tiers

| Channel              | Release Cadence   | Stability                  | Target Audience                                     |
| :------------------- | :---------------- | :------------------------- | :-------------------------------------------------- |
| **Stable**           | Monthly           | High (Production Ready)    | General users, clinical staff, legal practitioners. |
| **Beta**             | Bi-weekly         | Moderate (Tested Features) | Enthusiasts, power users, workflow creators.        |
| **Nightly / Canary** | Weekly / On Merge | Experimental (Active Dev)  | Contributors, developers, AI model benchmarkers.    |

---

## 2. How to Join the Open Beta

### Windows (10 & 11)

1. Download the latest pre-release `.msi` or `.exe` installer from our [GitHub Releases](https://github.com/alexgutscher26/HushWrite/releases).
2. Install over your existing version — your local SQLite history, custom dictionary, and settings will be preserved automatically.
3. In **Settings > General > Update Channel**, select **Beta**.

### macOS (Apple Silicon & Intel)

1. Download the latest unsigned preview `.dmg` or `.app` from [GitHub Releases](https://github.com/alexgutscher26/HushWrite/releases).
2. If Gatekeeper prompts on first open:
   ```bash
   xattr -cr /Applications/HushWrite.app
   ```
3. In **Settings > General > Update Channel**, select **Beta**.

---

## 3. How to Provide Feedback & Report Bugs

1. **Discord Community**:
   - Join `#beta-feedback` on our [Discord Server](https://discord.gg/s95VtQv33m) for live discussions with maintainers.
2. **GitHub Issues**:
   - File structured reports using our [Bug Report Template](../.github/ISSUE_TEMPLATE/bug_report.yml) or [Feature Request Template](../.github/ISSUE_TEMPLATE/feature_request.yml).
3. **What to Include**:
   - Operating System & Hardware (e.g., Windows 11, RTX 4070 DirectML vs CPU).
   - Active ASR Model (`small-q5_1`, `parakeet-tdt-0.6b-v2`, `large-v3-turbo`).
   - Log excerpts from `Settings > General > Logs` (verify no private information is included).

---

## 4. Privacy & Zero-Egress in Beta Builds

Beta builds adhere to the exact same strict privacy invariants as stable releases:

- **0 bytes of audio** are ever transmitted to any remote server.
- All model inference (`whisper.cpp`, `parakeet` ONNX, `llama-cpp-2` GGUF) executes 100% locally in your machine's RAM and VRAM.
- Air-Gap mode remains fully operational and verifiable with local packet monitoring.

---

## 5. Contributor Recognition

Active beta testers who report reproducible bugs, benchmark new models, or submit PRs are automatically added to our [**`CONTRIBUTORS.md`**](../CONTRIBUTORS.md) ledger!
