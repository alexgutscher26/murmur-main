/**
 * SOURCE OF TRUTH KEYWORDS: ShortcutsModal, keyboard-shortcuts, reference-panel, keycaps
 * WHAT:  The keyboard shortcuts and voice commands reference modal in Murmur.
 * WHY:   Displays global hotkeys, app navigation shortcuts, and spoken formatting commands
 *        with styled keycaps using design system tokens.
 * WHERE: Triggered from the dashboard header, settings view, or pressing '?' on keyboard.
 */

import { useEffect } from "react";
import { X, Keyboard, Mic, Sparkles } from "lucide-react";

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    keys?: string[];
    spoken?: string;
    description: string;
  }[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Global System Hotkeys",
    icon: <Keyboard className="size-4 text-text-primary" />,
    items: [
      {
        label: "Dictate Anywhere",
        keys: ["Option / Alt", "Space"],
        description: "Hold to push-to-talk, or tap to start/stop hands-free dictation.",
      },
      {
        label: "Double-Tap Fast Dictation",
        keys: ["Alt+Space", "× 2 (<300ms)"],
        description: "Double-tap shortcut rapidly for instant high-priority dictation.",
      },
      {
        label: "Toggle Dashboard Window",
        keys: ["Option / Alt", "Shift", "Space"],
        description: "Open, focus, or minimize the Murmur dashboard window.",
      },
      {
        label: "Instant Cancel & Clear",
        keys: ["Option / Alt", "Escape"],
        description: "Abort recording immediately, clear preview, and restore clipboard.",
      },
      {
        label: "Cancel Dictation",
        keys: ["Escape"],
        description: "Cancel audio capture or abort the countdown preview.",
      },
    ],
  },
  {
    title: "Dashboard Navigation",
    icon: <Sparkles className="size-4 text-text-primary" />,
    items: [
      {
        label: "Stats Tab",
        keys: ["⌘ / Ctrl", "1"],
        description: "View dictation analytics, WPM speedup, and latency breakdown.",
      },
      {
        label: "History Tab",
        keys: ["⌘ / Ctrl", "2"],
        description: "Browse, copy, and search past audio transcriptions.",
      },
      {
        label: "Settings Tab",
        keys: ["⌘ / Ctrl", "3"],
        description: "Configure models, hotkeys, profiles, and custom dictionary.",
      },
      {
        label: "Billing / Plans",
        keys: ["⌘ / Ctrl", "4"],
        description: "Manage subscription, trial status, and Pro license keys.",
      },
      {
        label: "Open Shortcuts Help",
        keys: ["?"],
        description: "Toggle this shortcut cheatsheet from anywhere in Murmur.",
      },
    ],
  },
  {
    title: "Spoken Formatting & Editing Commands",
    icon: <Mic className="size-4 text-text-primary" />,
    items: [
      {
        label: "New Line / Paragraph",
        spoken: '"new line" / "new paragraph"',
        description: "Inserts a line break or blank paragraph separator.",
      },
      {
        label: "Delete Last Sentence",
        spoken: '"scratch that" / "delete line"',
        description: "Removes the preceding phrase or dictated block.",
      },
      {
        label: "Bullet Point List",
        spoken: '"bullet point" / "dash"',
        description: "Starts a clean markdown bullet list item.",
      },
      {
        label: "Punctuation Marks",
        spoken: '"comma", "period", "question mark"',
        description: "Explicitly forces exact punctuation marks.",
      },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="hairline rounded-card bg-elevated shadow-card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="hairline border-b border-[var(--border-hairline)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="size-5 text-text-primary" />
            <h3 className="text-body font-bold text-text-primary">
              Keyboard Shortcuts & Voice Commands
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="hairline rounded-input p-1.5 text-text-tertiary transition-colors hover:bg-sunken hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {SHORTCUT_CATEGORIES.map((category, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2 text-label font-semibold text-text-secondary uppercase tracking-wider">
                {category.icon}
                <span>{category.title}</span>
              </div>

              <div className="hairline rounded-card bg-surface divide-y divide-[var(--border-hairline)]">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-caption font-semibold text-text-primary">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {item.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {item.keys?.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="hairline rounded-input bg-sunken px-2 py-1 font-mono text-[11px] font-semibold text-text-primary shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                      {item.spoken && (
                        <span className="hairline rounded-input bg-sunken px-2 py-1 font-mono text-[11px] text-text-primary">
                          {item.spoken}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="hairline border-t border-[var(--border-hairline)] px-5 py-3 bg-surface flex items-center justify-between text-caption text-text-secondary">
          <span>Press <kbd className="font-mono font-bold">Esc</kbd> or click outside to dismiss</span>
          <button
            type="button"
            onClick={onClose}
            className="hairline rounded-input bg-sunken px-3 py-1 text-caption font-medium text-text-primary hover:bg-sunken-strong"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
