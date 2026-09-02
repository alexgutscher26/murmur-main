"use client";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Press your global shortcut",
      description:
        "Tap Option Space on macOS or Alt Space on Windows from any focused application to trigger the minimal pill.",
    },
    {
      number: "02",
      title: "Speak at your natural pace",
      description:
        "Speak naturally in your preferred tone. Local Whisper models decode audio streaming chunks concurrently on your GPU.",
    },
    {
      number: "03",
      title: "Receive formatted text instantly",
      description:
        "Release the shortcut. Murmur clears filler sounds, structures sentences, and pastes text directly into your document.",
    },
  ];

  return (
    <section className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Three Step Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            How Murmur works in three steps.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            No window switching or manual copying. Speak and your thoughts become structured writing.
          </p>
        </div>

        {/* Steps Grid (B3: Nested radius) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-mono font-bold text-white/30 block mb-4">
                  {step.number}
                </span>

                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#313131] flex items-center justify-between text-xs font-mono text-white/50">
                <span>Instant paste</span>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
