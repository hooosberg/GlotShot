---
description: Build and Notarize macOS DMG Installer
---

This workflow builds the macOS DMG installer and notarizes it using the configured Apple credentials.

# Prerequisites

Ensure the `.env` file exists in the project root with the following variables:
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

And ensure the assets are present:
- `public/icon/AppIcon_1024x1024.png` (App Icon)
- `public/icon/DMG_Icon_1024x1024.png` (DMG Volume Icon)
- `assets/dmg_background.png` (DMG Window Background)

# Build Command

Run the following command to build and notarize the application.

// turbo
export $(cat .env | xargs) && npm run electron:build && mkdir -p release && mv dist/*.dmg dist/*.blockmap release/ && mv dist/mac-arm64/*.app release/ && mv dist/builder-debug.yml dist/builder-effective-config.yaml release/
