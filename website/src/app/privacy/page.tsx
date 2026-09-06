import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Architecture & Verifiability Ledger · Murmur",
  description:
    "Plain-English, auditable proof of how Murmur processes voice, audio, and transcriptions 100% locally on your machine. Zero cloud streaming, zero accounts, zero telemetry.",
};

const DATA_BOUNDARY_MATRIX = [
  {
    type: "Microphone Audio",
    storage: "Volatile RAM buffer only",
    cloud: "0 Bytes (Never uploaded)",
    retention: "Instantly freed upon decode completion",
    status: "Strictly Local",
  },
  {
    type: "Transcripts & Pasted Text",
    storage: "Local SQLite database or RAM-only (Incognito)",
    cloud: "0 Bytes (Never uploaded)",
    retention: "Configurable auto-purge (0-30 days) or 1-click wipe",
    status: "Strictly Local",
  },
  {
    type: "Custom Dictionary & Snippets",
    storage: "Local SQLite (`dictionary` table)",
    cloud: "0 Bytes (Never uploaded)",
    retention: "Editable & erasable on demand",
    status: "Strictly Local",
  },
  {
    type: "App & Window Context",
    storage: "Ephemeral memory (Target app title/bundle ID)",
    cloud: "0 Bytes (Never uploaded)",
    retention: "Discarded after formatting rule evaluation",
    status: "Strictly Local",
  },
  {
    type: "User Account & Authentication",
    storage: "None (Zero accounts or logins required)",
    cloud: "0 Bytes (No user auth service exists)",
    retention: "N/A — 100% anonymous & local",
    status: "Zero Accounts",
  },
  {
    type: "Telemetry & Usage Analytics",
    storage: "None (Zero tracking SDKs)",
    cloud: "0 Bytes (No analytics beacons or crash telemetry)",
    retention: "N/A — No identifiers generated",
    status: "Zero Telemetry",
  },
  {
    type: "Whisper AI Model Weights",
    storage: "Local Disk (`~/.murmur/models`)",
    cloud: "1-time download from HuggingFace/GitHub",
    retention: "Permanent offline storage",
    status: "Air-Gap Ready",
  },
  {
    type: "Software Update Checks",
    storage: "None",
    cloud: "GitHub Releases API (Query only)",
    retention: "Can be disabled via 'Check for updates' toggle",
    status: "User Controlled",
  },
];

const VERIFICATION_QUESTIONS = [
  {
    q: "Is audio ever uploaded? — No, never.",
    a: "No. Never. Spoken voice captured from your microphone is streamed strictly into a temporary volatile RAM buffer on your physical machine and passed directly to the local Whisper inference engine. The millisecond decoding finishes, the raw audio buffer is immediately freed and zeroed. Zero bytes of audio are ever transmitted over the network.",
    badge: "0 Bytes Audio Uploaded",
  },
  {
    q: "Are transcripts ever uploaded? — No, never.",
    a: "No. Never. Transcripts are generated locally on-device and typed directly into your active window at your cursor position via native OS keyboard injection. Murmur maintains no cloud transcript databases, remote backups, or synchronization servers. Your spoken words never touch an external server.",
    badge: "0 Cloud Transcripts",
  },
  {
    q: "Does the product work with no internet connection?",
    a: "Yes, 100%. Once model weights are stored on your local disk, Murmur requires zero internet connectivity to operate. You can dictate on airplanes, in air-gapped secure development facilities, or during network outages with zero drop in speed or accuracy.",
    badge: "100% Offline Capable",
  },
  {
    q: "What data leaves the device for licensing, updates, or error reporting?",
    a: "Murmur is free and open-source under the MIT license, so there are zero licensing calls, seat tracking, or activation checks. For software updates, Murmur makes an optional, read-only HTTPS query to the official public GitHub Releases API to check version tags (which can be disabled with one click in Settings). Zero crash logs, stack traces, or error diagnostics leave your machine.",
    badge: "Zero Licensing Telemetry",
  },
  {
    q: "Is analytics disabled by default?",
    a: "Yes. Telemetry and analytics are zero by default—Murmur contains no analytics SDKs, telemetry beacons, Google Analytics, PostHog, or third-party tracking scripts. We do not track words spoken, session frequencies, or what applications you dictate into.",
    badge: "Zero Analytics by Default",
  },
  {
    q: "Can users delete all local history?",
    a: "Yes. Local history is stored in an on-device SQLite database (`murmur.db`). You can purge your entire history at any time with a single click in Settings, configure automatic purge retention rules (e.g. wipe after 24 hours, 7 days, or 30 days), or use Incognito Mode so transcripts are never written to disk in the first place.",
    badge: "1-Click Wipe & Incognito",
  },
  {
    q: "What model runs locally?",
    a: "Murmur runs open-source OpenAI Whisper architecture models compiled into compact, quantized GGML weights (Tiny, Base, Small, Medium, and Large-v3-Turbo) using whisper.cpp. Models execute natively with GPU hardware acceleration via Apple Metal on macOS and DirectML or CUDA on Windows.",
    badge: "Open-Source Whisper Models",
  },
  {
    q: "Can advanced users block the app's network access and retain core functionality?",
    a: "Yes. Advanced users and IT administrators can block Murmur in Windows Defender Firewall, Little Snitch, LuLu, or pf, or toggle Murmur's built-in 'Air-Gap Mode' in Settings. Core dictation, custom phonetic dictionary biasing, and context-aware formatting continue to function with 100% reliability.",
    badge: "Firewall & Air-Gap Friendly",
  },
  {
    q: "How does Murmur differ from cloud dictation tools like Wispr Flow?",
    a: "Cloud tools like Wispr Flow stream your voice over WebSockets to remote GPU clusters, store transcripts in cloud databases, and use cloud LLMs for post-processing. Murmur executes speech recognition and prompt formatting on your local hardware using whisper.cpp with sub-180ms latency.",
    badge: "Architecture vs Policy",
  },
  {
    q: "How can I independently test and verify these claims?",
    a: "You can monitor Murmur using standard packet capture tools (Wireshark, Little Snitch, LuLu, or Windows pktmon). When you press the dictation hotkey and speak for 10 minutes, your network monitor will register exactly 0 bytes of egress traffic.",
    badge: "Verifiable by Anyone",
  },
];

const REPRODUCIBLE_TEST_RECIPES = [
  {
    os: "macOS",
    tool: "Little Snitch / LuLu",
    title: "Real-Time Connection Monitoring",
    command: "lulu --monitor /Applications/Murmur.app",
    description:
      "Launch LuLu or Little Snitch in Alert Mode. Start dictating in any application. Notice that zero connection alert prompts appear during voice capture, decode, or text insertion.",
  },
  {
    os: "Windows",
    tool: "Pktmon / Wireshark",
    title: "Packet Inspection During Dictation",
    command: "pktmon filter add -n murmur && pktmon start --etw",
    description:
      "Bind packet monitor to Murmur.exe. Dictate high-entropy paragraphs. Stop the trace and inspect the capture: zero TCP/UDP packets leave your network interface.",
  },
  {
    os: "Linux / Cross-Platform",
    tool: "NetHogs / tcpdump",
    title: "Process Bandwidth Auditing",
    command: "sudo nethogs -d 1",
    description:
      "Monitor process bandwidth in real-time. Dictate for several minutes continuously. Murmur will register 0 KB/s upload and 0 KB/s download.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white">
      <Navbar />

      <section className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-[760px] mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">
              Verifiable Trust · 100% Local-First
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Privacy by Architecture.
            <span className="block text-gradient-hero mt-1">Not merely by policy.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            Cloud dictation services ask you to trust legal privacy policies while streaming your
            raw voice to remote servers. Murmur protects your confidential thoughts with physical
            architecture:{" "}
            <strong className="text-white">your voice never leaves your device.</strong>
          </p>
        </div>

        {/* Visual Data Flow Diagram */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#272727] mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
                Data Boundary Flow
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                How voice flows from microphone to active window
              </h2>
              <p className="text-xs font-mono text-emerald-400/90 mt-1">
                Microphone → Your Computer (whisper.cpp & RAM) → Any App (Zero network egress)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1c] border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Air-Gapped Local Loop
            </div>
          </div>

          {/* Diagram Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333333] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#272727] flex items-center justify-center text-sm mb-3">
                  🎙️
                </div>
                <h3 className="text-sm font-bold text-white mb-1">1. Microphone</h3>
                <p className="text-xs text-white/60 leading-normal">
                  OS audio stream captured into temporary volatile RAM buffer (CPAL / WASAPI /
                  CoreAudio).
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-4 block">
                RAM only · 0 bytes to disk
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-emerald-500/40 relative flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.05)]">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm mb-3">
                  ⚡
                </div>
                <h3 className="text-sm font-bold text-white mb-1">2. Local Whisper Engine</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Decoded on-device via{" "}
                  <code className="text-emerald-300 text-[11px]">whisper.cpp</code> using native
                  Metal (macOS) or DirectML/CUDA (Windows).
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-4 block">
                On-device GPU/NPU
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333333] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#272727] flex items-center justify-center text-sm mb-3">
                  ⚙️
                </div>
                <h3 className="text-sm font-bold text-white mb-1">3. Context Rules</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Local regex & jargon bias rules format text, strip fillers, and match app context.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-4 block">
                Instant local transform
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333333] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#272727] flex items-center justify-center text-sm mb-3">
                  📋
                </div>
                <h3 className="text-sm font-bold text-white mb-1">4. Direct Insertion</h3>
                <p className="text-xs text-white/60 leading-normal">
                  Formatted text is typed directly into your focused cursor via native OS input
                  injection.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-4 block">
                Audio RAM buffer purged
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#0f0f0f] border border-[#272727] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓ Net Result:</span>
              <span>Zero audio packets. Zero transcripts in the cloud. No remote logging.</span>
            </div>
            <span className="font-mono text-[11px] text-white/50">
              Audit method: Wireshark / LuLu / Little Snitch
            </span>
          </div>
        </div>

        {/* The Data Boundary Matrix */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131] mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">The Murmur Local Data Boundary</h2>
              <p className="text-xs sm:text-sm text-white/60">
                A line-by-line breakdown of every data asset and its storage guarantee.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#222] border border-[#333] text-white/70">
              Audit Version: 1.0.0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#313131] text-white/80 font-mono">
                  <th className="pb-3 pr-4">Data Type</th>
                  <th className="pb-3 px-4">Storage Location</th>
                  <th className="pb-3 px-4">Cloud Transmission</th>
                  <th className="pb-3 px-4">Retention & Erasure</th>
                  <th className="pb-3 pl-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272727] text-white/70 font-mono">
                {DATA_BOUNDARY_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#202020] transition-colors">
                    <td className="py-3 pr-4 font-bold text-white">{row.type}</td>
                    <td className="py-3 px-4 text-white/80">{row.storage}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{row.cloud}</td>
                    <td className="py-3 px-4 text-white/60">{row.retention}</td>
                    <td className="py-3 pl-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#262626] text-emerald-300 border border-emerald-500/20">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8 Plain-Language Questions */}
        <div className="mb-14">
          <div className="text-center max-w-[680px] mx-auto mb-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 block mb-2">
              Auditable Plain-English FAQ
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              Direct answers. Zero legalese.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERIFICATION_QUESTIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between hover:border-[#444] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272727] text-emerald-400 border border-[#313131]">
                      {item.badge}
                    </span>
                    <span className="text-xs font-mono text-white/40">#{idx + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.q}</h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reproducible Verification Recipes */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2b2b2b] mb-14">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202020] border border-[#333] text-xs font-mono text-white/80 mb-3">
              <span>🔬</span> Reproducible Audit Recipes
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Turn &ldquo;Trust Me&rdquo; into &ldquo;Verify Me&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Don&apos;t take our word for it. Here is how security teams, enterprise compliance
              officers, and power users can independently verify Murmur with network inspection
              tools:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {REPRODUCIBLE_TEST_RECIPES.map((recipe, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#1a1a1a] border border-[#313131] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-white">{recipe.tool}</span>
                    <span className="text-[10px] text-white/40">{recipe.os}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-emerald-300 mb-2">{recipe.title}</h3>
                  <p className="text-white/70 text-xs font-sans leading-relaxed mb-4">
                    {recipe.description}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e0e0e] border border-[#272727] font-mono text-[11px] text-white/90 overflow-x-auto">
                  <code>{recipe.command}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Competitive Trust Wedge */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#161616] border border-[#2f2f2f] mb-14">
          <h2 className="text-xl font-bold text-white mb-4">
            The Trust Wedge: Local Architecture vs. Cloud Promises
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/75 leading-relaxed font-sans">
            <div className="p-5 rounded-xl bg-[#111] border border-[#262626]">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Cloud Dictation (e.g. Wispr Flow, Cloud APIs)
              </h3>
              <ul className="space-y-2 text-xs text-white/60 list-disc list-inside">
                <li>Audio streams across public networks to remote GPU endpoints.</li>
                <li>Requires account creation, authentication tokens, and user IDs.</li>
                <li>
                  Transcripts and voice snippets may be retained for model fine-tuning unless
                  explicitly opted out.
                </li>
                <li>
                  Dependent on third-party uptime, internet bandwidth, and corporate cloud retention
                  policies.
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[#111] border border-emerald-500/30">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Murmur On-Device Architecture
              </h3>
              <ul className="space-y-2 text-xs text-white/80 list-disc list-inside">
                <li>0 bytes of audio or transcript leave your physical hardware.</li>
                <li>Zero accounts, zero logins, zero marketing or crash telemetry.</li>
                <li>Model weights execute directly in local memory via whisper.cpp.</li>
                <li>
                  Works completely offline on airplanes, air-gapped workstations, and strict
                  enterprise networks.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center p-8 sm:p-10 rounded-2xl bg-[#181818] border border-[#313131]">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Dictate with total confidence.
          </h2>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
            Murmur is free, open source, and built for people who value privacy as an absolute
            guarantee.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/#download"
              className="text-sm font-semibold text-black bg-white hover:bg-white/90 px-6 py-2.5 rounded-full transition-colors"
            >
              Download Murmur
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-white/80 hover:text-white bg-[#222222] border border-[#313131] px-5 py-2.5 rounded-full transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
