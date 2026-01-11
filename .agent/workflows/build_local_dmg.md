---
description: Build Local DMG without Notarization (for testing)
---

This workflow builds a local macOS DMG installer without code signing or notarization.
Use this for local testing before submitting for notarization.

# Prerequisites

Ensure the following assets are present:
- `public/icon/AppIcon_1024x1024.png` (App Icon)
- `public/icon/DMG_Icon_1024x1024.png` (DMG Volume Icon)
- `assets/dmg_background.png` (DMG Window Background, 1080x720 for Retina)

# Build Command

// turbo
npm run electron:build && mkdir -p release && cp -f dist/*.dmg dist/*.blockmap release/ 2>/dev/null || true

# Verification

1. Open the generated DMG file: `open release/GlotShot-*.dmg`
2. Verify the DMG window displays correctly:
   - Window size should be 540x360
   - Background should fill the entire window
   - App icon on the left, Applications folder on the right
   - Arrow in the center indicating "drag to install"
