"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Does any audio or personal data leave my computer?",
    answer:
      "Never. All audio capture, Voice Activity Detection (VAD), Whisper model inference, and text formatting run exclusively on your local CPU and GPU. The only network calls Murmur makes are the initial model weight download from official Hugging Face mirrors and an optional update check.",
  },
  {
    question: "How is Murmur completely free compared to paid cloud alternatives?",
    answer:
      "Cloud dictation apps pay ongoing GPU cluster server costs to process your audio remotely. Murmur uses your local machine's neural engine and GPU instead of renting cloud servers, allowing the project to remain free and open source forever.",
  },
  {
    question: "How does Murmur paste text into my active application?",
    answer:
      "When you trigger the global shortcut, Murmur detects the frontmost window. When you finish speaking, Murmur injects the transcribed text directly at your active cursor position and restores your previous clipboard state in milliseconds.",
  },
  {
    question: "Can I use toggle mode instead of holding down the hotkey?",
    answer:
      "Yes. Murmur supports both hold-to-talk and toggle mode where a single tap starts recording and a second tap finishes dictation. You can configure this in Settings.",
  },
  {
    question: "How do I add custom jargon and teammate names?",
    answer:
      "Add names, abbreviations, and technical terms to your custom dictionary in Settings. Murmur biases Whisper recognition weights toward those terms for zero spelling mistakes.",
  },
  {
    question: "Does Murmur work without an internet connection?",
    answer:
      "Yes. Once your chosen Whisper model weights are downloaded, Murmur operates completely offline in air-gapped environments with no internet access required.",
  },
  {
    question: "What system permissions are required?",
    answer:
      "Murmur requires microphone access for audio recording and accessibility permissions on macOS (or UI Automation on Windows) to paste text into your active target window.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Murmur supports all 99 languages included in OpenAI Whisper models, with automatic language identification enabled by default.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Questions & Answers
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Frequently asked questions.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Everything you need to know about Murmur performance, privacy, and local architecture.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 overflow-hidden transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm sm:text-base font-bold text-neutral-950">
                    {faq.question}
                  </span>
                  <span className={`p-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-600 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-neutral-950 bg-neutral-200/70" : ""}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
