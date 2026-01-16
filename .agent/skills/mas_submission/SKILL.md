---
name: Mac App Store Submission Checklist
description: MAS 提交前自检清单，整合苹果审核要求和常见拒审原因
version: 1.0.0
tags: [mac, electron, app-store, review]
---

# Mac App Store 提交自检技能

在提交 Mac App Store (MAS) 之前，执行此自检清单以避免常见拒审问题。

## 🚨 常见拒审原因

根据 Apple 审核指南和历史经验，以下是最常见的拒审原因：

| 类别 | 问题 | 解决方案 |
|:-----|:-----|:---------|
| **隐私** | 未声明数据收集 | 添加隐私政策，App 内可访问 |
| **完整性** | 崩溃/未完成功能 | 全面测试，移除占位符 |
| **UI/UX** | 不符合 HIG | 遵循 Human Interface Guidelines |
| **元数据** | 描述不准确 | 确保描述与功能一致 |
| **性能** | 启动慢/响应差 | 优化加载时间 |

---

## ✅ 自检清单

### 1. 应用完整性

```bash
# 检查构建是否成功
npm run build

# 检查 MAS 签名
codesign -dv --verbose=4 "release/mas/YourApp.app"

# 验证沙箱
codesign -d --entitlements :- "release/mas/YourApp.app"
```

- [ ] 应用可以正常启动
- [ ] 所有功能都可正常使用
- [ ] 无崩溃或卡顿
- [ ] 无控制台错误
- [ ] 无占位符内容（TODO、TBD、Lorem ipsum）

### 2. 图标要求

Mac App Store 图标要求：

| 规格 | 要求 |
|:-----|:-----|
| 尺寸 | 1024 × 1024 像素 |
| 格式 | PNG，无透明度 |
| 形状 | 正方形（满铺），系统自动添加圆角 |
| 内容 | 无透明区域，无阴影（系统自动添加） |

```bash
# 检查图标规格
sips -g all public/icon/AppIcon_1024x1024.png
```

- [ ] 图标尺寸正确 (1024x1024)
- [ ] 无透明通道
- [ ] 满铺设计（无内边距）
- [ ] 视觉清晰，辨识度高

### 3. 截图要求

| 尺寸 | 适用设备 |
|:-----|:---------|
| 2880 × 1800 | MacBook Pro 15" |
| 2560 × 1600 | MacBook Pro 13" |
| 1280 × 800 | MacBook Air |

- [ ] 截图为 PNG 或 JPEG 格式
- [ ] 72 DPI 分辨率
- [ ] 展示实际 App 界面
- [ ] 无边框或设备外框
- [ ] 无用户隐私数据

### 4. 元数据检查

- [ ] **应用名称**：简洁，无关键词堆砌
- [ ] **副标题**：简短描述核心功能
- [ ] **描述**：准确描述功能，无夸大
- [ ] **分类**：选择正确的类别
- [ ] **隐私政策 URL**：可访问，内容完整

### 5. macOS 特定要求

```bash
# 验证 Info.plist
plutil -lint "release/mas/YourApp.app/Contents/Info.plist"

# 检查 entitlements
codesign -d --entitlements :- "release/mas/YourApp.app" | plutil -lint -
```

- [ ] CFBundleVersion 每次提交递增
- [ ] CFBundleShortVersionString 格式正确 (x.y.z)
- [ ] 沙箱已启用 (`com.apple.security.app-sandbox = true`)
- [ ] 仅请求必要权限

### 6. Electron 特定检查

```bash
# 检查 node_modules 是否正确打包
ls -la "release/mas/YourApp.app/Contents/Resources/app/node_modules" 2>/dev/null && echo "警告: node_modules 存在" || echo "OK: node_modules 未打包"

# 检查敏感文件
grep -r "API_KEY\|SECRET\|PASSWORD" "release/mas/YourApp.app/Contents/Resources/app/"
```

- [ ] 未打包开发依赖
- [ ] 无硬编码密钥/密码
- [ ] Electron 版本为稳定版

### 7. macOS 设计规范 (Guideline 4)

> ⚠️ **重要**: Apple 审核经常因此拒绝应用！

**窗口管理检查**:
```javascript
// electron/main.cjs 必须包含以下代码

// 1. activate 事件处理 - 点击 Dock 图标时重新显示窗口
app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 2. 窗口关闭事件 - 正确清理 mainWindow 引用
mainWindow.on('closed', () => {
  mainWindow = null;
});

// 3. 窗口菜单 - 必须有"显示主窗口"选项
{
  label: '窗口',
  submenu: [
    { label: '显示主窗口', click: () => { mainWindow.show(); } },
    // ...
  ]
}
```

**检查清单**:
- [ ] `activate` 事件正确处理(点击 Dock 可重新打开窗口)
- [ ] 窗口菜单有"显示主窗口"选项
- [ ] 关闭窗口后 mainWindow 设为 null
- [ ] 窗口关闭后应用不会"假死"

---

## 🔧 构建命令

```bash
# 1. 清理旧构建
rm -rf release/mas

# 2. 构建 Vite 资源
npm run build

# 3. 构建 MAS 包
electron-builder --mac mas --config.mac.identity="3rd Party Mac Developer Application: YOUR_NAME (TEAM_ID)"

# 4. 生成 pkg
productbuild --component "release/mas/YourApp.app" /Applications --sign "3rd Party Mac Developer Installer: YOUR_NAME (TEAM_ID)" "release/YourApp.pkg"

# 5. 验证 pkg
xcrun altool --validate-app -f "release/YourApp.pkg" -t osx -u "your@email.com"

# 6. 上传
xcrun altool --upload-app -f "release/YourApp.pkg" -t osx -u "your@email.com"
```

---

## 📋 快速自检命令

```bash
# 一键检查（复制到终端执行）
echo "=== MAS 自检 ==="
echo "1. 检查图标..."
sips -g pixelWidth -g pixelHeight public/icon/AppIcon_1024x1024.png
echo "2. 检查版本..."
grep -E "version|CFBundle" package.json electron/main.cjs 2>/dev/null | head -5
echo "3. 检查敏感词..."
grep -rn "TODO\|FIXME\|XXX" src/ --include="*.jsx" --include="*.js" | head -10
echo "=== 完成 ==="
```

---

## 📚 参考资源

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines - macOS](https://developer.apple.com/design/human-interface-guidelines/macos)
- [App Icon Specifications](https://developer.apple.com/design/human-interface-guidelines/app-icons)
