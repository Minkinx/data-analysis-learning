# 开源 BI 方案

> 商业 BI 工具（Tableau、Power BI）功能强大但成本高昂，且受限于厂商生态。开源 BI 方案提供了**低成本、可自托管、可定制**的替代选择。本节介绍 Metabase 和 Superset 两个主流开源 BI 工具。

## Metabase

Metabase 是一款**面向业务用户**的开源 BI 工具。它强调"让没有 SQL 经验的人也能自助分析"，部署和维护门槛极低。

### 快速部署

```bash
# Docker 一键部署
docker run -d \
  -p 3000:3000 \
  -v ~/metabase-data:/metabase.db \
  --name metabase \
  metabase/metabase

# 或使用 Docker Compose（含 PostgreSQL 持久化）
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  metabase:
    image: metabase/metabase:latest
    ports:
      - "3000:3000"
    environment:
      MB_DB_TYPE: postgres
      MB_DB_DBNAME: metabase
      MB_DB_HOST: postgres
      MB_DB_PORT: 5432
      MB_DB_USER: metabase
      MB_DB_PASS: metabase
    volumes:
      - ./plugins:/plugins
    restart: always
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: metabase
      POSTGRES_USER: metabase
      POSTGRES_PASSWORD: metabase
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

### SQL 查询

Metabase 的 Web SQL 编辑器支持原生 SQL 查询：

```sql
-- Metabase 中支持变量模板，用 {{variable}} 实现动态参数
SELECT
  DATE_TRUNC('month', o.created_at) AS month,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(o.total) AS revenue,
  AVG(o.total) AS avg_order_value
FROM orders o
WHERE o.created_at >= {{start_date}}
  AND o.created_at < {{end_date}}
  [[AND o.region = {{region}}]]  -- 可选筛选
GROUP BY 1
ORDER BY 1;
```

- **变量（Variables）**：`{{variable_name}}`，用户执行查询时会弹出输入框
- **可选片段（Optional Clauses）**：`[[AND condition]]`，当变量为空时自动忽略该条件

### 核心功能

| 功能 | 说明 |
|------|------|
| **问题（Questions）** | 单一图表/查询，支持简单模式和原生 SQL 模式 |
| **仪表板（Dashboards）** | 组合多个问题，支持筛选器联动 |
| **订阅（Subscriptions）** | 定时通过邮件/Slack 发送报表 |
| **数据模型（Data Model）** | 自定义字段类型、语义层定义、度量值创建 |
| **权限（Permissions）** | 按数据集合、按用户组精细控制数据访问 |
| **嵌入（Embedding）** | 将图表/仪表板嵌入到内部应用中 |

### 权限管理

```text
权限层级：
  管理员（Admin）→ 完全控制
  数据管理员（Data Manager）→ 管理数据模型
  普通用户 → 按集合（Collection）和数据源授权

最佳实践：
  - 创建"基础数据"集合，只允许数据管理员修改
  - 用户创建的问题保存在"个人收藏"集合
  - 正式仪表板发布到"公开"集合，只读权限
  - 敏感字段使用列级权限控制
```

::: tip Metabase 适用场景
适合**团队规模不大（10-100 人）**、**分析需求以看数和简单聚合为主**的团队。Metabase 不适合需要复杂 DAX/LOD 计算或数百用户并发访问的场景。
:::

## Apache Superset

Apache Superset 是 Airbnb 开源的企业级 BI 平台，功能定位更接近 Tableau/Power BI，支持**丰富的可视化、复杂的 SQL 查询和细粒度权限控制**。

### 部署方式

```bash
# Docker Compose 部署（推荐用于生产环境）
git clone https://github.com/apache/superset.git
cd superset
docker-compose -f docker-compose-non-dev.yml up -d

# 或使用 Python 直接安装
pip install apache-superset
superset db upgrade
superset init
```

### 连接数据库

Superset 支持几乎所有主流数据库（50+ 种），通过 SQLAlchemy URI 连接：

```text
MySQL:     mysql://user:pass@host:3306/db
PostgreSQL: postgresql://user:pass@host:5432/db
ClickHouse: clickhouse+native://user:pass@host:9000/db
Snowflake:  snowflake://user:pass@account/db
Presto:     presto://host:8080/catalog/schema
```

### 图表类型

Superset 提供了 60+ 种原生可视化类型，远超 Metabase：

```text
常用类型：
  - Table / Pivot Table（明细表、透视表）
  - Distribution Bar / Histogram（柱状图、直方图）
  - Time-series Line / Area / Bar（时间序列）
  - Scatter Plot / Bubble Chart（散点图、气泡图）
  - Heatmap / Calendar Heatmap（热力图）
  - Treemap / Sunburst（树图、旭日图）
  - Mapbox / DeckGL（地理空间可视化）
  - Box Plot / Violin Plot（箱线图、小提琴图）
  - Sankey / Parallel Coordinates（桑基图、平行坐标）
  - Word Cloud（词云）
```

### SQL Lab

Superset 的 SQL Lab 是其核心功能之一，提供一个 Web 端的 SQL IDE：

```sql
-- 支持多 Tab 编辑、查询历史、自动补全
-- 查询结果可以直接创建图表

SELECT
    d.region,
    d.category,
    DATE_TRUNC('month', f.order_date) AS month,
    COUNT(DISTINCT f.order_id) AS orders,
    SUM(f.revenue) AS revenue,
    SUM(f.revenue) / COUNT(DISTINCT f.order_id) AS avg_revenue
FROM fact_sales f
JOIN dim_product d ON f.product_key = d.product_key
WHERE f.order_date >= '2025-01-01'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;
```

**SQL Lab 特性**：
- LIMIT 自动限制（默认 1000 行）
- 长时间查询后台运行（异步执行）
- 查询结果可以下载为 CSV/Excel
- 查询结果可以直接"创建图表"（Explore in Chart）

### 高级功能

| 功能 | 说明 |
|------|------|
| **虚拟数据集（Virtual Dataset）** | 将 SQL 查询保存为"表"，供后续复用 |
| **计算列（Calculated Column）** | 类似 Tableau 的计算字段 |
| **动态筛选器（Dashboard Filters）** | 全局筛选器、跨图表同步 |
| **自定义 CSS** | 调整仪表板样式 |
| **API 访问** | 完整的 REST API，支持自动化操作 |
| **SSO 集成** | LDAP、OAuth、OpenID Connect |
| **告警与通知** | 基于条件的自动告警 |

## 工具对比

| 维度 | Metabase | Superset | Tableau | Power BI |
|------|---------|----------|---------|----------|
| **部署难度** | ⭐（简单，5 分钟） | ⭐⭐⭐（中等） | ⭐⭐⭐⭐（Server 复杂） | ⭐⭐⭐⭐（需要 Azure/本地网关） |
| **非技术用户** | ⭐⭐⭐⭐⭐（最优） | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **可视化丰富度** | ⭐⭐（有限） | ⭐⭐⭐⭐⭐（丰富） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SQL 能力** | ⭐⭐⭐（基础） | ⭐⭐⭐⭐⭐（SQL Lab 强大） | ⭐⭐⭐ | ⭐⭐ |
| **大数据支持** | ⭐⭐（10M 以下推荐） | ⭐⭐⭐⭐⭐（亿级无压力） | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **权限管控** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **嵌入能力** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **社区生态** | ⭐⭐⭐⭐（活跃） | ⭐⭐⭐⭐⭐（Apache 项目） | ⭐⭐⭐⭐⭐（商业支持） | ⭐⭐⭐⭐⭐（微软生态） |
| **许可成本** | 免费 / 付费企业版 | 完全免费 | 昂贵（按用户/年） | 中等（Pro/Fabric） |
| **运维成本** | 极低 | 中等 | 高 | 高 |

### 选型建议

```text
你的团队有什么需求？

├── 团队小（< 50 人），需要快速上线看板
│   └── 业务人员自助分析为主
│       └── → Metabase（最低的运维和学习成本）
│
├── 团队中等（50-500 人），需要复杂分析
│   ├── 技术团队较强，需要自定义可视化
│   │   └── → Superset（最灵活的开源方案）
│   └── 技术薄弱，预算充足
│       └── → Tableau / Power BI
│
├── 大型企业（500+ 人），需要严格权限管控
│   └── → Tableau Server / Power BI Premium
│
└── 需要嵌入式分析
    └── → Metabase Embedding / Tableau Embedded / Superset iframe
```

## 相关文章

- [Tableau 实战](/knowledge-map/km-6-bi-visualization/05-tableau)
- [Power BI 实战](/knowledge-map/km-6-bi-visualization/06-powerbi)
