/**
 * SOURCE OF TRUTH KEYWORDS: productHuntLaunch, phListingAssets, launchCoupon
 * WHAT: Product Hunt launch assets and submission package for Murmur.
 * SPEC: Tagline (<60 chars), Description (<260 chars), 3 screenshots, 1 demo GIF,
 *       Maker bio, first-comment talking points, 25% coupon code.
 */

export interface ProductHuntListing {
  name: string;
  tagline: string;
  description: string;
  topics: string[];
  pricingType: "Free + Paid Options" | "Free" | "Paid";
  couponCode: {
    code: string;
    discountPercent: number;
    description: string;
    targetTiers: string[];
  };
  maker: {
    name: string;
    role: string;
    bio: string;
    avatarUrl: string;
    socialLinks: {
      x: string;
      github: string;
    };
  };
  screenshots: {
    id: string;
    title: string;
    caption: string;
    dimensions: string;
    visualCallouts: string[];
  }[];
  demoGif: {
    title: string;
    dimensions: string;
    durationSeconds: number;
    storyboardSteps: string[];
  };
  firstComment: {
    greeting: string;
    storyParagraphs: string[];
    technicalHighlights: string[];
    offerAnnouncement: string;
    callToAction: string;
  };
}

export const PRODUCT_HUNT_LAUNCH: ProductHuntListing = {
  name: "Murmur",
  tagline: "Fast, private on-device voice dictation for macOS & Windows",
  description:
    "Murmur turns speech into clean, formatted text in any desktop app—running 100% locally on your GPU via whisper.cpp. No cloud audio uploads, no accounts, and sub-180ms latency. Dictate code, notes, and emails with complete privacy.",
  topics: [
    "Productivity",
    "Open Source",
    "Artificial Intelligence",
    "Developer Tools",
    "Privacy",
  ],
  pricingType: "Free + Paid Options",
  couponCode: {
    code: "HUNTER25",
    discountPercent: 25,
    description: "25% off Murmur Core Lifetime perpetual license ($49 → $36.75) and Pro Annual ($49/yr → $36.75/yr)",
    targetTiers: ["Core Lifetime", "Pro Annual"],
  },
  maker: {
    name: "Alex Gutscher & Murmur Core Contributors",
    role: "Systems Engineer & Creator of Murmur",
    bio: "Systems engineer obsessed with local-first software, latency optimization, and data sovereignty. Built Murmur to prove that local AI on modern GPUs is faster, cheaper, and fundamentally more private than cloud streaming.",
    avatarUrl: "https://murmur.app/128x128@2x.png",
    socialLinks: {
      x: "https://x.com/webprodigies",
      github: "https://github.com/webprodigies/murmur",
    },
  },
  screenshots: [
    {
      id: "screenshot-1-floating-pill",
      title: "Universal Floating Pill & Real-Time Waveform",
      caption: "Hold ⌥ Space / Alt+Space anywhere. Dictate naturally into VS Code, Notion, Slack, or Obsidian with sub-180ms text insertion.",
      dimensions: "1270x760 (16:10 aspect ratio)",
      visualCallouts: [
        "Dynamic audio waveform matching vocal cadence",
        "Visual Air-Gap indicator confirming 0 bytes network activity",
        "Sub-180ms latency timer badge",
        "Instant clean cursor injection without clipboard clobbering",
      ],
    },
    {
      id: "screenshot-2-hardware-model-selector",
      title: "Local Hardware Acceleration & Air-Gap Switch",
      caption: "Run quantized OpenAI Whisper models (Base, Small, Medium) locally via Apple Metal GPU or Windows DirectML with zero telemetry.",
      dimensions: "1270x760 (16:10 aspect ratio)",
      visualCallouts: [
        "1-click model download and permanent local storage",
        "DirectML / Apple Metal GPU device detection",
        "Physical network kill-switch closing all outbound sockets",
        "RAM usage meter showing <42MB background idle footprint",
      ],
    },
    {
      id: "screenshot-3-context-dictionary",
      title: "App-Aware Context Formatting & Custom Vocabulary",
      caption: "Automatic casing and punctuation rules for IDEs, documents, and chat apps, paired with a custom phonetic dictionary for code acronyms.",
      dimensions: "1270x760 (16:10 aspect ratio)",
      visualCallouts: [
        "Code Mode: camelCase, snake_case, and markdown backticks",
        "Custom phonetic biasing for `kubectl`, `PostgreSQL`, `serde_json`",
        "Automatic filler word purge (eradicates 'um', 'uh', 'you know')",
        "Local dictionary synchronization without cloud accounts",
      ],
    },
  ],
  demoGif: {
    title: "Air-Gap Dictation with Wi-Fi Physically Disabled",
    dimensions: "1280x720 (60fps, 14 seconds loop)",
    durationSeconds: 14,
    storyboardSteps: [
      "Step 1 (0-3s): Wi-Fi disconnected on macOS menu bar / Windows taskbar; Little Snitch / tcpdump terminal running in background showing 0 packets.",
      "Step 2 (3-8s): Hotkey held over empty GitHub issue; user dictates technical bug report with code syntax and reproduction steps.",
      "Step 3 (8-11s): Hotkey released; formatted markdown with bullet points and code block instantaneously appears in the text area.",
      "Step 4 (11-14s): Terminal packet monitor highlighted in green confirming 0.00 KB uploaded and 0 network connections opened.",
    ],
  },
  firstComment: {
    greeting: "Hey Product Hunt! 👋 I'm Alex, creator of Murmur.",
    storyParagraphs: [
      "Over the past year, voice dictation tools experienced a renaissance. Being able to speak at 160 WPM transformed how we draft pull request reviews, write Notion docs, and reply to messages. But when we looked under the hood of popular tools, we were alarmed: almost every single one streams raw microphone audio over WebSockets to remote cloud GPU clusters.",
      "For engineers handling proprietary code, lawyers with privileged briefs, and clinicians writing patient notes, that architecture is a dealbreaker. Furthermore, round-tripping audio to the cloud adds 400–1,200ms of latency, requires continuous Wi-Fi, and ends with a $15/month subscription.",
      "So we asked: Can we run modern speech recognition completely on-device, make it faster than cloud APIs, and keep it 100% free and open source?",
      "The result is **Murmur**. Built in Rust, Tauri 2, and whisper.cpp, Murmur offloads quantized Whisper models directly to Apple Silicon Metal or Windows DirectML GPUs. It achieves a tail latency of 134–168ms, uses under 45MB of idle RAM, works completely offline on an airplane, and never emits a single byte of telemetry.",
    ],
    technicalHighlights: [
      "⚡ 100% Local GPU Inference: Powered by whisper.cpp with native Metal & DirectML shaders.",
      "🔒 Zero Network Egress: Audio is processed in RAM and discarded upon text insertion. No accounts, no cloud.",
      "🎯 App-Aware Context Engine: Automatically applies code formatting in IDEs and formal prose in emails.",
      "📖 Custom Phonetic Dictionary: Bias speech recognition for proprietary APIs, jargon, and names.",
      "💻 Native Cross-Platform: Universal binaries for macOS (Apple Silicon & Intel) and Windows 10/11.",
    ],
    offerAnnouncement:
      "Murmur is 100% free forever for core daily dictation. For power users who want advanced acoustic model switching and professional custom profiles, we're offering 25% off our Core Lifetime perpetual license and Pro tier with code **HUNTER25** for the next 48 hours!",
    callToAction:
      "Download the app, disconnect your Wi-Fi, hold ⌥ Space or Alt+Space, and let us know what you think! I'll be hanging out in the comments all day to answer questions about whisper.cpp FFI, DirectML shaders, and audio buffer optimization.",
  },
};
