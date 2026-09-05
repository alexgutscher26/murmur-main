"use client";

import { CheckCircle2, ShieldCheck, Zap, Sparkles } from "lucide-react";

interface AppItem {
  name: string;
  category: string;
  icon: string;
}

const APPS_ROW_1: AppItem[] = [
  { name: "Cursor", category: "AI Code Editor", icon: "{ }" },
  { name: "VS Code", category: "Code Editor", icon: "//" },
  { name: "Slack", category: "Team Chat", icon: "#" },
  { name: "Linear", category: "Issue Tracking", icon: "▲" },
  { name: "GitHub Desktop", category: "Version Control", icon: "⌘" },
  { name: "Terminal", category: "macOS Shell", icon: ">_" },
  { name: "Raycast", category: "Productivity", icon: "⌥" },
  { name: "Warp", category: "Modern Terminal", icon: "$" },
  { name: "Xcode", category: "Apple Development", icon: "⚒" },
  { name: "iTerm2", category: "Terminal", icon: "~" },
  { name: "IntelliJ IDEA", category: "JetBrains IDE", icon: "ij" },
  { name: "Postman", category: "API Testing", icon: "⇄" },
  { name: "Docker Desktop", category: "Containers & DevOps", icon: "⬡" },
  { name: "PyCharm", category: "Python IDE", icon: "py" },
  { name: "Sublime Text", category: "Text Editor", icon: "=" },
  { name: "Neovim", category: "Modal Editor", icon: "v" },
];

const APPS_ROW_2: AppItem[] = [
  { name: "Notion", category: "Docs & Knowledge", icon: "N" },
  { name: "Claude", category: "AI Intelligence", icon: "✦" },
  { name: "ChatGPT", category: "AI Assistant", icon: "◎" },
  { name: "Figma", category: "Interface Design", icon: "❖" },
  { name: "Apple Mail", category: "Email Client", icon: "✉" },
  { name: "Obsidian", category: "Markdown Notes", icon: "◆" },
  { name: "Google Docs", category: "Collaborative Docs", icon: "≡" },
  { name: "Arc", category: "Modern Browser", icon: "◓" },
  { name: "Apple Notes", category: "Quick Notes", icon: "✎" },
  { name: "Discord", category: "Community Chat", icon: "::" },
  { name: "Google Sheets", category: "Spreadsheets", icon: "⊞" },
  { name: "Chrome", category: "Web Browser", icon: "◌" },
  { name: "Excel", category: "Data & Finance", icon: "X" },
  { name: "Safari", category: "Apple Browser", icon: "🧭" },
  { name: "Telegram", category: "Encrypted Chat", icon: "✈" },
  { name: "Airtable", category: "Connected DB", icon: "◫" },
];

export function AppGridMarquee() {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden bg-white border-y border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      {/* Section Header */}
      <div className="max-w-3xl mx-auto px-4 mb-10 text-center relative z-10 flex flex-col items-center">
        {/* Eyebrow Pill Badge matching Hero */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono font-medium text-neutral-800">
            Universal Application Support
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-2.5">
          Works instantly anywhere you can place a cursor
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto font-normal">
          No browser plugins, no custom integrations, and zero clipboard overwrites.
          Murmur simulates native OS keyboard events directly into the frontmost window.
        </p>
      </div>

      {/* Marquee Container with Masked Fade Edges */}
      <div className="relative w-full overflow-hidden space-y-3.5">
        {/* Row 1: Forward (Leftwards) */}
        <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex items-center gap-3 py-1">
            {APPS_ROW_1.concat(APPS_ROW_1).map((app, index) => (
              <div
                key={`row1-${app.name}-${index}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 cursor-default group shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/80 group-hover:bg-[#141416] group-hover:border-[#141416] group-hover:text-white flex items-center justify-center font-mono font-bold text-xs text-neutral-700 transition-all duration-200 shadow-sm">
                  {app.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-900 group-hover:text-black transition-colors flex items-center gap-1.5">
                    {app.name}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {app.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Reverse (Rightwards) */}
        <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee-reverse flex items-center gap-3 py-1">
            {APPS_ROW_2.concat(APPS_ROW_2).map((app, index) => (
              <div
                key={`row2-${app.name}-${index}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 cursor-default group shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/80 group-hover:bg-[#141416] group-hover:border-[#141416] group-hover:text-white flex items-center justify-center font-mono font-bold text-xs text-neutral-700 transition-all duration-200 shadow-sm">
                  {app.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-900 group-hover:text-black transition-colors flex items-center gap-1.5">
                    {app.name}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {app.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crisp Gradient Fade Masks on Borders */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
      </div>

      {/* Trust & Native Capability Checklist Pills matching Hero */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4 text-xs font-mono text-neutral-600 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero browser plugins or extensions</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Preserves your existing clipboard history</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <Zap className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sub-180ms OS synthetic key injection</span>
        </div>
      </div>
    </section>
  );
}
