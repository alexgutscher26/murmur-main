"use client";

import { useState } from "react";
import { Calculator, Clock, Calendar, DollarSign, Sparkles } from "lucide-react";

export function ProductivityCalculator() {
  const [dailyTypingHours, setDailyTypingHours] = useState<number>(3.5);
  const [hourlyRate, setHourlyRate] = useState<number>(65);

  const hoursSavedPerDay = dailyTypingHours * 0.75;
  const hoursSavedPerWeek = hoursSavedPerDay * 5;
  const hoursSavedPerMonth = hoursSavedPerWeek * 4.33;
  const hoursSavedPerYear = hoursSavedPerDay * 250;
  const workDaysSavedPerYear = hoursSavedPerYear / 8;
  const moneyValueSaved = hoursSavedPerYear * hourlyRate;

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
              Time & Value ROI Calculator
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Calculate your speaking speed dividend.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Human speech flows at ~160 words per minute while average typing tops out at ~40 words
            per minute.
          </p>
        </div>

        {/* Calculator Body */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-neutral-200/80">
            {/* Input 1: Daily Typing Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-neutral-800">
                  Daily hours spent typing:
                </label>
                <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200/80 shadow-sm">
                  {dailyTypingHours.toFixed(1)} hrs / day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={dailyTypingHours}
                onChange={(e) => setDailyTypingHours(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer accent-[#141416]"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-2">
                <span>0.5 hr (Light)</span>
                <span>4.0 hrs (Average)</span>
                <span>8.0 hrs (Heavy)</span>
              </div>
            </div>

            {/* Input 2: Hourly Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-neutral-800">
                  Estimated hourly value:
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-sm">
                  ${hourlyRate} / hr
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer accent-[#141416]"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-2">
                <span>$20 / hr</span>
                <span>$100 / hr</span>
                <span>$250 / hr</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500 text-[10px] uppercase font-bold">
                  Monthly Hours Saved
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-neutral-950 block mb-1">
                {hoursSavedPerMonth.toFixed(0)} hrs
              </span>
              <span className="text-neutral-500 text-[11px]">
                ~{hoursSavedPerWeek.toFixed(1)} hours reclaimed weekly
              </span>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500 text-[10px] uppercase font-bold">
                  Work Days Gained / Year
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-700 block mb-1">
                +{workDaysSavedPerYear.toFixed(0)} days
              </span>
              <span className="text-neutral-500 text-[11px]">Annual productivity dividend</span>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/90">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800 text-[10px] uppercase font-bold">
                  Annual Value Created
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-neutral-950 block mb-1">
                ${moneyValueSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-emerald-700 font-medium text-[11px]">
                $0.00 Murmur software cost (Free)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
