---
name: Skill Template
description: 用于创建新技能的标准模板
version: 1.0.0
---

# 技能模板 (Skill Template)

这是创建新技能的标准模板，遵循 Antigravity Skills 最佳实践。

## SKILL.md 标准结构

```markdown
---
name: [Skill Name]
description: [One-line description]
version: 1.0.0
author: [Optional]
tags: [react, typescript, etc.]
source: [If adapted from external, original URL]
adapted_date: [If adapted, date]
---

# [Skill Name]

[Brief introduction - what this skill does and why it's useful]

## Goal

[Clear statement of what this skill helps achieve]

## Instructions

[Step-by-step instructions for the AI to follow when using this skill]

### 1. [First Step]
[Details...]

### 2. [Second Step]
[Details...]

## Constraints

[Any limitations or rules the AI should follow]

- [ ] Constraint 1
- [ ] Constraint 2

## Examples

### Example 1: [Scenario]

```[language]
// Code example
```

### Example 2: [Another Scenario]

```[language]
// Another code example
```

## Best Practices

1. **[Practice 1]**: [Explanation]
2. **[Practice 2]**: [Explanation]

## Changelog

### v1.0.0 (YYYY-MM-DD)
- Initial release
```

---

## 创建新技能

### 1. 目录结构

```
.agent/skills/[skill_name]/
├── SKILL.md          # 必需 - 主技能文件
├── README.md         # 可选 - 详细文档
├── examples/         # 可选 - 示例代码
│   ├── basic.md
│   └── advanced.md
├── scripts/          # 可选 - 辅助脚本
│   └── setup.sh
└── resources/        # 可选 - 资源文件
    └── config.json
```

### 2. 命名规范

- **技能名称**: 使用 `snake_case`，例如 `css_theme_system`
- **文件名**: SKILL.md 必须使用大写
- **变量名**: 使用语义化命名，避免 `value1`, `option2`

### 3. Frontmatter 字段

| 字段 | 必需 | 说明 |
|:-----|:-----|:-----|
| `name` | ✅ | 技能显示名称 |
| `description` | ✅ | 一句话描述 |
| `version` | 推荐 | 语义化版本号 |
| `author` | 可选 | 作者信息 |
| `tags` | 可选 | 技术标签数组 |
| `source` | 可选 | 如果改编自外部来源 |
| `adapted_date` | 可选 | 适配日期 |

---

## 技能质量标准

### ✅ 好的技能

- 目标清晰，解决具体问题
- 指令详细，AI 可直接执行
- 包含代码示例
- 考虑边界情况

### ❌ 差的技能

- 目标模糊，如"写好代码"
- 指令抽象，如"注意性能"
- 缺少示例
- 过于项目特定

---

## 快速创建

复制以下最小模板开始：

```markdown
---
name: My New Skill
description: [Description]
---

# My New Skill

## Goal

[What this skill achieves]

## Instructions

1. [Step 1]
2. [Step 2]

## Examples

\`\`\`javascript
// Example code
\`\`\`
```
