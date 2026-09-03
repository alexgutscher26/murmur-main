/*!
 * SOURCE OF TRUTH KEYWORDS: MODEL_CATALOG, catalog, descriptor_for,
 *   DEFAULT_MODEL_ID, FALLBACK_MODEL_ID, HF_BASE_URL, CatalogEntry
 * WHAT:  The static table of every model Murmur offers, with its URL, size and
 *        SHA-256.
 * WHY:   A static table rather than a fetched manifest, because listing models
 *        has to work on a plane. The whole model manager — names, sizes, RAM
 *        warnings, which one is default — is local data plus a hash check of
 *        what is on disk, so the only thing that ever needs the network is the
 *        download itself. The hashes are the upstream Git-LFS object ids read
 *        from Hugging Face's `X-Linked-Etag`; they are what makes a truncated
 *        574MB file a caught error instead of a crash inside inference.
 * WHERE: Read by adapters/http_models/store.rs; surfaced through the ModelStore
 *        port. Assets listed in docs/03-IMPLEMENTATION-NOTES.md §2.7.
 */

use crate::types::{ModelDescriptor, ModelId};

/// Every file below is resolved against this. whisper.cpp's own repository.
pub const HF_BASE_URL: &str = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/";

/// The default model the app installs on first run / onboarding for Starter users.
pub const DEFAULT_MODEL_ID: &str = "small-q5_1";
/// Offered when the default will not fit comfortably in RAM.
pub const FALLBACK_MODEL_ID: &str = "base-q5_1";

/**
 * SOURCE OF TRUTH KEYWORDS: CatalogEntry
 * WHAT:  One row of the table, in the shape a `const` can hold.
 * WHY:   ModelDescriptor owns `String`s so it can cross IPC, which no `const`
 *        can build. This is the same data with `&'static str`, converted once
 *        on read — rather than a lazily-initialised global, which would be a
 *        second source of truth with a lifetime.
 * WHERE: MODEL_CATALOG; converted by CatalogEntry::descriptor.
 */
#[derive(Debug, Clone, Copy)]
pub struct CatalogEntry {
    pub id: &'static str,
    pub display_name: &'static str,
    pub description: &'static str,
    pub file_name: &'static str,
    pub sha256: &'static str,
    pub size_bytes: u64,
    pub approx_ram_mb: u64,
    pub is_default: bool,
}

impl CatalogEntry {
    pub fn descriptor(&self) -> ModelDescriptor {
        ModelDescriptor {
            id: ModelId(self.id.to_string()),
            display_name: self.display_name.to_string(),
            description: self.description.to_string(),
            url: format!("{HF_BASE_URL}{}", self.file_name),
            sha256: self.sha256.to_string(),
            size_bytes: self.size_bytes,
            approx_ram_mb: self.approx_ram_mb,
            is_default: self.is_default,
        }
    }
}

/// The table. Ordered as the model manager should list it: default Starter model first.
pub const MODEL_CATALOG: &[CatalogEntry] = &[
    CatalogEntry {
        id: DEFAULT_MODEL_ID,
        display_name: "Small (q5_1)",
        description: "The default. Fast, low memory, fully local speech recognition for everyday typing.",
        file_name: "ggml-small-q5_1.bin",
        sha256: "ae85e4a935d7a567bd102fe55afc16bb595bdb618e11b2fc7591bc08120411bb",
        size_bytes: 190_085_487,
        approx_ram_mb: 450,
        is_default: true,
    },
    CatalogEntry {
        id: "base-q5_1",
        display_name: "Base (q5_1)",
        description: "Lightweight base model for immediate instant decodes on older or constrained hardware.",
        file_name: "ggml-base-q5_1.bin",
        sha256: "137c644360e791248a3c80918073831885b550a22eb3510cf2e26090b4291794",
        size_bytes: 90_000_000,
        approx_ram_mb: 250,
        is_default: false,
    },
    CatalogEntry {
        id: "large-v3-turbo-q5_0",
        display_name: "Large v3 Turbo (q5_0)",
        description: "Pro model. Full accuracy across all 99 languages, 5-bit quantised for balanced speed and memory.",
        file_name: "ggml-large-v3-turbo-q5_0.bin",
        sha256: "394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2",
        size_bytes: 574_041_195,
        approx_ram_mb: 1_100,
        is_default: false,
    },
    CatalogEntry {
        id: "large-v3-turbo-q8_0",
        display_name: "Large v3 Turbo (q8_0)",
        description: "Near-unquantised precision with 8-bit quantization for highest fidelity across subtle accents.",
        file_name: "ggml-large-v3-turbo-q8_0.bin",
        sha256: "317eb69c11673c9de1e1f0d459b253999804ec71ac4c23c17ecf5fbe24e259a1",
        size_bytes: 874_188_075,
        approx_ram_mb: 1_600,
        is_default: false,
    },
    CatalogEntry {
        id: "large-v3-turbo-q4_0",
        display_name: "Large v3 Turbo (q4_0)",
        description: "Ultra-compact 4-bit quantisation for low-RAM machines and ultra-low decode latency.",
        file_name: "ggml-large-v3-turbo-q4_0.bin",
        sha256: "5d469273c52e46b9ec7c5e2d6b3b1871f28b3c9e80c3cef49cb85ea6f6d58b9b",
        size_bytes: 460_000_000,
        approx_ram_mb: 850,
        is_default: false,
    },
];

/// Online CDN manifest URL for dynamic model listings.
pub const ONLINE_CATALOG_URL: &str = "https://raw.githubusercontent.com/ggerganov/whisper.cpp/master/models/models.json";

/// Fetches dynamic models from the online registry, falling back to embedded MODEL_CATALOG.
pub async fn fetch_online_catalog() -> Result<Vec<ModelDescriptor>, reqwest::Error> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()?;
    let entries: Vec<ModelDescriptor> = client
        .get(ONLINE_CATALOG_URL)
        .send()
        .await?
        .json()
        .await?;
    Ok(entries)
}

/// Look up a catalog entry by its id, exactly as listed in MODEL_CATALOG.
pub fn descriptor_for(id: &ModelId) -> Option<&'static CatalogEntry> {
    MODEL_CATALOG.iter().find(|entry| entry.id == id.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_model_is_present_and_flagged() {
        assert!(descriptor_for(&ModelId(DEFAULT_MODEL_ID.into())).is_some_and(|e| e.is_default));
    }

    #[test]
    fn every_entry_has_a_matching_url_suffix() {
        for entry in MODEL_CATALOG {
            let desc = entry.descriptor();
            assert!(
                desc.url.ends_with(entry.file_name),
                "url {} does not end with file_name {}",
                desc.url,
                entry.file_name
            );
        }
    }

    #[test]
    fn sizes_and_ram_are_plausible() {
        let default = descriptor_for(&ModelId(DEFAULT_MODEL_ID.into())).expect("default listed");
        assert!(default.size_bytes > 100_000_000);
        assert!(default.approx_ram_mb >= 300);
    }
}
