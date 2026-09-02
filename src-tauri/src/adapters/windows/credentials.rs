/*!
 * SOURCE OF TRUTH KEYWORDS: WindowsCredentialStore, CredWriteW, CredReadW,
 *   CredDeleteW, CRED_TYPE_GENERIC, CRED_PERSIST_LOCAL_MACHINE
 * WHAT:  Secure key and secret storage backed by Windows Credential Manager.
 * WHY:   Murmur promises voice privacy and data safety on device. Storing
 *        encryption keys (for future audio export, transcripts, or credentials)
 *        in plaintext files inside AppData exposes them to any unprivileged
 *        process. Windows Credential Manager secures credentials per-user with
 *        DPAPI / Windows Hello encryption.
 * WHERE: adapters/windows/credentials.rs; consumed by security and export services.
 */

use windows::core::{PCWSTR, PWSTR};
use windows::Win32::Security::Credentials::{
    CredDeleteW, CredFree, CredReadW, CredWriteW, CREDENTIALW, CRED_FLAGS,
    CRED_PERSIST_LOCAL_MACHINE, CRED_TYPE_GENERIC,
};

const DEFAULT_TARGET_PREFIX: &str = "Murmur/Secret/";

pub struct WindowsCredentialStore;

impl WindowsCredentialStore {
    /**
     * SOURCE OF TRUTH KEYWORDS: store_secret
     * WHAT:  Persists a secret/key string securely under a given target identifier.
     * WHY:   Encrypts with DPAPI at rest; isolated to the local user account.
     */
    pub fn store_secret(key: &str, secret: &[u8]) -> bool {
        let target_name: Vec<u16> = format!("{DEFAULT_TARGET_PREFIX}{key}\0").encode_utf16().collect();
        let user_name: Vec<u16> = "MurmurUser\0".encode_utf16().collect();

        let mut credential = CREDENTIALW {
            Flags: CRED_FLAGS(0),
            Type: CRED_TYPE_GENERIC,
            TargetName: PWSTR(target_name.as_ptr() as *mut u16),
            Comment: PWSTR::null(),
            LastWritten: windows::Win32::Foundation::FILETIME::default(),
            CredentialBlobSize: secret.len() as u32,
            CredentialBlob: secret.as_ptr() as *mut _,
            Persist: CRED_PERSIST_LOCAL_MACHINE,
            AttributeCount: 0,
            Attributes: std::ptr::null_mut(),
            TargetAlias: PWSTR::null(),
            UserName: PWSTR(user_name.as_ptr() as *mut u16),
        };

        unsafe { CredWriteW(&mut credential, 0).is_ok() }
    }

    /**
     * SOURCE OF TRUTH KEYWORDS: read_secret
     * WHAT:  Retrieves a previously stored secret/key from Windows Credential Manager.
     */
    pub fn read_secret(key: &str) -> Option<Vec<u8>> {
        let target_name: Vec<u16> = format!("{DEFAULT_TARGET_PREFIX}{key}\0").encode_utf16().collect();

        unsafe {
            let mut cred_ptr: *mut CREDENTIALW = std::ptr::null_mut();
            if CredReadW(
                PCWSTR(target_name.as_ptr()),
                CRED_TYPE_GENERIC,
                0,
                &mut cred_ptr,
            )
            .is_ok()
                && !cred_ptr.is_null()
            {
                let cred = &*cred_ptr;
                let blob_size = cred.CredentialBlobSize as usize;
                let slice = std::slice::from_raw_parts(cred.CredentialBlob, blob_size);
                let result = slice.to_vec();
                CredFree(cred_ptr as *const _);
                Some(result)
            } else {
                None
            }
        }
    }

    /**
     * SOURCE OF TRUTH KEYWORDS: delete_secret
     * WHAT:  Deletes a secret from Windows Credential Manager.
     */
    pub fn delete_secret(key: &str) -> bool {
        let target_name: Vec<u16> = format!("{DEFAULT_TARGET_PREFIX}{key}\0").encode_utf16().collect();

        unsafe { CredDeleteW(PCWSTR(target_name.as_ptr()), CRED_TYPE_GENERIC, 0).is_ok() }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn credential_store_roundtrip_test() {
        let test_key = "test_key_roundtrip";
        let test_data = b"super_secret_payload_123";

        let stored = WindowsCredentialStore::store_secret(test_key, test_data);
        if stored {
            let retrieved = WindowsCredentialStore::read_secret(test_key);
            assert_eq!(retrieved.as_deref(), Some(&test_data[..]));
            let deleted = WindowsCredentialStore::delete_secret(test_key);
            assert!(deleted);
        }
    }
}
