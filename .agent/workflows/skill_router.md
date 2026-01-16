---
description: Intelligent skill router that automatically selects and applies skills based on task context
---

# 技能路由器 (Skill Router)

这是一个**智能路由器**，在每次对话开始时自动分析任务类型，并路由到最合适的技能组合。

> [!IMPORTANT]
> 这是所有技能的统一入口，AI 应该在开始任何任务前自动执行路由逻辑。

---

## 🧠 路由逻辑

### 自动触发

在每次对话开始时，AI 应该：

1. **分析用户意图** - 从用户消息中提取关键词
2. **匹配技能规则** - 根据规则表选择技能
3. **加载技能指令** - 读取并应用选中的 SKILL.md
4. **执行任务** - 按照技能指令完成任务

---

## 📋 路由规则表

### 开发类任务

| 关键词模式 | 匹配技能 | 优先级 |
|:----------|:---------|:-------|
| `UI`, `界面`, `样式`, `颜色`, `按钮`, `组件` | `ui_standardization` | 高 |
| `主题`, `深色`, `浅色`, `theme`, `dark`, `light` | `css_theme_system` | 高 |
| `国际化`, `多语言`, `翻译`, `i18n`, `language` | `react_i18n` | 高 |
| `创建项目`, `新项目`, `React`, `Vite` | `css_theme_system` + `react_i18n` | 中 |

### 构建发布类任务

| 关键词模式 | 匹配技能/工作流 | 优先级 |
|:----------|:---------------|:-------|
| `MAS`, `App Store`, `提交`, `上架`, `审核`, `自检` | `mas_submission` | 高 |
| `构建`, `打包`, `发布`, `build`, `release` | `security_check` → `build_*` | 高 |
| `DMG`, `Mac`, `macOS` | `build_notarized_dmg` | 高 |
| `Windows`, `exe`, `安装包` | `build_windows` | 高 |
| `Linux`, `deb`, `AppImage` | `build_linux` | 高 |
| `上传`, `GitHub`, `Release` | `upload_release` | 中 |

### 技能管理类任务

| 关键词模式 | 匹配工作流 | 优先级 |
|:----------|:----------|:-------|
| `搜索技能`, `查找技巧`, `skill search` | `skill_discovery` | 高 |
| `学习技能`, `导入`, `skill learn` | `skill_learning` | 高 |
| `升级`, `融合`, `全局化` | `skill_fusion` | 高 |
| `技能`, `技巧`, `skill` | `skill_management` | 低 |

---

## 🔄 路由流程

```
用户消息 → 关键词提取 → 规则匹配 → 技能加载 → 执行任务
```

---

## 🎯 技能组合策略

### 单技能匹配
```
"修改按钮样式" → ui_standardization
```

### 多技能组合
```
"创建支持多语言的组件" → css_theme_system + react_i18n + ui_standardization
```

### 工作流链
```
"打包发布到 GitHub" → security_check → build_* → upload_release
```

---

## ⚙️ 技能位置

| 类型 | 位置 |
|:-----|:-----|
| 全局技能 | `~/.gemini/antigravity/global_skills/` |
| 全局工作流 | `~/.gemini/antigravity/global_workflows/` |
| 项目技能 | `.agent/skills/` |
| 项目工作流 | `.agent/workflows/` |

---

## 📊 路由优先级

1. **项目技能** > **全局技能**
2. **高优先级匹配** > **低优先级匹配**
3. **精确匹配** > **模糊匹配**

> [!NOTE]
> 路由器是"隐式"运行的，用户无需手动触发。AI 会自动根据上下文选择最佳技能组合。
