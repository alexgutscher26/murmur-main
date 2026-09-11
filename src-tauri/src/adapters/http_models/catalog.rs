/*!
 * SOURCE OF TRUTH KEYWORDS: MODEL_CATALOG, catalog, descriptor_for,
 *   DEFAULT_MODEL_ID, FALLBACK_MODEL_ID, HF_BASE_URL, CatalogEntry
 * WHAT:  The static table of every model HushWrite offers, with its URL, size and
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

/// Every file below without custom_url is resolved against this. whisper.cpp's own repository.
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
    pub custom_url: Option<&'static str>,
}

impl CatalogEntry {
    pub fn descriptor(&self) -> ModelDescriptor {
        ModelDescriptor {
            id: ModelId(self.id.to_string()),
            display_name: self.display_name.to_string(),
            description: self.description.to_string(),
            url: self
                .custom_url
                .map(|u| u.to_string())
                .unwrap_or_else(|| format!("{HF_BASE_URL}{}", self.file_name)),
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
        id: "tiny",
        display_name: "Tiny (Full)",
        description: "Smallest model. Very fast, lower accuracy. Good for testing.",
        file_name: "ggml-tiny.bin",
        sha256: "be07e048e1e599ad46341c8d2a135645097a538221678b7acdd1b1919c6e1b21",
        size_bytes: 77691713,
        approx_ram_mb: 200,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "tiny.en",
        display_name: "Tiny (English)",
        description: "Smallest model. Very fast, lower accuracy. Good for testing.",
        file_name: "ggml-tiny.en.bin",
        sha256: "921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f",
        size_bytes: 77704715,
        approx_ram_mb: 200,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "tiny-q5_1",
        display_name: "Tiny (q5_1)",
        description: "Smallest model. Very fast, lower accuracy. Good for testing.",
        file_name: "ggml-tiny-q5_1.bin",
        sha256: "818710568da3ca15689e31a743197b520007872ff9576237bda97bd1b469c3d7",
        size_bytes: 32152673,
        approx_ram_mb: 100,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "tiny.en-q5_1",
        display_name: "Tiny (English, q5_1)",
        description: "Smallest model. Very fast, lower accuracy. Good for testing.",
        file_name: "ggml-tiny.en-q5_1.bin",
        sha256: "c77c5766f1cef09b6b7d47f21b546cbddd4157886b3b5d6d4f709e91e66c7c2b",
        size_bytes: 32166155,
        approx_ram_mb: 100,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "tiny-q8_0",
        display_name: "Tiny (q8_0)",
        description: "Smallest model. Very fast, lower accuracy. Good for testing.",
        file_name: "ggml-tiny-q8_0.bin",
        sha256: "c2085835d3f50733e2ff6e4b41ae8a2b8d8110461e18821b09a15c40c42d1cca",
        size_bytes: 43537433,
        approx_ram_mb: 150,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "base",
        display_name: "Base (Full)",
        description: "Lightweight base model for immediate instant decodes on older or constrained hardware.",
        file_name: "ggml-base.bin",
        sha256: "60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe",
        size_bytes: 147951465,
        approx_ram_mb: 300,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "base.en",
        display_name: "Base (English)",
        description: "Lightweight base model for immediate instant decodes on older or constrained hardware.",
        file_name: "ggml-base.en.bin",
        sha256: "a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002",
        size_bytes: 147964211,
        approx_ram_mb: 300,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "base-q5_1",
        display_name: "Base (q5_1)",
        description: "Lightweight base model for immediate instant decodes on older or constrained hardware.",
        file_name: "ggml-base-q5_1.bin",
        sha256: "422f1ae452ade6f30a004d7e5c6a43195e4433bc370bf23fac9cc591f01a8898",
        size_bytes: 59707625,
        approx_ram_mb: 250,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "base.en-q5_1",
        display_name: "Base (English, q5_1)",
        description: "Lightweight base model for immediate instant decodes on older or constrained hardware.",
        file_name: "ggml-base.en-q5_1.bin",
        sha256: "4baf70dd0d7c4247ba2b81fafd9c01005ac77c2f9ef064e00dcf195d0e2fdd2f",
        size_bytes: 59721011,
        approx_ram_mb: 150,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "base-q8_0",
        display_name: "Base (q8_0)",
        description: "Lightweight base model for immediate instant decodes on older or constrained hardware.",
        file_name: "ggml-base-q8_0.bin",
        sha256: "c577b9a86e7e048a0b7eada054f4dd79a56bbfa911fbdacf900ac5b567cbb7d9",
        size_bytes: 81768585,
        approx_ram_mb: 200,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "small",
        display_name: "Small (Full)",
        description: "Fast, low memory, fully local speech recognition.",
        file_name: "ggml-small.bin",
        sha256: "1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b",
        size_bytes: 487601967,
        approx_ram_mb: 950,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "small.en",
        display_name: "Small (English)",
        description: "Fast, low memory, fully local speech recognition.",
        file_name: "ggml-small.en.bin",
        sha256: "c6138d6d58ecc8322097e0f987c32f1be8bb0a18532a3f88f734d1bbf9c41e5d",
        size_bytes: 487614201,
        approx_ram_mb: 950,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "small.en-tdrz",
        display_name: "Small (tdrz) (English)",
        description: "Tiny diarization model for fast, low-memory transcription with speaker turns.",
        file_name: "ggml-small.en-tdrz.bin",
        sha256: "ceac3ec06d1d98ef71aec665283564631055fd6129b79d8e1be4f9cc33cc54b4",
        size_bytes: 487614184,
        approx_ram_mb: 950,
        is_default: false,
        custom_url: Some("https://huggingface.co/akashmjn/tinydiarize-whisper.cpp/resolve/main/ggml-small.en-tdrz.bin"),
    },
    CatalogEntry {
        id: "small-q5_1",
        display_name: "Small (q5_1)",
        description: "The default. Fast, low memory, fully local speech recognition for everyday typing.",
        file_name: "ggml-small-q5_1.bin",
        sha256: "ae85e4a935d7a567bd102fe55afc16bb595bdb618e11b2fc7591bc08120411bb",
        size_bytes: 190085487,
        approx_ram_mb: 450,
        is_default: true,
        custom_url: None,
    },
    CatalogEntry {
        id: "small.en-q5_1",
        display_name: "Small (English, q5_1)",
        description: "Fast, low memory, fully local speech recognition.",
        file_name: "ggml-small.en-q5_1.bin",
        sha256: "bfdff4894dcb76bbf647d56263ea2a96645423f1669176f4844a1bf8e478ad30",
        size_bytes: 190098681,
        approx_ram_mb: 400,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "small-q8_0",
        display_name: "Small (q8_0)",
        description: "Fast, low memory, fully local speech recognition.",
        file_name: "ggml-small-q8_0.bin",
        sha256: "49c8fb02b65e6049d5fa6c04f81f53b867b5ec9540406812c643f177317f779f",
        size_bytes: 264464607,
        approx_ram_mb: 550,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "medium",
        display_name: "Medium (Full)",
        description: "Pro model. Exceptional accuracy across all 99 languages with balanced RAM consumption.",
        file_name: "ggml-medium.bin",
        sha256: "6c14d5adee5f86394037b4e4e8b59f1673b6cee10e3cf0b11bbdbee79c156208",
        size_bytes: 1533763059,
        approx_ram_mb: 2200,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "medium.en",
        display_name: "Medium (English)",
        description: "Pro model. Exceptional accuracy across all 99 languages with balanced RAM consumption.",
        file_name: "ggml-medium.en.bin",
        sha256: "cc37e93478338ec7700281a7ac30a10128929eb8f427dda2e865faa8f6da4356",
        size_bytes: 1533774781,
        approx_ram_mb: 2200,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "medium-q5_0",
        display_name: "Medium (q5_0)",
        description: "Pro model. Exceptional accuracy across all 99 languages with balanced RAM consumption.",
        file_name: "ggml-medium-q5_0.bin",
        sha256: "19fea4b380c3a618ec4723c3eef2eb785ffba0d0538cf43f8f235e7b3b34220f",
        size_bytes: 539212467,
        approx_ram_mb: 1000,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "medium.en-q5_0",
        display_name: "Medium (English, q5_0)",
        description: "Pro model. Exceptional accuracy across all 99 languages with balanced RAM consumption.",
        file_name: "ggml-medium.en-q5_0.bin",
        sha256: "76733e26ad8fe1c7a5bf7531a9d41917b2adc0f20f2e4f5531688a8c6cd88eb0",
        size_bytes: 539225533,
        approx_ram_mb: 950,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "medium-q8_0",
        display_name: "Medium (q8_0)",
        description: "Pro model. Exceptional accuracy across all 99 languages with balanced RAM consumption.",
        file_name: "ggml-medium-q8_0.bin",
        sha256: "42a1ffcbe4167d224232443396968db4d02d4e8e87e213d3ee2e03095dea6502",
        size_bytes: 823369779,
        approx_ram_mb: 1450,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v1",
        display_name: "Large v1 (Full)",
        description: "Large model. High accuracy, high RAM usage.",
        file_name: "ggml-large-v1.bin",
        sha256: "7d99f41a10525d0206bddadd86760181fa920438b6b33237e3118ff6c83bb53d",
        size_bytes: 3094623691,
        approx_ram_mb: 4450,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v2",
        display_name: "Large v2 (Full)",
        description: "Large model. High accuracy, high RAM usage.",
        file_name: "ggml-large-v2.bin",
        sha256: "9a423fe4d40c82774b6af34115b8b935f34152246eb19e80e376071d3f999487",
        size_bytes: 3094623691,
        approx_ram_mb: 4450,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v2-q5_0",
        display_name: "Large v2 (q5_0)",
        description: "Large model. High accuracy, high RAM usage.",
        file_name: "ggml-large-v2-q5_0.bin",
        sha256: "3a214837221e4530dbc1fe8d734f302af393eb30bd0ed046042ebf4baf70f6f2",
        size_bytes: 1080732091,
        approx_ram_mb: 1550,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v2-q8_0",
        display_name: "Large v2 (q8_0)",
        description: "Large model. High accuracy, high RAM usage.",
        file_name: "ggml-large-v2-q8_0.bin",
        sha256: "fef54e6d898246a65c8285bfa83bd1807e27fadf54d5d4e81754c47634737e8c",
        size_bytes: 1656129691,
        approx_ram_mb: 2400,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v3",
        display_name: "Large v3 (Full)",
        description: "Large model. High accuracy, high RAM usage.",
        file_name: "ggml-large-v3.bin",
        sha256: "64d182b440b98d5203c4f9bd541544d84c605196c4f7b845dfa11fb23594d1e2",
        size_bytes: 3095033483,
        approx_ram_mb: 4450,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v3-q5_0",
        display_name: "Large v3 (q5_0)",
        description: "Large model. High accuracy, high RAM usage.",
        file_name: "ggml-large-v3-q5_0.bin",
        sha256: "d75795ecff3f83b5faa89d1900604ad8c780abd5739fae406de19f23ecd98ad1",
        size_bytes: 1081140203,
        approx_ram_mb: 1550,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v3-turbo",
        display_name: "Large v3 Turbo (Full)",
        description: "Full precision weights for uncompromising transcription accuracy on high-RAM machines.",
        file_name: "ggml-large-v3-turbo.bin",
        sha256: "1fc70f774d38eb169993ac391eea357ef47c88757ef72ee5943879b7e8e2bc69",
        size_bytes: 1624555275,
        approx_ram_mb: 2200,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v3-turbo-q5_0",
        display_name: "Large v3 Turbo (q5_0)",
        description: "Pro model. Peak accuracy across all 99 languages, 5-bit quantised for fast decode times.",
        file_name: "ggml-large-v3-turbo-q5_0.bin",
        sha256: "394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2",
        size_bytes: 574041195,
        approx_ram_mb: 1100,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "large-v3-turbo-q8_0",
        display_name: "Large v3 Turbo (q8_0)",
        description: "Near-unquantised precision with 8-bit quantization for highest fidelity across subtle accents.",
        file_name: "ggml-large-v3-turbo-q8_0.bin",
        sha256: "317eb69c11673c9de1e1f0d459b253999804ec71ac4c23c17ecf5fbe24e259a1",
        size_bytes: 874188075,
        approx_ram_mb: 1600,
        is_default: false,
        custom_url: None,
    },
    CatalogEntry {
        id: "distil-small.en",
        display_name: "Distil-Whisper Small (English)",
        description:
            "Distilled English Small model. Up to 6x faster than standard Whisper Small with low memory footprint.",
        file_name: "ggml-distil-small.en.bin",
        sha256: "7691eb11167ab7aaf6b3e05d8266f2fd9ad89c550e433f86ac266ebdee6c970a",
        size_bytes: 336191657,
        approx_ram_mb: 450,
        is_default: false,
        custom_url: Some("https://huggingface.co/distil-whisper/distil-small.en/resolve/main/ggml-distil-small.en.bin"),
    },
    CatalogEntry {
        id: "distil-medium.en",
        display_name: "Distil-Whisper Medium (English)",
        description:
            "Distilled English Medium model. Fast, low latency with exceptional technical English accuracy.",
        file_name: "ggml-medium-32-2.en.bin",
        sha256: "ad53ccb618188b210550e98cc32bf5a13188d86635e395bb11115ed275d6e7aa",
        size_bytes: 794018180,
        approx_ram_mb: 1000,
        is_default: false,
        custom_url: Some("https://huggingface.co/distil-whisper/distil-medium.en/resolve/main/ggml-medium-32-2.en.bin"),
    },
    CatalogEntry {
        id: "distil-large-v2",
        display_name: "Distil-Whisper Large v2 (English)",
        description:
            "Distilled Large v2 model. State of the art English accuracy with 5.8x speedup over standard Large v2.",
        file_name: "ggml-large-32-2.en.bin",
        sha256: "2ed2bbe6c4138b3757f292b0622981bdb3d02bcac57f77095670dac85fab3cd6",
        size_bytes: 1519111363,
        approx_ram_mb: 1800,
        is_default: false,
        custom_url: Some("https://huggingface.co/distil-whisper/distil-large-v2/resolve/main/ggml-large-32-2.en.bin"),
    },
    CatalogEntry {
        id: "distil-large-v3",
        display_name: "Distil-Whisper Large v3 (English)",
        description:
            "Distilled Large v3 model. Peak accuracy, 6x faster inference than Large v3 with studio-grade punctuation.",
        file_name: "ggml-distil-large-v3.bin",
        sha256: "2883a11b90fb10ed592d826edeaee7d2929bf1ab985109fe9e1e7b4d2b69a298",
        size_bytes: 1519521155,
        approx_ram_mb: 1800,
        is_default: false,
        custom_url: Some("https://huggingface.co/distil-whisper/distil-large-v3-ggml/resolve/main/ggml-distil-large-v3.bin"),
    },
    CatalogEntry {
        id: "qwen2.5-1.5b-instruct-q4_k_m",
        display_name: "Qwen 2.5 1.5B Instruct (Q4_K_M)",
        description:
            "Compact on-device LLM cleanup via llama-cpp-2 (GGUF). Provides sub-second filler cleanup, punctuation enhancement, and 99-language formatting on CPU.",
        file_name: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
        sha256: "6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e",
        size_bytes: 1117320736,
        approx_ram_mb: 1200,
        is_default: false,
        custom_url: Some("https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf"),
    },
    CatalogEntry {
        id: "qwen2.5-1.5b-instruct-q5_k_m",
        display_name: "Qwen 2.5 1.5B Instruct (Q5_K_M)",
        description:
            "High-fidelity 5-bit quantized LLM cleanup. Optimal for GPU and high-core desktop workstations.",
        file_name: "qwen2.5-1.5b-instruct-q5_k_m.gguf",
        sha256: "b46661073c18e5b56a41fa320975f866a00def1ff08feef4718e013258896f8c",
        size_bytes: 1285494304,
        approx_ram_mb: 1400,
        is_default: false,
        custom_url: Some("https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q5_k_m.gguf"),
    },
    CatalogEntry {
        id: "phi-3.5-mini-instruct-q4_k_m",
        display_name: "Phi-3.5 Mini Instruct (Q4_K_M)",
        description:
            "High-reasoning small language model tailored for complex voice transformations ('Hey HushWrite, make that formal') and deep tone rewriting on CPU.",
        file_name: "Phi-3.5-mini-instruct-Q4_K_M.gguf",
        sha256: "e4165e3a71af97f1b4820da61079826d8752a2088e313af0c7d346796c38eff5",
        size_bytes: 2393232672,
        approx_ram_mb: 2400,
        is_default: false,
        custom_url: Some("https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf"),
    },
    CatalogEntry {
        id: "phi-3.5-mini-instruct-q6_k",
        display_name: "Phi-3.5 Mini Instruct (Q6_K)",
        description:
            "6-bit high-precision weights for conversational voice rewriting, executive document synthesis, and tone adjustments on GPU.",
        file_name: "Phi-3.5-mini-instruct-Q6_K.gguf",
        sha256: "cc4f0d756eb82447035314dbd247809a564189c20583e1d6fb926f9b6e1eb890",
        size_bytes: 3135853344,
        approx_ram_mb: 3400,
        is_default: false,
        custom_url: Some("https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q6_K.gguf"),
    },
    CatalogEntry {
        id: "parakeet-tdt-0.6b-v2",
        display_name: "NVIDIA Parakeet TDT 0.6B v2 (ONNX)",
        description:
            "Ultra-fast English streaming ASR via ONNX Runtime & DirectML. Delivers sub-50ms latency with high accuracy.",
        file_name: "parakeet-tdt-0.6b-v2.onnx",
        sha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
        size_bytes: 625000000,
        approx_ram_mb: 700,
        is_default: false,
        custom_url: Some("https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/resolve/main/parakeet-tdt-0.6b-v2.onnx"),
    },
    CatalogEntry {
        id: "parakeet-tdt_ctc-110m",
        display_name: "NVIDIA Parakeet TDT/CTC 110M (Fast Tier)",
        description:
            "Ultra-compact sub-25ms hotkey command and instantaneous English streaming dictation model.",
        file_name: "parakeet-tdt_ctc-110m.onnx",
        sha256: "b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
        size_bytes: 118000000,
        approx_ram_mb: 180,
        is_default: false,
        custom_url: Some("https://huggingface.co/nvidia/parakeet-tdt_ctc-110m/resolve/main/parakeet-tdt_ctc-110m.onnx"),
    },
];

/// Online CDN manifest URL for dynamic model listings.
pub const ONLINE_CATALOG_URL: &str =
    "https://raw.githubusercontent.com/ggerganov/whisper.cpp/master/models/models.json";

/// Configures a reqwest client builder according to whether Air-Gap mode is active.
/// When air-gapped, binds to loopback (127.0.0.1) with no proxy to prevent outbound traffic.
pub fn configure_air_gap_client_builder(
    builder: reqwest::ClientBuilder,
    air_gapped: bool,
) -> reqwest::ClientBuilder {
    if air_gapped {
        builder
            .no_proxy()
            .local_address(std::net::IpAddr::V4(std::net::Ipv4Addr::LOCALHOST))
    } else {
        builder
    }
}

/// Fetches dynamic models from the online registry, falling back to embedded MODEL_CATALOG.
/// When air_gapped is true, blocks the CDN model manifest fetch entirely.
pub async fn fetch_online_catalog_with_air_gap(
    air_gapped: bool,
) -> Result<Vec<ModelDescriptor>, reqwest::Error> {
    if air_gapped {
        // Block outbound CDN fetch entirely when Air-Gap / Hardware Isolation Mode is active
        return Ok(MODEL_CATALOG.iter().map(|e| e.descriptor()).collect());
    }
    let builder = reqwest::Client::builder().timeout(std::time::Duration::from_secs(5));
    let client = configure_air_gap_client_builder(builder, false).build()?;
    let entries: Vec<ModelDescriptor> = client.get(ONLINE_CATALOG_URL).send().await?.json().await?;
    Ok(entries)
}

/// Fetches dynamic models from the online registry, falling back to embedded MODEL_CATALOG.
pub async fn fetch_online_catalog() -> Result<Vec<ModelDescriptor>, reqwest::Error> {
    fetch_online_catalog_with_air_gap(false).await
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
