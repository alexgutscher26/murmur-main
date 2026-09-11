/**
 * SOURCE OF TRUTH KEYWORDS: PillConfetti, ConfettiParticle
 * WHAT:  Renders a celebratory burst of micro-confetti particles across the
 *        overlay when a dictation transcription successfully delivers.
 */

import { useEffect, useRef } from "react";
import { getAccentConfig, type AccentColorId } from "@/lib/accent";

interface PillConfettiProps {
  active: boolean;
  accentId?: string | null;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  shape: "rect" | "circle" | "star";
}

export function PillConfetti({ active, accentId, onComplete }: PillConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth ?? 300);
    const height = (canvas.height = canvas.parentElement?.clientHeight ?? 60);

    const accent = getAccentConfig(accentId as AccentColorId);
    const palette = [
      ...accent.particleColors,
      "#38bdf8",
      "#f43f5e",
      "#fbbf24",
      "#a855f7",
      "#34d399",
    ];

    const particleCount = 38;
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const angle = (Math.random() * Math.PI) / 1.2 - Math.PI / 2.4;
      const speed = 2.5 + Math.random() * 4.5;
      const shapes: Particle["shape"][] = ["rect", "circle", "star"];
      return {
        x: width / 2 + (Math.random() * 40 - 20),
        y: height / 2 + (Math.random() * 10 - 5),
        vx: Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.abs(Math.cos(angle) * speed) - 1.2,
        size: 2.5 + Math.random() * 3.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    });

    let animId: number;
    let frame = 0;
    const maxFrames = 75;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // star/sparkle
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.3, -p.size * 0.3);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.3, p.size * 0.3);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.3, p.size * 0.3);
          ctx.lineTo(-p.size, 0);
          ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (frame < maxFrames) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onComplete?.();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active, accentId, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-50 h-full w-full overflow-visible"
    />
  );
}
