---
description: Analyze, understand and adapt external skills for local use
---

# 技能学习工作流 (Skill Learning)

分析外部技能结构，理解其工作方式，并适配到本地环境。

## 触发条件

当用户说以下内容时触发：
- "学习这个技能 [URL]"
- "导入技能"
- "/skill_learn [URL]"

---

## 学习流程

### 1. 获取技能内容

```bash
# 如果是 GitHub 仓库
# 读取 SKILL.md 文件内容

# 如果是单个文件 URL
# 使用 read_url_content 获取内容
```

### 2. 结构分析

分析 SKILL.md 的结构：

```markdown
## 结构分析清单

### YAML Frontmatter
- [ ] name: 技能名称
- [ ] description: 技能描述
- [ ] (可选) version, author, tags

### 内容结构
- [ ] 目标 (Goal/Purpose)
- [ ] 指令 (Instructions)
- [ ] 约束 (Constraints)
- [ ] 示例 (Examples)

### 依赖分析
- [ ] 是否需要特定 MCP 工具
- [ ] 是否需要外部服务/API
- [ ] 是否需要特定文件结构
```

### 3. 兼容性检查

```markdown
## 兼容性报告

### 与现有技能对比

| 现有技能 | 冲突类型 | 解决方案 |
|:---------|:---------|:---------|
| css_theme_system | 无 | - |
| react_i18n | 低（命名相似） | 重命名变量 |
| ui_standardization | 无 | - |

### 项目适配建议

1. **修改点**：[需要修改的部分]
2. **新增依赖**：[如果有]
3. **配置更新**：[如果需要]
```

### 4. 本地化

将外部技能适配到本地：

```markdown
## 本地化步骤

1. **创建技能目录**
   ```
   .agent/skills/[skill_name]/SKILL.md
   ```

2. **适配内容**
   - 移除项目特定引用
   - 更新路径为相对路径
   - 调整示例代码

3. **添加项目标签**
   - 在 frontmatter 添加 `source: [原始URL]`
   - 添加 `adapted_date: [日期]`
```

---

## 技能分析模板

分析完成后，输出以下报告：

```markdown
## 📚 技能分析报告: [技能名称]

### 概览
- **来源**: [URL]
- **版本**: [如有]
- **最后更新**: [日期]

### 功能摘要
[一段话描述技能的核心功能]

### 依赖项
- ✅ 无外部依赖 / ⚠️ 需要 [依赖列表]

### 兼容性
- ✅ 与现有技能无冲突 / ⚠️ 有以下冲突: [列表]

### 建议
- [ ] 直接使用
- [ ] 需要适配后使用
- [ ] 不建议使用（原因）

### 下一步
确认后执行 `/skill_apply [skill_name]` 应用此技能
```

---

## 学习策略

### 快速学习（默认）

只分析 SKILL.md 核心内容，快速给出建议。

### 深度学习

额外分析：
- scripts/ 目录中的辅助脚本
- examples/ 目录中的示例
- resources/ 目录中的资源文件

使用 `/skill_learn [URL] --deep` 触发深度学习

---

## 快速命令

```
/skill_learn [URL]         # 快速学习
/skill_learn [URL] --deep  # 深度学习
/skill_apply [name]        # 应用已分析的技能
```
