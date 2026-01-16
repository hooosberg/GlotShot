---
description: Extract reusable patterns from project skills and promote to global
---

# 技能融合工作流 (Skill Fusion)

将项目中成熟的技能提炼为通用模式，升级为全局可复用技能。

## 触发条件

当用户说以下内容时触发：
- "升级技能到全局"
- "提炼通用技能"
- "/skill_fuse"
- "/skill_upgrade"

---

## 融合标准

### 前置条件 ✅

在融合前，技能必须满足：

| 条件 | 说明 | 检查方式 |
|:-----|:-----|:---------|
| **成熟度** | 至少在 2 个场景中验证有效 | 查看使用记录 |
| **独立性** | 与项目耦合度 < 30% | 分析依赖 |
| **通用性** | 可应用于其他同类项目 | 评估抽象度 |

### 评分矩阵

```markdown
评分范围: 1-5 分，总分 ≥ 12 分可升级

| 维度 | 1分 | 3分 | 5分 |
|:-----|:----|:----|:----|
| 通用性 | 仅限当前项目 | 同技术栈可用 | 跨技术栈可用 |
| 完整性 | 仅核心代码 | 有文档+示例 | 有完整生态 |
| 维护性 | 硬编码值多 | 部分可配置 | 完全可配置 |
```

---

## 融合流程

### 1. 分析项目技能

```markdown
## 技能扫描

扫描 `.agent/skills/` 目录：

| 技能 | 使用次数 | 最后更新 | 融合候选 |
|:-----|:---------|:---------|:---------|
| css_theme_system | 15+ | 2026-01-15 | ✅ |
| react_i18n | 20+ | 2026-01-16 | ✅ |
| ui_standardization | 10+ | 2026-01-16 | ⚠️ 项目特定 |
```

### 2. 提炼通用模式

对于候选技能，执行：

```markdown
## 通用化步骤

1. **识别项目特定内容**
   - 硬编码的路径 → 替换为占位符 `{{PROJECT_ROOT}}`
   - 项目特定变量名 → 使用通用命名
   - 特定配置值 → 提取为可配置参数

2. **提取核心模式**
   - 保留核心逻辑和架构
   - 移除项目特定的实现细节
   - 添加"如何定制"说明

3. **增强文档**
   - 添加"快速开始"章节
   - 添加"定制指南"章节
   - 添加"常见问题"章节
```

### 3. 生成全局版本

```markdown
## 输出结构

~/.gemini/antigravity/global_skills/
└── [skill_name]/
    ├── SKILL.md           # 通用化后的技能文件
    ├── README.md          # 详细使用说明
    └── examples/          # 示例代码
        └── basic_usage.md
```

### 4. 建立联动

在原项目技能中添加引用：

```yaml
---
name: CSS Theme System (Project Version)
base_skill: ~/.gemini/antigravity/global_skills/css_theme_system
customizations:
  - 添加了 Sepia 主题
  - 调整了默认颜色值
---
```

---

## 融合报告模板

```markdown
## 🔄 技能融合报告

### 融合候选

| 技能 | 评分 | 状态 |
|:-----|:-----|:-----|
| css_theme_system | 14/15 | ✅ 可融合 |
| react_i18n | 13/15 | ✅ 可融合 |
| ui_standardization | 9/15 | ⚠️ 需进一步通用化 |

### 生成的全局技能

1. **css_theme_system** (全局版)
   - 位置: `~/.gemini/antigravity/global_skills/css_theme_system/`
   - 变更: 移除了项目特定颜色，添加了配置指南

2. **react_i18n** (全局版)
   - 位置: `~/.gemini/antigravity/global_skills/react_i18n/`
   - 变更: 抽象了语言列表，添加了扩展接口

### 后续步骤

1. 手动复制 `.agent/skills/` 中的全局版本到 `~/.gemini/antigravity/global_skills/`
2. 在新项目中测试全局技能
3. 根据反馈迭代更新
```

---

## 版本管理

### 版本号规则

```
MAJOR.MINOR.PATCH

MAJOR: 架构变更，不向后兼容
MINOR: 新功能，向后兼容
PATCH: Bug 修复
```

### 更新记录

在 SKILL.md 中维护 changelog：

```markdown
## Changelog

### v1.1.0 (2026-01-16)
- 新增: Sepia 主题支持
- 优化: 过渡动画性能

### v1.0.0 (2026-01-10)
- 初始版本
```

---

## 快速命令

```
/skill_fuse             # 分析并生成融合报告
/skill_upgrade [name]   # 升级指定技能到全局
/skill_diff [name]      # 对比项目版本与全局版本
```
