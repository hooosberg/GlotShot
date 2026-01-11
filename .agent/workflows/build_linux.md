---
description: Build Linux Packages (x64 + ARM64)
---

# Build Linux AppImages

Build separate Linux AppImage packages for x64 and ARM64 architectures.

## Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)
- Icon file at `build/icon.png` (copy from `public/icon/DMG_Icon_1024x1024.png` if missing)

## Output
All artifacts output to `release/` directory:
- `GlotShot-{version}-x86_64.AppImage` - Linux x64 AppImage
- `GlotShot-{version}-arm64.AppImage` - Linux ARM64 AppImage

## Build Command

// turbo
```bash
npm run electron:build -- --linux
```

## Notes
- **DO NOT** build `.deb` packages on macOS (requires `fpm` and `dpkg`)
- Each architecture gets its own separate AppImage
- Files are named with architecture suffix automatically via `artifactName` in `package.json`
- `x86_64` is the standard Linux naming for x64 architecture

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
