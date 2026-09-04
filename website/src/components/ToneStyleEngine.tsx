"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TonePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  output: string;
  targetApps: string;
}

interface ExamplePrompt {
  id: string;
  rawSpoken: string;
  category: string;
  tones: Record<string, string>;
}

const EXAMPLES: ExamplePrompt[] = [
  {
    id: "lunch-invite",
    category: "Casual Message",
    rawSpoken: "hey are you free for lunch tomorrow let's do 12 if that works for you",
    tones: {
      formal: "Good afternoon. Are you available for lunch tomorrow? 12:00 PM would work well if your schedule permits.",
      casual: "Hey, are you free for lunch tomorrow? Let’s do 12 if that works for you.",
      very_casual: "hey free for lunch tmrw? 12 works if you’re down 👍",
      concise: "• Lunch tomorrow at 12:00 PM — let me know if that works.",
      developer: "lunch tomorrow @ 12:00? lmk",
    },
  },
  {
    id: "status-update",
    category: "Project Status",
    rawSpoken: "we just merged the auth token fix to main tests are passing please test staging when you can",
    tones: {
      formal: "I am writing to confirm that the authentication token patch has been merged into the main branch. All automated tests have passed. Please review the staging environment at your earliest convenience.",
      casual: "We just merged the auth token fix to main and all tests are passing. Please check staging whenever you get a chance!",
      very_casual: "auth token fix is on main, tests green. test staging when u can 🚀",
      concise: "• Auth token fix merged to main\n• Unit/integration tests: Passed\n• Action item: Staging sanity test",
      developer: 'git commit -m "fix(auth): resolve token refresh rotation and verify staging build"',
    },
  },
  {
    id: "meeting-followup",
    category: "Client Follow-up",
    rawSpoken: "thanks for your time today sending over the draft agreement let me know if you need any changes",
    tones: {
      formal: "Thank you for your time during our discussion today. I have attached the draft agreement for your review. Please let me know if any amendments are required.",
      casual: "Thanks for your time today! Sending over the draft agreement now—let me know if you'd like any changes.",
      very_casual: "great chatting today! sent the draft agreement over, let me know if anything needs a tweak",
      concise: "• Attached: Draft agreement\n• Status: Awaiting client review & amendments",
      developer: "docs(agreement): shared v1 draft for review & signoff",
    },
  },
];

const TONE_OPTIONS: { id: string; label: string }[] = [
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
  { id: "very_casual", label: "Very casual" },
  { id: "concise", label: "Concise" },
  { id: "developer", label: "Developer" },
];

export function ToneStyleEngine() {
  const [activeTone, setActiveTone] = useState<string>("casual");
  const [selectedExample, setSelectedExample] = useState<ExamplePrompt>(EXAMPLES[0]);

  return (
    <section id="tone-style" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-white/80">Adaptive Writing Styles</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-serif">
            Make Murmur sound like you
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            Murmur adapts to how you write in different apps. Set a different style for messages, work chats, emails, and code editors—computed 100% locally on your machine.
          </p>
        </div>

        {/* Interactive Tone Playground Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#2b2b2b] shadow-2xl">
          {/* Example Voice Selector */}
          <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Select Spoken Input Example:
            </span>
            <div className="flex gap-1.5 bg-[#101010] p-1 rounded-xl border border-[#262626]">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExample(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedExample.id === ex.id
                      ? "bg-white text-black font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {ex.category}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Speech Bar */}
          <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-[#303030] mb-6">
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
              Spoken words (Raw Audio In)
            </span>
            <p className="text-sm font-mono text-white/90 italic">
              &ldquo;{selectedExample.rawSpoken}&rdquo;
            </p>
          </div>

          {/* Tone Pill Switcher */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
            {TONE_OPTIONS.map((tone) => {
              const isSelected = activeTone === tone.id;
              return (
                <button
                  key={tone.id}
                  onClick={() => setActiveTone(tone.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    isSelected
                      ? "bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.15)] scale-[1.02]"
                      : "bg-[#222222] text-white/70 hover:text-white hover:bg-[#2a2a2a] border border-[#333]"
                  }`}
                >
                  {tone.label}
                </button>
              );
            })}
          </div>

          {/* Formatted Output Canvas */}
          <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-emerald-500/30 min-h-[130px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Formatted for {TONE_OPTIONS.find((t) => t.id === activeTone)?.label} Style
                </span>
                <span className="text-[11px] font-mono text-white/40">100% On-Device Transform</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`${selectedExample.id}-${activeTone}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm sm:text-base text-white/95 font-sans leading-relaxed whitespace-pre-line"
                >
                  {selectedExample.tones[activeTone]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>Auto-applied when app focus changes</span>
              <span className="text-emerald-400/80">0ms Network round-trip</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
