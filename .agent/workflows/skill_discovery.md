---
description: Search and evaluate external skills from trusted sources
---

# 技能发现工作流 (Skill Discovery)

从可信赖的外部资源搜索、评估和下载技能。

## 可信资源列表

### GitHub 仓库

| 资源 | 搜索关键词 | 描述 |
|:-----|:----------|:-----|
| Awesome Antigravity Skills | `antigravity-awesome-skills` | 社区整理的技能聚合库 |
| Google 官方示例 | `rominirani/antigravity-skills` | 官方最佳实践 |
| MCP Tools | `modelcontextprotocol awesome` | MCP 工具集合 |

### 社区资源

| 平台 | 搜索方式 | 内容类型 |
|:-----|:---------|:---------|
| Reddit | `r/google_antigravity flair:Skills` | 用户分享的自定义技能 |
| Dev.to | `antigravity workflow [技术栈]` | 深度教程和集成指南 |
| Medium | `Antigravity skills tutorial` | 进阶技巧和案例 |

---

## 搜索流程

### 1. 触发条件

当用户说以下内容时触发：
- "搜索技能 [关键词]"
- "查找相关技能"
- "/skill_search [关键词]"

### 2. 搜索步骤

```markdown
## 搜索步骤

1. **分析需求**
   - 从用户的关键词中提取技术栈（React, Python, etc.）
   - 识别任务类型（测试、部署、文档等）

2. **构建搜索查询**
   - GitHub: `antigravity skill [关键词] language:[技术栈]`
   - Reddit: `site:reddit.com/r/google_antigravity [关键词]`
   - Dev.to: `site:dev.to antigravity [关键词]`

3. **执行搜索**
   - 使用 search_web 工具搜索上述查询
   - 收集前 5 个相关结果

4. **输出结果**
   - 列出发现的技能/资源
   - 附带评估建议
```

---

## 技能评估标准

在推荐技能前，使用以下标准评估：

### 必要条件 ✅

- [ ] **结构完整**：包含有效的 SKILL.md 文件
- [ ] **来源可信**：来自已知仓库或有 stars/forks
- [ ] **文档清晰**：有使用说明和示例代码

### 质量指标 ⭐

| 指标 | 优秀 | 一般 | 差 |
|:-----|:-----|:-----|:---|
| Stars/Forks | >50 | 10-50 | <10 |
| 最近更新 | <3月 | 3-12月 | >1年 |
| Issues 响应 | 活跃 | 偶尔 | 无 |

### 兼容性检查 🔧

- [ ] **依赖检查**：是否有特殊依赖（MCP 服务器等）
- [ ] **版本兼容**：是否与当前 Antigravity 版本兼容
- [ ] **冲突检测**：是否与现有技能冲突

---

## 输出模板

搜索完成后，使用以下格式输出：

```markdown
## 🔍 技能搜索结果: [关键词]

### 推荐技能

1. **[技能名称]** ⭐⭐⭐⭐
   - 来源: [GitHub 链接]
   - 描述: [一句话描述]
   - 适用场景: [场景]
   - ⚠️ 注意: [如有]

2. **[技能名称]** ⭐⭐⭐
   ...

### 下一步

使用 `/skill_learn [URL]` 学习指定技能
```

---

## 快速命令

```
/skill_search [关键词]  # 执行搜索
/skill_sources          # 列出可信资源
```
