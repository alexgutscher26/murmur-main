# Windows Package Manager (Winget) Manifests for Murmur

This directory contains the official multi-file YAML manifests for **Murmur** (`WebProdigies.Murmur`), configured and validated according to the Microsoft Winget v1.6.0 schema specification.

## Manifest Structure

```
winget/manifests/w/WebProdigies/Murmur/0.1.0/
├── WebProdigies.Murmur.yaml                # Version manifest
├── WebProdigies.Murmur.installer.yaml      # Installer manifest (x64 NSIS, SHA-256)
└── WebProdigies.Murmur.locale.en-US.yaml   # Localization and app metadata
```

## Validation

All manifests have been verified using the official Windows Package Manager client:

```powershell
winget validate --manifest winget\manifests\w\WebProdigies\Murmur\0.1.0
```

Output:
```text
Manifest validation succeeded.
```

## Submitting to the Official Microsoft Repository (`microsoft/winget-pkgs`)

Until Microsoft indexes the package in their central community repository, running `winget install WebProdigies.Murmur` will return `No package found matching input criteria`.

To publish Murmur to the official Microsoft Winget index:

### Method 1: Using `wingetcreate` (Automated)

1. Install the Microsoft Winget Manifest Creator CLI:
   ```powershell
   winget install Microsoft.WingetCreate
   ```

2. Submit the validated manifests using a GitHub Personal Access Token (PAT with `repo` scope):
   ```powershell
   wingetcreate submit winget\manifests\w\WebProdigies\Murmur\0.1.0 -t <YOUR_GITHUB_PAT>
   ```
   This automatically forks [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs), opens a Pull Request with the validated manifests, and runs Microsoft's automated CI checks.

### Method 2: Manual Pull Request

1. Fork [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs) on GitHub.
2. Copy the folder `winget/manifests/w/WebProdigies/Murmur/0.1.0` to `manifests/w/WebProdigies/Murmur/0.1.0` in your fork.
3. Commit and open a Pull Request titled `New package: WebProdigies.Murmur version 0.1.0`.
4. Once Microsoft's CI merges the PR (typically within 1-2 hours), `winget install WebProdigies.Murmur` will be globally available.

## Local Installation for Development

To test the installation locally before publishing:

1. Enable local manifest support in Winget:
   ```powershell
   winget settings --enable LocalManifestFiles
   ```
2. Run the local manifest install:
   ```powershell
   winget install --manifest winget\manifests\w\WebProdigies\Murmur\0.1.0
   ```
