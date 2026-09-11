/*!
 * SOURCE OF TRUTH KEYWORDS: HardwareProfile, HardwareDetector, RecommendedQuantization,
 *   auto_select_quantization, LlmTaskKind
 * WHAT:  Hardware-aware quantization and LLM model tier selection.
 * WHY:   CPU-bound laptops have tight memory bandwidth and strict latency constraints.
 *        Auto-selecting Q4_K_M quantization for CPU and Q5_K_M/Q6_K on dedicated GPUs
 *        guarantees sub-second latency without user manual tuning or OOM crashes.
 * WHERE: adapters/llm/hardware.rs; queried by LlmTextEnhancer and IPC settings commands.
 */

use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum QuantizationTier {
    Q4KM,
    Q5KM,
    Q6K,
}

impl QuantizationTier {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Q4KM => "Q4_K_M",
            Self::Q5KM => "Q5_K_M",
            Self::Q6K => "Q6_K",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum LlmTaskKind {
    /// Fast filler removal, punctuation enhancement, multilingual formatting
    SmartCleanup,
    /// Conversational tone rewriting and complex document synthesis
    VoiceTransform,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct HardwareProfile {
    pub cpu_cores: u32,
    pub has_dedicated_gpu: bool,
    pub gpu_name: Option<String>,
    pub recommended_quantization: QuantizationTier,
    pub is_battery_or_laptop: bool,
    pub recommended_cleanup_model: String,
    pub recommended_transform_model: String,
}

pub struct HardwareDetector;

impl HardwareDetector {
    /// Inspect the local machine's CPU threads and GPU capabilities to build a profile.
    pub fn detect() -> HardwareProfile {
        let cpu_cores = std::thread::available_parallelism()
            .map(|p| p.get() as u32)
            .unwrap_or(4);

        let (has_dedicated_gpu, gpu_name) = Self::detect_gpu();
        let is_laptop = Self::detect_mobile_or_laptop(cpu_cores);

        // Auto-select quantization tier:
        // CPU-bound laptops & systems without dedicated GPU -> Q4_K_M
        // GPU or high-core desktop workstation -> Q5_K_M for cleanup, Q6_K for Phi-3.5
        let recommended_quantization = if has_dedicated_gpu && !is_laptop {
            QuantizationTier::Q5KM
        } else {
            QuantizationTier::Q4KM
        };

        let recommended_cleanup_model = if recommended_quantization == QuantizationTier::Q5KM {
            "qwen2.5-1.5b-instruct-q5_k_m".to_string()
        } else {
            "qwen2.5-1.5b-instruct-q4_k_m".to_string()
        };

        let recommended_transform_model = if has_dedicated_gpu && !is_laptop {
            "phi-3.5-mini-instruct-q6_k".to_string()
        } else {
            "phi-3.5-mini-instruct-q4_k_m".to_string()
        };

        HardwareProfile {
            cpu_cores,
            has_dedicated_gpu,
            gpu_name,
            recommended_quantization,
            is_battery_or_laptop: is_laptop,
            recommended_cleanup_model,
            recommended_transform_model,
        }
    }

    #[cfg(target_os = "windows")]
    fn detect_gpu() -> (bool, Option<String>) {
        // Check for common dedicated GPU vendors in environment or graphics drivers
        // On Windows, DirectX / Vulkan / DirectML queries or vendor signatures
        if let Ok(val) = std::env::var("CUDA_VISIBLE_DEVICES") {
            if !val.trim().is_empty() && val != "-1" {
                return (true, Some("NVIDIA CUDA Device".to_string()));
            }
        }
        if std::path::Path::new("C:\\Windows\\System32\\nvapi64.dll").exists()
            || std::path::Path::new("C:\\Windows\\System32\\nvcuda.dll").exists()
        {
            return (true, Some("NVIDIA RTX / GeForce GPU".to_string()));
        }
        if std::path::Path::new("C:\\Windows\\System32\\amdvlk64.dll").exists()
            || std::path::Path::new("C:\\Windows\\System32\\atig6pxx.dll").exists()
        {
            return (true, Some("AMD Radeon GPU".to_string()));
        }
        (false, None)
    }

    #[cfg(target_os = "macos")]
    fn detect_gpu() -> (bool, Option<String>) {
        // Apple Silicon unified memory GPU (Metal)
        (true, Some("Apple Silicon Neural Engine / Metal GPU".to_string()))
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    fn detect_gpu() -> (bool, Option<String>) {
        (false, None)
    }

    fn detect_mobile_or_laptop(cpu_cores: u32) -> bool {
        // Modern laptops often have 4 to 12 threads with power throttling
        // Workstations and desktops typically have >= 16 threads
        cpu_cores <= 8
    }

    /// Select optimal model ID given the user's intent and hardware profile.
    pub fn select_model_for_task(
        task: LlmTaskKind,
        auto_quantize: bool,
        configured_model: &str,
    ) -> String {
        if !auto_quantize && !configured_model.is_empty() && configured_model != "auto" {
            return configured_model.to_string();
        }

        let profile = Self::detect();
        match task {
            LlmTaskKind::SmartCleanup => profile.recommended_cleanup_model,
            LlmTaskKind::VoiceTransform => profile.recommended_transform_model,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detection_returns_valid_hardware_profile() {
        let profile = HardwareDetector::detect();
        assert!(profile.cpu_cores >= 1);
        assert!(!profile.recommended_cleanup_model.is_empty());
        assert!(!profile.recommended_transform_model.is_empty());
    }

    #[test]
    fn auto_selection_resolves_task_model() {
        let cleanup_model = HardwareDetector::select_model_for_task(
            LlmTaskKind::SmartCleanup,
            true,
            "auto",
        );
        assert!(cleanup_model.starts_with("qwen2.5-1.5b-instruct"));

        let transform_model = HardwareDetector::select_model_for_task(
            LlmTaskKind::VoiceTransform,
            true,
            "auto",
        );
        assert!(transform_model.starts_with("phi-3.5-mini-instruct"));
    }

    #[test]
    fn manual_override_is_respected_when_auto_quantize_disabled() {
        let selected = HardwareDetector::select_model_for_task(
            LlmTaskKind::SmartCleanup,
            false,
            "custom-qwen-model",
        );
        assert_eq!(selected, "custom-qwen-model");
    }
}
