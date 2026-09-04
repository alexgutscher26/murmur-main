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
    <section className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Time & Value ROI Calculator
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Calculate your speaking speed dividend.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Human speech flows at ~160 words per minute while average typing tops out at ~40 words per minute.
          </p>
        </div>

        {/* Calculator Body */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/[0.08]">
            {/* Input 1: Daily Typing Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-zinc-200">
                  Daily hours spent typing:
                </label>
                <span className="text-xs font-mono font-bold text-white bg-white/[0.06] px-3 py-1 rounded-lg border border-white/[0.08]">
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
                className="w-full h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2">
                <span>0.5 hr (Light)</span>
                <span>4.0 hrs (Average)</span>
                <span>8.0 hrs (Heavy)</span>
              </div>
            </div>

            {/* Input 2: Hourly Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-zinc-200">
                  Estimated hourly value:
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
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
                className="w-full h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2">
                <span>$20 / hr</span>
                <span>$100 / hr</span>
                <span>$250 / hr</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-500 text-[10px] uppercase font-bold">
                  Monthly Hours Saved
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white block mb-1">
                {hoursSavedPerMonth.toFixed(0)} hrs
              </span>
              <span className="text-zinc-500 text-[11px]">
                ~{hoursSavedPerWeek.toFixed(1)} hours reclaimed weekly
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-500 text-[10px] uppercase font-bold">
                  Work Days Gained / Year
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 block mb-1">
                +{workDaysSavedPerYear.toFixed(0)} days
              </span>
              <span className="text-zinc-500 text-[11px]">
                Annual productivity dividend
              </span>
            </div>

            <div className="p-5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[10px] uppercase font-bold">
                  Annual Value Created
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white block mb-1">
                ${moneyValueSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-emerald-400/80 text-[11px]">
                $0.00 Murmur software cost (Free)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
