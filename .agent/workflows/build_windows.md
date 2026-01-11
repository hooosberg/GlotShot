---
description: Build Windows Installers (x64 + ARM64)
---

# Build Windows Installers

Build separate Windows NSIS installers for x64 and ARM64 architectures.

## Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)
- Icon file at `build/icon.png` (copy from `public/icon/DMG_Icon_1024x1024.png` if missing)

## Output
All artifacts output to `release/` directory:
- `GlotShot-{version}-x64.exe` - Windows x64 installer
- `GlotShot-{version}-arm64.exe` - Windows ARM64 installer

## Build Command

// turbo
```bash
npm run electron:build -- --win
```

## Notes
- **DO NOT** use combined architecture builds (multiple archs in one target)
- **DO NOT** build portable versions
- Each architecture gets its own separate installer
- Files are named with architecture suffix automatically via `artifactName` in `package.json`

## Cross-Platform Asset Handling

> **IMPORTANT**: When loading images/assets in React components, always use ES module imports instead of absolute paths.

❌ **WRONG** (only works on macOS):
```jsx
<img src="/icon/logo.png" />
```

✅ **CORRECT** (works on all platforms):
```jsx
import logo from '../../public/icon/logo.png';
// ...
<img src={logo} />
```

Vite bundles imported assets into `dist/assets/`, ensuring cross-platform compatibility.
