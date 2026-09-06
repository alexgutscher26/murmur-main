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
  hook: "Cloud voice AI tools require your data to leave your machine. Watch Murmur dictate a formatted, multi-section GitHub issue with Wi-Fi turned off.",
  storyboard: [
    {
      timestamp: "0:00 - 0:06",
      action: "Turn off Wi-Fi on MacBook / Windows taskbar and enable in-app Air-Gap Mode.",
      screenDisplay:
        "Desktop screen with Wi-Fi disconnected icon and Murmur Air-Gap badge glowing green.",
      audioVoiceover: "Turning off Wi-Fi completely. Air-Gap Mode is active in Murmur.",
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
        "Murmur pill appears with audio waveform. Text flows into GitHub issue markdown editor with sub-180ms latency.",
      audioVoiceover:
        "Issue title: Memory profile in air-gap mode. Steps to reproduce: disconnect Wi-Fi, dictate five paragraphs. Expected: 0 bytes egress.",
    },
    {
      timestamp: "0:29 - 0:34",
      action: "Release hotkey. Murmur auto-formats headers, bold labels, and bullet lists.",
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

Murmur runs OpenAI Whisper open weights locally on your GPU via whisper.cpp.

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

We built Murmur to solve this once and for all:

1. 100% Local Inference: Audio is decoded directly on your Apple Silicon Neural Engine or Windows DirectX GPU using whisper.cpp.
2. Hard Kill-Switch: Our in-app Air-Gap Mode disables all outbound sockets in the binary.
3. Universal Integration: Types directly into your focused cursor across VS Code, Cursor, GitHub, Notion, and Terminal.

Here is a 38-second unedited screen recording demonstrating a complete GitHub bug issue dictated in Airplane Mode with a live packet monitor showing 0.00 KB transmitted.

Code is available on GitHub (MIT licensed): https://github.com/alexgutscher26/murmur`,
      discussionQuestion:
        "Does your engineering team permit cloud-based voice dictation on corporate workstations?",
    },
    reddit: {
      subreddits: ["r/programming", "r/privacy", "r/selfhosted", "r/LocalLLaMA"],
      postTitle:
        "I built Murmur: 100% offline, on-device Whisper voice dictation for macOS & Windows with 0 bytes sent (free, open source)",
      postBody: `Hey everyone,

Like many developers, I love the speed of voice dictation for writing PR descriptions, commit messages, and documentation (speaking at ~150 wpm beats typing at ~75 wpm). But I hated that existing solutions:
1. Stream microphone audio to cloud GPU clusters
2. Charge recurring $15/month subscriptions
3. Introduce compliance risks when dealing with proprietary code or customer data

I built Murmur, a local-first desktop application for macOS and Windows.

### The Architecture:
- Core Engine: Runs OpenAI Whisper models locally via whisper.cpp with Metal (macOS) and DirectML (Windows) hardware acceleration.
- Latency: Sub-180ms tail latency (faster than a cloud round-trip).
- Air-Gap / Hardware Isolation Mode: Closes all sockets and disables any network calls in the binary.
- OS Injection: Inserts text directly into your cursor using native accessibility APIs and SendInput.
- Smart Rules: Auto-capitalizes, strips filler words ("um", "uh"), and handles code casing (camelCase, snake_case, PascalCase).

### How to Audit:
You don't have to take my word for it. Turn off your Wi-Fi, open Wireshark or macOS LuLu, and dictate. You will see 0 outbound packets.

GitHub repo: https://github.com/alexgutscher26/murmur
Website: https://murmur.app`,
    },
    productHunt: {
      tagline: "Private, instant voice dictation powered 100% on your local GPU",
      makerCommentSnippet: `Hey Product Hunt! 👋

We built Murmur because we believe voice productivity shouldn't require surrendering your privacy. 

While cloud alternatives stream your voice, sensitive notes, and code snippets across third-party servers, Murmur runs open-weights Whisper models directly on your computer's GPU.

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
