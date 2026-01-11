---
description: Build Windows Installers (x64 + ARM64)
---

This workflow builds Windows installers for both x64 and ARM64 architectures.

# Prerequisites

Ensure the icon is present:
- `build/icon.png` (will be auto-converted to .ico by electron-builder)

**Note:** Building Windows installers from macOS may require Wine. For production builds, consider using GitHub Actions or a Windows environment.

# Build Command

Run the following command to build Windows installers.

// turbo
npm run build && npx electron-builder --win --x64 --arm64 && mkdir -p release && mv dist/*.exe dist/*.blockmap release/ 2>/dev/null || true
