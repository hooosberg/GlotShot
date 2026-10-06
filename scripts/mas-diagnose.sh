#!/bin/bash
# MAS 打包诊断脚本
# 用法: ./scripts/mas-diagnose.sh

echo "=== MAS 打包诊断 ==="
echo "时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "[1] 检查 Provisioning Profile..."
if [ -f "embedded.provisionprofile" ]; then
  pass "embedded.provisionprofile 存在"
  # 显示 Profile 详情
  security cms -D -i embedded.provisionprofile 2>/dev/null | grep -E "Name|TeamIdentifier|CreationDate|ExpirationDate" | head -4
else
  fail "缺少 embedded.provisionprofile - 这是致命错误！"
  echo "    请从 Apple Developer Portal 下载 Mac App Store Connect Profile"
fi

echo ""
echo "[2] 检查 Entitlements 文件..."
[ -f "build/entitlements.mas.plist" ] && pass "entitlements.mas.plist" || fail "缺少 entitlements.mas.plist"
[ -f "build/entitlements.mas.inherit.plist" ] && pass "entitlements.mas.inherit.plist" || fail "缺少 entitlements.mas.inherit.plist"

echo ""
echo "[3] 检查证书..."
if security find-identity -v -p codesigning 2>/dev/null | grep -q "Apple Distribution"; then
  pass "Apple Distribution 证书"
  security find-identity -v -p codesigning | grep "Apple Distribution" | head -1
else
  fail "缺少 Apple Distribution 证书"
fi

if security find-identity -v -p basic 2>/dev/null | grep -q "3rd Party Mac Developer Installer"; then
  pass "3rd Party Mac Developer Installer 证书"
  security find-identity -v -p basic | grep "3rd Party Mac Developer Installer" | head -1
else
  fail "缺少 3rd Party Mac Developer Installer 证书"
fi

echo ""
echo "[4] 检查 package.json 配置..."
if [ -f "package.json" ]; then
  echo "版本号: $(grep '"version"' package.json | head -1)"
  
  if grep -q '"mas"' package.json; then
    pass "package.json 包含 MAS 配置"
  else
    fail "package.json 缺少 MAS 配置块"
  fi
  
  if grep -q '"build:mas"' package.json; then
    pass "存在 build:mas 脚本"
  else
    warn "缺少 build:mas 脚本"
  fi
fi

echo ""
echo "[5] 检查构建输出..."
if [ -d "release/mas-arm64" ]; then
  pass "release/mas-arm64 存在"
  
  APP_PATH=$(find release/mas-arm64 -name "*.app" -maxdepth 1 | head -1)
  if [ -n "$APP_PATH" ]; then
    pass "找到 App: $(basename "$APP_PATH")"
    
    if [ -f "$APP_PATH/Contents/embedded.provisionprofile" ]; then
      pass "App 内已嵌入 Provisioning Profile"
    else
      fail "App 内缺少 embedded.provisionprofile - 验证会失败！"
    fi
  fi
else
  warn "release/mas-arm64 不存在 (需要先运行 build:mas)"
fi

echo ""
echo "[6] 检查 .gitignore..."
if grep -q "embedded.provisionprofile" .gitignore 2>/dev/null; then
  pass ".gitignore 已忽略 embedded.provisionprofile"
else
  warn ".gitignore 未忽略 embedded.provisionprofile (敏感文件可能被提交)"
fi

echo ""
echo "=== 诊断完成 ==="
