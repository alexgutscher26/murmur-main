/*!
 * SOURCE OF TRUTH KEYWORDS: ModifierTap, TapDetector, TapEvent, TapOutcome,
 *   watch_modifier_tap, DOUBLE_TAP_WINDOW, TAP_MAX_HOLD, WindowsModifierTap
 * WHAT:  Watches for single/double-taps of bare modifier keys (Ctrl/Alt/Shift/Win) on Windows.
 * WHY:   Global shortcut APIs only trigger chords. A bare modifier requires a
 *        low-level keyboard hook (WH_KEYBOARD_LL) to track key transitions cleanly.
 * WHERE: Started by bootstrap when dictation binding is modifier-only.
 */

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use windows::Win32::Foundation::{HINSTANCE, LPARAM, LRESULT, WPARAM};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    VK_CONTROL, VK_LCONTROL, VK_LMENU, VK_LSHIFT, VK_LWIN, VK_MENU, VK_RCONTROL,
    VK_RMENU, VK_RSHIFT, VK_RWIN, VK_SHIFT,
};
use windows::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, PeekMessageW,
    SetWindowsHookExW, UnhookWindowsHookEx, HHOOK, KBDLLHOOKSTRUCT, MSG, PM_REMOVE,
    WH_KEYBOARD_LL, WM_KEYDOWN, WM_KEYUP, WM_SYSKEYDOWN, WM_SYSKEYUP,
};

use crate::types::KeyModifier;

const TAP_MAX_HOLD: Duration = Duration::from_millis(400);
const DOUBLE_TAP_WINDOW: Duration = Duration::from_millis(500);
pub const TAPS_REQUIRED: usize = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TapEvent {
    ModifierDown,
    ModifierUp,
    OtherModifierChanged,
    KeyPressed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TapOutcome {
    None,
    Triggered,
}

pub struct TapDetector {
    modifier_down_at: Option<Instant>,
    completed_taps: usize,
    last_tap_completed_at: Option<Instant>,
}

impl Default for TapDetector {
    fn default() -> Self {
        Self::new()
    }
}

impl TapDetector {
    pub fn new() -> Self {
        Self {
            modifier_down_at: None,
            completed_taps: 0,
            last_tap_completed_at: None,
        }
    }

    pub fn handle(&mut self, event: TapEvent, now: Instant) -> TapOutcome {
        match event {
            TapEvent::ModifierDown => {
                if self.modifier_down_at.is_none() {
                    self.modifier_down_at = Some(now);
                }
                TapOutcome::None
            }
            TapEvent::ModifierUp => {
                let Some(down_at) = self.modifier_down_at.take() else {
                    return TapOutcome::None;
                };

                if now.duration_since(down_at) > TAP_MAX_HOLD {
                    self.completed_taps = 0;
                    self.last_tap_completed_at = None;
                    return TapOutcome::None;
                }

                if let Some(last) = self.last_tap_completed_at {
                    if now.duration_since(last) > DOUBLE_TAP_WINDOW {
                        self.completed_taps = 0;
                    }
                }

                self.completed_taps += 1;
                self.last_tap_completed_at = Some(now);

                if self.completed_taps >= TAPS_REQUIRED {
                    self.completed_taps = 0;
                    self.last_tap_completed_at = None;
                    TapOutcome::Triggered
                } else {
                    TapOutcome::None
                }
            }
            TapEvent::OtherModifierChanged | TapEvent::KeyPressed => {
                self.modifier_down_at = None;
                self.completed_taps = 0;
                self.last_tap_completed_at = None;
                TapOutcome::None
            }
        }
    }
}

pub struct ModifierTap {
    running: Arc<AtomicBool>,
}

impl Drop for ModifierTap {
    fn drop(&mut self) {
        self.running.store(false, Ordering::SeqCst);
    }
}

static mut HOOK_HANDLE: Option<HHOOK> = None;
static mut DETECTOR_CALLBACK: Option<Box<dyn FnMut() + Send + 'static>> = None;
static mut CURRENT_MODIFIER: Option<KeyModifier> = None;
static mut DETECTOR_STATE: Option<TapDetector> = None;

unsafe extern "system" fn low_level_keyboard_proc(
    n_code: i32,
    w_param: WPARAM,
    l_param: LPARAM,
) -> LRESULT {
    if n_code >= 0 {
        let kbd = *(l_param.0 as *const KBDLLHOOKSTRUCT);
        let msg = w_param.0 as u32;
        let is_down = msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN;
        let is_up = msg == WM_KEYUP || msg == WM_SYSKEYUP;

        if let (Some(target), Some(detector), Some(cb)) = (
            CURRENT_MODIFIER,
            DETECTOR_STATE.as_mut(),
            DETECTOR_CALLBACK.as_mut(),
        ) {
            let event = match (target, kbd.vkCode as u16) {
                (
                    KeyModifier::Control,
                    x,
                ) if x == VK_CONTROL.0 || x == VK_LCONTROL.0 || x == VK_RCONTROL.0 => {
                    if is_down { TapEvent::ModifierDown } else if is_up { TapEvent::ModifierUp } else { TapEvent::KeyPressed }
                }
                (
                    KeyModifier::Option,
                    x,
                ) if x == VK_MENU.0 || x == VK_LMENU.0 || x == VK_RMENU.0 => {
                    if is_down { TapEvent::ModifierDown } else if is_up { TapEvent::ModifierUp } else { TapEvent::KeyPressed }
                }
                (
                    KeyModifier::Shift,
                    x,
                ) if x == VK_SHIFT.0 || x == VK_LSHIFT.0 || x == VK_RSHIFT.0 => {
                    if is_down { TapEvent::ModifierDown } else if is_up { TapEvent::ModifierUp } else { TapEvent::KeyPressed }
                }
                (
                    KeyModifier::Command,
                    x,
                ) if x == VK_LWIN.0 || x == VK_RWIN.0 => {
                    if is_down { TapEvent::ModifierDown } else if is_up { TapEvent::ModifierUp } else { TapEvent::KeyPressed }
                }
                _ => {
                    if is_down {
                        TapEvent::KeyPressed
                    } else {
                        TapEvent::KeyPressed
                    }
                }
            };

            if detector.handle(event, Instant::now()) == TapOutcome::Triggered {
                cb();
            }
        }
    }

    CallNextHookEx(None, n_code, w_param, l_param)
}

pub fn watch_modifier_tap<F>(modifier: KeyModifier, on_tap: F) -> Option<ModifierTap>
where
    F: Fn() + Send + Sync + 'static,
{
    let running = Arc::new(AtomicBool::new(true));
    let running_thread = Arc::clone(&running);

    std::thread::spawn(move || unsafe {
        DETECTOR_STATE = Some(TapDetector::new());
        CURRENT_MODIFIER = Some(modifier);
        DETECTOR_CALLBACK = Some(Box::new(on_tap));

        let hook = SetWindowsHookExW(
            WH_KEYBOARD_LL,
            Some(low_level_keyboard_proc),
            HINSTANCE(std::ptr::null_mut()),
            0,
        );

        if let Ok(h) = hook {
            HOOK_HANDLE = Some(h);
            let mut msg = MSG::default();
            while running_thread.load(Ordering::SeqCst) {
                if PeekMessageW(&mut msg, None, 0, 0, PM_REMOVE).as_bool() {
                    let _ = DispatchMessageW(&msg);
                }
                std::thread::sleep(Duration::from_millis(10));
            }
            if let Some(h) = HOOK_HANDLE.take() {
                let _ = UnhookWindowsHookEx(h);
            }
        }
    });

    Some(ModifierTap { running })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn single_tap_detector_triggers_on_modifier_up() {
        let mut detector = TapDetector::new();
        let now = Instant::now();
        assert_eq!(detector.handle(TapEvent::ModifierDown, now), TapOutcome::None);
        assert_eq!(
            detector.handle(TapEvent::ModifierUp, now + Duration::from_millis(50)),
            TapOutcome::Triggered
        );
    }
}
