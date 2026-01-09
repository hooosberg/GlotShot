# Steam 图标规范

> 官方来源: [Steamworks Documentation - Graphical Assets](https://partner.steamgames.com/doc/store/assets/standard)

## 图标类型概览

Steam 需要多种图标/资产，用途各不相同：

| 类型 | 尺寸 | 格式 | 用途 |
|------|------|------|------|
| **Client Icon** | 32 × 32 | PNG/JPG | 客户端小图标 |
| **App Icon** | 184 × 184 | JPG | 库列表、聊天、通知 |
| **Shortcut Icon** | 256 × 256 或 512 × 512 | ICO/PNG | 桌面快捷方式 |
| **Community Icon** | 184 × 184 | PNG/JPG | 社区中心头像 |

## 详细规范

### 1. Shortcut Icon (桌面快捷方式)

用于 Windows 桌面快捷方式启动游戏：

| 属性 | 要求 |
|------|------|
| **尺寸** | 256 × 256 或 **512 × 512** px |
| **格式** | ICO 或 PNG (Steam 自动转换) |
| **背景** | 透明 |

> 如上传 PNG，Steam 会自动生成 ICO。建议提供 512px 以获得最佳清晰度。

### 2. App Icon (应用图标)

用于 Steam 库列表、聊天通知等处：

| 属性 | 要求 |
|------|------|
| **尺寸** | 184 × 184 px |
| **格式** | JPG (也接受 PNG) |
| **形状** | 正方形 (可能被系统切圆) |

⚠️ **安全区提示**: Steam Deck 和新版聊天可能将此图标切为圆形，建议将核心内容放在中心圆形区域内。

### 3. Client Icon (客户端图标)

Steam 客户端内部使用的小图标：

| 属性 | 要求 |
|------|------|
| **尺寸** | 32 × 32 px |
| **格式** | PNG/JPG |

### 4. Library Logo (库 Logo)

叠加在"库页眉"上的透明 Logo：

| 属性 | 要求 |
|------|------|
| **尺寸** | 宽 1280 px 和/或 高 720 px |
| **格式** | PNG (透明背景) |

> 用于 Steam 库详情页，不需要本工具处理。

## 本工具输出

仅输出 **1 个文件**:
```
Steam/
└── ShortcutIcon_512x512.png    ← 桌面快捷方式源图
```

> 用户需在 Steamworks 后台上传各类资产。App Icon (184px) 可从此源图缩放生成。
