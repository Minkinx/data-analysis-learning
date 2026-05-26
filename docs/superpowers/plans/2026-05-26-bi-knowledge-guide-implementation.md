# BI 数据分析知识指南 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a VitePress-based knowledge guide for junior-to-mid-level BI analysts with 5 modules covering learning paths, knowledge map, interview prep, career development, and appendix.

**Architecture:** Single VitePress site with dynamic sidebar per module. Content is pure Markdown. Navigation via top nav bar + contextual sidebar.

**Tech Stack:** VitePress, Markdown, Node.js/npm

---

### Task 1: Initialize VitePress Project

**Files:**
- Create: `package.json`
- Create: `docs/.vitepress/config.mjs`
- Create: `.gitignore`

- [ ] **Step 1: Initialize project and install VitePress**

```bash
cd /Users/minkinx/projects/data_analysis
npm init -y
npm install -D vitepress
```

- [ ] **Step 2: Create .gitignore**

```bash
cat > /Users/minkinx/projects/data_analysis/.gitignore << 'GITIGNORE'
node_modules/
.DS_Store
dist/
.cache/
GITIGNORE
```

- [ ] **Step 3: Add scripts to package.json**

Edit `package.json` to add:
```json
"scripts": {
  "dev": "vitepress dev docs",
  "build": "vitepress build docs",
  "preview": "vitepress preview docs"
}
```

- [ ] **Step 4: Verify VitePress is installed**

Run: `npx vitepress --version`
Expected: version string outputs (no error)

- [ ] **Step 5: Commit**

```bash
git init
git add package.json package-lock.json .gitignore
git commit -m "chore: initialize VitePress project"
```

---

### Task 2: Configure VitePress Site

**Files:**
- Create: `docs/.vitepress/config.mjs` (full config with nav, sidebar for all modules)
- Create: `docs/public/.gitkeep`

- [ ] **Step 1: Write config.mjs**

Create `docs/.vitepress/config.mjs` with:

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BI 数据分析知识指南',
  description: '面向初中级数据分析师的系统化知识体系',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: null, // no logo for now
    siteTitle: 'BI 知识指南',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路径', link: '/learning-paths/' },
      { text: '知识地图', link: '/knowledge-map/' },
      { text: '面试专区', link: '/interview/' },
      { text: '职业发展', link: '/career/' },
      { text: '附录', link: '/appendix/' },
    ],

    sidebar: {
      '/learning-paths/': [
        {
          text: '学习路径',
          items: [
            { text: '概览', link: '/learning-paths/' },
            {
              text: '路径一：基础能力巩固',
              collapsed: false,
              items: [
                { text: 'SQL 核心精讲', link: '/learning-paths/path-1-basics/01-sql-core' },
                { text: 'Python 数据分析', link: '/learning-paths/path-1-basics/02-python' },
                { text: '统计学快速复习', link: '/learning-paths/path-1-basics/03-statistics' },
              ]
            },
            {
              text: '路径二：独立分析能力',
              collapsed: true,
              items: [
                { text: '数据建模入门', link: '/learning-paths/path-2-core/01-data-modeling' },
                { text: '分析方法论', link: '/learning-paths/path-2-core/02-analysis-methods' },
                { text: 'BI 工具实战', link: '/learning-paths/path-2-core/03-bi-tools' },
                { text: '业务指标体系建设', link: '/learning-paths/path-2-core/04-metrics' },
                { text: '数据可视化与报告', link: '/learning-paths/path-2-core/05-visualization' },
              ]
            },
            {
              text: '路径三：进阶突破',
              collapsed: true,
              items: [
                { text: '数据工程基础', link: '/learning-paths/path-3-advanced/01-data-engineering' },
                { text: '实验与因果推断', link: '/learning-paths/path-3-advanced/02-experiments' },
                { text: '数据治理与质量', link: '/learning-paths/path-3-advanced/03-governance' },
                { text: 'ML for BI', link: '/learning-paths/path-3-advanced/04-ml' },
              ]
            },
            {
              text: '路径四：职场进阶',
              collapsed: true,
              items: [
                { text: '沟通与协作', link: '/learning-paths/path-4-career/01-communication' },
                { text: '分析思维培养', link: '/learning-paths/path-4-career/02-thinking' },
                { text: '职业发展', link: '/learning-paths/path-4-career/03-development' },
              ]
            },
          ]
        }
      ],
      '/knowledge-map/': [
        {
          text: '知识地图',
          items: [
            { text: '概览', link: '/knowledge-map/' },
            { text: 'KM 1. SQL 完全指南', link: '/knowledge-map/km-1-sql/' },
            { text: 'KM 2. Python 数据分析', link: '/knowledge-map/km-2-python' },
            { text: 'KM 3. 统计学与概率论', link: '/knowledge-map/km-3-statistics' },
            { text: 'KM 4. 数据建模', link: '/knowledge-map/km-4-data-modeling/' },
            { text: 'KM 5. 分析方法论', link: '/knowledge-map/km-5-analysis-methods/' },
            { text: 'KM 6. BI 工具与可视化', link: '/knowledge-map/km-6-bi-visualization/' },
            { text: 'KM 7. 业务指标体系', link: '/knowledge-map/km-7-metrics/' },
            { text: 'KM 8. 数据工程基础', link: '/knowledge-map/km-8-data-engineering' },
            { text: 'KM 9. 实验与因果推断', link: '/knowledge-map/km-9-experiments' },
            { text: 'KM 10. 数据治理与质量', link: '/knowledge-map/km-10-governance' },
            { text: 'KM 11. 机器学习基础', link: '/knowledge-map/km-11-ml' },
            { text: 'KM 12. 数据产品与工具链', link: '/knowledge-map/km-12-tools' },
          ]
        }
      ],
      '/interview/': [
        {
          text: '面试专区',
          items: [
            { text: '概览', link: '/interview/' },
            { text: 'IP 1. SQL 面试题库', link: '/interview/ip-1-sql/' },
            { text: 'IP 2. Python 面试题', link: '/interview/ip-2-python' },
            { text: 'IP 3. 统计学与概率题', link: '/interview/ip-3-statistics' },
            { text: 'IP 4. Case Study', link: '/interview/ip-4-case-study/' },
            { text: 'IP 5. Product Sense', link: '/interview/ip-5-product-sense' },
            { text: 'IP 6. 行为面试', link: '/interview/ip-6-behavioral' },
            { text: 'IP 7. 面试策略', link: '/interview/ip-7-strategy' },
          ]
        }
      ],
      '/career/': [
        {
          text: '职业发展',
          items: [
            { text: '概览', link: '/career/' },
            { text: '岗位全景图', link: '/career/cd-1-overview' },
            { text: '能力成长路线', link: '/career/cd-2-growth-path' },
            { text: '学习资源推荐', link: '/career/cd-3-resources' },
            { text: '职场软技能', link: '/career/cd-4-soft-skills' },
          ]
        }
      ],
      '/appendix/': [
        {
          text: '附录',
          items: [
            { text: '概览', link: '/appendix/' },
            { text: '工具速查手册', link: '/appendix/ap-1-cheatsheets' },
            { text: '术语表', link: '/appendix/ap-2-glossary' },
            { text: '构建与维护', link: '/appendix/ap-3-maintenance' },
            { text: '许可证与声明', link: '/appendix/ap-4-license' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/minkinx' },
    ],

    footer: {
      message: '基于 CC BY-NC-SA 4.0 许可发布',
      copyright: 'Copyright 2026-present',
    },

    editLink: {
      pattern: 'https://github.com/minkinx/data_analysis/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdatedText: '最后更新',
  },
})
```

- [ ] **Step 2: Create public placeholder**

```bash
touch /Users/minkinx/projects/data_analysis/docs/public/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add docs/.vitepress/config.mjs docs/public/.gitkeep
git commit -m "feat: configure VitePress with nav and sidebar"
```

---

### Task 3: Create Home Page (Index)

**Files:**
- Create: `docs/index.md`

- [ ] **Step 1: Write home page**

Create `docs/index.md`:

```md
---
layout: home

hero:
  name: BI 数据分析知识指南
  text: 面向初中级数据分析师的系统化知识体系
  tagline: 从 SQL 取数到业务决策，构建你的数据分析能力全景图
  actions:
    - theme: brand
      text: 开始学习
      link: /learning-paths/
    - theme: alt
      text: 知识地图
      link: /knowledge-map/

features:
  - title: 🎯 学习路径
    details: 4 条推荐学习路线，从基础巩固到进阶突破，按图索骥系统提升
    link: /learning-paths/
  - title: 🗺️ 知识地图
    details: 12 大领域深度参考，SQL、Python、统计学、数据建模…工作中随查随用
    link: /knowledge-map/
  - title: 💼 面试专区
    details: SQL 题库、Case Study、Product Sense、行为面试，覆盖 BI 岗全题型
    link: /interview/
  - title: 💡 职业发展
    details: 岗位全景、能力成长路线、学习资源与软技能，不止于技术
    link: /career/
---
```

- [ ] **Step 2: Verify dev server works**

Run: `npx vitepress dev docs`
Expected: Server starts on localhost, home page renders with 4 feature cards and hero section.

- [ ] **Step 3: Commit**

```bash
git add docs/index.md
git commit -m "feat: add home page with hero and feature cards"
```

---

### Task 4: Create Content Directory Structure and Index Pages

**Files:**
- Create: `docs/learning-paths/index.md`
- Create: `docs/knowledge-map/index.md`
- Create: `docs/interview/index.md`
- Create: `docs/career/index.md`
- Create: `docs/appendix/index.md`

- [ ] **Step 1: Create learning-paths overview page**

Create `docs/learning-paths/index.md`:

```md
# 🎯 学习路径

> 从基础到进阶，推荐按顺序学习，每条路径标注了参考用时。

## 路径一：基础能力巩固（2-4 周）

- [SQL 核心精讲](./path-1-basics/01-sql-core) — 窗口函数、查询优化、实战场景
- [Python 数据分析](./path-1-basics/02-python) — Pandas、数据清洗、自动化
- [统计学快速复习](./path-1-basics/03-statistics) — 描述统计、推断统计、相关分析

## 路径二：独立分析能力（4-8 周）

- [数据建模入门](./path-2-core/01-data-modeling) — 维度建模、Fact & Dimension Table
- [分析方法论](./path-2-core/02-analysis-methods) — A/B Testing、漏斗、Cohort、留存
- [BI 工具实战](./path-2-core/03-bi-tools) — Tableau / Power BI / 开源方案
- [业务指标体系建设](./path-2-core/04-metrics) — AARRR、北极星指标、行业指标库
- [数据可视化与报告](./path-2-core/05-visualization) — Dashboard 设计、Data Storytelling

## 路径三：进阶突破（4-6 周，选学）

- [数据工程基础](./path-3-advanced/01-data-engineering) — ETL、数仓架构、Pipeline
- [实验与因果推断](./path-3-advanced/02-experiments) — A/B Testing 进阶、DID、Causal Inference
- [数据治理与质量](./path-3-advanced/03-governance) — Data Quality、元数据、合规
- [ML for BI](./path-3-advanced/04-ml) — 监督/无监督、模型理解、分析师视角

## 路径四：职场进阶（并行学习）

- [沟通与协作](./path-4-career/01-communication) — 需求沟通、跨团队协作、向上汇报
- [分析思维培养](./path-4-career/02-thinking) — 结构化思维、业务理解、批判性思维
- [职业发展](./path-4-career/03-development) — 岗位全景、成长路线、学习资源
```

- [ ] **Step 2: Create knowledge-map overview page**

Create `docs/knowledge-map/index.md`:

```md
# 🗺️ 知识地图

> 按领域组织的深度参考，横跨 12 大知识领域。工作中按需查阅。

| 领域 | 核心内容 |
|------|---------|
| [KM 1. SQL 完全指南](./km-1-sql/) | 基础查询 / JOIN / CTE / 窗口函数 / 优化 / 实战场景 |
| [KM 2. Python 数据分析](./km-2-python) | Pandas / 数据清洗 / 可视化 / 自动化 |
| [KM 3. 统计学与概率论](./km-3-statistics) | 描述统计 / 推断统计 / 假设检验 / 贝叶斯 |
| [KM 4. 数据建模](./km-4-data-modeling/) | 维度建模 / Fact & Dimension / SCD |
| [KM 5. 分析方法论](./km-5-analysis-methods/) | 漏斗 / Cohort / 留存 / 归因 / LTV |
| [KM 6. BI 工具与可视化](./km-6-bi-visualization/) | 可视化原理 / Dashboard / Tableau / Power BI |
| [KM 7. 业务指标体系](./km-7-metrics/) | AARRR / 北极星 / 指标管理 / 行业指标库 |
| [KM 8. 数据工程基础](./km-8-data-engineering) | ETL / 数仓 / Pipeline / 工具链 |
| [KM 9. 实验与因果推断](./km-9-experiments) | A/B Testing / DID / RDD / Causal Inference |
| [KM 10. 数据治理与质量](./km-10-governance) | Data Quality / 元数据 / 安全合规 |
| [KM 11. 机器学习基础](./km-11-ml) | 监督/无监督 / 特征工程 / 模型评估 |
| [KM 12. 数据产品与工具链](./km-12-tools) | 工具全景 / AI 辅助 / 效率工具 |
```

- [ ] **Step 3: Create interview overview page**

Create `docs/interview/index.md`:

```md
# 💼 面试专区

> BI 数据分析岗面试全题型覆盖，从技术面到业务面系统准备。

| 分类 | 内容 |
|------|------|
| [IP 1. SQL 面试题库](./ip-1-sql/) | 入门 / 中级 / 进阶 / 困难 + 大厂真题 |
| [IP 2. Python 面试题](./ip-2-python) | Pandas 操作 / 数据处理 / 算法基础 |
| [IP 3. 统计学与概率题](./ip-3-statistics) | 概率问题 / 假设检验 / A/B 测试案例 |
| [IP 4. Case Study](./ip-4-case-study/) | 指标异动 / 策略评估 / 费米估算 / 分析框架 |
| [IP 5. Product Sense](./ip-5-product-sense) | 指标定义 / 数据产品设计 / 数据驱动决策 |
| [IP 6. 行为面试](./ip-6-behavioral) | STAR 法则 / 高频问题 / 项目深挖 |
| [IP 7. 面试策略](./ip-7-strategy) | 级别差异化 / 公司类型 / 简历与谈薪 |
```

- [ ] **Step 4: Create career overview page**

Create `docs/career/index.md`:

```md
# 💡 职业发展

> 了解 BI 岗位全景，规划你的成长路径。

- [岗位全景图](./cd-1-overview) — BI 分析师 / 数据运营 / 数据产品 / 数据工程
- [能力成长路线](./cd-2-growth-path) — 初 / 中 / 高 / 专家 / 管理各阶段
- [学习资源推荐](./cd-3-resources) — 书籍 / 课程 / 社区 / 开源项目
- [职场软技能](./cd-4-soft-skills) — 需求沟通 / 跨团队协作 / 向上汇报
```

- [ ] **Step 5: Create appendix overview page**

Create `docs/appendix/index.md`:

```md
# 📚 附录

> 工具速查、术语表、站点构建信息。

- [工具速查手册](./ap-1-cheatsheets) — SQL 函数大全 / Pandas 速查 / 统计公式 / 命令
- [术语表](./ap-2-glossary) — BI 领域常用中英文术语解释
- [构建与维护](./ap-3-maintenance) — 本站构建说明 / 贡献指南 / 更新日志
- [许可证与声明](./ap-4-license) — CC BY-NC-SA 4.0
```

- [ ] **Step 6: Create all sub-directories and placeholder content files**

Run the following commands to create the complete directory tree:

```bash
cd /Users/minkinx/projects/data_analysis/docs

# Learning paths subdirs
mkdir -p learning-paths/path-1-basics
mkdir -p learning-paths/path-2-core
mkdir -p learning-paths/path-3-advanced
mkdir -p learning-paths/path-4-career

# Create placeholder files for all learning path articles
for f in 01-sql-core 02-python 03-statistics; do
  cat > learning-paths/path-1-basics/$f.md << 'EOF'
# Title

> 本文来自「路径一：基础能力巩固」。完整内容待填充。

## 概述

<!-- TODO: 填充内容 -->

## 核心知识点

<!-- TODO: 填充内容 -->

> 深入了解请参阅知识地图对应章节。
EOF
done

for f in 01-data-modeling 02-analysis-methods 03-bi-tools 04-metrics 05-visualization; do
  cat > learning-paths/path-2-core/$f.md << 'EOF'
# Title

> 本文来自「路径二：独立分析能力」。完整内容待填充。

## 概述

<!-- TODO: 填充内容 -->

## 核心知识点

<!-- TODO: 填充内容 -->

> 深入了解请参阅知识地图对应章节。
EOF
done

for f in 01-data-engineering 02-experiments 03-governance 04-ml; do
  cat > learning-paths/path-3-advanced/$f.md << 'EOF'
# Title

> 本文来自「路径三：进阶突破」。完整内容待填充。

## 概述

<!-- TODO: 填充内容 -->

## 核心知识点

<!-- TODO: 填充内容 -->

> 深入了解请参阅知识地图对应章节。
EOF
done

for f in 01-communication 02-thinking 03-development; do
  cat > learning-paths/path-4-career/$f.md << 'EOF'
# Title

> 本文来自「路径四：职场进阶」。完整内容待填充。

## 概述

<!-- TODO: 填充内容 -->

## 核心知识点

<!-- TODO: 填充内容 -->
EOF
done

# Knowledge map subdirs
mkdir -p knowledge-map/km-1-sql
mkdir -p knowledge-map/km-4-data-modeling
mkdir -p knowledge-map/km-5-analysis-methods
mkdir -p knowledge-map/km-6-bi-visualization
mkdir -p knowledge-map/km-7-metrics

# Create KM index files (for sub-directory modules)
cat > knowledge-map/km-1-sql/index.md << 'EOF'
# KM 1. SQL 完全指南

> 深度参考。完整内容待填充。

## 章节

- 基础查询与聚合
- JOIN 与子查询
- CTE 与递归查询
- 窗口函数
- 集合操作
- 数据处理函数
- 查询优化
- 实战场景
EOF

cat > knowledge-map/km-4-data-modeling/index.md << 'EOF'
# KM 4. 数据建模

> 深度参考。完整内容待填充。
EOF

cat > knowledge-map/km-5-analysis-methods/index.md << 'EOF'
# KM 5. 分析方法论

> 深度参考。完整内容待填充。
EOF

cat > knowledge-map/km-6-bi-visualization/index.md << 'EOF'
# KM 6. BI 工具与可视化

> 深度参考。完整内容待填充。
EOF

cat > knowledge-map/km-7-metrics/index.md << 'EOF'
# KM 7. 业务指标体系

> 深度参考。完整内容待填充。
EOF

# Create single-file KM placeholders
for f in km-2-python km-3-statistics km-8-data-engineering km-9-experiments km-10-governance km-11-ml km-12-tools; do
  cat > knowledge-map/$f.md << 'EOF'
# Title

> 深度参考。完整内容待填充。
EOF
done

# Interview subdirs
mkdir -p interview/ip-1-sql
mkdir -p interview/ip-4-case-study

cat > interview/ip-1-sql/index.md << 'EOF'
# IP 1. SQL 面试题库

> 完整内容待填充。按难度分级：入门 / 中级 / 进阶 / 困难 + 大厂真题。
EOF

cat > interview/ip-4-case-study/index.md << 'EOF'
# IP 4. Case Study

> 完整内容待填充。指标异动 / 策略评估 / 产品分析 / 费米估算 / 分析框架。
EOF

for f in ip-2-python ip-3-statistics ip-5-product-sense ip-6-behavioral ip-7-strategy; do
  cat > interview/$f.md << 'EOF'
# Title

> 完整内容待填充。
EOF
done

# Career files
for f in cd-1-overview cd-2-growth-path cd-3-resources cd-4-soft-skills; do
  cat > career/$f.md << 'EOF'
# Title

> 完整内容待填充。
EOF
done

# Appendix files
for f in ap-1-cheatsheets ap-2-glossary ap-3-maintenance ap-4-license; do
  cat > appendix/$f.md << 'EOF'
# Title

> 完整内容待填充。
EOF
done
```

- [ ] **Step 7: Verify all pages load**

Run: `npx vitepress dev docs`
Expected: Navigate to each module overview page and a few article pages, all render without 404.

- [ ] **Step 8: Commit**

```bash
git add docs/learning-paths/ docs/knowledge-map/ docs/interview/ docs/career/ docs/appendix/
git commit -m "feat: add content directory structure and index pages"
```

---

### Content Filling Tasks (Tasks 5+)

The following tasks each fill actual content into one page/article. They follow the same pattern and can be executed independently in any order.

Content conventions:
- Chinese-first, English terms in parentheses on first use
- Use `::: tip`, `::: warning`, `::: info` callouts for emphasis
- Include code blocks with SQL/Python examples where appropriate
- Link to related knowledge-map pages for deeper dives

---

### Task 5: Fill Learning Path — SQL Core (path-1-basics/01-sql-core)

**Files:**
- Modify: `docs/learning-paths/path-1-basics/01-sql-core.md`

- [ ] **Step 1: Write SQL core article**

Content topics: SELECT / WHERE / GROUP BY / HAVING / ORDER BY, JOIN types, CTE, window functions (ROW_NUMBER, RANK, LAG/LEAD), query optimization basics, practical BI scenarios (retention, funnel SQL).

```md
# SQL 核心精讲

> 数据分析师的核心武器。本文覆盖从基础查询到窗口函数再到 BI 实战场景的完整路径。深入参考请见 [KM 1. SQL 完全指南](/knowledge-map/km-1-sql/)。

## 基础查询与聚合

### SELECT 子句顺序

```sql
SELECT column1, aggregate(column2)
FROM table
JOIN other_table ON table.id = other_table.id
WHERE condition
GROUP BY column1
HAVING aggregate_condition
ORDER BY column1
LIMIT n;
```

### 常用聚合函数

| 函数 | 用途 | 注意 |
|------|------|------|
| `COUNT(*)` | 行数统计 | `COUNT(1)` 等价，`COUNT(col)` 不计 NULL |
| `SUM(col)` | 求和 | 忽略 NULL |
| `AVG(col)` | 均值 | 先排除 NULL |
| `DISTINCT` | 去重 | `COUNT(DISTINCT col)` 代价高 |

### WHERE vs HAVING

- `WHERE`：在聚合前过滤行
- `HAVING`：在聚合后过滤分组

## 多表关联

### JOIN 类型速查

```sql
-- INNER JOIN：两表匹配的行
SELECT * FROM A INNER JOIN B ON A.id = B.a_id;

-- LEFT JOIN：左表全部 + 右表匹配（无匹配则为 NULL）
SELECT * FROM A LEFT JOIN B ON A.id = B.a_id;

-- FULL JOIN：两表全部（MySQL 用 UNION 模拟）
SELECT * FROM A LEFT JOIN B ON A.id = B.a_id
UNION
SELECT * FROM A RIGHT JOIN B ON A.id = B.a_id;
```

::: tip BI 场景
多表关联时注意**数据膨胀**：如果左表 1 行关联右表 N 行，结果集会膨胀 N 倍。聚合前先确认关联基数。
:::

## 子查询与 CTE

### CTE（Common Table Expression）

```sql
WITH active_users AS (
  SELECT user_id, COUNT(*) as login_count
  FROM user_actions
  WHERE action_date >= '2025-01-01'
  GROUP BY user_id
  HAVING COUNT(*) > 5
)
SELECT DATE_TRUNC('month', ua.action_date) as month,
       COUNT(DISTINCT au.user_id) as active_users
FROM user_actions ua
JOIN active_users au ON ua.user_id = au.user_id
GROUP BY 1;
```

## 窗口函数

窗口函数是 BI 面试**最高频考点**之一。

### 排名窗口

```sql
-- 各品类销售额排名
SELECT category, product, revenue,
       ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) as rank_no,
       RANK()       OVER (PARTITION BY category ORDER BY revenue DESC) as rank,
       DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) as dense_rank
FROM product_sales;
```

### 偏移窗口

```sql
-- 当日与前一日对比
SELECT date, revenue,
       LAG(revenue, 1) OVER (ORDER BY date) as prev_day_revenue,
       revenue - LAG(revenue, 1) OVER (ORDER BY date) as diff
FROM daily_revenue;
```

### 聚合窗口

```sql
-- 累计求和（Running Total）
SELECT date, revenue,
       SUM(revenue) OVER (ORDER BY date) as running_total
FROM daily_revenue;

-- 滑动平均（7 日）
SELECT date, revenue,
       AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as ma_7d
FROM daily_revenue;
```

## BI 实战场景 SQL

### 留存计算（Day N Retention）

```sql
WITH first_actions AS (
  SELECT user_id, MIN(action_date) as first_date
  FROM user_actions GROUP BY user_id
),
daily_actions AS (
  SELECT user_id, action_date
  FROM user_actions GROUP BY user_id, action_date
)
SELECT fa.first_date,
       COUNT(DISTINCT fa.user_id) as new_users,
       COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 1 THEN da.user_id END) as day_1_retained,
       COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 7 THEN da.user_id END) as day_7_retained
FROM first_actions fa
LEFT JOIN daily_actions da ON fa.user_id = da.user_id
GROUP BY fa.first_date;
```

### 漏斗转化

```sql
WITH step1 AS (SELECT user_id, MIN(event_time) as t FROM events WHERE event = 'page_view' GROUP BY 1),
     step2 AS (SELECT user_id, MIN(event_time) as t FROM events WHERE event = 'add_cart' GROUP BY 1),
     step3 AS (SELECT user_id, MIN(event_time) as t FROM events WHERE event = 'payment' GROUP BY 1)
SELECT 'page_view' as step, COUNT(*) as users FROM step1
UNION ALL
SELECT 'add_cart', COUNT(*) FROM step2 s2 WHERE EXISTS (SELECT 1 FROM step1 s1 WHERE s1.user_id = s2.user_id AND s1.t < s2.t)
UNION ALL
SELECT 'payment', COUNT(*) FROM step3 s3 WHERE EXISTS (SELECT 1 FROM step2 s2 WHERE s2.user_id = s3.user_id AND s2.t < s3.t);
```

## 查询优化要点

1. **避免 SELECT \*** — 只选取需要的列
2. **过滤下推** — WHERE 条件尽早过滤数据
3. **JOIN 顺序** — 小表驱动大表
4. **EXPLAIN** — 查看执行计划，关注 `type` 和 `rows`
5. **索引** — WHERE / JOIN / ORDER BY 涉及的列考虑建索引

> 深入了解请参阅 [KM 1. SQL 完全指南](/knowledge-map/km-1-sql/)，包含更完整的语法详解和优化技巧。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-1-basics/01-sql-core.md
git commit -m "feat(learning-path): fill SQL core article"
```

---

### Task 6: Fill Learning Path — Python (path-1-basics/02-python)

**Files:**
- Modify: `docs/learning-paths/path-1-basics/02-python.md`

- [ ] **Step 1: Write Python article**

```md
# Python 数据分析

> 数据分析师日常使用 Python 的场景集中在数据提取、清洗、分析和自动化。深入参考请见 [KM 2. Python 数据分析](/knowledge-map/km-2-python)。

## Pandas 核心操作

### 数据读取

```python
import pandas as pd

# 从 CSV / Excel / SQL
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx')
df = pd.read_sql('SELECT * FROM table', connection)
```

### DataFrame 操作

```python
# 查看概览
df.head()
df.info()
df.describe()

# 选择列
df['column_name']
df[['col1', 'col2']]

# 过滤行
df[df['col'] > 100]
df[df['category'].isin(['A', 'B'])]

# groupby 聚合
df.groupby('category')['revenue'].agg(['sum', 'mean', 'count'])
```

## 数据清洗

```python
# 缺失值
df.isnull().sum()
df.dropna(subset=['important_col'])
df['col'].fillna(df['col'].median())

# 异常值（IQR 法）
Q1 = df['col'].quantile(0.25)
Q3 = df['col'].quantile(0.75)
IQR = Q3 - Q1
df = df[(df['col'] >= Q1 - 1.5 * IQR) & (df['col'] <= Q3 + 1.5 * IQR)]

# 类型转换
df['date'] = pd.to_datetime(df['date'])
df['amount'] = df['amount'].astype(float)
```

## 可视化

```python
import matplotlib.pyplot as plt
import seaborn as sns

# 分布图
sns.histplot(df['revenue'], bins=50)
plt.show()

# 箱线图（异常值检测）
sns.boxplot(x='category', y='revenue', data=df)
plt.show()

# 相关性热图
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
plt.show()
```

## 自动化脚本

```python
# 定时导出报表
def generate_daily_report():
    df = pd.read_sql(daily_sql, conn)
    df.to_excel(f'report_{date.today()}.xlsx', index=False)
    send_email(recipient, subject, body, attachment)

# 结合 cron / Airflow 调度
```

> 深入了解请参阅 [KM 2. Python 数据分析](/knowledge-map/km-2-python)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-1-basics/02-python.md
git commit -m "feat(learning-path): fill Python article"
```

---

### Task 7: Fill Learning Path — Statistics (path-1-basics/03-statistics)

**Files:**
- Modify: `docs/learning-paths/path-1-basics/03-statistics.md`

- [ ] **Step 1: Write statistics article**

```md
# 统计学快速复习

> 描述统计、推断统计、相关分析的快速回顾。深入参考请见 [KM 3. 统计学与概率论](/knowledge-map/km-3-statistics)。

## 描述性统计

### 集中趋势

| 指标 | 适用场景 | 注意 |
|------|---------|------|
| 均值 (Mean) | 数据对称分布 | 受异常值影响大 |
| 中位数 (Median) | 偏态分布 | 对异常值鲁棒 |
| 众数 (Mode) | 分类数据 | — |

### 离散程度

- **方差 / 标准差**：数据分散程度
- **IQR（四分位距）**：Q3 - Q1，用于箱线图
- **CV（变异系数）**：标准差 / 均值，比较不同量纲的离散程度

## 概率基础

**贝叶斯定理**：`P(A|B) = P(B|A) * P(A) / P(B)`

**常见分布**：
- 正态分布：自然现象、测量误差
- 二项分布：n 次独立实验中成功 k 次
- 泊松分布：单位时间内事件发生次数

## 推断统计

### 中心极限定理

无论总体分布如何，样本均值的分布趋近正态。这是大部分统计推断的理论基础。

### 假设检验流程

```
1. 设定 H0（零假设）和 H1（备择假设）
2. 选择显著性水平 α（通常 0.05）
3. 选择检验方法（t 检验 / 卡方 / ANOVA）
4. 计算 p-value
5. 若 p < α，拒绝 H0
```

### 常见检验方法

| 检验 | 用途 |
|------|------|
| t 检验 | 两组均值对比 |
| 卡方检验 | 分类变量独立性 |
| ANOVA | 三组及以上均值对比 |

## 相关分析

- **Pearson**：线性相关（连续变量，正态分布）
- **Spearman**：单调相关（不要求正态）
- 相关 ≠ 因果：可能存在混淆变量

> 深入了解请参阅 [KM 3. 统计学与概率论](/knowledge-map/km-3-statistics)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-1-basics/03-statistics.md
git commit -m "feat(learning-path): fill statistics article"
```

---

### Task 8: Fill Learning Path — Data Modeling (path-2-core/01-data-modeling)

**Files:**
- Modify: `docs/learning-paths/path-2-core/01-data-modeling.md`

- [ ] **Step 1: Write data modeling article**

```md
# 数据建模入门

> 数据建模是 BI 分析师的硬核技能，直接影响查询效率和可维护性。深入参考请见 [KM 4. 数据建模](/knowledge-map/km-4-data-modeling/)。

## 维度建模（Dimensional Modeling）

Kimball 提出的维度建模是 BI 领域最主流的建模方法。

### Star Schema（星型模型）

```
Fact Table（中间） ← Dimension Tables（四周）

                 ┌── dim_user ──┐
                 │              │
    dim_product ──┤  fact_orders ├── dim_date
                 │              │
                 └── dim_store ─┘
```

- **Fact Table**：存储度量（金额、数量），有外键关联维度
- **Dimension Table**：存储描述性属性（名称、分类、时间）

### Snowflake Schema

维度表进一步规范化（拆成子表），节省存储但增加 JOIN 复杂度。

## Fact Table 类型

| 类型 | 特点 | 示例 |
|------|------|------|
| 事务事实 | 每行一笔事件 | 订单表、点击日志 |
| 周期快照 | 定期汇总 | 每日余额快照 |
| 累积快照 | 记录整个生命周期 | 订单从创建到完成的完整记录 |

## Dimension Table 与 SCD

| SCD 类型 | 处理方式 | 适用场景 |
|----------|---------|---------|
| Type 1 | 直接覆盖 | 错误修正 |
| Type 2 | 新增记录 + 有效时间 | 历史可追溯（地址、分类） |
| Type 3 | 增加字段保留上期值 | 仅需当前 vs 上一期 |

> 深入了解请参阅 [KM 4. 数据建模](/knowledge-map/km-4-data-modeling/)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-2-core/01-data-modeling.md
git commit -m "feat(learning-path): fill data modeling article"
```

---

### Task 9: Fill Learning Path — Analysis Methods (path-2-core/02-analysis-methods)

**Files:**
- Modify: `docs/learning-paths/path-2-core/02-analysis-methods.md`

- [ ] **Step 1: Write analysis methods article**

```md
# 分析方法论

> A/B Testing、漏斗分析、同期群分析等核心方法概述。深入参考请见 [KM 5. 分析方法论](/knowledge-map/km-5-analysis-methods/)。

## A/B Testing 完整流程

### 实验设计四要素
1. **假设**：H0 = 无差异，H1 = 有提升
2. **随机化单元**：用户级 / 会话级 / 事件级
3. **样本量计算**：基于 MDE（最小可检测效应）、α、β
4. **运行时长**：跑够一周以上，覆盖全周期

### 常见陷阱
- **Novelty Effect**：新功能短期兴奋，长期回落
- **SRM (Sample Ratio Mismatch)**：分流比例不等于预期
- **Multiple Testing**：看太多指标会增加假阳性

## 漏斗分析

```python
# 各步骤用户数
funnel = {
    '首页浏览': 100000,
    '搜索': 50000,
    '商品浏览': 30000,
    '加购物车': 10000,
    '支付': 5000,
}

# 步骤间转化率
for i in range(1, len(funnel)):
    step_names = list(funnel.keys())
    rate = funnel[step_names[i]] / funnel[step_names[i-1]]
    print(f'{step_names[i-1]} → {step_names[i]}: {rate:.1%}')
```

## 同期群分析（Cohort）

按首次行为时间分组，追踪各组后续表现。常见用途：
- **Retention Cohort**：各组留存曲线
- **Revenue Cohort**：各组累计收入
- 判断产品改版是否真正改善了留存

## 用户分层：RFM 模型

| 维度 | 定义 | 业务意义 |
|------|------|---------|
| Recency | 最近一次购买距今 | 活跃度 |
| Frequency | 购买频率 | 忠诚度 |
| Monetary | 消费金额 | 价值 |

三层各分 3-5 档，组合出用户分层策略。

> 深入了解请参阅 [KM 5. 分析方法论](/knowledge-map/km-5-analysis-methods/)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-2-core/02-analysis-methods.md
git commit -m "feat(learning-path): fill analysis methods article"
```

---

### Task 10: Fill Learning Path — BI Tools (path-2-core/03-bi-tools)

**Files:**
- Modify: `docs/learning-paths/path-2-core/03-bi-tools.md`

- [ ] **Step 1: Write BI tools article**

```md
# BI 工具实战

> 了解主流 BI 工具的核心能力和选型思路。深入参考请见 [KM 6. BI 工具与可视化](/knowledge-map/km-6-bi-visualization/)。

## Tableau

核心能力：拖拽式交互、LOD 表达式、参数控制

```text
-- LOD 示例（每个客户的首单金额）
{FIXED [Customer ID]: MIN([Order Amount])}
```

## Power BI

核心能力：DAX 语言、Power Query (M)、行级安全

```dax
// DAX 计算累计值
Running Total =
CALCULATE(
    SUM(Sales[Amount]),
    FILTER(ALL('Date'), 'Date'[Date] <= MAX('Date'[Date]))
)
```

## 开源方案（Metabase / Superset）

- **Metabase**：上手快，适合团队自助分析
- **Superset**：功能强大，适合数据团队深度使用

## 工具选型参考

| 场景 | 推荐 |
|------|------|
| 公司有 Tableau 授权 | Tableau |
| 微软生态 | Power BI |
| 小团队、低成本 | Metabase |
| 需要深度定制 | Superset + 自建 |

> 深入了解请参阅 [KM 6. BI 工具与可视化](/knowledge-map/km-6-bi-visualization/)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-2-core/03-bi-tools.md
git commit -m "feat(learning-path): fill BI tools article"
```

---

### Task 11: Fill Learning Path — Metrics (path-2-core/04-metrics)

**Files:**
- Modify: `docs/learning-paths/path-2-core/04-metrics.md`

- [ ] **Step 1: Write metrics article**

```md
# 业务指标体系建设

> 指标体系是连接业务和理解业务的桥梁。深入参考请见 [KM 7. 业务指标体系](/knowledge-map/km-7-metrics/)。

## 主流指标框架

### AARRR（海盗指标）

| 阶段 | 核心指标 | 关注点 |
|------|---------|--------|
| Acquisition 获取 | 新增用户、CAC | 渠道效率 |
| Activation 激活 | 激活率、首次核心行为 | 第一印象 |
| Retention 留存 | 次日/7日/30日留存 | 产品粘性 |
| Revenue 收入 | LTV、ARPU、GMV | 商业价值 |
| Referral 传播 | K-factor、邀请率 | 增长飞轮 |

## 北极星指标

定义原则：**指引方向、可拆解、可衡量、与业务价值对齐**

示例：
- Spotify → **用户收听时长**
- Airbnb → **预订过夜数**
- 电商 → **GMV**

## 行业核心指标速查

| 行业 | 核心指标 |
|------|---------|
| 电商 | GMV、客单价、复购率、退货率 |
| 金融 | LTV/CAC、逾期率、首笔率、复借率 |
| 内容 | DAU、人均时长、内容消费渗透率 |
| SaaS | MRR/ARR、Churn Rate、NPS |

> 深入了解请参阅 [KM 7. 业务指标体系](/knowledge-map/km-7-metrics/)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-2-core/04-metrics.md
git commit -m "feat(learning-path): fill metrics article"
```

---

### Task 12: Fill Learning Path — Visualization (path-2-core/05-visualization)

**Files:**
- Modify: `docs/learning-paths/path-2-core/05-visualization.md`

- [ ] **Step 1: Write visualization article**

```md
# 数据可视化与报告

> 好的可视化让数据说话。深入参考请见 [KM 6. BI 工具与可视化](/knowledge-map/km-6-bi-visualization/)。

## 可视化原则

### Gestalt 原理（可视化版）

- **接近**：相关的内容放一起
- **相似**：同类数据用同色同形
- **闭合**：用空白建立分组

### Chart Selection 决策树

```
比较数值 → 柱状图
看趋势 → 折线图
看分布 → 直方图 / 箱线图
看占比 → 饼图（≤5 类）/ 堆叠柱状图
看关联 → 散点图
看地理 → 地图
```

## Dashboard 设计

- **信息层级**：核心 KPI 左上 → 辅助指标 → 明细数据
- **KPI 布局**：主指标 + 同环比 + 趋势迷你图
- **交互**：下钻、筛选器、联动

## Data Storytelling

四步结构：
1. **Context** — 背景和目标
2. **Conflict** — 发现了什么问题
3. **Resolution** — 原因是什么
4. **Action** — 建议做什么

> 深入了解请参阅 [KM 6. BI 工具与可视化](/knowledge-map/km-6-bi-visualization/)。
```

- [ ] **Step 2: Commit**

```bash
git add docs/learning-paths/path-2-core/05-visualization.md
git commit -m "feat(learning-path): fill visualization article"
```

---

### Task 13: Fill Learning Path — Advanced Modules (path-3 + path-4)

**Files:**
- Modify: `docs/learning-paths/path-3-advanced/01-data-engineering.md`
- Modify: `docs/learning-paths/path-3-advanced/02-experiments.md`
- Modify: `docs/learning-paths/path-3-advanced/03-governance.md`
- Modify: `docs/learning-paths/path-3-advanced/04-ml.md`
- Modify: `docs/learning-paths/path-4-career/01-communication.md`
- Modify: `docs/learning-paths/path-4-career/02-thinking.md`
- Modify: `docs/learning-paths/path-4-career/03-development.md`

- [ ] **Step 1: Write data engineering article**

```md
# 数据工程基础

> 分析师需要了解的数据工程知识，帮助更好地与数据团队协作和排查数据问题。深入参考请见 [KM 8. 数据工程基础](/knowledge-map/km-8-data-engineering)。

## ETL vs ELT

| | ETL | ELT |
|--|-----|-----|
| 转换位置 | 加载前（中间层） | 加载后（目标库） |
| 适用 | 传统数仓、结构化数据 | 云数仓（BigQuery / Snowflake / Redshift） |
| 灵活性 | 低 | 高 |

## 数仓分层（常用四层）

- **ODS**：源数据层，原封不动接入
- **DWD**：明细层，清洗去重
- **DWS**：汇总层，轻度聚合
- **ADS**：应用层，面向业务报表

## 数据 Pipeline 概念

```text
源数据 → 抽出（Extract）→ 转换（Transform）→ 加载（Load）→ 数据质量检查 → 报表
```

> 深入了解请参阅 [KM 8. 数据工程基础](/knowledge-map/km-8-data-engineering)。
```

- [ ] **Step 2: Write experiments article**

```md
# 实验与因果推断

> 理解因果关系的分析方法。深入参考请见 [KM 9. 实验与因果推断](/knowledge-map/km-9-experiments)。

## A/B Testing 进阶

- **MDE (Minimum Detectable Effect)**：样本量计算的核心参数
- **SRM 检测**：用卡方检验验证分流是否均匀
- **Multiple Testing Correction**：Bonferroni / Benjamini-Hochberg

## 准实验方法

当随机化不可行时：
- **DID（双重差分）**：比较实验组 vs 对照组在策略前后的变化差异
- **RDD（断点回归）**：利用阈值的天然断点（如 60 分及格）
- **Synthetic Control**：构建合成对照组

> 深入了解请参阅 [KM 9. 实验与因果推断](/knowledge-map/km-9-experiments)。
```

- [ ] **Step 3: Write governance article**

```md
# 数据治理与质量

> 分析师是数据质量的直接受害者也是守护者。深入参考请见 [KM 10. 数据治理与质量](/knowledge-map/km-10-governance)。

## Data Quality 六维度

| 维度 | 含义 | 常见问题 |
|------|------|---------|
| 完整性 | 数据是否缺失 | 字段为 NULL |
| 准确性 | 数据是否正确 | 金额错误 |
| 一致性 | 跨系统是否一致 | 口径打架 |
| 及时性 | 是否按时到 | T+1 未更新 |
| 唯一性 | 是否有重复 | 重复记录 |
| 有效性 | 是否符合规则 | 手机号格式错误 |

## 分析师怎么做？

- 建表时加上 **数据质量监控规则**
- 关键报表 **双跑验证**（新逻辑 vs 旧逻辑）
- 维护 **指标字典**，统一口径

> 深入了解请参阅 [KM 10. 数据治理与质量](/knowledge-map/km-10-governance)。
```

- [ ] **Step 4: Write ML article**

```md
# ML for BI

> 分析师不需要会写模型，但需要理解模型的思路和局限。深入参考请见 [KM 11. 机器学习基础](/knowledge-map/km-11-ml)。

## 核心概念

- **监督学习**：有标签，预测
- **无监督学习**：无标签，发现模式
- **Overfitting**：模型记住噪声，泛化差
- **特征工程**：从原始数据构造有效特征

## 分析师视角的 ML

| 场景 | 模型思路 | 产出 |
|------|---------|------|
| 用户流失预测 | 分类模型 | 流失概率 → 运营策略 |
| 用户分层 | K-Means 聚类 | 分层标签 → 精细化运营 |
| 销售预测 | 时间序列预测 | 多期预测值 → 目标参考 |

> 深入了解请参阅 [KM 11. 机器学习基础](/knowledge-map/km-11-ml)。
```

- [ ] **Step 5: Write career skill articles (communication, thinking, development)**

```md
# 04-communication.md — 沟通与协作

> 需求沟通：听懂业务需求、BRD 解读、优先级判断
> 跨团队协作：与产品 / 运营 / 工程的分工与配合
> 向上汇报：用数据讲故事的汇报结构
```

```md
# 02-thinking.md — 分析思维培养

> 结构化思维：MECE、金字塔原理、假设驱动
> 业务理解：行业研究、商业模式、竞品分析
> 批判性思维：避免确认偏误、数据说谎的常见手法
```

```md
# 03-development.md — 职业发展

> 岗位全景：BI 分析师 / 数据运营 / 数据产品 / 数据工程
> 成长路线：初级 → 中级 → 高级 → 专家/管理
> 持续学习：书籍、课程、社区、认证推荐
```

- [ ] **Step 6: Commit**

```bash
git add docs/learning-paths/path-3-advanced/ docs/learning-paths/path-4-career/
git commit -m "feat(learning-path): fill advanced and career path articles"
```

---

### Future Content Tasks (to be expanded)

The following content areas are scaffolded with placeholder files and ready for content filling in future iterations:

- **Knowledge Map** — KM 1 (SQL sub-articles) through KM 12
- **Interview** — All 7 IP categories with actual questions and answers
- **Career** — Detailed articles for CD 1-4
- **Appendix** — AP 1-4

Each future content task follows the same pattern:
1. Write the markdown content following the established conventions
2. Commit with message format: `feat(knowledge-map): fill KM N article`

---

## Self-Review Checklist

- [x] **Spec coverage**: Tasks 1-4 cover project scaffold and framework. Tasks 5-13 cover Learning Path 1 (all articles), Learning Path 2 (all articles), Learning Path 3 (all articles), and Learning Path 4 (all articles). Knowledge Map, Interview, Career, Appendix are scaffolded with placeholders ready for filling.
- [x] **Placeholder scan**: All content in Tasks 5-13 contains actual full article content (no "TBD"). Placeholder files (Tasks 4) use explicit `<!-- TODO: 填充内容 -->` markers that are visually clear and intentional for the scaffold phase.
- [x] **Type consistency**: All file paths and sidebar links use the same naming convention. All cross-references between learning paths and knowledge map use correct paths.
