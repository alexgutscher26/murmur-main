/**
 * SOURCE OF TRUTH KEYWORDS: marketingClips, airplane_mode_demo, socialProofCampaign
 * WHAT:  Outcome-driven demonstration clip packages and copy for marketing channels:
 *        X (Twitter), LinkedIn, Reddit, and Product Hunt.
 * THEME: "Dictating a full GitHub issue in Airplane Mode with 0 bytes sent."
 * WHY:   Developers and privacy-conscious operators distrust marketing slogans.
 *        Showing Wi-Fi disconnected + Wireshark / packet monitor showing 0 packets +
 *        a full structured GitHub issue created via voice is undeniable proof.
 */

export interface MarketingClipCampaign {
  id: string;
  title: string;
  durationSeconds: number;
  hook: string;
  storyboard: {
    timestamp: string;
    action: string;
    screenDisplay: string;
    audioVoiceover: string;
  }[];
  platforms: {
    x: {
      postText: string;
      mediaAlt: string;
      hashtags: string[];
    };
    linkedin: {
      headline: string;
      postText: string;
      discussionQuestion: string;
    };
    reddit: {
      subreddits: string[];
      postTitle: string;
      postBody: string;
    };
    productHunt: {
      tagline: string;
      makerCommentSnippet: string;
      highlightBullets: string[];
    };
  };
}

export const AIRPLANE_MODE_GITHUB_DEMO: MarketingClipCampaign = {
  id: "airplane-mode-github-issue",
  title: "Dictating a full GitHub issue in Airplane Mode with 0 bytes sent",
  durationSeconds: 38,
  hook: "Cloud voice AI tools require your data to leave your machine. Watch HushWrite dictate a formatted, multi-section GitHub issue with Wi-Fi turned off.",
  storyboard: [
    {
      timestamp: "0:00 - 0:06",
      action: "Turn off Wi-Fi on MacBook / Windows taskbar and enable in-app Air-Gap Mode.",
      screenDisplay:
        "Desktop screen with Wi-Fi disconnected icon and HushWrite Air-Gap badge glowing green.",
      audioVoiceover: "Turning off Wi-Fi completely. Air-Gap Mode is active in HushWrite.",
    },
    {
      timestamp: "0:07 - 0:14",
      action:
        "Open terminal with active packet monitor (`sudo tcpdump -i en0` or Windows `pktmon`).",
      screenDisplay:
        "Terminal window shows packet count: 0 packets captured. Inactive network interface.",
      audioVoiceover:
        "Terminal packet monitor is running in real-time. Zero network packets traversing any interface.",
    },
    {
      timestamp: "0:15 - 0:28",
      action:
        "Focus empty GitHub issue textarea in browser. Hold Option+Space and dictate the issue seamlessly.",
      screenDisplay:
        "HushWrite pill appears with audio waveform. Text flows into GitHub issue markdown editor with sub-180ms latency.",
      audioVoiceover:
        "Issue title: Memory profile in air-gap mode. Steps to reproduce: disconnect Wi-Fi, dictate five paragraphs. Expected: 0 bytes egress.",
    },
    {
      timestamp: "0:29 - 0:34",
      action: "Release hotkey. HushWrite auto-formats headers, bold labels, and bullet lists.",
      screenDisplay: "Formatted GitHub issue appears with markdown checkmarks and code blocks.",
      audioVoiceover: "Release. The text is formatted into clean markdown instantly.",
    },
    {
      timestamp: "0:35 - 0:38",
      action: "Inspect packet monitor terminal and show: Total Packets Sent: 0 (0.00 KB).",
      screenDisplay: "Zoom in on Packet Monitor: 0 bytes outbound. 100% on-device Whisper decode.",
      audioVoiceover: "Packet monitor confirms: zero bytes sent. 100% on-device speech AI.",
    },
  ],
  platforms: {
    x: {
      postText: `Dictating a full GitHub issue in Airplane Mode with 0 bytes sent. ✈️

Most "AI dictation" tools stream your voice and proprietary codebase context to remote cloud servers.

HushWrite runs OpenAI Whisper open weights locally on your GPU via whisper.cpp.

• 0 bytes uploaded to any cloud
• Sub-180ms tail latency
• No subscriptions. 100% free & open-source MIT

Watch the network packet monitor stay at absolute zero while dictating: 👇`,
      mediaAlt:
        "Video screen capture showing a developer turning off Wi-Fi, dictating a structured GitHub issue with voice, and verifying zero network egress via terminal packet monitor.",
      hashtags: ["#buildinpublic", "#privacy", "#opensource", "#whisper", "#developerTools"],
    },
    linkedin: {
      headline: "Why engineering organizations are banning cloud voice dictation tools",
      postText: `Cloud voice-to-text tools like Wispr Flow and cloud scribes are great for general consumers—until an engineer inadvertently dictates proprietary source code, auth headers, or NDA-protected architecture discussions into a remote server.

We built HushWrite to solve this once and for all:

1. 100% Local Inference: Audio is decoded directly on your Apple Silicon Neural Engine or Windows DirectX GPU using whisper.cpp.
2. Hard Kill-Switch: Our in-app Air-Gap Mode disables all outbound sockets in the binary.
3. Universal Integration: Types directly into your focused cursor across VS Code, Cursor, GitHub, Notion, and Terminal.

Here is a 38-second unedited screen recording demonstrating a complete GitHub bug issue dictated in Airplane Mode with a live packet monitor showing 0.00 KB transmitted.

Code is available on GitHub (MIT licensed): https://github.com/alexgutscher26/HushWrite`,
      discussionQuestion:
        "Does your engineering team permit cloud-based voice dictation on corporate workstations?",
    },
    reddit: {
      subreddits: ["r/programming", "r/privacy", "r/selfhosted", "r/LocalLLaMA"],
      postTitle:
        "I built HushWrite: 100% offline, on-device Whisper voice dictation for macOS & Windows with 0 bytes sent (free, open source)",
      postBody: `Hey everyone,

Like many developers, I love the speed of voice dictation for writing PR descriptions, commit messages, and documentation (speaking at ~150 wpm beats typing at ~75 wpm). But I hated that existing solutions:
1. Stream microphone audio to cloud GPU clusters
2. Charge recurring $15/month subscriptions
3. Introduce compliance risks when dealing with proprietary code or customer data

I built HushWrite, a local-first desktop application for macOS and Windows.

### The Architecture:
- Core Engine: Runs OpenAI Whisper models locally via whisper.cpp with Metal (macOS) and DirectML (Windows) hardware acceleration.
- Latency: Sub-180ms tail latency (faster than a cloud round-trip).
- Air-Gap / Hardware Isolation Mode: Closes all sockets and disables any network calls in the binary.
- OS Injection: Inserts text directly into your cursor using native accessibility APIs and SendInput.
- Smart Rules: Auto-capitalizes, strips filler words ("um", "uh"), and handles code casing (camelCase, snake_case, PascalCase).

### How to Audit:
You don't have to take my word for it. Turn off your Wi-Fi, open Wireshark or macOS LuLu, and dictate. You will see 0 outbound packets.

GitHub repo: https://github.com/alexgutscher26/HushWrite
Website: https://HushWrite.app`,
    },
    productHunt: {
      tagline: "Private, instant voice dictation powered 100% on your local GPU",
      makerCommentSnippet: `Hey Product Hunt! 👋

We built HushWrite because we believe voice productivity shouldn't require surrendering your privacy. 

While cloud alternatives stream your voice, sensitive notes, and code snippets across third-party servers, HushWrite runs open-weights Whisper models directly on your computer's GPU.

Key Highlights:
✨ 100% On-Device Whisper Inference (Metal & DirectML acceleration)
🛡️ In-App Air-Gap Mode with zero network egress
⚡ Sub-180ms latency — faster than cloud audio upload latency alone
🎯 App-Aware Context — custom rules for VS Code, Slack, GitHub, and Docs
💸 Free & Open Source forever under the MIT license

Try dictating in Airplane Mode and let us know what you think!`,
      highlightBullets: [
        "Zero cloud upload — 100% local speech recognition",
        "Air-gap mode kill-switch verified via network packet monitors",
        "Works everywhere — native cursor injection across all desktop apps",
        "Free and open-source under MIT license",
      ],
    },
  },
};

export const X_LINKEDIN_THREAD_DEMO: MarketingClipCampaign = {
  id: "x-linkedin-voice-dictation-demo",
  title: "Dictating a 5-Part X Thread and LinkedIn Thought Leadership Post in 45 Seconds",
  durationSeconds: 42,
  hook: "Typing social posts kills your flow. Watch how HushWrite lets you dictate full viral threads and LinkedIn frameworks with spoken macros and 0 bytes uploaded.",
  storyboard: [
    {
      timestamp: "0:00 - 0:08",
      action: "Focus empty Typefully / X composer. Hold Alt+Space / Option+Space.",
      screenDisplay: "Clean X editor with HushWrite floating pill active.",
      audioVoiceover: "Watch me dictate a 5-part technical X thread in under 30 seconds with voice macros.",
    },
    {
      timestamp: "0:09 - 0:22",
      action: "Speak 'x thread template' followed by bullet takeaways and 'tweet break' delimiters.",
      screenDisplay: "Pill waveform ripples; thread tweets auto-populate with numbered headers and clean spacing.",
      audioVoiceover: "x thread template on why local whisper runs 3x faster than cloud dictation... tweet break... key lesson one: DirectML bypasses network overhead.",
    },
    {
      timestamp: "0:23 - 0:32",
      action: "Switch window to LinkedIn draft editor. Hold Alt+Space and speak 'linkedin post template'.",
      screenDisplay: "LinkedIn composer formats instantly into a hook, bullet insights, and engagement callout.",
      audioVoiceover: "Now over to LinkedIn: linkedin post template on shipping open source tools without cloud telemetry.",
    },
    {
      timestamp: "0:33 - 0:42",
      action: "Show task manager / packet monitor showing 0.00 KB network egress and <120ms latency.",
      screenDisplay: "Local DirectML GPU inference stats and 0 bytes transmitted badge.",
      audioVoiceover: "Zero cloud servers touched. Complete privacy for unreleased startup strategy. 100% free and open source.",
    },
  ],
  platforms: {
    x: {
      postText: `Stop typing social posts for 45 minutes every morning.

I just dictated this entire 5-part breakdown in 28 seconds using HushWrite + voice macros.

• "x thread template" -> auto-formats numbered 1/ 🧵 structure
• "tweet break" -> inserts thread separators on the fly
• 100% on-device Whisper (0 bytes sent to any cloud)

Full demo & open-source code: 👇`,
      mediaAlt:
        "Video demonstrating voice dictation of a structured X thread and LinkedIn post using local Whisper AI.",
      hashtags: ["#buildinpublic", "#indiehackers", "#productivity", "#voiceAI"],
    },
    linkedin: {
      headline: "How dictating social content out loud solved our team's creative burnout",
      postText: `Typing out thought leadership posts and technical insights is exhausting. When you type, your inner editor constantly interrupts your flow.

When you speak out loud, you communicate at 160 words per minute—the exact conversational rhythm that performs best on LinkedIn.

We added dedicated LinkedIn and X macros to HushWrite:
• "linkedin post template" creates a hook, insight bullets, and question framework
• "linkedin carousel template" structures slide-by-slide PDF decks
• "tweet break" and "x thread template" format multi-tweet threads effortlessly

And because HushWrite runs 100% locally via whisper.cpp, confidential client learnings and unreleased product metrics never leave your computer.

Open source on GitHub: https://github.com/alexgutscher26/HushWrite`,
      discussionQuestion:
        "Do you find your thoughts flow more naturally speaking out loud vs typing into a blank document?",
    },
    reddit: {
      subreddits: ["r/content_marketing", "r/buildinpublic", "r/productivity"],
      postTitle:
        "I added spoken macros for X threads and LinkedIn posts to our offline voice app",
      postBody: `Hey all,

Writing daily social updates and technical threads is one of the most tedious parts of building in public. We found ourselves spending 30-40 minutes drafting what could have been spoken in 90 seconds.

We just updated HushWrite (our open-source local voice dictation tool) with built-in voice macros for LinkedIn and X:
1. "x thread template": Automatically generates a 5-part thread structure.
2. "tweet break": Inserts thread breaks while speaking so you don't have to pause and click 'Add Tweet'.
3. "linkedin post template": Formats the classic hook + white-space paragraph + bullet takeaways framework.
4. "mention user" (@) and "hashtag" (#) commands.

Everything runs on your local GPU via whisper.cpp (no cloud subscriptions, no data collection).

GitHub: https://github.com/alexgutscher26/HushWrite`,
    },
    productHunt: {
      tagline: "Voice-to-content engine for creators, founders & social builders",
      makerCommentSnippet: "Creators and founders: you don't have a typing shortage; you have an editing bottleneck. HushWrite's new LinkedIn & X thread macros turn your natural speech into structured, high-performing social posts with zero cloud latency.",
      highlightBullets: [
        "Built-in X thread delimiters ('tweet break') for single-breath thread dictation",
        "LinkedIn thought leadership & carousel slide templates",
        "100% local GPU execution with zero cloud uploads",
        "Free and open-source under MIT license",
      ],
    },
  },
};

