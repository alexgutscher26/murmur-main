"use client";

import { motion } from "framer-motion";

interface MarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

export function Mark({ size = "md", animated = false, className = "" }: MarkProps) {
  const sizeClasses = {
    sm: "h-4 gap-0.5",
    md: "h-6 gap-1",
    lg: "h-8 gap-1.5",
    xl: "h-12 gap-2",
  };

  const barWidths = {
    sm: "w-[2px]",
    md: "w-[3px]",
    lg: "w-[4px]",
    xl: "w-[6px]",
  };

  const bars = [
    { height: "25%", delay: 0.1 },
    { height: "60%", delay: 0.2 },
    { height: "100%", delay: 0 },
    { height: "60%", delay: 0.2 },
    { height: "25%", delay: 0.1 },
  ];

  return (
    <div className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          className={`${barWidths[size]} rounded-full bg-gradient-to-t from-cyan-400 via-indigo-400 to-violet-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]`}
          style={{ height: bar.height }}
          animate={
            animated
              ? {
                  height: ["20%", "95%", "35%", "100%", "20%"],
                }
              : undefined
          }
          transition={
            animated
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: bar.delay,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
