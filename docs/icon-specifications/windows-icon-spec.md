# Windows 图标规范

> 官方来源: [Microsoft Windows App Icons](https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design)

## 核心要求

| 属性 | 要求 |
|------|------|
| **格式** | ICO (多尺寸容器) 或 PNG |
| **透明度** | ✅ 推荐透明背景 |
| **色深** | 32-bit (含 Alpha 通道) |
| **最大尺寸** | 256 × 256 px |

## ICO 文件结构

ICO 是一个容器格式，应包含多个尺寸以适配不同显示场景：

### 必需尺寸

| 尺寸 | 用途 |
|------|------|
| 16 × 16 | 标题栏、系统托盘、上下文菜单 |
| 24 × 24 | 经典模式工具栏 |
| 32 × 32 | 任务栏、搜索结果 |
| 48 × 48 | 开始菜单 |
| **256 × 256** | 大图标视图 (关键!) |

### 推荐完整列表

```
16, 24, 32, 48, 64, 128, 256
```

> 256px 图标可使用 PNG 压缩嵌入 ICO 以减小文件体积。

## 缩放因子 (Windows 10/11)

Windows 支持多种 DPI 缩放：

| 场景 | 100% | 125% | 150% | 200% | 250% | 300% | 400% |
|------|------|------|------|------|------|------|------|
| 系统托盘 | 16 | 20 | 24 | 32 | 40 | 48 | 64 |
| 任务栏 | 24 | 30 | 36 | 48 | 60 | 72 | 96 |
| 开始固定 | 32 | 40 | 48 | 64 | 80 | 96 | 256 |

## 导出策略

### 核心图标

提供一个 **256 × 256 px PNG**，然后使用工具（如 ImageMagick 或在线转换器）打包为 ICO：

```bash
# 示例：使用 ImageMagick 生成 ICO
magick icon_256.png -define icon:auto-resize=256,128,64,48,32,24,16 icon.ico
```

## 本工具输出

仅输出 **1 个文件**:
```
Windows/
└── Icon_256x256.png    ← ICO 源图 (最大尺寸)
```

> 用户可使用 [ConvertICO](https://convertico.com/)、[ICO Convert](https://icoconvert.com/) 或 ImageMagick 自行打包 ICO。
