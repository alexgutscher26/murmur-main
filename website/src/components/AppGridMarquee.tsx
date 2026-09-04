"use client";

interface AppItem {
  name: string;
  category: string;
}

const APPS_LIST: AppItem[] = [
  { name: "Cursor", category: "AI Code Editor" },
  { name: "VS Code", category: "Development" },
  { name: "Slack", category: "Team Chat" },
  { name: "Notion", category: "Docs & Notes" },
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
  { name: "Chrome", category: "Browser" },
  { name: "Terminal", category: "Development" },
  { name: "iTerm2", category: "Terminal" },
  { name: "GitHub Desktop", category: "Version Control" },
  { name: "Zoom", category: "Video Calls" },
  { name: "Google Docs", category: "Docs & Notes" },
  { name: "Google Sheets", category: "Spreadsheets" },
  { name: "Excel", category: "Spreadsheets" },
  { name: "Gmail", category: "Email" },
  { name: "Outlook", category: "Email" },
  { name: "Sketch", category: "Design" },
  { name: "Adobe Photoshop", category: "Design" },
  { name: "Illustrator", category: "Design" },
  { name: "Postman", category: "API Testing" },
  { name: "Docker Desktop", category: "DevOps" },
  { name: "Warp", category: "Terminal" },
  { name: "Telegram", category: "Messaging" },
  { name: "Messages", category: "Messaging" },
  { name: "Spotify", category: "Music" },
  { name: "Jira", category: "Issue Tracking" },
  { name: "Confluence", category: "Docs & Notes" },
  { name: "Asana", category: "Project Management" },
  { name: "Trello", category: "Project Management" },
  { name: "Airtable", category: "Database" },
  { name: "IntelliJ IDEA", category: "Development" },
  { name: "PyCharm", category: "Python Development" },
  { name: "Sublime Text", category: "Text Editor" },
  { name: "Vim", category: "Text Editor" },
  { name: "Finder", category: "File Management" },
  { name: "Safari", category: "Browser" },
  { name: "Calendar", category: "Scheduling" },
  { name: "Zapier", category: "Automation" },
];

export function AppGridMarquee() {
  return (
    <section className="py-12 relative overflow-hidden border-y border-white/[0.06] bg-black/40 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 mb-6 text-center">
        <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-emerald-400 block mb-1">
          Universal Application Support
        </span>
        <h2 className="text-sm sm:text-base font-semibold text-zinc-300">
          Works instantly anywhere you can place a cursor
        </h2>
      </div>

      {/* Marquee Row */}
      <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex items-center gap-3 py-1">
          {APPS_LIST.concat(APPS_LIST).map((app, index) => (
            <div
              key={`${app.name}-${index}`}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 cursor-default group shrink-0"
            >
              <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/[0.08] group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                {app.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {app.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
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
