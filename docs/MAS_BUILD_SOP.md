# WitNote Mac App Store (MAS) 封装标准流程 (SOP)

> **目标读者**：Claude Code / Codex / 开发者本人
> **最后验证版本**：v1.3.6 (build 1.3.7) — 2026-03-19 构建并上传 TestFlight 成功，内购测试通过，无 malware 弹窗

---

## 0. 前置条件（首次配置 / 环境搭建）

### 0.1 Apple Developer 后台

| 项目 | 要求 | 验证方式 |
|------|------|----------|
| App ID | `com.zikedece.witnote`，已启用 In-App Purchase + App Groups | Developer Portal > Identifiers |
| App Groups | `group.com.zikedece.witnote` | Developer Portal > Identifiers > App Groups |
| 内购商品 | `com.zikedece.witnote.pro.lifetime`，状态为 **Ready to Submit（绿色）** | App Store Connect > App > 内购 |
| Provisioning Profile | App Store Distribution 类型，包含 IAP + App Groups 权限 | Developer Portal > Profiles |
| 沙盒测试账号 | 至少一个已验证的 Sandbox Tester | App Store Connect > Users > Sandbox |

### 0.2 本地钥匙串证书

```bash
# 检查必需的证书
security find-identity -v -p codesigning | grep "Apple Distribution"
security find-identity -v | grep "3rd Party Mac Developer Installer"
```

必须同时拥有：
- **Apple Distribution** 证书（签名 .app）
- **3rd Party Mac Developer Installer** 证书（签名 .pkg）

### 0.3 环境变量

在项目根目录的 `.env` 或 `.env.local` 中配置：
```
APPLE_ID=your@apple.id
APPLE_TEAM_ID=STWPBZG6S7
```

---

## 1. 更新 Provisioning Profile

当后台权限有变更（新增 capability、更换证书等）时，必须重新下载 Profile。

```bash
# 将下载的 Profile 复制到 build 目录
cp ~/Downloads/WitNote_MAS_V2.provisionprofile build/embedded.provisionprofile

# 验证 Profile 内容（确认包含 App Groups、IAP 等权限）
security cms -D -i build/embedded.provisionprofile | grep -A5 "Entitlements"
```

**关键检查点**：Profile 中的 `application-identifier` 和 `com.apple.security.application-groups` 必须与 entitlements 文件一致。

---

## 2. 检查 Entitlements 文件

### 2.1 主进程 entitlements (`build/entitlements.mas.plist`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.files.bookmarks.app-scope</key>
    <true/>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.zikedece.witnote</string>
    </array>
</dict>
</plist>
```

### 2.2 子进程 entitlements (`build/entitlements.mas.inherit.plist`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.inherit</key>
    <true/>
</dict>
</plist>
```

### 2.3 绝对禁止项

> **`com.apple.developer.in-app-purchase` 是 iOS-only 的 key，绝对不能出现在 macOS entitlements 中！**
>
> macOS MAS 的内购权限通过 Provisioning Profile 自动授予，不需要在 entitlements 里声明。
> 添加此 key 会导致上传时报 **409 Validation Error**：
> `Invalid Code Signing Entitlements: key 'com.apple.developer.in-app-purchase' is not supported`

快速检查：
```bash
# 必须返回空（无匹配）
grep "in-app-purchase" build/entitlements.mas.plist
```

### 2.4 核心规则

**entitlements 文件中声明的权限必须是 Profile 中包含权限的子集，且只能包含 macOS 支持的 key。**

| Entitlement Key | iOS | macOS (MAS) | 说明 |
|----------------|-----|-------------|------|
| `com.apple.developer.in-app-purchase` | 需要 | **禁止添加** | macOS 不支持，添加导致 409 |
| `com.apple.security.app-sandbox` | N/A | 必须 | MAS 强制要求 |
| `com.apple.security.application-groups` | 需要 | 需要 | 与 Profile 中 App Groups 一致 |
| `com.apple.security.inherit` | N/A | 子进程必须 | Helper 进程继承沙盒 |

---

## 3. 递增版本号

**每次上传到 TestFlight / App Store Connect 都必须递增 `buildVersion`，否则报 duplicate build error。**

编辑 `package.json`：
```json
{
  "version": "1.3.6",
  "build": {
    "buildVersion": "1.3.7"   // <-- 每次上传递增这个值
  }
}
```

- `version`：用户可见的版本号（如 1.3.6），对应 `CFBundleShortVersionString`
- `buildVersion`：构建号（如 1.3.7），对应 `CFBundleVersion`，每次上传必须唯一

---

## 4. 执行构建

### 4.1 一键构建（推荐）

```bash
bash scripts/build-mas.sh
```

构建脚本自动执行以下步骤：
1. **MAS 合规性检查** — `npm run mas:check`（typecheck + license tests + i18n audit）
2. **前置条件检查** — 版本号、Profile、Entitlements、证书
3. **清理旧构建** — `rm -rf release/mas dist dist-electron`
4. **构建 MAS 版本** — `npm run build:mas`（tsc + vite build + electron-builder --mac mas）
5. **定位输出 / 创建 PKG** — 如果 electron-builder 未生成 PKG，使用 `productbuild` 手动创建
6. **签名验证** — `codesign --verify --deep --strict`
7. **沙盒检查** — 确认 App Sandbox 已启用

### 4.2 手动分步构建（调试用）

```bash
# Step 1: 清理
rm -rf release/mas-arm64 dist dist-electron

# Step 2: 合规检查
npm run mas:check

# Step 3: 构建
npm run build:mas

# Step 4: 验证签名
codesign --verify --deep --strict --verbose=2 release/mas-arm64/WitNote.app

# Step 5: 检查嵌入的 entitlements（确认无 iOS-only key）
codesign -d --entitlements :- release/mas-arm64/WitNote.app

# Step 6: 验证 PKG 签名
pkgutil --check-signature release/mas-arm64/WitNote-*.pkg
```

### 4.3 构建日志关键检查点

构建日志中必须看到以下行，确认 MAS 签名正确：
```
signing  file=release/mas-arm64/WitNote.app platform=mas type=distribution identity=<MAS证书指纹> provisioningProfile=build/embedded.provisionprofile
```

如果看到 `platform=darwin`（而非 `platform=mas`），说明签名使用了 DMG 证书而非 MAS 证书，需要检查 `package.json > build.mas.identity` 配置。

---

## 5. 上传到 App Store Connect

### 5.1 使用 Transporter（推荐）

打开 Transporter App → 拖入 PKG 文件 → 点击"交付"

### 5.2 使用命令行

```bash
xcrun altool --upload-app \
  -f "release/mas-arm64/WitNote-1.3.6-arm64.pkg" \
  -t macos \
  -u "$APPLE_ID"
```

### 5.3 上传后验证

- App Store Connect > TestFlight 中出现新构建版本
- 状态从 "Processing" 变为 "Ready to Test"
- 无 "Invalid Binary" 或 "Missing Compliance" 警告

---

## 6. TestFlight 沙盒测试

### 6.1 测试前准备

```
1. 彻底删除 Mac 上的旧版 WitNote（从 /Applications 和 ~/Library 清理残留）
2. 从 TestFlight 安装最新构建版本
3. 确认 App Store Connect > Users > Sandbox 中有已验证的测试账号
```

### 6.2 测试流程

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 启动 App | 无 "malware" 弹窗，正常启动 |
| 2 | 点击购买按钮 | 弹出 App Store 登录/确认对话框 |
| 3 | 使用沙盒账号登录 | 登录成功 |
| 4 | 确认购买 | 显示 "购买成功"，Pro 功能解锁 |
| 5 | 退出并重新打开 App | Pro 状态保持 |
| 6 | 点击 "恢复购买" | 恢复成功，Pro 状态保持 |

### 6.3 常见测试问题

| 问题 | 原因 | 解决 |
|------|------|------|
| "Apple could not verify... malware" 弹窗 | Profile/entitlements/签名三者不对齐 | 见第 8 节深度分析 |
| "Product not found" | 后台商品未 Ready 或 Product ID 不匹配 | 确认后台状态为绿色，Product ID 完全一致 |
| 沙盒账号无法登录 | 账号未验证或区域不匹配 | 在 App Store Connect 重新验证沙盒账号 |
| 购买后 Pro 未解锁 | 代码中 Product ID 与后台不一致 | 检查 `masReview.productId` |

---

## 7. 提交审核前检查清单

### 7.1 打包前

- [ ] `npm run mas:check` 全部通过
- [ ] Provisioning Profile 已更新，`security cms -D -i` 确认包含所需权限
- [ ] `grep "in-app-purchase" build/entitlements.mas.plist` 返回空
- [ ] entitlements 中 App Groups ID 与 Profile 完全一致（大小写敏感）
- [ ] `buildVersion` 已递增
- [ ] 代码中 Product ID 与 App Store Connect 后台一致
- [ ] 已彻底清理旧构建

### 7.2 打包后

- [ ] `codesign --verify --deep --strict --verbose=2` 显示 `valid on disk`
- [ ] `codesign -d --entitlements :-` 确认无 iOS-only key
- [ ] 构建日志中签名行显示 `platform=mas type=distribution`
- [ ] `pkgutil --check-signature` PKG 签名有效
- [ ] App Sandbox 已启用
- [ ] Helper 进程（GPU、Renderer、Plugin）签名均有效

### 7.3 上传后

- [ ] TestFlight 显示正确版本号和构建号
- [ ] **先删旧 App** → TestFlight 安装新版
- [ ] 无 malware 弹窗
- [ ] 内购测试通过（购买 + 恢复）
- [ ] Pro 状态退出后重启仍保持

### 7.4 审核前

- [ ] UI 无 test/mock/beta/debug 字样（"Test connection" 等功能性用词除外）
- [ ] Support URL 可访问：`npm run mas:url:health`
- [ ] Privacy URL 可访问
- [ ] App Store 描述/截图无 Android/Google Play 等竞品词汇
- [ ] `.env` 文件未被打包进 ASAR
- [ ] 年龄分级问卷已填写
- [ ] 有 "恢复购买" 按钮
- [ ] 购买按钮有 loading 状态和错误提示

---

## 8. 常见错误与解决方案

### 8.1 `409 Invalid Code Signing Entitlements`

```
Validation failed (409)
key 'com.apple.developer.in-app-purchase' in '...' is not supported
```

**原因**：entitlements 包含 iOS-only 的 key
**解决**：从 `build/entitlements.mas.plist` 删除 `com.apple.developer.in-app-purchase`

### 8.2 "Apple could not verify... is free of malware" 弹窗

**深度根因分析**（可能同时存在多个原因）：

1. **Profile 权限不匹配**
   - 旧 Profile 不包含 App Groups / IAP 权限，但 entitlements 声明了
   - 系统检测到不一致，视为签名被篡改
   - **修复**：下载包含所有 capability 的新 Profile

2. **electron-builder 双重签名**
   - electron-builder 先用 `mac.identity`（DMG 证书）签名，再用 `mas.identity`（MAS 证书）签名
   - 如果两个 identity 冲突，第一次签名的残留导致最终签名不一致
   - **修复**：确保 `mac.identity` 和 `mas.identity` 分别配置正确

3. **Helper 进程签名不完整**
   - Electron 含多个 Helper（GPU、Renderer、Plugin）
   - `entitlementsInherit` 缺失或内容错误导致 Helper 签名异常
   - **修复**：确保 `build/entitlements.mas.inherit.plist` 包含 `app-sandbox` + `inherit`

4. **旧构建缓存干扰**
   - `release/` 和 `dist-electron/` 残留旧签名文件混入新构建
   - **修复**：`rm -rf release/mas-arm64 dist dist-electron`

5. **buildVersion 未递增**
   - TestFlight 缓存旧版本签名信息
   - **修复**：递增 `buildVersion`

**关键结论**：弹窗消失的真正原因是 **Profile 权限、entitlements 声明、签名证书三者完全对齐**。

### 8.3 `Build version already exists`

**原因**：`buildVersion` 与已上传的构建重复
**解决**：在 `package.json > build.buildVersion` 中递增

### 8.4 PKG 创建失败

**原因**：缺少 `3rd Party Mac Developer Installer` 证书
**解决**：从 Developer Portal 下载并安装到钥匙串

### 8.5 `Product not found`

**原因**：App Store Connect 后台商品未就绪
**解决**：确认商品状态为绿色 "Ready to Submit"，Product ID 完全匹配

---

## 9. MAS 审核被拒常见原因

### Guideline 2.3.10 — 测试词汇残留
- UI 中出现 "test"/"mock"/"beta"/"debug"
- **WitNote 案例**：Paywall 残留 `mockUpgradeNow`、`testToggleTitle`
- **修复**：`grep -rn "mock\|test.*toggle\|beta\|debug" src/locales/ src/components/`

### Guideline 3.1.1 — 内购
- 缺少 "恢复购买" 按钮
- 购买按钮无 loading/error 状态
- Product ID 与后台不一致

### Guideline 5.0 — App Sandbox
- 未启用 App Sandbox
- 子进程 spawn 未签名可执行文件
- **WitNote 案例**：Ollama CLI 在 MAS 模式通过 `isMAS()` 守卫禁用

### Guideline 1.5 — Support URL
- 不能指向 GitHub Issues，必须是独立页面
- **WitNote 案例**：创建了 `docs/support.html` 和 `docs/privacy.html`

### Guideline 4.0 — macOS 行为
- Dock 点击必须恢复窗口（`activate` 事件）
- 关闭窗口不退出应用
- 单实例锁（`requestSingleInstanceLock()`）

### Guideline 2.4.5 — 子进程
- 不能 spawn 未签名的可执行文件
- 本地 CLI 工具在 MAS 模式必须禁用

---

## 10. 项目关键文件索引

| 文件 | 用途 |
|------|------|
| `build/embedded.provisionprofile` | MAS 分发用 Provisioning Profile |
| `build/entitlements.mas.plist` | 主进程 entitlements（App Sandbox + 权限声明） |
| `build/entitlements.mas.inherit.plist` | 子进程 entitlements（继承沙盒） |
| `build/entitlements.mac.plist` | DMG 分发用 entitlements（非 MAS） |
| `scripts/build-mas.sh` | MAS 一键构建脚本 |
| `scripts/notarize.js` | DMG 公证脚本（MAS 不使用） |
| `package.json > build.mas` | electron-builder MAS 配置 |
| `package.json > masReview` | MAS 审核元数据（Product ID、Support/Privacy URL） |
| `electron/licenseService.ts` | 主进程内购服务（MAS / dev-stub / unsupported 三模式） |
| `src/services/LicenseManager.ts` | 渲染进程许可证管理 |
| `src/components/PaywallDialog.tsx` | 购买/恢复 UI 组件 |
| `scripts/mas/check.js` | MAS 合规性检查脚本 |
| `reports/mas/` | MAS 审核报告输出目录 |

---

## 11. electron-builder MAS 配置参考

```jsonc
// package.json > build.mas
{
  "mas": {
    "type": "distribution",
    "target": {
      "target": "mas",
      "arch": ["arm64"]
    },
    "entitlements": "build/entitlements.mas.plist",
    "entitlementsInherit": "build/entitlements.mas.inherit.plist",
    "hardenedRuntime": false,          // MAS 不需要 hardened runtime
    "gatekeeperAssess": false,         // MAS 不需要 Gatekeeper 评估
    "provisioningProfile": "build/embedded.provisionprofile",
    "category": "public.app-category.productivity",
    "minimumSystemVersion": "12.0",
    "identity": "hu Huambo (STWPBZG6S7)",  // MAS 分发证书
    "binaries": [],                    // 无额外二进制
    "extraResources": [
      { "from": "build/zh_CN.lproj", "to": "zh_CN.lproj" },
      { "from": "build/en.lproj", "to": "en.lproj" }
    ]
  },
  "pkg": {
    "identity": "79D525387C81F7E0CC16A21EDCEFB5CD320E5146"  // 3rd Party Mac Developer Installer 证书
  }
}
```

**注意**：`mas.identity` 和 `mac.identity` 是两个不同的证书，不能混用：
- `mac.identity`：用于 DMG 分发（Developer ID Application）
- `mas.identity`：用于 MAS 分发（Apple Distribution / 3rd Party Mac Developer Application）

---

## 12. 快速参考命令

```bash
# === 一键构建 ===
bash scripts/build-mas.sh

# === 合规检查 ===
npm run mas:check              # typecheck + license tests + i18n audit
npm run mas:url:health         # 检查 Support/Privacy URL 可达性
npm run mas:evidence           # 生成审核证据报告

# === 签名验证 ===
codesign --verify --deep --strict --verbose=2 release/mas-arm64/WitNote.app
codesign -d --entitlements :- release/mas-arm64/WitNote.app
pkgutil --check-signature release/mas-arm64/WitNote-*.pkg

# === Profile 检查 ===
security cms -D -i build/embedded.provisionprofile

# === Entitlements 安全检查 ===
grep "in-app-purchase" build/entitlements.mas.plist  # 必须返回空！

# === 上传 ===
xcrun altool --upload-app -f "release/mas-arm64/WitNote-1.3.6-arm64.pkg" -t macos -u "$APPLE_ID"
```

---

## 变更日志

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-03-19 | v1.3.6 (build 1.3.7) | 初始版本：内购测试通过，malware 弹窗修复，完整 SOP 文档化 |
| 2026-03-19 | v1.3.6 (build 1.3.8) | 补齐 viewer.fontSize 翻译 key（12 个语言文件） |
| 2026-03-19 | v1.3.6 (build 1.3.9) | 标准流程封装 |
