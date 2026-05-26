# BI 数据分析知识指南 — 设计文档

## 1. 概述

### 1.1 项目定位

面向 1-3 年经验初中级数据分析师（BI 岗）的系统化知识指南。旨在帮助读者：
- 查漏补缺，建立体系化的知识结构
- 工作中按需查阅深度参考内容
- 准备面试时集中刷题和案例训练

### 1.2 参考风格

参考 [datawhalechina/easy-vibe](https://datawhalechina.github.io/easy-vibe/zh-cn/) 的形式风格：
- VitePress 静态站点，Markdown 驱动
- 首页卡片式布局展示模块入口
- 侧边栏导航 + 顶部导航栏
- 中文为主，技术术语保留英文
- 图文并茂，多使用示意插图和格式化的内容块

### 1.3 技术选型

- **框架**：VitePress
- **语言**：中英混排（中文叙述 + 英文术语）
- **部署**：先本地编写，后续决定部署方式

## 2. 整体站点架构

站点分为 **5 个顶层模块**：

```
📊 BI 指南
├── 🎯 学习路径（Learning Paths）    — 4 条推荐学习路线
├── 🗺️ 知识地图（Knowledge Map）     — 12 大领域深度参考
├── 💼 面试专区（Interview Prep）     — 7 大题型分类题库
├── 💡 职业发展（Career）            — 岗位全景、成长路线、资源
└── 📚 附录（Appendix）              — 工具速查、术语表、构建说明
```

### 2.1 导航设计

- **顶部导航**：首页 | 学习路径 | 知识地图 | 面试专区 | 职业发展 | 附录
- **侧边栏**：根据当前模块动态切换，显示该模块的子目录树
- **首页**：卡片式布局，展示 5 大模块入口，附带站点定位介绍

## 3. 模块一：学习路径（Learning Paths）

横向导览结构，推荐按顺序学习。

### 路径一：基础能力巩固（2-4 周）

#### 1.1 SQL 核心精讲
- 基础查询与聚合：SELECT / WHERE / GROUP BY / HAVING / ORDER BY
- 多表关联：INNER / LEFT / RIGHT / FULL JOIN, Self-Join, Cross-Join
- 子查询与 CTE：标量子查询, 派生表, WITH (CTE), 递归 CTE
- 窗口函数：ROW_NUMBER / RANK / DENSE_RANK, LAG / LEAD, SUM() OVER, 滑动窗口
- 高级技巧：Pivot / Unpivot, 日期时间函数, 字符串处理, Conditional Aggregation
- 查询优化：执行计划解读, 索引优化, 分区表, SQL 反模式
- 实战场景：留存计算 SQL, 漏斗转化 SQL, RFM 分析 SQL

#### 1.2 Python 数据分析
- Pandas 核心：DataFrame 操作, groupby / agg, merge / join, apply / map
- 数据清洗：缺失值处理, 异常值检测, 类型转换, 去重
- 数据探索：描述性统计, 相关性矩阵, 分布分析
- 可视化基础：Matplotlib / Seaborn / Plotly Express
- 自动化脚本：报表导出, 邮件/IM 推送, 定时任务

#### 1.3 统计学快速复习
- 描述统计：均值 / 中位数 / 众数, 方差 / 标准差, 百分位数, 偏度 / 峰度
- 概率基础：贝叶斯定理, 随机变量, 常见分布（正态 / 二项 / 泊松 / 均匀）
- 推断统计：中心极限定理, 置信区间, 假设检验（t 检验 / 卡方 / ANOVA）
- 相关分析：Pearson / Spearman, 协方差, 相关 ≠ 因果

### 路径二：独立分析能力（4-8 周）

#### 2.1 数据建模入门
- 维度建模：Star Schema vs Snowflake Schema
- Fact Table：事务事实 / 周期快照 / 累积快照
- Dimension Table：SCD Type 1/2/3, 退化维度, Junk Dimension
- 数据建模实战：电商订单模型 / 用户行为模型

#### 2.2 分析方法论
- A/B Testing 完整流程：实验设计, 指标选择, 结果分析, 常见陷阱
- 漏斗分析：Conversion Funnel, 流失节点定位, 漏斗对比
- 同期群分析：Cohort Retention, 按月/周/日群组, Revenue Cohort
- 留存与流失：Retention Curve, 滚动留存, Churn Prediction 思路
- 用户分层：RFM 模型, LTV, 分层运营策略
- 时间序列分析：趋势 / 季节性 / 周期性, 移动平均, 同比 / 环比

#### 2.3 BI 工具实战
- Tableau：数据连接, 计算字段, LOD 表达式, Dashboard 设计
- Power BI：DAX 基础, Power Query (M), 行级安全
- Metabase / Superset：开源方案概览
- 工具选型指南

#### 2.4 业务指标体系建设
- 指标框架：AARRR, HEART 模型, GSM
- 北极星指标：定义原则, 拆解方法, 案例
- 指标字典与口径管理
- 行业指标库：电商（GMV/客单价/复购率）、金融（LTV/CAC/坏账率）、内容（DAU/时长/互动率）、SaaS（MRR/Churn/NPS）

#### 2.5 数据可视化与报告
- 可视化原则：Gestalt 原理, Chart Selection, 色彩与标注
- Dashboard 设计：信息层级, KPI 布局, 交互设计
- Data Storytelling：叙事结构, 洞察提炼
- 报告自动化：邮件报表, 预警监控

### 路径三：进阶突破（4-6 周，选学）

#### 3.1 数据工程基础
- ETL vs ELT：概念与工具链 (Airflow / dbt / Airbyte)
- 数据仓库：架构演进（传统 → 云数仓 → LakeHouse）
- Data Pipeline：调度依赖, 数据质量, 异常告警
- 数仓建模进阶：Kimball vs Inmon, Data Vault

#### 3.2 实验与因果推断
- A/B Testing 进阶：分层实验, 网络效应, MDE 计算
- 准实验方法：DID, Synthetic Control
- Causal Inference 入门：DAG, Simpson's Paradox
- 观测数据因果推断：PSM, IV, RDD

#### 3.3 数据治理与质量
- Data Quality 维度：完整性 / 准确性 / 一致性 / 及时性
- 元数据管理：数据目录, 数据血源 (Lineage), 数据地图
- 数据安全与合规：脱敏, 权限管理, 个保法 / GDPR
- 治理工具与流程

#### 3.4 ML for BI
- ML 核心概念：监督 / 无监督, Overfitting, 特征工程
- 常见模型：线性回归, 决策树, K-Means, 推荐系统
- ML 在分析中的应用：预测/分类辅助决策, 模型评估

### 路径四：职场进阶（软技能，并行学习）

#### 4.1 沟通与协作
- 需求沟通：听懂业务需求, BRD 解读, 优先级判断
- 跨团队协作：与产品 / 运营 / 工程的分工与配合
- 向上汇报：汇报结构, 指标解读, 用数据讲故事

#### 4.2 分析思维培养
- 结构化思维：MECE, 金字塔原理, 假设驱动分析
- 业务理解：行业研究, 商业模式分析, 竞品分析
- 批判性思维：避免确认偏误, 数据说谎的常见手法

#### 4.3 职业发展
- BI 岗位全景：BI 分析师 / 数据运营 / 数据产品 / 数据工程
- 能力成长路线图：从初 / 中 / 高 / 专家 / 管理
- 持续学习：优质资源推荐, 社区, 认证

## 4. 模块二：知识地图（Knowledge Map）

按领域平行组织的深度参考模块，共 12 大领域。

| 领域 | 核心内容 |
|------|---------|
| KM 1. SQL 完全指南 | 基础查询, JOIN, CTE, 窗口函数, 集合操作, 函数, Pivot, 优化, 反模式, 实战专题 |
| KM 2. Python 数据分析 | Pandas 核心, 清洗, 转换, 多表, 时间序列, NumPy, 可视化, 自动化, 高性能 |
| KM 3. 统计学与概率论 | 描述统计, 概率分布, 抽样估计, 假设检验, 回归, 贝叶斯, 统计陷阱 |
| KM 4. 数据建模 | Kimball / Inmon / Data Vault, Star/Snowflake, Fact & Dimension, SCD, 实战 |
| KM 5. 分析方法论 | 漏斗 / Cohort / 留存 / 分层 / 归因 / 异动 / 行为序列 / LTV / 行业专题 |
| KM 6. BI 工具与可视化 | 可视化原理, 图表类型, Dashboard, Storytelling, Tableau, Power BI, 开源方案 |
| KM 7. 业务指标体系 | AARRR / HEART / GSM / North Star, 指标管理, OKR/KPI, 行业指标体系 |
| KM 8. 数据工程基础 | ETL vs ELT, 数仓分层, Pipeline, Lambda/Kappa, 工具介绍 |
| KM 9. 实验与因果推断 | A/B Testing 完整体系, DID, RDD, PSM, IV, Causal Inference |
| KM 10. 数据治理与质量 | 6 维度质量, 元数据管理, 安全合规, 治理组织 |
| KM 11. 机器学习基础 | 监督 / 无监督, 特征工程, 回归 / 分类 / 聚类 / 推荐, 可解释性 |
| KM 12. 数据产品与工具链 | 工具全景, 数据产品视角, AI 辅助分析, 效率工具 |

## 5. 模块三：面试专区（Interview Prep）

| 分类 | 内容 |
|------|------|
| IP 1. SQL 面试题库 | 入门 / 中级 / 进阶 / 困难四级难度, 大厂真题 |
| IP 2. Python 面试题 | Pandas 操作, 数据处理, 算法基础 |
| IP 3. 统计学与概率题 | 概率问题, 假设检验, A/B 测试案例 |
| IP 4. Case Study | 指标异动, 策略评估, 产品分析, 费米估算, 分析思路 |
| IP 5. Product Sense | 指标定义, 数据产品设计, 数据驱动决策 |
| IP 6. 行为面试 | STAR 法则, 高频问题, 项目深挖 |
| IP 7. 面试策略 | 级别差异化, 公司类型, 简历指南, 谈薪 |

## 6. 模块四：职业发展（Career）

| 分类 | 内容 |
|------|------|
| CD 1. 岗位全景图 | 岗位类型 / 职责 / 技能对比, 方向选择 |
| CD 2. 能力成长路线 | 初级 / 中级 / 高级 / 专家管理各阶段能力要求 |
| CD 3. 学习资源推荐 | 书籍 / 课程认证 / 社区博客 / 开源项目 |
| CD 4. 职场软技能 | 需求沟通, 跨团队协作, 向上汇报, 时间管理 |

## 7. 模块五：附录（Appendix）

| 分类 | 内容 |
|------|------|
| AP 1. 工具速查手册 | SQL 函数大全, Pandas 速查, 统计公式, 命令行 / Git |
| AP 2. 术语表 | BI 领域常用中英文术语解释 |
| AP 3. 构建与维护 | 本站构建说明, 贡献指南, 更新日志 |
| AP 4. 许可证与声明 | CC BY-NC-SA 4.0 |

## 8. 学习路径与知识地图的引用关系

学习路径和知识地图存在内容重叠的领域（如 SQL、数据建模、统计学等），处理方式如下：

- **学习路径**中的章节提供概述 + 核心知识点 + 学习指引，篇幅精简
- **知识地图**对应领域提供完整的深度参考
- 学习路径页面通过内部链接指向知识地图的对应章节

这种设计避免了重复编写，同时兼顾了"系统学习"和"按需查阅"两种场景。

## 9. 内容粒度原则

### 侧边栏导航粒度

侧边栏展示到二级（分组 → 文章），三级及以上内容在文章内部通过 Heading 组织。

### 独立成文的判断标准

| 条件 | 独立成文 | 合并父级 |
|------|---------|---------|
| 可写 800+ 字且有独立逻辑 | ✅ 窗口函数、查询优化 | |
| 几个子主题关联紧密，分开阅读体验割裂 | | ✅ 数据清洗、指标框架 |
| 面试常考、值得单独深挖 | ✅ SQL 面试题库 | |
| 概念性内容（偏定义和认知） | | ✅ 概述性文章 |

### 内容密集型文章的处理

对知识地图中内容量较大的领域（如 KM 1 SQL、KM 5 分析方法论），一个领域目录下可包含多篇独立文章：

```
km-1-sql/
├── index.md              # 概述 + 导航
├── 01-basic-queries.md   # 基础查询
├── 02-joins.md           # JOIN
├── 03-cte.md             # CTE
├── 04-window-functions.md# 窗口函数
├── 05-optimization.md    # 查询优化
└── 06-scenarios.md       # 实战场景
```

以知识点模块为目录，内部按逻辑顺序编号，便于维护和导航配置。

## 10. 文件目录结构（VitePress 建议）

```
data_analysis/
├── docs/
│   ├── .vitepress/
│   │   └── config.mjs
│   ├── public/
│   │   └── (图片、SVG 等静态资源)
│   ├── index.md                  # 首页
│   ├── learning-paths/           # 🎯
│   │   ├── index.md
│   │   ├── path-1-basics/
│   │   │   ├── index.md
│   │   │   ├── 01-sql-core.md
│   │   │   ├── 02-python.md
│   │   │   └── 03-statistics.md
│   │   ├── path-2-core/
│   │   │   ├── index.md
│   │   │   ├── 01-data-modeling.md
│   │   │   ├── 02-analysis-methods.md
│   │   │   ├── 03-bi-tools.md
│   │   │   ├── 04-metrics.md
│   │   │   └── 05-visualization.md
│   │   ├── path-3-advanced/
│   │   │   ├── index.md
│   │   │   ├── 01-data-engineering.md
│   │   │   ├── 02-experiments.md
│   │   │   ├── 03-governance.md
│   │   │   └── 04-ml.md
│   │   └── path-4-career/
│   │       ├── index.md
│   │       ├── 01-communication.md
│   │       ├── 02-thinking.md
│   │       └── 03-development.md
│   ├── knowledge-map/           # 🗺️
│   │   ├── index.md
│   │   ├── km-1-sql/
│   │   │   ├── index.md
│   │   │   ├── 01-basic-queries.md
│   │   │   ├── 02-joins.md
│   │   │   ├── 03-subqueries-cte.md
│   │   │   ├── 04-window-functions.md
│   │   │   ├── 05-set-operations.md
│   │   │   ├── 06-functions.md
│   │   │   ├── 07-optimization.md
│   │   │   └── 08-scenarios.md
│   │   ├── km-2-python.md
│   │   ├── km-3-statistics.md
│   │   ├── km-4-data-modeling/
│   │   │   ├── index.md
│   │   │   ├── 01-dimensional-modeling.md
│   │   │   ├── 02-fact-dimension.md
│   │   │   ├── 03-scd.md
│   │   │   └── 04-industry-cases.md
│   │   ├── km-5-analysis-methods/
│   │   │   ├── index.md
│   │   │   ├── 01-funnel.md
│   │   │   ├── 02-cohort.md
│   │   │   ├── 03-retention.md
│   │   │   ├── 04-user-segmentation.md
│   │   │   ├── 05-attribution.md
│   │   │   ├── 06-anomaly-detection.md
│   │   │   ├── 07-ltv.md
│   │   │   └── 08-industry.md
│   │   ├── km-6-bi-visualization/
│   │   │   ├── index.md
│   │   │   ├── 01-principles.md
│   │   │   ├── 02-chart-types.md
│   │   │   ├── 03-dashboard-design.md
│   │   │   ├── 04-storytelling.md
│   │   │   ├── 05-tableau.md
│   │   │   ├── 06-powerbi.md
│   │   │   └── 07-open-source.md
│   │   ├── km-7-metrics/
│   │   │   ├── index.md
│   │   │   ├── 01-frameworks.md
│   │   │   ├── 02-metrics-management.md
│   │   │   ├── 03-okr-kpi.md
│   │   │   ├── 04-ecommerce.md
│   │   │   ├── 05-finance.md
│   │   │   ├── 06-content.md
│   │   │   └── 07-saas.md
│   │   ├── km-8-data-engineering.md
│   │   ├── km-9-experiments.md
│   │   ├── km-10-governance.md
│   │   ├── km-11-ml.md
│   │   └── km-12-tools.md
│   ├── interview/              # 💼
│   │   ├── index.md
│   │   ├── ip-1-sql/
│   │   │   ├── index.md
│   │   │   ├── 01-beginner.md
│   │   │   ├── 02-intermediate.md
│   │   │   ├── 03-advanced.md
│   │   │   ├── 04-hard.md
│   │   │   └── 05-real-cases.md
│   │   ├── ip-2-python.md
│   │   ├── ip-3-statistics.md
│   │   ├── ip-4-case-study/
│   │   │   ├── index.md
│   │   │   ├── 01-metric-anomaly.md
│   │   │   ├── 02-strategy-evaluation.md
│   │   │   ├── 03-product-analysis.md
│   │   │   ├── 04-fermi-estimation.md
│   │   │   └── 05-analytical-thinking.md
│   │   ├── ip-5-product-sense.md
│   │   ├── ip-6-behavioral.md
│   │   └── ip-7-strategy.md
│   ├── career/                 # 💡
│   │   ├── index.md
│   │   ├── cd-1-overview.md
│   │   ├── cd-2-growth-path.md
│   │   ├── cd-3-resources.md
│   │   └── cd-4-soft-skills.md
│   └── appendix/               # 📚
│       ├── index.md
│       ├── ap-1-cheatsheets.md
│       ├── ap-2-glossary.md
│       ├── ap-3-maintenance.md
│       └── ap-4-license.md
├── package.json
├── .gitignore
└── README.md
```

## 11. 后续阶段

1. **阶段一**：初始化 VitePress 项目，配置首页与导航结构
2. **阶段二**：填充学习路径内容（优先路径一和二）
3. **阶段三**：填充知识地图模块（优先 KM 1-7）
4. **阶段四**：填充面试专区题库
5. **阶段五**：填充职业发展与附录
6. **阶段六**：完善样式、交互、多端适配
