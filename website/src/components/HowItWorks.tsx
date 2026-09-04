"use client";

import { Command, Mic, Sparkles } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Press your global shortcut",
      description:
        "Tap Option+Space on macOS or Alt+Space on Windows from any focused application to trigger the minimal pill.",
      icon: Command,
      badge: "Instant Focus",
    },
    {
      number: "02",
      title: "Speak at your natural pace",
      description:
        "Speak naturally in your preferred tone. Local Whisper models decode audio streaming chunks concurrently on your GPU.",
      icon: Mic,
      badge: "GPU Streaming",
    },
    {
      number: "03",
      title: "Receive formatted text instantly",
      description:
        "Release the shortcut. Murmur clears filler sounds, structures sentences, and pastes text directly into your document.",
      icon: Sparkles,
      badge: "Instant Paste",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Three-Step Workflow
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            How Murmur works in three steps.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            No window switching or manual copying. Speak and your thoughts become structured writing.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.16] flex flex-col justify-between transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-mono font-bold text-zinc-600 group-hover:text-emerald-400 transition-colors">
                      {step.number}
                    </span>
                    <div className="p-2 rounded-xl bg-white/[0.04] text-emerald-400 border border-white/[0.08]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span className="text-emerald-400/90 font-medium">{step.badge}</span>
                  <span className="text-zinc-600">Step {step.number}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
