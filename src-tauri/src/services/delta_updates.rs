/*!
 * SOURCE OF TRUTH KEYWORDS: delta_updates, bsdiff, bspatch, patch_application,
 *   binary_diff, sha256_verification
 * WHAT:  Binary delta update service for Murmur.
 * WHY:   Full desktop installers for macOS and Windows are ~60-100 MB.
 *        Delta updates compute binary diffs (bsdiff) between version N-1 and N,
 *        reducing download payload to 2-5 MB (a 90-95% reduction in bandwidth).
 *        If a delta patch is unavailable or fails cryptographic hash verification,
 *        the updater seamlessly falls back to the full bundle download.
 * WHERE: Imported by ipc/commands/updates.rs; verified in unit tests below.
 */

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use sha2::{Digest, Sha256};
use serde::{Deserialize, Serialize};

use crate::error::{AppError, ErrorCode};

/// A single binary delta patch targeting an upgrade from an older version.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeltaPatchEntry {
    /// The source version this patch applies to (e.g. "0.1.0" or "1.2.0").
    pub from_version: String,
    /// Direct download URL for the `.patch` binary diff file.
    pub url: String,
    /// Expected SHA-256 hex string of the reconstructed target binary.
    pub target_sha256: String,
    /// Optional minisign or GPG signature string for the patch.
    pub signature: Option<String>,
    /// Estimated size in bytes of the compressed patch file.
    pub size_bytes: Option<u64>,
}

/// Platform-specific release entry in the extended update manifest.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PlatformManifest {
    pub url: String,
    pub signature: Option<String>,
    #[serde(default)]
    pub patches: Vec<DeltaPatchEntry>,
}

/// Extended update manifest payload containing both full bundles and delta patches.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeltaUpdateManifest {
    pub version: String,
    pub notes: Option<String>,
    pub pub_date: Option<String>,
    #[serde(default)]
    pub platforms: HashMap<String, PlatformManifest>,
}

/// Normalizes a version string by stripping a leading 'v' or 'V' and whitespace.
pub fn normalize_version(v: &str) -> &str {
    v.trim().trim_start_matches(['v', 'V'])
}

/// Finds a matching delta patch for the current version and platform target.
pub fn find_matching_delta_patch<'a>(
    manifest: &'a DeltaUpdateManifest,
    platform_key: &str,
    current_version: &str,
) -> Option<&'a DeltaPatchEntry> {
    let platform = manifest.platforms.get(platform_key)?;
    let norm_current = normalize_version(current_version);

    platform.patches.iter().find(|p| {
        normalize_version(&p.from_version) == norm_current
    })
}

/// Verifies whether the SHA-256 hash of `data` matches `expected_hex` (case-insensitive).
pub fn verify_binary_sha256(data: &[u8], expected_hex: &str) -> bool {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    let actual_hex = hex::encode(result);
    actual_hex.eq_ignore_ascii_case(expected_hex.trim())
}

/// Applies a binary bsdiff patch to `old_bytes`, producing the reconstructed `new_bytes`.
pub fn apply_binary_patch(old_bytes: &[u8], patch_bytes: &[u8]) -> Result<Vec<u8>, AppError> {
    let patcher = qbsdiff::Bspatch::new(patch_bytes).map_err(|e| {
        AppError::new(
            ErrorCode::Internal,
            "Failed to parse binary delta update patch header.",
        )
        .with_detail(format!("bspatch header error: {e:?}"))
    })?;

    let mut output = Vec::with_capacity(old_bytes.len() + patch_bytes.len());
    patcher.apply(old_bytes, &mut output).map_err(|e| {
        AppError::new(
            ErrorCode::Internal,
            "Failed to apply binary delta update to local executable.",
        )
        .with_detail(format!("bspatch apply error: {e:?}"))
    })?;

    Ok(output)
}

/// Creates a binary bsdiff patch from `old_bytes` to `new_bytes`.
/// Useful for CI release scripts and test harnesses.
pub fn create_binary_patch(old_bytes: &[u8], new_bytes: &[u8]) -> Result<Vec<u8>, AppError> {
    let mut patch_output = Vec::new();
    let patcher = qbsdiff::Bsdiff::new(old_bytes, new_bytes);
    patcher.compare(&mut patch_output).map_err(|e| {
        AppError::new(
            ErrorCode::Internal,
            "Failed to generate binary delta diff patch.",
        )
        .with_detail(format!("bsdiff write error: {e:?}"))
    })?;

    Ok(patch_output)
}

/// Prepares the staging path for applying a patched executable.
pub fn get_staged_exe_path(current_exe: &Path) -> PathBuf {
    let mut staged = current_exe.to_path_buf();
    let file_name = current_exe
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("murmur");
    staged.set_file_name(format!("{file_name}.patch_staged"));
    staged
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_normalization() {
        assert_eq!(normalize_version("v1.2.0"), "1.2.0");
        assert_eq!(normalize_version("V0.1.5"), "0.1.5");
        assert_eq!(normalize_version(" 1.0.0 "), "1.0.0");
    }

    #[test]
    fn test_binary_diff_and_patch_roundtrip() {
        let old_binary = b"ELF/PE-HEADER-ORIGINAL-MACHINE-CODE-v1.0.0-MURMUR-BASE-BINARY-XYZ1234567890";
        let new_binary = b"ELF/PE-HEADER-UPDATED-MACHINE-CODE-v1.1.0-MURMUR-OPTIMIZED-DIRECTML-XYZ1234567890-ADDITIONAL-FEATURE-DATA";

        // 1. Create patch
        let patch = create_binary_patch(old_binary, new_binary).expect("patch creation succeeds");
        assert!(!patch.is_empty());

        // 2. Apply patch
        let reconstructed = apply_binary_patch(old_binary, &patch).expect("patch application succeeds");
        assert_eq!(&reconstructed[..], &new_binary[..]);

        // 3. Verify SHA-256
        let mut hasher = Sha256::new();
        hasher.update(new_binary);
        let expected_hash = hex::encode(hasher.finalize());

        assert!(verify_binary_sha256(&reconstructed, &expected_hash));
        assert!(!verify_binary_sha256(&reconstructed, "0000000000000000000000000000000000000000000000000000000000000000"));
    }

    #[test]
    fn test_matching_patch_lookup() {
        let mut platforms = HashMap::new();
        platforms.insert(
            "windows-x86_64".to_string(),
            PlatformManifest {
                url: "https://example.com/full_installer.msi.zip".to_string(),
                signature: None,
                patches: vec![
                    DeltaPatchEntry {
                        from_version: "0.1.0".to_string(),
                        url: "https://example.com/patch_0.1.0_to_0.2.0.patch".to_string(),
                        target_sha256: "abc123".to_string(),
                        signature: None,
                        size_bytes: Some(1024 * 1024),
                    },
                    DeltaPatchEntry {
                        from_version: "0.1.9".to_string(),
                        url: "https://example.com/patch_0.1.9_to_0.2.0.patch".to_string(),
                        target_sha256: "def456".to_string(),
                        signature: None,
                        size_bytes: Some(512 * 1024),
                    },
                ],
            },
        );

        let manifest = DeltaUpdateManifest {
            version: "0.2.0".to_string(),
            notes: Some("Delta test release".to_string()),
            pub_date: None,
            platforms,
        };

        // Matching version
        let patch = find_matching_delta_patch(&manifest, "windows-x86_64", "v0.1.0");
        assert!(patch.is_some());
        assert_eq!(patch.unwrap().url, "https://example.com/patch_0.1.0_to_0.2.0.patch");

        // Non-matching version
        let missing = find_matching_delta_patch(&manifest, "windows-x86_64", "v0.0.9");
        assert!(missing.is_none());

        // Non-matching platform
        let missing_plat = find_matching_delta_patch(&manifest, "darwin-aarch64", "v0.1.0");
        assert!(missing_plat.is_none());
    }
}
