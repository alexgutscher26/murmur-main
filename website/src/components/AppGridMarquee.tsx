"use client";

interface AppItem {
  name: string;
  category: string;
}

const APPS_LIST: AppItem[] = [
  { name: "Cursor", category: "AI Code Editor" },
  { name: "VS Code", category: "Development" },
  { name: "Slack", category: "Team Chat" },
  { name: "Notion", category: "Docs and Notes" },
  { name: "Linear", category: "Issue Tracking" },
  { name: "ChatGPT", category: "AI Assistant" },
  { name: "Obsidian", category: "Knowledge Base" },
  { name: "Raycast", category: "Productivity" },
  { name: "Apple Mail", category: "Email" },
  { name: "Discord", category: "Community" },
  { name: "Claude", category: "AI Chat" },
  { name: "Figma", category: "Design" },
  { name: "Arc", category: "Browser" },
  { name: "Apple Notes", category: "Notes" },
  { name: "WhatsApp", category: "Messaging" },
  { name: "Xcode", category: "iOS Development" },
];

export function AppGridMarquee() {
  return (
    <section className="py-14 relative overflow-hidden border-y border-[#313131] bg-[#181818]">
      <div className="max-w-4xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs uppercase tracking-widest font-mono font-semibold text-white/50">
          Universal Compatibility
        </p>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Pastes directly into every application you use daily
        </h2>
      </div>

      {/* Marquee Row */}
      <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex items-center gap-3 py-1">
          {APPS_LIST.concat(APPS_LIST).map((app, index) => (
            <div
              key={`${app.name}-${index}`}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#1f1f1f] border border-[#313131] hover:border-white/40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-default group"
            >
              <div className="w-6 h-6 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center font-bold text-xs text-white">
                {app.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white">
                  {app.name}
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  {app.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
