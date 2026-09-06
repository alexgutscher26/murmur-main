import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://murmur.app"),
  title: "Murmur · Private On-Device AI Voice Dictation | macOS & Windows",
  description:
    "Dictate anywhere. Nothing leaves your device. Fast, polished voice dictation for macOS and Windows that never sends your voice or transcripts off your computer.",
  keywords: [
    "Murmur",
    "private speech to text",
    "on device voice dictation",
    "whisper ai offline",
    "local speech recognition",
    "air gapped dictation",
    "Tauri 2",
    "Rust",
  ],
  authors: [{ name: "Murmur Contributors" }],
  openGraph: {
    title: "Murmur · Speak naturally. Write anywhere. Keep it private.",
    description:
      "Turn your voice into polished text in any app—processed locally on your PC or Mac. No uploaded audio. No cloud transcript history.",
    url: "https://murmur.app",
    siteName: "Murmur",
    images: [
      {
        url: "/128x128@2x.png",
        width: 256,
        height: 256,
        alt: "Murmur Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Murmur · Dictate anywhere. Nothing leaves your device.",
    description:
      "Fast, polished on-device AI voice dictation. 100% private by architecture. Free forever & open source.",
    images: ["/128x128@2x.png"],
  },
  icons: {
    icon: "/32x32.png",
    apple: "/128x128@2x.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-[#000000] font-sans text-white antialiased selection:bg-white/20 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1f1f1f] focus:text-white focus:rounded-lg focus:border focus:border-white/20"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
