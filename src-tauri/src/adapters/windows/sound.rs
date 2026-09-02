/*!
 * SOURCE OF TRUTH KEYWORDS: play_feedback, FeedbackSound, PlaySoundW, MessageBeep,
 *   SOUND_START, SOUND_STOP, SOUND_FAILED, windows_sound
 * WHAT:  The three short audio cues that confirm a recording started, stopped,
 *        or failed on Windows.
 * WHY:   Gives immediate tactile feedback before any visual element appears.
 *        Uses Windows native system sounds via PlaySoundW with SND_ASYNC | SND_ALIAS
 *        so it is completely non-blocking, avoids modal MessageBeep delays, and
 *        respects user system sound schemes. Falls back to MessageBeep if alias fails.
 * WHERE: Called by the session actor on state transitions.
 */

use windows::core::{w, PCWSTR};
use windows::Win32::Foundation::HMODULE;
use windows::Win32::Media::Audio::{PlaySoundW, SND_ALIAS, SND_ASYNC, SND_NODEFAULT};
use windows::Win32::UI::WindowsAndMessaging::{
    MB_ICONASTERISK, MB_ICONEXCLAMATION, MB_OK,
};

#[link(name = "user32")]
extern "system" {
    fn MessageBeep(uType: u32) -> i32;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FeedbackSound {
    /// Recording has begun and the microphone is live.
    Start,
    /// Recording has ended and capture stopped.
    Stop,
    /// Something went wrong and there is nothing to paste.
    Failed,
}

/**
 * SOURCE OF TRUTH KEYWORDS: play_feedback
 * WHAT:  Plays one Windows system sound asynchronously without blocking.
 * WHY:   Fire-and-forget; uses PlaySoundW with SND_ASYNC so it never blocks
 *        the caller thread or waits modally.
 * WHERE: Session actor on state transitions.
 */
pub fn play_feedback(sound: FeedbackSound) {
    let alias: PCWSTR = match sound {
        FeedbackSound::Start => w!("SystemAsterisk"),
        FeedbackSound::Stop => w!("SystemDefault"),
        FeedbackSound::Failed => w!("SystemHand"),
    };

    let flags = SND_ASYNC | SND_ALIAS | SND_NODEFAULT;

    unsafe {
        let played = PlaySoundW(alias, HMODULE::default(), flags);
        if !played.as_bool() {
            // Fallback to MessageBeep if registry alias wasn't resolved
            let sound_type = match sound {
                FeedbackSound::Start => MB_OK,
                FeedbackSound::Stop => MB_ICONASTERISK,
                FeedbackSound::Failed => MB_ICONEXCLAMATION,
            };
            let _ = MessageBeep(sound_type.0);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn playing_a_sound_never_panics() {
        play_feedback(FeedbackSound::Start);
    }
}
