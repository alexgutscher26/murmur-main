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
    <section className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
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
              Three-Step Workflow
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            How Murmur works in three steps.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            No window switching or manual copying. Speak and your thoughts become structured
            writing.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-mono font-bold text-neutral-300 group-hover:text-neutral-950 transition-colors">
                      {step.number}
                    </span>
                    <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-800 border border-neutral-200/80 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200/80 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-neutral-950 mb-2">{step.title}</h3>
                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-neutral-200/80 flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    {step.badge}
                  </span>
                  <span className="text-neutral-400">Step {step.number}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
