---
description: Upload release packages to GitHub Releases
---

# Upload Packages to GitHub Releases

Upload built packages to GitHub Releases page for distribution.

## Prerequisites
- All packages built and available in `release/` directory
- GitHub CLI installed (`brew install gh`) and authenticated (`gh auth login`)

## Packages to Upload
- `GlotShot-{version}-arm64.dmg` - macOS Apple Silicon
- `GlotShot-{version}-x64.exe` - Windows x64
- `GlotShot-{version}-arm64.exe` - Windows ARM64
- `GlotShot-{version}-x86_64.AppImage` - Linux x64
- `GlotShot-{version}-arm64.AppImage` - Linux ARM64

## Upload Process

### 1. Create Release on GitHub
```bash
gh release create v{version} --title "GlotShot v{version}" --notes-file RELEASE_NOTES.md
```

### 2. Upload Packages
// turbo
```bash
gh release upload v{version} release/GlotShot-{version}-*.dmg release/GlotShot-{version}-*.exe release/GlotShot-{version}-*.AppImage --clobber
```

## Release Notes Template
Create `RELEASE_NOTES.md` with:

```markdown
# GlotShot v{version}

## Downloads

| Platform | Architecture | Download |
|----------|--------------|----------|
| macOS | Apple Silicon | GlotShot-{version}-arm64.dmg |
| Windows | x64 | GlotShot-{version}-x64.exe |
| Windows | ARM64 | GlotShot-{version}-arm64.exe |
| Linux | x64 | GlotShot-{version}-x86_64.AppImage |
| Linux | ARM64 | GlotShot-{version}-arm64.AppImage |

## What's New
- [List changes here]

## System Requirements
- macOS 11.0+ (Big Sur or later)
- Windows 10+ (64-bit)
- Linux: Ubuntu 20.04+ or compatible
```

## Notes
- **DO NOT** use `git push` for release packages (GitHub file size limit is 100MB)
- Always use GitHub Releases for distributing installers
- Use `--clobber` flag to replace existing files when re-uploading
