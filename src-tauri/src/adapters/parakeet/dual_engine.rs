/*!
 * SOURCE OF TRUTH KEYWORDS: DualEngine, DUAL_ENGINE_ID, dual_engine_routing,
 *   LanguageHint, WhisperEngine, ParakeetEngine
 * WHAT:  Intelligent Dual-Engine speech recognition orchestrator combining
 *        Parakeet (English fast mode, <50ms) with Whisper (99-language coverage).
 * WHY:   Gives users the best of both worlds: lightning-fast streaming dictation
 *        when speaking English without sacrificing Whisper's robust 99-language
 *        accuracy for multilingual dictation.
 * WHERE: adapters/parakeet/dual_engine.rs; plugged via adapters/mod.rs.
 */

use std::sync::Arc;

use crate::error::AppResult;
use crate::ports::engine::{TranscribeRequest, TranscriptionEngine};
use crate::types::{
    AudioChunk, EngineCapabilities, EngineFeature, EngineId, LanguageHint, LanguageSupport,
    TranscriptSegment,
};

pub const DUAL_ENGINE_ID: &str = "dual";

pub struct DualEngine {
    parakeet: Arc<dyn TranscriptionEngine>,
    whisper: Arc<dyn TranscriptionEngine>,
}

impl DualEngine {
    pub fn new(
        parakeet: Arc<dyn TranscriptionEngine>,
        whisper: Arc<dyn TranscriptionEngine>,
    ) -> Self {
        Self { parakeet, whisper }
    }
}

impl TranscriptionEngine for DualEngine {
    fn capabilities(&self) -> EngineCapabilities {
        EngineCapabilities {
            id: EngineId(DUAL_ENGINE_ID.to_string()),
            display_name: "Dual Engine (Parakeet Fast English + Whisper Multilingual)".to_string(),
            languages: LanguageSupport::All,
            features: vec![
                EngineFeature::Offline,
                EngineFeature::LanguageAutoDetect,
                EngineFeature::InitialPrompt,
            ],
            realtime_factor: 0.04, // Sub-50ms for English, standard Whisper speed for other languages
            requires_download: true,
            runs_offline: true,
        }
    }

    fn prepare(&self) -> AppResult<()> {
        // Attempt to prepare both; Whisper is critical fallback
        let _ = self.parakeet.prepare();
        self.whisper.prepare()
    }

    fn is_ready(&self) -> bool {
        // Ready if either engine is operational (Whisper or Parakeet)
        self.whisper.is_ready() || self.parakeet.is_ready()
    }

    fn transcribe(
        &self,
        chunk: &AudioChunk,
        request: &TranscribeRequest,
    ) -> AppResult<Vec<TranscriptSegment>> {
        let is_english = match &request.language {
            LanguageHint::Pinned { language } => language.0 == "en",
            LanguageHint::Auto => true, // Default to fast Parakeet tier for auto
        };

        // Route to Parakeet for English if ready, otherwise fallback to Whisper
        if is_english && self.parakeet.is_ready() {
            if let Ok(res) = self.parakeet.transcribe(chunk, request) {
                if !res.is_empty() {
                    return Ok(res);
                }
            }
        }

        // Multilingual or fallback route
        self.whisper.transcribe(chunk, request)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::faster_whisper::FasterWhisperEngine;
    use crate::adapters::parakeet::engine::ParakeetEngine;
    use std::path::PathBuf;

    #[test]
    fn dual_engine_reports_full_multilingual_capabilities() {
        let p = Arc::new(ParakeetEngine::new(PathBuf::from("/tmp/parakeet.onnx")));
        let w = Arc::new(FasterWhisperEngine::new(PathBuf::from("/tmp/whisper.bin")));
        let dual = DualEngine::new(p, w);

        let caps = dual.capabilities();
        assert_eq!(caps.languages, LanguageSupport::All);
        assert!(caps.runs_offline);
    }
}
