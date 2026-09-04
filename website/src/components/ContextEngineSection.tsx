"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Terminal, MessageSquare, FileText, Mail, Check } from "lucide-react";

interface ContextApp {
  id: string;
  name: string;
  category: string;
  icon: typeof MessageSquare;
  outputDescription: string;
  formattedOutput: string;
}

const CONTEXT_APPS: ContextApp[] = [
  {
    id: "slack",
    name: "Slack & Discord",
    category: "Team Chat",
    icon: MessageSquare,
    outputDescription: "Casual structure with bullet points and mentions",
    formattedOutput: `Hey Mark. Just merged the auth token rotation fix to main.

• Token invalidation grace period is set to 15 mins
• Unit & integration tests are all green

Could you give staging a quick sanity check? Thanks!`,
  },
  {
    id: "cursor",
    name: "Cursor & VS Code",
    category: "Code & Commits",
    icon: Terminal,
    outputDescription: "CamelCase syntax and conventional commit message",
    formattedOutput: `/**
 * Fixes auth token rotation by invalidating stale refresh tokens
 * and enforcing strict rotation grace periods.
 */
git commit -m "fix(auth): enforce refresh token rotation and revoke stale sessions"`,
  },
  {
    id: "notion",
    name: "Notion & Linear",
    category: "Product Management",
    icon: FileText,
    outputDescription: "Markdown checklists, subheaders, and assignees",
    formattedOutput: `### Release Checklist: Auth Token Rotation

• [x] Merge PR 412 (Token rotation service)
• [ ] Mark to verify staging deployment behavior
• [ ] Run regression suite for legacy OAuth clients`,
  },
  {
    id: "gmail",
    name: "Mail & Docs",
    category: "Professional Writing",
    icon: Mail,
    outputDescription: "Polite salutation, clear paragraphs, and sign-off",
    formattedOutput: `Hi Mark,

I wanted to provide a quick update regarding the auth token rotation fix. The changes have been successfully merged into our main branch.

Whenever you have a moment today, could you please verify the staging environment to ensure everything behaves as expected?

Thanks for your help,
Alex`,
  },
];

export function ContextEngineSection() {
  const [selectedApp, setSelectedApp] = useState<ContextApp>(CONTEXT_APPS[0]);

  const rawSpokenVoice =
    "hey mark we just merged the auth token rotation fix to main let me know if staging looks good thanks";

  return (
    <section id="context" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Smart Context Engine
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            One voice input. Formatted for every app.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Murmur senses the frontmost active window and shapes tone, punctuation, and layout to fit the medium.
          </p>
        </div>

        {/* Comparison Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          {/* Universal Raw Voice Input Bar */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Raw Spoken Speech (Single Take)
              </span>
              <p className="text-xs sm:text-sm font-mono text-zinc-200">
                &ldquo;{rawSpokenVoice}&rdquo;
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 self-start sm:self-auto bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
              Whisper detected: EN
            </span>
          </div>

          {/* App Switcher Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {CONTEXT_APPS.map((app) => {
              const isSelected = selectedApp.id === app.id;
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-300 ${
                    isSelected
                      ? "bg-white text-black font-semibold border-white shadow-lg scale-[1.01]"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-emerald-400"}`} />
                    <span className="text-xs font-bold block">{app.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono block ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}>
                    {app.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Box */}
          <div className="rounded-xl bg-[#060608] border border-white/[0.08] overflow-hidden shadow-inner">
            <div className="bg-white/[0.03] px-5 py-3 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono text-zinc-200 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Formatted Output for {selectedApp.name}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {selectedApp.outputDescription}
              </span>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed min-h-[160px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {selectedApp.formattedOutput}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
