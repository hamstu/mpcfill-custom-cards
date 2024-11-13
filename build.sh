#!/bin/bash
rm -rf release
deno compile --allow-read --allow-write --target x86_64-apple-darwin --output release/mpcfill-custom-cards-macos-intel main.ts
deno compile --allow-read --allow-write --target aarch64-apple-darwin --output release/mpcfill-custom-cards-macos-arm main.ts
deno compile --allow-read --allow-write --target x86_64-pc-windows-msvc --output release/mpcfill-custom-cards-macos main.ts
