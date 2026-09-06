"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mark } from "@/components/Mark";
import { GithubIcon } from "@/components/GithubIcon";

const DEMO_PRESETS = [
  {
    id: "file-tagging",
    title: "AI IDE File Tagging",
    spoken:
      "look at tag file src slash components slash Button dot tsx and add a secondary variant prop",
    output: "look at @src/components/Button.tsx and add a secondary variant prop",
    target: "Cursor / Windsurf / Claude Code",
    badge: "Context Injection",
  },
  {
    id: "camel-case",
    title: "Code Casing Directive",
    spoken: "create a camel case user authentication service and connect it to database",
    output: "create a userAuthenticationService and connect it to database",
    target: "VS Code / Neovim / Zed",
    badge: "Syntax Smart",
  },
  {
    id: "pr-checklist",
    title: "Voice Snippet Macro",
    spoken: "please review pr checklist before merge",
    output: `### ✅ PR Checklist
- [ ] Code follows style conventions
- [ ] Unit & integration tests pass
- [ ] Documentation updated
- [ ] No sensitive credentials or debug logs`,
    target: "GitHub PR / Linear / GitLab",
    badge: "Voice Snippets",
  },
  {
    id: "code-block",
    title: "Code Block Scaffolding",
    spoken: "code block typescript const config equals defineConfig open brace close brace",
    output: "```typescript\nconst config = defineConfig({})\n```",
    target: "Documentation / Issues",
    badge: "Markdown Mode",
  },
  {
    id: "tech-entities",
    title: "Developer Vocabulary",
    spoken: "deploying next js with tailwind css and drizzle orm to supabase via github actions",
    output: "Deploying Next.js with Tailwind CSS and Drizzle ORM to Supabase via GitHub Actions.",
    target: "All Developer Tools",
    badge: "80+ Tech Entities",
  },
];

const DEV_CAPABILITIES = [
  {
    icon: "🎯",
    title: "Context-Aware File Tagging",
    desc: "Tag files in Cursor, Windsurf, Claude Code, and Copilot hands-free. Speak 'tag file src/auth.ts' and Murmur formats '@src/auth.ts' right into your prompt.",
  },
  {
    icon: "⚡",
    title: "Instant Code Casing",
    desc: "Dictate camelCase, snake_case, PascalCase, SCREAMING_SNAKE_CASE, kebab-case, or `backticks` without touching your shift key.",
  },
  {
    icon: "📚",
    title: "Voice Snippets & Templates",
    desc: "Trigger PR checklists, environment setup guides, API specs, bug reports, and daily stand-ups with simple voice shortcuts.",
  },
  {
    icon: "🧠",
    title: "1-Click Codebase Symbol Importer",
    desc: "Scan your package.json, Cargo.toml, or workspace files to instantly import project-specific types, functions, and module names into your local dictionary.",
  },
  {
    icon: "🔒",
    title: "100% On-Device & Zero Cloud Leaks",
    desc: "Never stream company proprietary code or secret prompt context to 3rd-party servers. Murmur runs 100% offline with local whisper.cpp.",
  },
  {
    icon: "🚀",
    title: "Sub-200ms DirectML & Metal Speed",
    desc: "Zero network round trips. Hardware-accelerated local inference delivers transcription directly to your cursor faster than cloud round-trips.",
  },
];

const IDE_INTEGRATIONS = [
  { name: "Cursor", tag: "Full @file Tagging Support", icon: "⚡" },
  { name: "Windsurf", tag: "Cascade Flow Ready", icon: "🌊" },
  { name: "Claude Code", tag: "Hands-Free Terminal Prompting", icon: "🤖" },
  { name: "VS Code", tag: "Copilot & Native Insertion", icon: "💻" },
  { name: "Neovim / Zed", tag: "Direct UTF-8 Keystroke Injection", icon: "⌨️" },
  { name: "GitHub & Linear", tag: "PR & Issue Markdown Scaffolding", icon: "🐙" },
];

const COMPARISON_ROWS = [
  {
    feature: "AI Model Execution",
    murmur: "100% Local (whisper.cpp / GPU)",
    wispr: "Cloud Servers (Audio Uploaded)",
  },
  {
    feature: "Codebase Context Privacy",
    murmur: "Zero Outbound Data / Air-Gap Safe",
    wispr: "Code & Prompts Streamed Online",
  },
  {
    feature: "Cursor & Windsurf @file Tagging",
    murmur: "Native Voice Directive",
    wispr: "Supported (Cloud)",
  },
  {
    feature: "Syntax & Casing Directives",
    murmur: "camelCase, snake_case, backticks",
    wispr: "Supported (Cloud)",
  },
  {
    feature: "Developer Snippet Library",
    murmur: "Included (PRs, APIs, Env Setup)",
    wispr: "Supported (Cloud)",
  },
  {
    feature: "Codebase Symbol Importer",
    murmur: "1-Click package.json / Cargo scanner",
    wispr: "Manual Dictionary Entry",
  },
  {
    feature: "Pricing",
    murmur: "Free & Open Source / $49 Lifetime",
    wispr: "$12/mo / $144/yr recurring",
  },
];

export default function DevelopersPage() {
  const [selectedDemo, setSelectedDemo] = useState(DEMO_PRESETS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDemo.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black">
      <Navbar />

      <main className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* Hero Section */}
          <section className="text-center space-y-6 pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] border border-[#313131] text-xs font-mono text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Flow for Developers · 100% On-Device</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
              Dictation Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                Developers
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Ship 4x faster with syntax-smart dictation built for modern engineering workflows. Tag
              files in Cursor, dictate camelCase, and expand PR checklists hands-free—with zero
              audio leaving your laptop.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/#download"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2 text-sm"
              >
                <span>Download Murmur Free</span>
                <span className="text-xs opacity-70">↓</span>
              </Link>
              <a
                href="https://github.com/webprodigies/murmur"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-[#181818] text-white border border-[#313131] hover:bg-[#222222] transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Star on GitHub</span>
              </a>
            </div>
          </section>

          {/* Interactive Voice Simulator */}
          <section className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Interactive Developer Voice Demo</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Engine Rules
                  </span>
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Click any preset below to see how spoken developer cues transform instantly into
                  code.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedDemo(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDemo.id === preset.id
                        ? "bg-white text-black font-semibold shadow"
                        : "bg-[#1f1f1f] text-white/70 hover:text-white border border-[#313131]"
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spoken Voice Input */}
              <div className="bg-[#181818] border border-[#2e2e2e] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      Spoken Voice Input
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272727] text-white/60">
                      Mic Input
                    </span>
                  </div>
                  <p className="text-base text-white/90 font-mono leading-relaxed italic">
                    "{selectedDemo.spoken}"
                  </p>
                </div>

                <div className="text-xs text-white/40 font-mono">
                  Context: {selectedDemo.target}
                </div>
              </div>

              {/* Formatted IDE Output */}
              <div className="bg-[#181818] border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Injected IDE Output
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272727] text-white/80 hover:text-white border border-[#383838] transition-colors"
                    >
                      {copied ? "Copied! ✓" : "Copy Output"}
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-white bg-[#0e0e0e] p-3 rounded-lg border border-[#222222] whitespace-pre-wrap leading-relaxed">
                    {selectedDemo.output}
                  </pre>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-emerald-400/80">
                  <span>Directive: {selectedDemo.badge}</span>
                  <span>Latency: ~4µs rule eval</span>
                </div>
              </div>
            </div>
          </section>

          {/* Core Capabilities Grid */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Built for Developers Who Live in Their Tools
              </h2>
              <p className="text-sm text-white/60 max-w-xl mx-auto">
                No awkward typing pauses when pairing with AI coding agents or documenting pull
                requests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEV_CAPABILITIES.map((cap, idx) => (
                <div
                  key={idx}
                  className="bg-[#141414] border border-[#262626] rounded-xl p-6 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="text-2xl">{cap.icon}</div>
                  <h3 className="text-base font-semibold text-white">{cap.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* IDE Integrations Banner */}
          <section className="bg-[#121212] border border-[#262626] rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">
                Works Seamlessly Across Your Developer Stack
              </h2>
              <p className="text-xs text-white/60">
                Murmur injects text directly into the focused window via native OS events. No
                browser extensions or plugins required.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {IDE_INTEGRATIONS.map((ide, idx) => (
                <div
                  key={idx}
                  className="bg-[#181818] border border-[#2a2a2a] rounded-lg p-3 text-center space-y-1.5"
                >
                  <div className="text-xl">{ide.icon}</div>
                  <div className="text-xs font-semibold text-white">{ide.name}</div>
                  <div className="text-[10px] text-white/50 leading-tight">{ide.tag}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Head-to-Head Comparison with Wispr Flow */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Murmur vs. Wispr Flow for Developers
              </h2>
              <p className="text-sm text-white/60 max-w-xl mx-auto">
                Why privacy-conscious engineering teams choose on-device Murmur over cloud
                subscriptions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[#262626] rounded-xl overflow-hidden bg-[#121212] text-xs">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-[#262626] text-white/80 font-mono">
                    <th className="p-4">Feature / Requirement</th>
                    <th className="p-4 text-emerald-400 font-bold">Murmur (On-Device)</th>
                    <th className="p-4 text-white/50">Wispr Flow (Cloud)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161616] transition-colors">
                      <td className="p-4 font-medium text-white/90">{row.feature}</td>
                      <td className="p-4 text-emerald-400 font-semibold">{row.murmur}</td>
                      <td className="p-4 text-white/50">{row.wispr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-gradient-to-b from-[#181818] to-[#101010] border border-[#313131] rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#242424] border border-[#383838] flex items-center justify-center">
              <Mark size="md" animated={true} />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to Flow 4x Faster at Your Terminal?
              </h2>
              <p className="text-sm text-white/60">
                Install Murmur in seconds. Works completely offline with zero setup and zero account
                creation.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/#download"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all text-sm shadow-md"
              >
                Download for macOS & Windows
              </Link>
              <Link
                href="/privacy"
                className="px-6 py-3 rounded-full bg-[#202020] text-white/80 border border-[#333333] hover:text-white transition-all text-sm"
              >
                View Privacy Proof
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
