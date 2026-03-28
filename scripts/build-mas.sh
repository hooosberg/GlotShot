#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       GlotShot Mac App Store 构建工具                  ${NC}"
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
[ ! -f "build/entitlements.mas.inherit.plist" ] && echo -e "${RED}❌ entitlements.mas.inherit.plist 不存在${NC}" && exit 1
echo -e "✅ Entitlements 文件"

# 检查 iOS-only key
if grep -q "in-app-purchase" build/entitlements.mas.plist; then
    echo -e "${RED}❌ entitlements 包含 iOS-only 的 in-app-purchase key！${NC}"
    exit 1
fi
echo -e "✅ 无 iOS-only key"

# 检查证书
security find-identity -v -p codesigning | grep -q "Apple Distribution" || { echo -e "${RED}❌ 缺少 Apple Distribution 证书${NC}"; exit 1; }
echo -e "✅ Apple Distribution 证书"

if security find-identity -v | grep -q "3rd Party Mac Developer Installer"; then
    echo -e "✅ 3rd Party Mac Developer Installer 证书"
else
    echo -e "${YELLOW}⚠️ 未找到 Installer 证书，PKG 签名可能失败${NC}"
fi

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

[ -z "$APP_PATH" ] && echo -e "${RED}❌ 未找到 APP 文件${NC}" && ls -la release/ && exit 1
echo -e "📱 APP: ${GREEN}$APP_PATH${NC}"

if [ -z "$PKG_PATH" ]; then
    echo -e "${YELLOW}⚠️ PKG 未自动创建，使用 productbuild...${NC}"
    INSTALLER_CERT=$(security find-identity -v | grep "3rd Party Mac Developer Installer" | grep "STWPBZG6S7" | head -1 | sed 's/.*"\(.*\)".*/\1/')

    if [ -z "$INSTALLER_CERT" ]; then
        echo -e "${RED}❌ 未找到 Installer 证书${NC}"
        exit 1
    fi

    echo -e "使用证书: ${BLUE}$INSTALLER_CERT${NC}"
    PKG_PATH="release/GlotShot-${VERSION}-mas.pkg"

    if productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_CERT" "$PKG_PATH"; then
        echo -e "✅ PKG 创建成功"
    else
        echo -e "${RED}❌ PKG 创建失败${NC}"
        exit 1
    fi
fi

echo -e "📦 PKG: ${GREEN}$PKG_PATH${NC}"

# ── Step 5: 签名验证 ──
echo -e "\n${YELLOW}[Step 5] 签名验证...${NC}"

echo -e "\n📋 验证应用签名..."
if codesign --verify --deep --strict --verbose=2 "$APP_PATH" 2>&1; then
    echo -e "✅ APP 签名有效"
else
    echo -e "${RED}❌ APP 签名验证失败${NC}"
fi

echo -e "\n📋 验证 PKG 签名..."
if pkgutil --check-signature "$PKG_PATH" 2>&1; then
    echo -e "✅ PKG 签名有效"
else
    echo -e "${YELLOW}⚠️ PKG 签名验证警告${NC}"
fi

# ── Step 6: 沙盒检查 ──
echo -e "\n${YELLOW}[Step 6] 沙盒检查...${NC}"

SANDBOX_CHECK=$(codesign -d --entitlements :- "$APP_PATH" 2>/dev/null | grep "app-sandbox" | grep -c "true" || echo "0")
if [ "$SANDBOX_CHECK" -gt 0 ]; then
    echo -e "✅ App Sandbox 已启用"
else
    echo -e "${RED}❌ App Sandbox 未启用 — MAS 要求必须启用${NC}"
fi

echo -e "\n📋 Entitlements 检查:"
codesign -d --entitlements :- "$APP_PATH" 2>/dev/null | grep -E "(app-sandbox|network|files)" | head -10

# ── 完成 ──
echo -e "\n${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ GlotShot MAS 构建完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "\n📦 输出文件: ${BLUE}$PKG_PATH${NC}"
echo -e "\n下一步操作:"
echo -e "  1. 使用 Transporter 上传到 App Store Connect"
echo -e "  2. 或运行: xcrun altool --upload-app -f \"$PKG_PATH\" -t macos -u \"\$APPLE_ID\""
echo ""
