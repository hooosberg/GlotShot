# 图标规范参考文档

本目录包含各平台官方图标规范的整理文档，用于指导"全能图标工厂"的设计与实现。

## 文档列表

- [Apple 图标规范](./apple-icon-spec.md) - iOS / macOS / App Store
- [Android 图标规范](./android-icon-spec.md) - Google Play / Adaptive Icons
- [Windows 图标规范](./windows-icon-spec.md) - Windows 10/11 / ICO 格式
- [Steam 图标规范](./steam-icon-spec.md) - Steam Client / Library / Community

## 设计原则

**只导出核心底图**：各平台构建工具（Xcode, Android Studio, Visual Studio）会自动生成所需的所有尺寸和格式。本工具只输出符合规范的**最关键源图**。

| 平台 | 核心底图 | 格式 | 说明 |
|------|----------|------|------|
| Apple | 1024×1024 | PNG | 不透明，满铺正方形 |
| Android | 512×512 | PNG | Google Play Store 图标 |
| Windows | 256×256 | PNG | 最大尺寸 ICO 源图 |
| Steam | 512×512 | PNG | 快捷方式图标源图 |

## 参考来源

- Apple Human Interface Guidelines
- Android Developer Documentation
- Microsoft Design Guidelines
- Steamworks Documentation
