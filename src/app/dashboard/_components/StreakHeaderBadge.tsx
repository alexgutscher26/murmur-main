/**
 * SOURCE OF TRUTH KEYWORDS: StreakHeaderBadge, streak_milestones, habit_streak
 * WHAT:  Displays the daily habit streak counter and milestone badges in the dashboard header.
 * WHY:   A low-pressure retention nudge celebrating consistency. A day qualifies with either
 *        at least 3 successful sessions or 100 words dictated. Milestones awarded at 7, 30, 90, 365 days.
 * WHERE: Mounted in Dashboard.tsx top window bar header.
 */

import { useState, useRef, useEffect } from "react";
import { Flame, Zap, Trophy, Gem, CheckCircle2 } from "lucide-react";
import { commands, events } from "@/lib/bindings";
import { useCommand } from "@/lib/ipc";
import { useTauriEvent } from "@/lib/use-event";
import { cn } from "@/lib/utils";

interface Milestone {
  days: number;
  label: string;
  badge: string;
  icon: typeof Flame;
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    days: 7,
    label: "Week Sprint",
    badge: "7d+",
    icon: Zap,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    days: 30,
    label: "Monthly Builder",
    badge: "30d+",
    icon: Flame,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  },
  {
    days: 90,
    label: "Quarterly Pro",
    badge: "90d+",
    icon: Gem,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  {
    days: 365,
    label: "Annual Master",
    badge: "365d+",
    icon: Trophy,
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  },
];

interface StreakHeaderBadgeProps {
  className?: string;
}

export function StreakHeaderBadge({ className }: StreakHeaderBadgeProps = {}) {
  const stats = useCommand(commands.getStats, []);
  useTauriEvent(events.transcriptDelivered, () => stats.reload());

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const streakDays = stats.data?.current_streak_days ?? 0;
  const todaySessions = stats.data?.today_sessions ?? 0;
  const todayWords = stats.data?.today_words ?? 0;

  // Qualification: 3+ sessions OR 100+ words
  const sessionsGoalMet = todaySessions >= 3;
  const wordsGoalMet = todayWords >= 100;
  const isGoalMetToday = sessionsGoalMet || wordsGoalMet;

  // Highest unlocked milestone
  const currentMilestone = [...MILESTONES].reverse().find((m) => streakDays >= m.days);
  const nextMilestone = MILESTONES.find((m) => streakDays < m.days);

  // Session progress percentage (capped at 100%)
  const sessionsPct = Math.min(100, Math.round((todaySessions / 3) * 100));
  const wordsPct = Math.min(100, Math.round((todayWords / 100) * 100));
  const overallProgress = isGoalMetToday ? 100 : Math.max(sessionsPct, wordsPct);

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center", className)}>
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Habit streak tracker & milestones"
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-full px-2.5 text-caption font-medium transition-all select-none",
          streakDays > 0
            ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25 border border-amber-500/20"
            : "bg-stone-200/50 text-stone-600 hover:bg-stone-200/80 dark:bg-stone-800/40 dark:text-stone-400 dark:hover:bg-stone-800/70 border border-stone-300/40 dark:border-stone-700/40",
        )}
      >
        <Flame
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            streakDays > 0
              ? "text-amber-500 dark:text-amber-400 fill-amber-500/30 animate-pulse"
              : "text-stone-400 dark:text-stone-500",
          )}
        />
        <span className="tabular-nums font-semibold tracking-tight">{streakDays}d</span>

        {currentMilestone && (
          <span
            className={cn(
              "ml-0.5 inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-bold tracking-tight border",
              currentMilestone.color,
            )}
          >
            {currentMilestone.badge}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Habit streak details"
          className="absolute left-0 top-full mt-2 w-72 z-50 rounded-xl border border-stone-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Top header in popover */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  streakDays > 0
                    ? "bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
                    : "bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500",
                )}
              >
                <Flame className="h-4 w-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                    {streakDays} Day{streakDays === 1 ? "" : "s"}
                  </span>
                  {currentMilestone && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[9px] font-bold border",
                        currentMilestone.color,
                      )}
                    >
                      {currentMilestone.label}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {streakDays > 0 ? "Daily dictation habit" : "Start your streak today"}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Goal Progress */}
          <div className="mt-3 rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/50">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-700 dark:text-stone-300">Today's Goal</span>
              {isGoalMetToday ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Secured
                </span>
              ) : (
                <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                  {overallProgress}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isGoalMetToday ? "bg-emerald-500" : "bg-amber-500",
                )}
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span
                className={cn(
                  sessionsGoalMet && "font-medium text-emerald-600 dark:text-emerald-400",
                )}
              >
                {todaySessions} / 3 sessions
              </span>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <span
                className={cn(wordsGoalMet && "font-medium text-emerald-600 dark:text-emerald-400")}
              >
                {todayWords} / 100 words
              </span>
            </div>

            <p className="mt-1.5 text-[10px] text-stone-400 dark:text-stone-500 leading-snug">
              Achieve 3 sessions or 100 words daily to keep building your streak.
            </p>
          </div>

          {/* Milestone timeline */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              <span>Milestones</span>
              {nextMilestone && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  {nextMilestone.days - streakDays}d to {nextMilestone.label}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {MILESTONES.map((m) => {
                const isUnlocked = streakDays >= m.days;
                const Icon = m.icon;
                return (
                  <div
                    key={m.days}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg py-1.5 border transition-all text-center",
                      isUnlocked
                        ? cn(m.color, "shadow-xs")
                        : "border-dashed border-stone-200 bg-stone-50/50 text-stone-400 dark:border-stone-800 dark:bg-stone-800/20 dark:text-stone-600",
                    )}
                  >
                    <Icon className="h-3 w-3 mb-0.5" />
                    <span className="text-[10px] font-bold leading-tight">{m.badge}</span>
                    <span className="text-[9px] leading-tight opacity-75 truncate max-w-[56px]">
                      {m.days}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { StreakHeaderBadge as StreakBadge };
