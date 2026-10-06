# Apple 图标规范

> 官方来源: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## 核心要求

| 属性 | 要求 |
|------|------|
| **尺寸** | 1024 × 1024 px |
| **格式** | PNG |
| **色彩空间** | sRGB |
| **透明度** | ❌ 不允许，所有像素必须不透明 |
| **圆角** | ❌ 不需要处理，系统自动应用 Squircle 遮罩 |

## 导出策略

### App Store / MAS 图标

提交给 App Store Connect 的图标：
- **尺寸**: 1024 × 1024 px
- **格式**: PNG (不透明)
- **圆角**: 不处理 (Apple 自动裁剪)

### macOS DMG 图标

用于安装包/桌面快捷方式的图标：
- **尺寸**: 1024 × 1024 px (含视觉修正)
- **视觉修正**: macOS 图标内容区域约为 **824 × 824 px**，周围预留投影空间
- **圆角**: 需预处理为 Squircle 形状
- **投影**: 可选添加 macOS 风格投影

### Xcode 自动生成

Xcode 从 1024px 源图自动生成以下尺寸：

**iOS:**
| 用途 | @2x | @3x |
|------|-----|-----|
| Home Screen (iPhone) | 120px | 180px |
| Home Screen (iPad) | 152px | - |
| Home Screen (iPad Pro) | 167px | - |
| Spotlight | 80px | 120px |
| Settings | 58px | 87px |

**macOS:**
- @1x: 16, 32, 128, 256, 512
- @2x: 32, 64, 256, 512, 1024

## 本工具输出

仅输出 **1 个文件**:
```
Apple/
└── AppIcon_1024x1024.png    ← MAS 完整图标
```

> Xcode 或 App Wrapper 会自动从此源图生成所有尺寸。DMG 图标如有需要可手动处理 Squircle + 投影。
