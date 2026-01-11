---
description: Build Linux Packages (x64 + ARM64)
---

This workflow builds Linux packages (AppImage and deb) for both x64 and ARM64 architectures.

# Prerequisites

Ensure the icon is present:
- `build/icon.png`

# Build Command

Run the following command to build Linux packages.

// turbo
npm run build && npx electron-builder --linux --x64 --arm64 && mkdir -p release && mv dist/*.AppImage dist/*.deb dist/*.snap release/ 2>/dev/null || true
