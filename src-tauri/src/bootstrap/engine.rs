/*!
 * SOURCE OF TRUTH KEYWORDS: bootstrap_engine, prepare_engine, default_model_id, worth_warming
 * WHAT:  Engine background warm-up thread and model status evaluation.
 * WHERE: Consumed by bootstrap/mod.rs.
 */

use std::sync::Arc;
use tauri::AppHandle;

use crate::registry::{self, keys};
use crate::types::SettingValue;

pub fn default_model_id() -> crate::types::ModelId {
    let id = registry::setting_def(keys::TRANSCRIPTION_MODEL)
        .and_then(|def| match &def.default {
            SettingValue::Choice(value) => Some(value.clone()),
            _ => None,
        })
        .unwrap_or_else(|| "small-q5_1".to_string());
    crate::types::ModelId(id)
}

/**
 * SOURCE OF TRUTH KEYWORDS: worth_warming
 * WHAT:  Whether a model's state means there is something on disk worth
 *        verifying and loading at startup.
 * WHERE: prepare_engine's warm-up thread.
 */
pub fn worth_warming(state: &crate::types::ModelState) -> bool {
    !matches!(state, crate::types::ModelState::NotDownloaded)
}

/**
 * SOURCE OF TRUTH KEYWORDS: prepare_engine
 * WHAT:  Loads the model and warms its context, off the main thread.
 * WHERE: Called once by setup, after the windows exist.
 */
pub fn prepare_engine(
    app: &AppHandle,
    engine: Arc<dyn crate::ports::TranscriptionEngine>,
    models: Arc<dyn crate::ports::ModelStore>,
    model_id: crate::types::ModelId,
) {
    let app = app.clone();
    std::thread::Builder::new()
        .name("murmur-engine-warmup".into())
        .spawn(move || {
            let installed = tauri::async_runtime::block_on(models.status(&model_id))
                .map(|status| worth_warming(&status.state))
                .unwrap_or(false);

            if !installed {
                tracing::info!(
                    model = model_id.as_str(),
                    "no model on disk yet; leaving the download to onboarding"
                );
                return;
            }

            if let Err(err) = tauri::async_runtime::block_on(models.ensure(&model_id)) {
                tracing::info!(error = %err, "model could not be verified; onboarding will fetch it");
                return;
            }

            let started = std::time::Instant::now();
            match engine.prepare() {
                Ok(()) => tracing::info!(
                    elapsed_ms = started.elapsed().as_millis() as u64,
                    realtime_factor = engine.capabilities().realtime_factor,
                    "engine warm"
                ),
                Err(err) => {
                    tracing::info!(error = %err, "engine not ready yet");
                    let _ = &app;
                }
            }
        })
        .ok();
}
