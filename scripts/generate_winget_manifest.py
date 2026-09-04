#!/usr/bin/env python3
"""
Winget Manifest Generator for Murmur.

Generates official Windows Package Manager (Winget) multi-YAML manifests
for submission to the microsoft/winget-pkgs community repository.

Usage:
    python scripts/generate_winget_manifest.py \
        --version 0.1.0 \
        --installer-url https://github.com/webprodigies/murmur/releases/download/v0.1.0/murmur_0.1.0_x64-setup.exe \
        --installer-sha256 <SHA256_HEX> \
        --output-dir winget/manifests/w/WebProdigies/Murmur/0.1.0
"""

import argparse
import os


def generate_manifests(version: str, installer_url: str, sha256: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

    pkg_id = "WebProdigies.Murmur"

    version_yaml = f"""# yaml-language-server: $schema=https://aka.ms/winget-manifest.version.1.6.0.schema.json

PackageIdentifier: {pkg_id}
PackageVersion: {version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: 1.6.0
"""

    installer_yaml = f"""# yaml-language-server: $schema=https://aka.ms/winget-manifest.installer.1.6.0.schema.json

PackageIdentifier: {pkg_id}
PackageVersion: {version}
InstallerType: nullsoft
Scope: user
InstallModes:
  - silent
  - interactive
UpgradeBehavior: install
Installers:
  - Architecture: x64
    InstallerType: nullsoft
    InstallerUrl: {installer_url}
    InstallerSha256: {sha256}
    ProductCode: Murmur
ManifestType: installer
ManifestVersion: 1.6.0
"""

    locale_yaml = f"""# yaml-language-server: $schema=https://aka.ms/winget-manifest.defaultLocale.1.6.0.schema.json

PackageIdentifier: {pkg_id}
PackageVersion: {version}
PackageLocale: en-US
Publisher: WebProdigies
PublisherUrl: https://murmur.app
PublisherSupportUrl: https://github.com/webprodigies/murmur/issues
PrivacyUrl: https://murmur.app/privacy
Author: WebProdigies
PackageName: Murmur
PackageUrl: https://murmur.app
License: MIT
LicenseUrl: https://github.com/webprodigies/murmur/blob/main/LICENSE
Copyright: Copyright (c) 2026 WebProdigies
ShortDescription: Private, local AI voice dictation that never leaves your computer.
Description: |
  Murmur is a private, local-first voice dictation application for macOS and Windows.
  It runs OpenAI Whisper models locally on your GPU (Metal / DirectML) with sub-200ms latency,
  app-aware formatting, and custom phonetic dictionaries. Zero cloud audio upload.
Moniker: murmur
Tags:
  - dictation
  - speech-to-text
  - voice-typing
  - whisper
  - local-ai
  - privacy
ReleaseNotesUrl: https://github.com/webprodigies/murmur/releases/tag/v{version}
ManifestType: defaultLocale
ManifestVersion: 1.6.0
"""

    with open(os.path.join(output_dir, f"{pkg_id}.yaml"), "w", encoding="utf-8") as f:
        f.write(version_yaml)

    with open(os.path.join(output_dir, f"{pkg_id}.installer.yaml"), "w", encoding="utf-8") as f:
        f.write(installer_yaml)

    with open(os.path.join(output_dir, f"{pkg_id}.locale.en-US.yaml"), "w", encoding="utf-8") as f:
        f.write(locale_yaml)

    print(f"[✓] Successfully generated Winget manifests in {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Generate Winget manifests for Murmur.")
    parser.add_argument("--version", required=True, help="Release version (e.g. 0.1.0)")
    parser.add_argument("--installer-url", required=True, help="Download URL of the Windows NSIS/MSI installer")
    parser.add_argument("--installer-sha256", default="0" * 64, help="SHA256 checksum of the installer")
    parser.add_argument("--output-dir", default=None, help="Directory to place the YAML manifests")

    args = parser.parse_args()

    out_dir = args.output_dir or f"winget/manifests/w/WebProdigies/Murmur/{args.version}"
    generate_manifests(args.version, args.installer_url, args.installer_sha256, out_dir)


if __name__ == "__main__":
    main()
