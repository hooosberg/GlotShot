---
description: Build and Release Process for GlotShot (macOS DMG, Windows, Linux)
---

# Build and Release Workflow

This workflow documents the process for building the application for various platforms, including macOS (with notarization), Windows, and Linux.

## Prerequisites

1.  **Environment Variables**:
    Ensure the following environment variables are set. These are required for macOS notarization.
    You can set these in a `.env` file in the project root (ensure `.env` is git-ignored) or export them in your shell session.

    ```bash
    APPLE_ID=your_email@example.com
    APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password
    APPLE_TEAM_ID=STWPBZG6S7
    ```

2.  **Install Dependencies**:
    Ensure all dependencies are installed.
    ```bash
    npm install
    ```

## Build Commands

### macOS (DMG with Notarization)

Builds the DMG and notarizes it using the provided Apple credentials.

```bash
# Verify environment variables are loaded (if using .env)
export $(grep -v '^#' .env | xargs)

# Run the build
npm run electron:build -- --mac
```

### Windows

Builds the Windows installer.

```bash
npm run electron:build -- --win
```

### Linux

Builds the Linux AppImage and deb.

```bash
npm run electron:build -- --linux
```

### All Platforms (Turbo)

Build for all platforms sequentially.

```bash
export $(grep -v '^#' .env | xargs)
npm run electron:build -- -mwl
```
