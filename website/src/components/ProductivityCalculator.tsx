"use client";

import { useState } from "react";

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
    <section className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Time and Value Calculator
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Calculate your personal speaking speed dividend.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Human speech flows at 160 words per minute while average typing tops out at 40 words per minute.
          </p>
        </div>

        {/* Calculator Body (B3: Nested radius) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6 pb-6 border-b border-[#313131]">
            {/* Input 1: Daily Typing Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white">
                  Daily hours spent typing
                </label>
                <span className="text-xs font-mono font-bold text-white bg-[#272727] px-2.5 py-0.5 rounded border border-[#313131]">
                  {dailyTypingHours.toFixed(1)} hrs per day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={dailyTypingHours}
                onChange={(e) => setDailyTypingHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#272727] rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1">
                <span>1 hour</span>
                <span>4 hours</span>
                <span>8 hours</span>
              </div>
            </div>

            {/* Input 2: Hourly Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white">
                  Estimated hourly value
                </label>
                <span className="text-xs font-mono font-bold text-white bg-[#272727] px-2.5 py-0.5 rounded border border-[#313131]">
                  ${hourlyRate} per hr
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                className="w-full h-2 bg-[#272727] rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1">
                <span>$20 per hr</span>
                <span>$100 per hr</span>
                <span>$250 per hr</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 rounded-lg bg-[#1f1f1f] border border-[#313131]">
              <span className="text-white/50 block text-[10px] uppercase mb-1">
                Monthly hours saved
              </span>
              <span className="text-2xl font-bold text-white block">
                {hoursSavedPerMonth.toFixed(0)} hrs
              </span>
              <span className="text-white/40 text-[10px] mt-1 block">
                {hoursSavedPerWeek.toFixed(1)} hours every week
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#1f1f1f] border border-[#313131]">
              <span className="text-white/50 block text-[10px] uppercase mb-1">
                Work days gained per year
              </span>
              <span className="text-2xl font-bold text-white block">
                +{workDaysSavedPerYear.toFixed(0)} days
              </span>
              <span className="text-white/40 text-[10px] mt-1 block">
                Reclaimed productive time
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#272727] border border-[#313131]">
              <span className="text-white/50 block text-[10px] uppercase mb-1">
                Annual value created
              </span>
              <span className="text-2xl font-bold text-white block">
                ${moneyValueSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-white/60 text-[10px] mt-1 block">
                $0 Murmur software cost
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
