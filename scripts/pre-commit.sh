#!/bin/sh
# Pre-commit hook to validate SOT headers in Rust files
node scripts/sot.mjs --validate
