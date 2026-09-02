import Link from "next/link";
import { Mark } from "@/components/Mark";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="p-3 rounded-2xl bg-[#181818] border border-[#313131] mb-6">
        <Mark size="lg" animated={false} />
      </div>

      <span className="text-xs font-mono text-white/50 uppercase tracking-widest block mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
        Page not found
      </h1>

      <p className="text-white/70 text-sm max-w-sm mb-8 leading-relaxed">
        The requested page does not exist or has been moved. Return to the Murmur homepage to download the app.
      </p>

      <Link
        href="/"
        className="text-sm font-semibold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-full transition-colors"
      >
        Return to homepage
      </Link>
    </main>
  );
}
