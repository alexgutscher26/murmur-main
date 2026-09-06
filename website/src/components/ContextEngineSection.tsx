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
    <section
      id="context"
      className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Smart Context Engine
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            One voice input. Formatted for every app.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Murmur senses the frontmost active window and shapes tone, punctuation, and layout to
            fit the medium.
          </p>
        </div>

        {/* Comparison Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Universal Raw Voice Input Bar */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block mb-1">
                Raw Spoken Speech (Single Take)
              </span>
              <p className="text-xs sm:text-sm font-mono text-neutral-800">
                &ldquo;{rawSpokenVoice}&rdquo;
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-600 self-start sm:self-auto bg-white px-3 py-1 rounded-full border border-neutral-200/80 shadow-sm">
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
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-[#141416] text-white font-semibold border-[#141416] shadow-md scale-[1.01]"
                      : "bg-white text-neutral-600 border-neutral-200/80 hover:text-neutral-950 hover:bg-neutral-50 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-emerald-600"}`}
                    />
                    <span className="text-xs font-bold block">{app.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono block ${isSelected ? "text-neutral-400" : "text-neutral-500"}`}
                  >
                    {app.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Box */}
          <div className="rounded-2xl bg-neutral-50/70 border border-neutral-200/90 overflow-hidden shadow-sm">
            <div className="bg-neutral-100/80 px-5 py-3 border-b border-neutral-200/80 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono text-neutral-800 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Formatted Output for {selectedApp.name}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                {selectedApp.outputDescription}
              </span>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm text-neutral-900 bg-white whitespace-pre-wrap leading-relaxed min-h-[160px]">
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
