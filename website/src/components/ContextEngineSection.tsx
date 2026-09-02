"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContextApp {
  id: string;
  name: string;
  category: string;
  outputDescription: string;
  formattedOutput: string;
}

const CONTEXT_APPS: ContextApp[] = [
  {
    id: "slack",
    name: "Slack and Discord",
    category: "Team Chat",
    outputDescription: "Casual structure with bullet points and mentions",
    formattedOutput: `Hey Mark. Just merged the auth token rotation fix to main.

• Token invalidation grace period is set to 15 mins
• Unit and integration tests are all green

Could you give staging a quick sanity check? Thanks.`,
  },
  {
    id: "cursor",
    name: "Cursor and VS Code",
    category: "Code and Commits",
    outputDescription: "CamelCase syntax and conventional commit message",
    formattedOutput: `/**
 * Fixes auth token rotation by invalidating stale refresh tokens
 * and enforcing strict rotation grace periods.
 */
git commit -m "fix(auth): enforce refresh token rotation and revoke stale sessions"`,
  },
  {
    id: "notion",
    name: "Notion and Linear",
    category: "Product Management",
    outputDescription: "Markdown checklists, subheaders, and assignees",
    formattedOutput: `### Release Checklist: Auth Token Rotation

• [x] Merge PR 412 (Token rotation service)
• [ ] Mark to verify staging deployment behavior
• [ ] Run regression suite for legacy OAuth clients`,
  },
  {
    id: "gmail",
    name: "Mail and Docs",
    category: "Professional Writing",
    outputDescription: "Polite salutation, clear paragraphs, and signoff",
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
    <section id="context" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Smart Context Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            One voice input. Formatted for every app.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Murmur senses the frontmost active window and shapes tone, punctuation, and layout to fit the medium.
          </p>
        </div>

        {/* Comparison Box (B3: Nested radius) */}
        <div className="p-5 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131]">
          {/* Universal Raw Voice Input Bar */}
          <div className="p-4 rounded-lg bg-[#1f1f1f] border border-[#313131] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/50 font-semibold block mb-0.5">
                Exact spoken words
              </span>
              <p className="text-xs sm:text-sm font-mono text-white/90">
                &quot;{rawSpokenVoice}&quot;
              </p>
            </div>
            <span className="text-xs font-mono text-white/50 self-start sm:self-auto bg-[#272727] px-2.5 py-1 rounded-full border border-[#313131]">
              Whisper detected: EN
            </span>
          </div>

          {/* App Switcher Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {CONTEXT_APPS.map((app) => {
              const isSelected = selectedApp.id === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3 rounded-lg border text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isSelected
                      ? "bg-white text-black font-semibold border-white"
                      : "bg-[#1f1f1f] text-white/70 border-[#313131] hover:text-white hover:bg-[#272727]"
                  }`}
                >
                  <span className="text-xs font-bold block">{app.name}</span>
                  <span className={`text-[10px] font-mono block ${isSelected ? "text-black/70" : "text-white/50"}`}>
                    {app.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Box */}
          <div className="rounded-lg bg-[#131209] border border-[#313131] overflow-hidden">
            <div className="bg-[#1f1f1f] px-4 py-2.5 border-b border-[#313131] flex items-center justify-between">
              <span className="text-xs font-mono text-white/80 font-semibold">
                Formatted output for {selectedApp.name}
              </span>
              <span className="text-[11px] font-mono text-white/50">
                {selectedApp.outputDescription}
              </span>
            </div>

            <div className="p-5 font-mono text-xs sm:text-sm text-white/90 whitespace-pre-wrap leading-relaxed min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
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
