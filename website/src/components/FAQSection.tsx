"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Does any audio or personal data leave my computer?",
    answer:
      "Never. All audio capture, Voice Activity Detection, Whisper model inference, and text formatting run exclusively on your local CPU and GPU. The only network calls Murmur makes are the initial model download from official mirrors and an optional update check.",
  },
  {
    question: "How is Murmur completely free compared to paid cloud alternatives?",
    answer:
      "Cloud dictation apps pay ongoing server costs to process your audio remotely. Murmur uses your local machine hardware instead of running cloud servers, allowing the project to remain free and open source forever.",
  },
  {
    question: "How does Murmur paste text into my active application?",
    answer:
      "When you trigger the global shortcut, Murmur detects the frontmost window. When you finish speaking, Murmur injects the transcribed text into your cursor position and restores your previous clipboard content in milliseconds.",
  },
  {
    question: "Can I use toggle mode instead of holding down the hotkey?",
    answer:
      "Yes. Murmur supports both hold to talk and toggle mode where a single tap starts recording and a second tap finishes dictation. You can configure this in settings.",
  },
  {
    question: "How do I add custom jargon and teammate names?",
    answer:
      "Add names, abbreviations, and technical terms to your custom dictionary in settings. Murmur biases Whisper recognition weights toward those terms for zero spelling mistakes.",
  },
  {
    question: "Does Murmur work without an internet connection?",
    answer:
      "Yes. Once your chosen Whisper model weights are downloaded, Murmur operates completely offline in air gapped environments with no internet access required.",
  },
  {
    question: "What system permissions are required?",
    answer:
      "Murmur requires microphone access for audio recording and accessibility permissions on macOS to paste text into your active target window.",
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
    <section id="faq" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Questions and Answers
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Frequently asked questions.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Everything you need to know about Murmur performance, privacy, and architecture.
          </p>
        </div>

        {/* Accordion List (B3 & B4: Flat cards #181818, full border #313131) */}
        <div className="flex flex-col gap-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#181818] border border-[#313131] overflow-hidden"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.question}
                  </span>
                  <span className="text-xs font-mono text-white/50 px-2 py-0.5 rounded bg-[#272727]">
                    {isOpen ? "Hide" : "Show"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-[#272727] pt-3">
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
