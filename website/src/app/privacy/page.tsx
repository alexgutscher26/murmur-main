import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Architecture & Verifiability Proof · Murmur",
  description:
    "Plain-language, auditable proof of how Murmur handles your voice, audio, and transcriptions locally on your machine. Zero cloud uploads.",
};

const VERIFICATION_QUESTIONS = [
  {
    q: "Is audio ever uploaded to a server?",
    a: "No. Never. Audio recorded from your microphone is held temporarily in local system memory (RAM) and fed directly into the local whisper.cpp engine running on your CPU or GPU. Once transcribed, the raw audio buffer is immediately released.",
    badge: "0 Bytes Uploaded",
  },
  {
    q: "Are transcripts ever uploaded to the cloud?",
    a: "No. Transcriptions are generated locally on your device and pasted directly into your active window. If local history is enabled, it is stored strictly in a local SQLite file in your user AppData/Application Support directory.",
    badge: "100% On-Device",
  },
  {
    q: "Does Murmur work with no internet connection?",
    a: "Yes. Once the initial Whisper model weights are stored on your drive (~600 MB for Whisper Small), Murmur operates 100% offline. You can disconnect your Wi-Fi, turn on Airplane Mode, or run in an isolated intranet without any degradation.",
    badge: "Offline Ready",
  },
  {
    q: "What data leaves the device for updates or error reporting?",
    a: "By default, Murmur only checks the official GitHub release tag API to inform you when a newer desktop binary is available. No error reports, crash logs, or user identifiers are collected or transmitted. Update checks can also be completely disabled in Settings.",
    badge: "Zero Telemetry",
  },
  {
    q: "Is telemetry or product analytics disabled by default?",
    a: "Yes. There are zero tracking SDKs, analytics beacons, or usage telemetry built into the binary. We do not track words spoken, minutes recorded, or which apps you dictate into.",
    badge: "No Trackers",
  },
  {
    q: "Can users completely delete all local history?",
    a: "Yes. You can delete individual transcript items, clear all history with a single click, configure automatic daily purge retention (e.g. keep for 7 days or 0 days), or use Incognito Mode so recordings are never persisted to disk.",
    badge: "Instant Wipe",
  },
  {
    q: "What AI models run locally on my computer?",
    a: "Murmur runs open-weights OpenAI Whisper models (Tiny, Base, Small, Medium, Large-v3-Turbo) using whisper.cpp with native hardware acceleration (Metal on Apple Silicon macOS, DirectML/CUDA on Windows).",
    badge: "Open Weights",
  },
  {
    q: "Can advanced users block all network access and retain full functionality?",
    a: "Yes. You can block Murmur in Windows Firewall, Little Snitch, or LuLu. Dictation, custom dictionary phonetic biasing, app-aware formatting, and local history will all continue to function with zero interruptions.",
    badge: "Firewall Audited",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white">
      <Navbar />

      <section className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-white/90">
              Verifiable Security & Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Privacy by Architecture.
            <span className="block text-gradient-hero mt-1">Not merely by policy.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            Cloud dictation services ask you to trust their corporate policies and privacy controls while streaming your voice to remote servers.
            Murmur protects your confidential ideas by never sending them off your computer in the first place.
          </p>
        </div>

        {/* The Data Boundary Matrix */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131] mb-12">
          <h2 className="text-xl font-bold text-white mb-2">
            The Murmur Local Data Boundary
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mb-6">
            A transparent ledger of every data type processed by Murmur and where it resides.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#313131] text-white/80 font-mono">
                  <th className="pb-3 pr-4">Data Type</th>
                  <th className="pb-3 px-4">Storage Location</th>
                  <th className="pb-3 px-4">Cloud Transmission</th>
                  <th className="pb-3 pl-4">Retention Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272727] text-white/70 font-mono">
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Microphone Audio</td>
                  <td className="py-3 px-4">Volatile RAM only</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">0 Bytes (Never uploaded)</td>
                  <td className="py-3 pl-4">Cleared instantly on decode</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Transcripts & Text</td>
                  <td className="py-3 px-4">Local SQLite database</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">0 Bytes (Never uploaded)</td>
                  <td className="py-3 pl-4">1-click wipe / Auto-purge</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Custom Dictionary</td>
                  <td className="py-3 px-4">Local settings JSON</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">0 Bytes (Never uploaded)</td>
                  <td className="py-3 pl-4">Managed locally</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Telemetry & Analytics</td>
                  <td className="py-3 px-4">Non-existent</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">0 Bytes (No tracking SDKs)</td>
                  <td className="py-3 pl-4">N/A</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Model Weights</td>
                  <td className="py-3 px-4">Local disk (~600MB)</td>
                  <td className="py-3 px-4 text-white/60">One-time initial download</td>
                  <td className="py-3 pl-4">Offline permanent</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">App Update Checks</td>
                  <td className="py-3 px-4">None</td>
                  <td className="py-3 px-4 text-white/60">GitHub Releases API (Optional)</td>
                  <td className="py-3 pl-4">Can be toggled OFF</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 8 Plain-Language Questions */}
        <div className="mb-16">
          <div className="text-center max-w-[680px] mx-auto mb-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 block mb-2">
              Auditable Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              Plain-language security answers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERIFICATION_QUESTIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between"
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

        {/* How to Verify Yourself */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2b2b2b] mb-12">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            How to verify our network claims yourself
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
            We encourage developers, infosec auditors, and security teams to verify our network isolation claims independently using standard network inspection tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#1f1f1f] border border-[#313131]">
              <span className="font-bold text-white block mb-1">1. Little Snitch / LuLu</span>
              <p className="text-white/60 text-[11px] leading-normal">
                Run Little Snitch on macOS while dictating a 10-minute speech. Confirm 0 outbound connections are initiated.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1f1f1f] border border-[#313131]">
              <span className="font-bold text-white block mb-1">2. Wireshark / Pktmon</span>
              <p className="text-white/60 text-[11px] leading-normal">
                Capture local process network traffic on Windows. Verify zero HTTP/WebSocket payloads during voice capture.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1f1f1f] border border-[#313131]">
              <span className="font-bold text-white block mb-1">3. Air-Gap Firewall</span>
              <p className="text-white/60 text-[11px] leading-normal">
                Create a strict firewall rule blocking all outbound connections for Murmur. All dictation features work identically.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center p-8 rounded-2xl bg-[#181818] border border-[#313131]">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to dictate without compromise?
          </h2>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
            Download Murmur for macOS and Windows. Free, open source, and 100% on-device.
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
