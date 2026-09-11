/*!
 * SOURCE OF TRUTH KEYWORDS: AdaptiveEscalationPolicy, EscalationDecision, EscalationSignal,
 *   evaluate_escalation, is_precision_context
 * WHAT:  Multi-signal adaptive escalation engine that decides when an utterance or segment
 *        requires a higher-tier speech recognition model.
 * WHY:   Balancing latency and precision: run fast model for live feedback, then selectively
 *        escalate when confidence is low, acoustic noise is high, or app context (IDEs/terminals)
 *        demands maximum vocabulary accuracy.
 * WHERE: Evaluated in pipeline/worker.rs and session/delivery.rs.
 */

use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EscalationSignal {
    /// Token/segment confidence was below the configured threshold.
    LowConfidence,
    /// Frontmost application is an IDE, terminal, or precision-critical app.
    PrecisionAppContext,
    /// Elevated acoustic noise / low signal-to-noise ratio in the audio buffer.
    AcousticNoise,
    /// Long continuous utterance where compound error mitigation is beneficial.
    LongUtterance,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Type)]
pub struct EscalationDecision {
    pub should_escalate: bool,
    pub signals: Vec<EscalationSignal>,
    pub confidence_score: Option<f32>,
    pub target_model: String,
    pub reason: String,
}

impl EscalationDecision {
    pub fn no_escalation() -> Self {
        Self {
            should_escalate: false,
            signals: Vec::new(),
            confidence_score: None,
            target_model: String::new(),
            reason: "Standard fast tier sufficient".to_string(),
        }
    }
}

pub struct AdaptiveEscalationPolicy {
    pub enabled: bool,
    pub confidence_threshold: f32,
    pub app_aware_escalate: bool,
    pub target_model: String,
    pub user_can_escalate: bool,
}

impl Default for AdaptiveEscalationPolicy {
    fn default() -> Self {
        Self {
            enabled: false,
            confidence_threshold: 0.70,
            app_aware_escalate: true,
            target_model: "large-v3-turbo".to_string(),
            user_can_escalate: true,
        }
    }
}

impl AdaptiveEscalationPolicy {
    pub fn new(
        enabled: bool,
        confidence_threshold: f32,
        app_aware_escalate: bool,
        target_model: String,
        user_can_escalate: bool,
    ) -> Self {
        Self {
            enabled,
            confidence_threshold,
            app_aware_escalate,
            target_model,
            user_can_escalate,
        }
    }

    /**
     * Checks if the active application name/executable matches known precision environments
     * (code editors, development IDEs, terminals, shells).
     */
    pub fn is_precision_context(app_identifier: Option<&str>) -> bool {
        let Some(app) = app_identifier else {
            return false;
        };
        let lower = app.to_lowercase();
        const PRECISION_KEYWORDS: &[&str] = &[
            "code", "cursor", "vscodium", "terminal", "powershell", "cmd.exe",
            "devenv", "idea64", "pycharm", "webstorm", "clion", "rustrover",
            "sublime_text", "neovim", "nvim", "alacritty", "kitty", "wezterm",
            "warp", "xcode", "androidstudio", "zed", "obsidian",
        ];

        PRECISION_KEYWORDS.iter().any(|&keyword| lower.contains(keyword))
    }

    /**
     * Evaluates all signals against the policy.
     */
    pub fn evaluate(
        &self,
        avg_confidence: Option<f32>,
        duration_ms: u64,
        rms_dbfs: f32,
        peak_amplitude: f32,
        active_app: Option<&str>,
    ) -> EscalationDecision {
        if !self.enabled || !self.user_can_escalate {
            return EscalationDecision::no_escalation();
        }

        let mut signals = Vec::new();

        // 1. Confidence signal
        if let Some(conf) = avg_confidence {
            if conf < self.confidence_threshold {
                signals.push(EscalationSignal::LowConfidence);
            }
        }

        // 2. App-aware context signal
        if self.app_aware_escalate && Self::is_precision_context(active_app) {
            signals.push(EscalationSignal::PrecisionAppContext);
        }

        // 3. Acoustic noise signal: High background RMS with low dynamic range
        if rms_dbfs > -32.0 && peak_amplitude > 0.05 && (peak_amplitude / (rms_dbfs.abs().max(1.0))) < 0.015 {
            signals.push(EscalationSignal::AcousticNoise);
        }

        // 4. Utterance duration: long continuous speech (> 10 seconds)
        if duration_ms >= 10_000 {
            signals.push(EscalationSignal::LongUtterance);
        }

        if signals.is_empty() {
            return EscalationDecision::no_escalation();
        }

        let reasons: Vec<&'static str> = signals
            .iter()
            .map(|s| match s {
                EscalationSignal::LowConfidence => "low confidence score",
                EscalationSignal::PrecisionAppContext => "precision app context",
                EscalationSignal::AcousticNoise => "elevated background noise",
                EscalationSignal::LongUtterance => "extended utterance length",
            })
            .collect();

        EscalationDecision {
            should_escalate: true,
            signals,
            confidence_score: avg_confidence,
            target_model: self.target_model.clone(),
            reason: format!("Escalation triggered by: {}", reasons.join(", ")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn policy_disabled_never_escalates() {
        let policy = AdaptiveEscalationPolicy {
            enabled: false,
            ..Default::default()
        };
        let decision = policy.evaluate(Some(0.30), 15_000, -20.0, 0.5, Some("Code.exe"));
        assert!(!decision.should_escalate);
    }

    #[test]
    fn low_confidence_triggers_escalation() {
        let policy = AdaptiveEscalationPolicy {
            enabled: true,
            confidence_threshold: 0.75,
            ..Default::default()
        };
        let decision = policy.evaluate(Some(0.60), 2000, -40.0, 0.5, None);
        assert!(decision.should_escalate);
        assert!(decision.signals.contains(&EscalationSignal::LowConfidence));
    }

    #[test]
    fn precision_context_detection_works() {
        assert!(AdaptiveEscalationPolicy::is_precision_context(Some("Code.exe")));
        assert!(AdaptiveEscalationPolicy::is_precision_context(Some("WindowsTerminal.exe")));
        assert!(AdaptiveEscalationPolicy::is_precision_context(Some("Cursor")));
        assert!(AdaptiveEscalationPolicy::is_precision_context(Some("neovim")));
        assert!(!AdaptiveEscalationPolicy::is_precision_context(Some("Spotify.exe")));
        assert!(!AdaptiveEscalationPolicy::is_precision_context(Some("Slack.exe")));
    }

    #[test]
    fn user_without_permission_cannot_escalate() {
        let policy = AdaptiveEscalationPolicy {
            enabled: true,
            user_can_escalate: false,
            ..Default::default()
        };
        let decision = policy.evaluate(Some(0.20), 12_000, -20.0, 0.5, Some("Code.exe"));
        assert!(!decision.should_escalate);
    }
}
