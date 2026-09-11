/*!
 * SOURCE OF TRUTH KEYWORDS: parakeet_adapter, ParakeetEngine, DualEngine,
 *   PARAKEET_ENGINE_ID, DUAL_ENGINE_ID, AudioPreprocessor, ParakeetTokenizer
 * WHAT:  Barrel for the NVIDIA Parakeet ONNX Runtime speech recognition engine
 *        and Dual-Engine intelligent dispatcher.
 * WHY:   Centralizes fast-tier ASR components: log-mel feature extraction,
 *        SentencePiece token decoding, DirectML acceleration, and dual-engine routing.
 * WHERE: Constructed by adapters/mod.rs::build_engine; consumed through
 *        TranscriptionEngine port by pipeline/worker.rs.
 */

pub mod converter;
pub mod dual_engine;
pub mod engine;
pub mod preprocessor;
pub mod tokenizer;

pub use converter::{verify_parakeet_model_file, ParakeetVariant};
pub use dual_engine::{DualEngine, DUAL_ENGINE_ID};
pub use engine::{ParakeetEngine, PARAKEET_ENGINE_ID};
pub use preprocessor::{AudioPreprocessor, PreprocessorConfig};
pub use tokenizer::ParakeetTokenizer;
