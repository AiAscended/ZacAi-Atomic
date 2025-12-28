#!/bin/bash
set -euo pipefail

# Build script for kernel_methods Rust crate into WASM (web target)
# Requires: wasm-pack (https://rustwasm.github.io/wasm-pack/)

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
CRATE_DIR="$ROOT_DIR/packages/system-kernel-methods/rust"
OUT_DIR="$ROOT_DIR/packages/system-kernel-methods/wasm_dist"

echo "Building kernel_methods (Rust) -> WASM"
cd "$CRATE_DIR"

if ! command -v wasm-pack >/dev/null 2>&1; then
  echo "wasm-pack not found. Install with 'cargo install wasm-pack' or visit https://rustwasm.github.io/wasm-pack/" >&2
  exit 1
fi

wasm-pack build --release --target web --out-dir "$OUT_DIR" || {
  echo "wasm-pack build failed" >&2
  exit 1
}

echo "WASM build output in: $OUT_DIR"
