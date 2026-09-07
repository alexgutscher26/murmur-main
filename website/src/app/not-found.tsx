import Link from "next/link";
import { Mark } from "@/components/Mark";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background glow & subtle texture */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-32 w-[700px] h-[600px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <div className="p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-md mb-6">
        <Mark size="lg" animated={false} />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-600 mb-4 font-semibold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Error 404
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
        Page not found
      </h1>

      <p className="text-neutral-600 text-sm max-w-sm mb-8 leading-relaxed font-normal">
        The requested page does not exist or has been moved. Return to the Murmur homepage to
        download the app or explore features.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#141416] hover:bg-neutral-800 px-6 py-3 rounded-xl transition-all shadow-md"
      >
        <ArrowLeft className="size-4" />
        <span>Return to homepage</span>
      </Link>
    </main>
  );
}
