# Android 图标规范

> 官方来源: [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

## 核心要求

### Google Play Store 图标

| 属性 | 要求 |
|------|------|
| **尺寸** | 512 × 512 px |
| **格式** | PNG (32-bit) |
| **色彩空间** | sRGB |
| **最大文件大小** | 1024 KB |
| **形状** | 完整正方形 (Google Play 自动应用 30% 圆角遮罩) |
| **阴影** | ❌ 不添加 (Google Play 自动生成) |

### Adaptive Icon (自适应图标)

Android 8.0+ 使用双层结构：

| 层 | 尺寸 (dp) | 尺寸 (xxxhdpi px) | 说明 |
|----|-----------|-------------------|------|
| 前景层 (Foreground) | 108 × 108 | 432 × 432 | 透明 PNG |
| 背景层 (Background) | 108 × 108 | 432 × 432 | 可为纯色或图片 |

### 安全区 (Safe Zone)

⚠️ **关键概念**：

- **可见区域**: 72 × 72 dp (中心区域)
- **遮罩区**: 外围 18 dp 用于动态效果
- **Logo 安全区**: **66 × 66 dp** (最大 Logo 推荐范围)
- **Logo 最小尺寸**: 48 × 48 dp

换算到 1024px 画布:
- 可见区域 ≈ 683 px
- **安全区 ≈ 606 px** (Logo 必须在此圆形/方形内)

## 导出策略

### Google Play Store
- **尺寸**: 512 × 512 px
- **格式**: PNG (完整正方形)
- **处理**: 无遮罩、无投影

### Mipmap 目录 (供 Android Studio 使用)

如需手动生成（不推荐），各密度对应：

| 密度 | 尺寸 |
|------|------|
| mdpi | 48 × 48 |
| hdpi | 72 × 72 |
| xhdpi | 96 × 96 |
| xxhdpi | 144 × 144 |
| xxxhdpi | 192 × 192 |

> 通常只需提供 512px 源图，Android Studio / Gradle 会自动生成。

## 本工具输出

仅输出 **1 个文件**:
```
Android/
└── PlayStore_512x512.png    ← Google Play 商店图标
```

> Adaptive Icon 的前景/背景层通常在 Android Studio 中设置 XML 配置，无需手动裁剪。
