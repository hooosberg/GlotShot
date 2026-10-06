# Skill: Electron macOS App Store 内购上架全流程

> **用途**：可复用的 Claude Code Skill，适用于任何 Electron 项目从"免费 → 内购"改版并上架 Mac App Store 的完整流程。
> **来源**：从 WitNote（成功上架）和 GlotShot 两个项目中提炼。
> **最后更新**：2026-03-28

---

## 一、全流程概览（6 大阶段）

```
阶段 1: Apple Developer 后台配置
    ↓
阶段 2: App Store Connect 内购商品创建
    ↓
阶段 3: 证书 & Provisioning Profile 配置
    ↓
阶段 4: 项目代码 & package.json 配置
    ↓
阶段 5: 构建、签名、验证
    ↓
阶段 6: 上传、TestFlight 测试、提交审核
```

---

## 二、阶段 1：Apple Developer 后台配置

### 1.1 App ID 启用 In-App Purchase

1. 登录 https://developer.apple.com/account/resources/identifiers
2. 找到你的 App ID（如 `com.maohuhu.appstorebuilder`）
3. 点进去 → **Capabilities** 标签
4. 向下滚动找到 **In-App Purchase** → ✅ 勾选
5. 点 **Save**

> ⚠️ **致命陷阱**：`com.apple.developer.in-app-purchase` 是 **iOS-only** 的 entitlement key，**绝对不能**添加到 macOS 的 entitlements.mas.plist 中！macOS 的内购权限通过 Provisioning Profile 自动授予。添加此 key 会导致上传时报 **409 Validation Error**。

### 1.2 App Groups（如需要）

如果 App 需要跨进程数据共享（如 WitNote 的群组存储），需要：
1. Identifiers → App Groups → 创建新 Group（如 `group.com.xxx.appname`）
2. 回到 App ID → Capabilities → 勾选 App Groups → 选择刚创建的 Group

> GlotShot 不需要 App Groups，可跳过此步。

---

## 三、阶段 2：App Store Connect 内购商品创建

### 2.1 创建内购产品

1. 登录 https://appstoreconnect.apple.com
2. 进入你的 App → 左侧 **MONETIZATION** → **In-App Purchases**
3. 点 **Create**（或蓝色 + 号）
4. 填写：

| 字段 | 说明 | 示例 |
|------|------|------|
| **Type** | Non-Consumable（买断型终身） | Non-Consumable |
| **Reference Name** | 内部名称（用户不可见） | `AppName Pro Lifetime` |
| **Product ID** | 代码中使用的 ID，**必须与代码完全一致** | `com.xxx.appname.pro.lifetime` |

### 2.2 配置内购产品详情

创建后进入产品页面，需要完成：

| 配置项 | 操作 |
|--------|------|
| **Price** | 设置价格（如 ¥68 / $9.99） |
| **Localizations** | 至少添加一个语言的显示名称和描述 |
| **Review Screenshot** | 上传一张购买界面截图（审核用） |
| **Review Notes** | 写上审核说明（可选） |

> 所有项填完后，状态应变为 **Ready to Submit**（绿色）。

### 2.3 验证 Product ID 一致性

```bash
# 在代码中搜索 Product ID
grep -rn "PRODUCT_ID\|productId\|product_id" src/ electron/ --include="*.js" --include="*.ts" --include="*.cjs"
```

代码中的 Product ID 必须与 App Store Connect 后台 **完全一致**（大小写敏感）。

### 2.4 沙盒测试账号

1. App Store Connect → **Users and Access** → **Sandbox** 标签
2. 点 + 创建沙盒测试账号
3. 使用一个未注册过 Apple ID 的邮箱
4. 创建后需要在设备上验证该账号

---

## 四、阶段 3：证书 & Provisioning Profile

### 3.1 需要的证书（2个）

| 证书类型 | 用途 | 检查命令 |
|----------|------|----------|
| **Apple Distribution** | 签名 .app 文件 | `security find-identity -v -p codesigning \| grep "Apple Distribution"` |
| **3rd Party Mac Developer Installer** | 签名 .pkg 文件 | `security find-identity -v \| grep "3rd Party Mac Developer Installer"` |

> 如果缺少证书，去 Developer Portal → Certificates → + 创建。

### 3.2 创建/更新 Provisioning Profile

**当 App ID 新增了 Capability（如 In-App Purchase）时，必须重新生成 Profile！**

1. Developer Portal → **Profiles**
2. 找到已有的 Profile → **Edit** → **Generate** → 下载
3. 或创建新 Profile：
   - Type: **Mac App Store → Distribution**
   - App ID: 选择你的 App ID
   - Certificate: 选择 Apple Distribution 证书
   - Profile Name: `AppName_MAS_Distribution`
4. 下载后安装：

```bash
# 复制到项目 build 目录
cp ~/Downloads/AppName_MAS.provisionprofile build/embedded.provisionprofile

# 验证 Profile 包含 IAP 权限
security cms -D -i build/embedded.provisionprofile | grep -A5 "Entitlements"
```

### 3.3 Profile 验证要点

- `application-identifier` 必须匹配 App ID
- 如果使用 App Groups，Profile 中必须包含 `com.apple.security.application-groups`
- Profile 中的权限必须 **覆盖** entitlements 文件中声明的所有权限

---

## 五、阶段 4：项目配置

### 4.1 Entitlements 文件

#### 主进程 `build/entitlements.mas.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <!-- 根据 App 需要添加其他权限 -->
</dict>
</plist>
```

#### 子进程 `build/entitlements.mas.inherit.plist`

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

#### 绝对禁止项

```bash
# 检查 entitlements 中没有 iOS-only 的 key（必须返回空！）
grep "in-app-purchase" build/entitlements.mas.plist
```

### 4.2 package.json MAS 配置

```jsonc
{
  "version": "x.x.x",
  "build": {
    "buildVersion": "x.x.x",        // 每次上传必须递增！
    "appId": "com.xxx.appname",
    "mas": {
      "type": "distribution",
      "target": {
        "target": "mas",
        "arch": ["arm64"]            // Apple Silicon
      },
      "entitlements": "build/entitlements.mas.plist",
      "entitlementsInherit": "build/entitlements.mas.inherit.plist",
      "hardenedRuntime": false,      // MAS 不需要
      "gatekeeperAssess": false,     // MAS 不需要
      "provisioningProfile": "build/embedded.provisionprofile",
      "identity": "Your Name (TEAM_ID)",  // Apple Distribution 证书
      "category": "public.app-category.xxx"
    },
    "pkg": {
      "identity": "HASH_OF_INSTALLER_CERT"  // 3rd Party Mac Developer Installer 证书指纹
    }
  },
  "masReview": {
    "productId": "com.xxx.appname.pro.lifetime",
    "supportUrl": "https://xxx/support.html",
    "privacyUrl": "https://xxx/privacy.html"
  }
}
```

### 4.3 version vs buildVersion 规则

| 字段 | 对应 macOS Key | 规则 |
|------|---------------|------|
| `version` | `CFBundleShortVersionString` | 用户可见版本号，如 1.0.0 |
| `buildVersion` | `CFBundleVersion` | 每次上传必须唯一递增 |

### 4.4 构建脚本 `scripts/build-mas.sh`

```bash
#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       Mac App Store 构建工具                          ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# ── Step 1: 前置条件检查 ──
echo -e "\n${YELLOW}[Step 1] 前置条件检查...${NC}"

VERSION=$(node -p "require('./package.json').version")
BUILD_VERSION=$(node -p "require('./package.json').build.buildVersion || 'NOT SET'")
echo -e "📦 版本号: ${GREEN}$VERSION${NC}"
echo -e "🔢 构建号: ${GREEN}$BUILD_VERSION${NC}"

# 检查 provisioning profile
[ ! -f "build/embedded.provisionprofile" ] && echo -e "${RED}❌ build/embedded.provisionprofile 不存在${NC}" && exit 1
echo -e "✅ Provisioning Profile"

# 检查 entitlements
[ ! -f "build/entitlements.mas.plist" ] && echo -e "${RED}❌ entitlements.mas.plist 不存在${NC}" && exit 1
echo -e "✅ Entitlements"

# 检查 iOS-only key
if grep -q "in-app-purchase" build/entitlements.mas.plist; then
    echo -e "${RED}❌ entitlements 包含 iOS-only 的 in-app-purchase key！${NC}"
    exit 1
fi
echo -e "✅ 无 iOS-only key"

# 检查证书
security find-identity -v -p codesigning | grep -q "Apple Distribution" || { echo -e "${RED}❌ 缺少 Apple Distribution 证书${NC}"; exit 1; }
echo -e "✅ Apple Distribution 证书"

security find-identity -v | grep -q "3rd Party Mac Developer Installer" || echo -e "${YELLOW}⚠️ 未找到 Installer 证书${NC}"

# ── Step 2: 清理旧构建 ──
echo -e "\n${YELLOW}[Step 2] 清理旧构建...${NC}"
rm -rf release/mas-arm64 release/mas dist dist-electron
echo -e "✅ 清理完成"

# ── Step 3: 构建 MAS ──
echo -e "\n${YELLOW}[Step 3] 构建 MAS 版本...${NC}"
npm run build:mas || true

# ── Step 4: 定位输出 / 手动创建 PKG ──
echo -e "\n${YELLOW}[Step 4] 定位输出文件...${NC}"
APP_PATH=$(find release -name "*.app" -type d 2>/dev/null | head -1)
PKG_PATH=$(find release -name "*.pkg" -type f 2>/dev/null | head -1)

[ -z "$APP_PATH" ] && echo -e "${RED}❌ 未找到 APP${NC}" && exit 1
echo -e "📱 APP: ${GREEN}$APP_PATH${NC}"

if [ -z "$PKG_PATH" ]; then
    echo -e "${YELLOW}⚠️ PKG 未自动创建，使用 productbuild...${NC}"
    INSTALLER_CERT=$(security find-identity -v | grep "3rd Party Mac Developer Installer" | head -1 | sed 's/.*"\(.*\)".*/\1/')
    PKG_PATH="release/$(basename "$APP_PATH" .app)-${VERSION}-mas.pkg"
    productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_CERT" "$PKG_PATH"
fi
echo -e "📦 PKG: ${GREEN}$PKG_PATH${NC}"

# ── Step 5: 签名验证 ──
echo -e "\n${YELLOW}[Step 5] 签名验证...${NC}"
codesign --verify --deep --strict --verbose=2 "$APP_PATH" && echo -e "✅ APP 签名有效"
pkgutil --check-signature "$PKG_PATH" && echo -e "✅ PKG 签名有效"

# ── Step 6: 沙盒检查 ──
echo -e "\n${YELLOW}[Step 6] 沙盒检查...${NC}"
SANDBOX=$(codesign -d --entitlements :- "$APP_PATH" 2>/dev/null | grep -c "app-sandbox" || echo "0")
[ "$SANDBOX" -gt 0 ] && echo -e "✅ App Sandbox 已启用" || echo -e "${RED}❌ App Sandbox 未启用${NC}"

# ── 完成 ──
echo -e "\n${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ MAS 构建完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "\n📦 输出: ${BLUE}$PKG_PATH${NC}"
echo -e "\n下一步: 使用 Transporter 上传，或运行:"
echo -e "  xcrun altool --upload-app -f \"$PKG_PATH\" -t macos -u \"\$APPLE_ID\""
```

---

## 六、阶段 5：构建、签名、验证

### 5.1 一键构建

```bash
bash scripts/build-mas.sh
```

### 5.2 手动分步（调试用）

```bash
# 1. 清理
rm -rf release/mas-arm64 dist dist-electron

# 2. 构建
npm run build:mas

# 3. 验证签名
codesign --verify --deep --strict --verbose=2 release/mas-arm64/AppName.app

# 4. 检查 entitlements（确认无 iOS-only key）
codesign -d --entitlements :- release/mas-arm64/AppName.app

# 5. 验证 PKG
pkgutil --check-signature release/mas-arm64/AppName-*.pkg
```

### 5.3 构建日志检查点

日志中必须看到：
```
signing  file=release/mas-arm64/AppName.app platform=mas type=distribution
```

如果看到 `platform=darwin`，说明使用了 DMG 证书而非 MAS 证书。

---

## 七、阶段 6：上传与审核

### 6.1 上传方式

**方式 A：Transporter App（推荐）**
- 打开 Transporter → 拖入 PKG → 点"交付"

**方式 B：命令行**
```bash
xcrun altool --upload-app -f "release/mas-arm64/AppName-x.x.x-arm64.pkg" -t macos -u "$APPLE_ID"
```

### 6.2 上传后验证

- App Store Connect → TestFlight 出现新构建
- 状态从 "Processing" → "Ready to Test"
- 无 "Invalid Binary" 警告

### 6.3 TestFlight 内购测试

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 启动 App | 无 malware 弹窗 |
| 2 | 点购买按钮 | 弹出 App Store 对话框 |
| 3 | 沙盒账号登录 | 成功登录 |
| 4 | 确认购买 | Pro 功能解锁 |
| 5 | 重启 App | Pro 状态保持 |
| 6 | 恢复购买 | 恢复成功 |

### 6.4 提交审核

1. App Store Connect → 你的 App → 新版本
2. **关联内购产品**：版本页 → In-App Purchases and Subscriptions → 添加你创建的内购产品
3. 填写版本信息、截图、描述
4. 提交审核

---

## 八、审核检查清单

### 打包前

- [ ] App ID 已启用 In-App Purchase
- [ ] Provisioning Profile 包含 IAP 权限（重新生成后下载）
- [ ] `grep "in-app-purchase" build/entitlements.mas.plist` 返回空
- [ ] `buildVersion` 已递增
- [ ] Product ID 代码与后台完全一致
- [ ] 已清理旧构建

### 打包后

- [ ] `codesign --verify --deep --strict` 通过
- [ ] `codesign -d --entitlements :-` 无 iOS-only key
- [ ] 日志中 `platform=mas type=distribution`
- [ ] `pkgutil --check-signature` 通过
- [ ] App Sandbox 已启用

### 上传后

- [ ] TestFlight 版本正确
- [ ] 无 malware 弹窗
- [ ] 内购测试通过（购买 + 恢复）
- [ ] Pro 状态重启后保持

### 审核前

- [ ] UI 无 test/mock/beta/debug 字样
- [ ] Support URL 可访问
- [ ] Privacy URL 可访问
- [ ] 有"恢复购买"按钮
- [ ] 购买按钮有 loading 和错误提示
- [ ] 描述/截图无竞品词汇（Android、Google Play）
- [ ] 年龄分级已填写

---

## 九、常见错误速查表

| 错误 | 原因 | 解决 |
|------|------|------|
| `409 Invalid Code Signing Entitlements` | entitlements 含 iOS-only key | 删除 `com.apple.developer.in-app-purchase` |
| "malware" 弹窗 | Profile/entitlements/签名不对齐 | 重新下载 Profile，清理构建 |
| `Build version already exists` | buildVersion 重复 | 递增 `package.json > build.buildVersion` |
| PKG 创建失败 | 缺少 Installer 证书 | 下载安装 3rd Party Mac Developer Installer 证书 |
| `Product not found` | 后台商品未就绪 | 确认状态为 Ready to Submit，ID 完全匹配 |
| `platform=darwin`（非 mas） | 使用了 DMG 证书 | 检查 `build.mas.identity` |
| Profile 权限不匹配 | 新增 Capability 后未重新生成 Profile | 重新 Generate Profile |

---

## 十、关键文件索引（通用模板）

| 文件 | 用途 |
|------|------|
| `build/embedded.provisionprofile` | MAS 分发 Provisioning Profile |
| `build/entitlements.mas.plist` | 主进程 entitlements |
| `build/entitlements.mas.inherit.plist` | 子进程 entitlements |
| `scripts/build-mas.sh` | MAS 一键构建脚本 |
| `package.json > build.mas` | electron-builder MAS 配置 |
| `package.json > masReview` | MAS 审核元数据 |
| `electron/licenseService.*` | 主进程内购服务 |
| `src/shared/license.*` | 共享常量（Product ID） |
| `src/services/LicenseManager.*` | 渲染进程许可证管理 |

---

## 十一、经验教训（来自 WitNote 成功案例）

1. **macOS 不需要在 entitlements 中声明 in-app-purchase** — 这是 iOS-only 的 key，添加会导致 409 错误。这是最常踩的坑。

2. **每次后台新增 Capability 后必须重新生成 Provisioning Profile** — 否则 Profile 权限与 entitlements 不对齐，会导致 malware 弹窗。

3. **buildVersion 必须每次上传递增** — 即使 version 不变，buildVersion 也必须变。

4. **`mas.identity` 和 `mac.identity` 不能混用** — MAS 用 Apple Distribution，DMG 用 Developer ID Application。

5. **构建前必须彻底清理** — `rm -rf release/mas-arm64 dist dist-electron`，残留文件会导致签名异常。

6. **内购测试必须用沙盒账号** — 在 TestFlight 环境中，使用 App Store Connect > Users > Sandbox 中创建的测试账号。

7. **Support URL 不能指向 GitHub Issues** — 必须是独立的网页（如 GitHub Pages）。

8. **UI 不能有 test/mock/beta/debug 字样** — Guideline 2.3.10 会因此被拒。

9. **必须有"恢复购买"按钮** — Guideline 3.1.1 强制要求。

10. **Electron Helper 进程必须用 inherit entitlements 签名** — 否则 GPU/Renderer/Plugin 进程签名失败。
