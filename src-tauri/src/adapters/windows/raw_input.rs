/*!
 * SOURCE OF TRUTH KEYWORDS: raw_input, MouseRawInputHandle, MouseTriggerButton,
 *   start_mouse_raw_input, evaluate_button_flags, HID_USAGE_PAGE_GENERIC,
 *   HID_USAGE_GENERIC_MOUSE
 * WHAT:  Raw Input hook for mouse push-to-talk buttons (button 4/5/middle) on Windows.
 * WHY:   Global shortcut APIs and mouse hooks can fail or add latency when fullscreen
 *        games or applications capture mouse input. Registering a raw input device
 *        with RIDEV_INPUTSINK on a hidden HWND receives WM_INPUT messages regardless
 *        of foreground focus or exclusive capture.
 * WHERE: Consumed by bootstrap/hotkeys.rs on Windows.
 */

use std::sync::atomic::{AtomicU8, Ordering};
use std::sync::Arc;
use std::time::Duration;

use tauri_plugin_global_shortcut::ShortcutState;
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::System::LibraryLoader::GetModuleHandleW;
use windows::Win32::UI::Input::{
    GetRawInputData, RegisterRawInputDevices, HRAWINPUT, RAWINPUT, RAWINPUTDEVICE,
    RAWINPUTHEADER, RIDEV_INPUTSINK, RID_INPUT, RIM_TYPEMOUSE,
};
use windows::Win32::UI::WindowsAndMessaging::{
    CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, GetMessageW,
    PostMessageW, PostQuitMessage, RegisterClassW, TranslateMessage, UnregisterClassW,
    MSG, WINDOW_EX_STYLE, WNDCLASSW, WS_OVERLAPPED, WM_CLOSE, WM_DESTROY, WM_INPUT,
    RI_MOUSE_BUTTON_4_DOWN, RI_MOUSE_BUTTON_4_UP,
    RI_MOUSE_BUTTON_5_DOWN, RI_MOUSE_BUTTON_5_UP,
    RI_MOUSE_MIDDLE_BUTTON_DOWN, RI_MOUSE_MIDDLE_BUTTON_UP,
};

pub const HID_USAGE_PAGE_GENERIC: u16 = 0x01;
pub const HID_USAGE_GENERIC_MOUSE: u16 = 0x02;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum MouseTriggerButton {
    None = 0,
    Middle = 1,
    Button4 = 2,
    Button5 = 3,
}

impl MouseTriggerButton {
    pub fn from_str(val: &str) -> Self {
        match val {
            "mouse_middle" => Self::Middle,
            "mouse_back" => Self::Button4,
            "mouse_forward" => Self::Button5,
            _ => Self::None,
        }
    }

    pub fn to_u8(self) -> u8 {
        self as u8
    }

    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => Self::Middle,
            2 => Self::Button4,
            3 => Self::Button5,
            _ => Self::None,
        }
    }
}

pub fn evaluate_button_flags(
    trigger: MouseTriggerButton,
    button_flags: u16,
) -> Option<ShortcutState> {
    let (down_flag, up_flag) = match trigger {
        MouseTriggerButton::Middle => (
            RI_MOUSE_MIDDLE_BUTTON_DOWN as u16,
            RI_MOUSE_MIDDLE_BUTTON_UP as u16,
        ),
        MouseTriggerButton::Button4 => (
            RI_MOUSE_BUTTON_4_DOWN as u16,
            RI_MOUSE_BUTTON_4_UP as u16,
        ),
        MouseTriggerButton::Button5 => (
            RI_MOUSE_BUTTON_5_DOWN as u16,
            RI_MOUSE_BUTTON_5_UP as u16,
        ),
        MouseTriggerButton::None => return None,
    };

    if (button_flags & down_flag) != 0 {
        Some(ShortcutState::Pressed)
    } else if (button_flags & up_flag) != 0 {
        Some(ShortcutState::Released)
    } else {
        None
    }
}

static TRIGGER: AtomicU8 = AtomicU8::new(0);
static CALLBACK: parking_lot::Mutex<Option<Box<dyn Fn(ShortcutState) + Send + Sync + 'static>>> =
    parking_lot::Mutex::new(None);

pub struct MouseRawInputHandle {
    hwnd: HWND,
    trigger: Arc<AtomicU8>,
}

unsafe impl Send for MouseRawInputHandle {}
unsafe impl Sync for MouseRawInputHandle {}

impl MouseRawInputHandle {
    pub fn set_trigger(&self, button: MouseTriggerButton) {
        self.trigger.store(button.to_u8(), Ordering::SeqCst);
        TRIGGER.store(button.to_u8(), Ordering::SeqCst);
    }
}

impl Drop for MouseRawInputHandle {
    fn drop(&mut self) {
        TRIGGER.store(0, Ordering::SeqCst);
        *CALLBACK.lock() = None;

        unsafe {
            if !self.hwnd.0.is_null() {
                let _ = PostMessageW(self.hwnd, WM_CLOSE, WPARAM(0), LPARAM(0));
            }
        }
    }
}

unsafe extern "system" fn raw_input_wndproc(
    hwnd: HWND,
    msg: u32,
    w_param: WPARAM,
    l_param: LPARAM,
) -> LRESULT {
    match msg {
        WM_INPUT => {
            let trigger_code = TRIGGER.load(Ordering::Relaxed);
            if trigger_code != 0 {
                let trigger = MouseTriggerButton::from_u8(trigger_code);
                let hrawinput = HRAWINPUT(l_param.0 as *mut _);
                let mut data: RAWINPUT = std::mem::zeroed();
                let mut size = std::mem::size_of::<RAWINPUT>() as u32;
                let header_size = std::mem::size_of::<RAWINPUTHEADER>() as u32;

                let status = GetRawInputData(
                    hrawinput,
                    RID_INPUT,
                    Some(&mut data as *mut _ as *mut _),
                    &mut size,
                    header_size,
                );

                if status != u32::MAX && status != 0 {
                    if data.header.dwType == RIM_TYPEMOUSE.0 {
                        let button_flags = data.data.mouse.Anonymous.Anonymous.usButtonFlags;
                        if let Some(state) = evaluate_button_flags(trigger, button_flags) {
                            if let Some(ref cb) = *CALLBACK.lock() {
                                cb(state);
                            }
                        }
                    }
                }
            }
            DefWindowProcW(hwnd, msg, w_param, l_param)
        }
        WM_CLOSE => {
            let _ = DestroyWindow(hwnd);
            LRESULT(0)
        }
        WM_DESTROY => {
            PostQuitMessage(0);
            LRESULT(0)
        }
        _ => DefWindowProcW(hwnd, msg, w_param, l_param),
    }
}

pub fn start_mouse_raw_input<F>(
    initial_trigger: MouseTriggerButton,
    on_event: F,
) -> Option<MouseRawInputHandle>
where
    F: Fn(ShortcutState) + Send + Sync + 'static,
{
    TRIGGER.store(initial_trigger.to_u8(), Ordering::SeqCst);
    *CALLBACK.lock() = Some(Box::new(on_event));

    let trigger_arc = Arc::new(AtomicU8::new(initial_trigger.to_u8()));
    let (tx, rx) = std::sync::mpsc::sync_channel::<isize>(1);

    std::thread::Builder::new()
        .name("murmur-raw-mouse-input".to_string())
        .spawn(move || unsafe {
            let hinstance = match GetModuleHandleW(None) {
                Ok(h) => h,
                Err(err) => {
                    tracing::error!(error = %err, "could not get module handle for raw input window");
                    let _ = tx.send(0);
                    return;
                }
            };

            let class_name = windows::core::w!("MurmurRawInputHiddenWindow");
            let wc = WNDCLASSW {
                lpfnWndProc: Some(raw_input_wndproc),
                hInstance: hinstance.into(),
                lpszClassName: class_name,
                ..Default::default()
            };

            // RegisterClassW may fail if already registered in current process; ignore error and proceed
            let _ = RegisterClassW(&wc);

            let hwnd = match CreateWindowExW(
                WINDOW_EX_STYLE(0),
                class_name,
                windows::core::w!("MurmurRawInputHidden"),
                WS_OVERLAPPED,
                0,
                0,
                0,
                0,
                None,
                None,
                hinstance,
                None,
            ) {
                Ok(h) => h,
                Err(err) => {
                    tracing::error!(error = %err, "failed to create hidden window for raw input");
                    let _ = tx.send(0);
                    return;
                }
            };

            let device = RAWINPUTDEVICE {
                usUsagePage: HID_USAGE_PAGE_GENERIC,
                usUsage: HID_USAGE_GENERIC_MOUSE,
                dwFlags: RIDEV_INPUTSINK,
                hwndTarget: hwnd,
            };

            if let Err(err) =
                RegisterRawInputDevices(&[device], std::mem::size_of::<RAWINPUTDEVICE>() as u32)
            {
                tracing::error!(error = %err, "failed to register raw input devices for mouse");
                let _ = DestroyWindow(hwnd);
                let _ = tx.send(0);
                return;
            }

            tracing::info!("raw input mouse hook registered with RIDEV_INPUTSINK");
            if tx.send(hwnd.0 as isize).is_err() {
                let _ = DestroyWindow(hwnd);
                return;
            }

            let mut msg = MSG::default();
            while GetMessageW(&mut msg, None, 0, 0).as_bool() {
                let _ = TranslateMessage(&msg);
                let _ = DispatchMessageW(&msg);
            }

            let _ = UnregisterClassW(class_name, hinstance);
            tracing::info!("raw input mouse thread finished cleanly");
        })
        .ok()?;

    let hwnd_raw = rx.recv_timeout(Duration::from_secs(3)).ok()?;
    if hwnd_raw == 0 {
        return None;
    }
    let hwnd = HWND(hwnd_raw as *mut _);

    Some(MouseRawInputHandle {
        hwnd,
        trigger: trigger_arc,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_mouse_trigger_buttons() {
        assert_eq!(MouseTriggerButton::from_str("none"), MouseTriggerButton::None);
        assert_eq!(
            MouseTriggerButton::from_str("mouse_middle"),
            MouseTriggerButton::Middle
        );
        assert_eq!(
            MouseTriggerButton::from_str("mouse_back"),
            MouseTriggerButton::Button4
        );
        assert_eq!(
            MouseTriggerButton::from_str("mouse_forward"),
            MouseTriggerButton::Button5
        );
        assert_eq!(
            MouseTriggerButton::from_str("unknown"),
            MouseTriggerButton::None
        );
    }

    #[test]
    fn evaluate_button_4_transitions() {
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Button4,
                RI_MOUSE_BUTTON_4_DOWN as u16
            ),
            Some(ShortcutState::Pressed)
        );
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Button4,
                RI_MOUSE_BUTTON_4_UP as u16
            ),
            Some(ShortcutState::Released)
        );
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Button4,
                RI_MOUSE_BUTTON_5_DOWN as u16
            ),
            None
        );
    }

    #[test]
    fn evaluate_button_5_transitions() {
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Button5,
                RI_MOUSE_BUTTON_5_DOWN as u16
            ),
            Some(ShortcutState::Pressed)
        );
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Button5,
                RI_MOUSE_BUTTON_5_UP as u16
            ),
            Some(ShortcutState::Released)
        );
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Button5,
                RI_MOUSE_BUTTON_4_DOWN as u16
            ),
            None
        );
    }

    #[test]
    fn evaluate_middle_button_transitions() {
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Middle,
                RI_MOUSE_MIDDLE_BUTTON_DOWN as u16
            ),
            Some(ShortcutState::Pressed)
        );
        assert_eq!(
            evaluate_button_flags(
                MouseTriggerButton::Middle,
                RI_MOUSE_MIDDLE_BUTTON_UP as u16
            ),
            Some(ShortcutState::Released)
        );
    }

    #[test]
    fn none_trigger_always_returns_none() {
        assert_eq!(
            evaluate_button_flags(MouseTriggerButton::None, RI_MOUSE_BUTTON_4_DOWN as u16),
            None
        );
    }
}
