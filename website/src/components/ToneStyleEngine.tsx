"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Sparkles } from "lucide-react";

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
      concise: "• Auth token fix merged to main\n• Unit & integration tests: Green\n• Action item: Staging sanity test",
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
      concise: "• Attached: Draft agreement\n• Status: Awaiting client review & sign-off",
      developer: "docs(agreement): shared v1 draft for review & signoff",
    },
  },
];

const TONE_OPTIONS: { id: string; label: string }[] = [
  { id: "formal", label: "Formal Executive" },
  { id: "casual", label: "Natural Casual" },
  { id: "very_casual", label: "Quick Chat" },
  { id: "concise", label: "Bullet Concise" },
  { id: "developer", label: "Developer & Git" },
];

export function ToneStyleEngine() {
  const [activeTone, setActiveTone] = useState<string>("casual");
  const [selectedExample, setSelectedExample] = useState<ExamplePrompt>(EXAMPLES[0]);

  return (
    <section id="tone-style" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Adaptive Writing Styles
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Make Murmur sound like you.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Murmur adapts to how you write in different apps. Set a different style for messages, work chats, emails, and code editors—computed 100% locally on your machine.
          </p>
        </div>

        {/* Interactive Tone Playground Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          {/* Example Voice Selector */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              Select Sample Voice:
            </span>
            <div className="flex gap-1.5 bg-black/50 p-1 rounded-xl border border-white/[0.08]">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExample(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedExample.id === ex.id
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {ex.category}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Speech Bar */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 font-bold">
              Raw Spoken Voice Input
            </span>
            <p className="text-xs sm:text-sm font-mono text-zinc-200">
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shrink-0 ${
                    isSelected
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] font-bold scale-[1.02]"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {tone.label}
                </button>
              );
            })}
          </div>

          {/* Formatted Output Canvas */}
          <div className="p-6 rounded-xl bg-[#060608] border border-white/[0.08] min-h-[140px] flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Formatted as {TONE_OPTIONS.find((t) => t.id === activeTone)?.label}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">100% On-Device Rewrite</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`${selectedExample.id}-${activeTone}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm sm:text-base text-zinc-100 font-sans leading-relaxed whitespace-pre-line"
                >
                  {selectedExample.tones[activeTone]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500 flex-wrap gap-2">
              <span>Automatically applied when target application focused</span>
              <span className="text-emerald-400 font-medium">0ms Network round-trip</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
