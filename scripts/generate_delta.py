#!/usr/bin/env python3
"""
Binary Delta Patch Generator for Murmur.

Compares an older release binary with a newly compiled binary using bsdiff
to produce a lightweight delta patch file (.patch).

Usage:
    python scripts/generate_delta.py \
        --old-binary path/to/murmur-v1.2.0.exe \
        --new-binary path/to/murmur-v1.2.1.exe \
        --from-version 1.2.0 \
        --target-version 1.2.1 \
        --platform windows-x86_64 \
        --output dist/patch_win_x64_1.2.0_to_1.2.1.patch \
        --manifest dist/latest.json
"""

import argparse
import hashlib
import json
import os
import sys

try:
    # pyrefly: ignore [missing-import]
    import bsdiff4
except ImportError:
    # Fallback pure-python basic diff or warn if bsdiff4 library isn't installed
    bsdiff4 = None


def compute_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def generate_patch(old_path: str, new_path: str, out_path: str):
    print(f"[*] Generating binary diff: {old_path} -> {new_path}")
    if bsdiff4:
        bsdiff4.file_diff(old_path, new_path, out_path)
    else:
        # If bsdiff4 package is not present in environment, invoke system bsdiff
        ret = os.system(f'bsdiff "{old_path}" "{new_path}" "{out_path}"')
        if ret != 0:
            print("[!] Error: neither 'bsdiff4' python module nor 'bsdiff' CLI was found.", file=sys.stderr)
            print("    Please install with: pip install bsdiff4", file=sys.stderr)
            sys.exit(1)

    old_size = os.path.getsize(old_path)
    new_size = os.path.getsize(new_path)
    patch_size = os.path.getsize(out_path)
    savings = (1.0 - (patch_size / new_size)) * 100.0

    print(f"[✓] Patch created: {out_path}")
    print(f"    - Original Binary : {old_size / 1024 / 1024:.2f} MB")
    print(f"    - New Binary      : {new_size / 1024 / 1024:.2f} MB")
    print(f"    - Delta Patch     : {patch_size / 1024 / 1024:.2f} MB ({savings:.1f}% bandwidth savings)")


def update_manifest(manifest_path: str, platform: str, from_version: str, target_version: str, patch_url: str, target_sha256: str, patch_size: int):
    manifest = {
        "version": target_version,
        "notes": f"Murmur release {target_version}",
        "pub_date": None,
        "platforms": {}
    }

    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            try:
                manifest = json.load(f)
            except Exception:
                pass

    if platform not in manifest["platforms"]:
        manifest["platforms"][platform] = {
            "url": f"https://github.com/webprodigies/murmur/releases/download/v{target_version}/murmur_{target_version}_{platform}.zip",
            "signature": None,
            "patches": []
        }

    patches = manifest["platforms"][platform].get("patches", [])
    # Remove existing patch for same from_version if present
    patches = [p for p in patches if p.get("from_version") != from_version]
    patches.append({
        "from_version": from_version,
        "url": patch_url,
        "target_sha256": target_sha256,
        "size_bytes": patch_size
    })
    manifest["platforms"][platform]["patches"] = patches

    os.makedirs(os.path.dirname(os.path.abspath(manifest_path)), exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"[✓] Updated release manifest: {manifest_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate binary delta patches for Murmur.")
    parser.add_argument("--old-binary", required=True, help="Path to previous version binary")
    parser.add_argument("--new-binary", required=True, help="Path to new version binary")
    parser.add_argument("--from-version", required=True, help="Source version string (e.g. 1.2.0)")
    parser.add_argument("--target-version", required=True, help="Target version string (e.g. 1.2.1)")
    parser.add_argument("--platform", default="windows-x86_64", help="Platform key (windows-x86_64 or darwin-aarch64)")
    parser.add_argument("--output", required=True, help="Output .patch file path")
    parser.add_argument("--manifest", default="dist/latest.json", help="Path to latest.json to update")
    parser.add_argument("--patch-base-url", default="https://github.com/webprodigies/murmur/releases/download", help="Base URL for release downloads")

    args = parser.parse_args()

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    generate_patch(args.old_binary, args.new_binary, args.output)

    target_hash = compute_sha256(args.new_binary)
    patch_filename = os.path.basename(args.output)
    patch_url = f"{args.patch_base_url}/v{args.target_version}/{patch_filename}"
    patch_size = os.path.getsize(args.output)

    update_manifest(args.manifest, args.platform, args.from_version, args.target_version, patch_url, target_hash, patch_size)


if __name__ == "__main__":
    main()
