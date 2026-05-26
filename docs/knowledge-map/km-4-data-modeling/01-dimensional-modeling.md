# 维度建模方法论

> 维度建模（Dimensional Modeling）是数据仓库领域最主流的建模方法论，由 Ralph Kimball 提出。本节对比三大建模流派，深入分析星型与雪花型设计的选择策略。

## 三大建模方法论

### Kimball 维度建模

Kimball 维度建模以 **业务过程（Business Process）** 为中心，遵循"先总线架构、后一致性维度"的原则。核心思想：

- **事实表（Fact Table）** 记录业务度量，包含外键和数值型度量
- **维度表（Dimension Table）** 描述业务场景的上下文，宽表设计，非规范化

```sql
-- Kimball 风格的销售模型
CREATE TABLE fact_sales (
    sale_id         BIGINT PRIMARY KEY,
    product_key     INT      NOT NULL REFERENCES dim_product(product_key),
    customer_key    INT      NOT NULL REFERENCES dim_customer(customer_key),
    date_key        INT      NOT NULL REFERENCES dim_date(date_key),
    store_key       INT      NOT NULL REFERENCES dim_store(store_key),
    quantity        INT      NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0
);
```

::: tip 适用场景
Kimball 最适合 **业务分析报表、BI 可视化、自助分析** 场景。数仓建设速度快，业务用户理解成本低。
:::

### Inmon 范式建模

Inmon 主张 **自上而下（Top-Down）**，先建立符合 3NF 的企业级数据模型（CIF），再从中派生数据集市：

| 方面 | Kimball | Inmon |
|------|---------|-------|
| 架构方向 | 自下而上（Bottom-Up） | 自上而下（Top-Down） |
| 设计核心 | 业务过程 + 维度 | 实体关系（3NF） |
| 规范化程度 | 低（维度冗余） | 高（消除冗余） |
| 建设速度 | 快，按主题迭代 | 慢，需要全局规划 |
| 数据一致性 | 一致性维度保证 | 3NF 天然保证 |
| 修改灵活性 | 维度变更影响范围小 | 3NF 变更需全局评估 |

### Data Vault

Data Vault 是第三流派，结合了 Kimball 和 Inmon 的优点，专为 **大规模企业数据仓库** 和 **审计需求严格** 的场景设计：

- **Hub** — 存储业务键（Business Key），不含关系
- **Link** — 存储 Hub 之间的关系（多对多）
- **Satellite** — 存储描述性属性，带时间版本

```sql
-- Data Vault 示例：Hub + Satellite
CREATE TABLE hub_customer (
    customer_hk    CHAR(32) PRIMARY KEY,  -- Hash Key
    customer_id    VARCHAR(50) NOT NULL,
    load_dts       TIMESTAMP NOT NULL,
    record_source  VARCHAR(200) NOT NULL
);

CREATE TABLE sat_customer_detail (
    customer_hk    CHAR(32) REFERENCES hub_customer(customer_hk),
    load_dts       TIMESTAMP NOT NULL,
    name           VARCHAR(200),
    email          VARCHAR(200),
    phone          VARCHAR(50),
    hash_diff      CHAR(32),              -- 用于检测变更
    PRIMARY KEY (customer_hk, load_dts)
);
```

### 方法论选择决策

| 场景 | 推荐方法 | 理由 |
|------|---------|------|
| 小型团队快速建设 BI | Kimball | 迭代快，业务理解成本低 |
| 大型企业统一数据模型 | Inmon / Data Vault | 一致性高，适合全局管控 |
| 审计合规和数据溯源 | Data Vault | 完整的变更历史记录 |
| 实时数仓（Streaming） | Kimball + 宽表 | 查询路径简单，延迟低 |

## Star Schema 与 Snowflake Schema

### 星型模型（Star Schema）

事实表在中心，维度表直接连接。维度表**非规范化**（将层级合并到一张宽表）：

```
fact_sales
 ├── dim_product   (category, sub_category, brand → 都在一张表)
 ├── dim_customer  (city, state, country → 都在一张表)
 ├── dim_date
 └── dim_store
```

**优势**：查询简单（少 JOIN）、OLAP 性能高
**劣势**：维度表有数据冗余，ETL 时需处理

### 雪花模型（Snowflake Schema）

维度表进一步规范化，将层级拆分成单独的表：

```
fact_sales
 ├── dim_product → dim_category
 ├── dim_customer → dim_city → dim_state → dim_country
 ├── dim_date
 └── dim_store
```

**优势**：数据冗余少，更新维护更一致
**劣势**：查询需要更多 JOIN，影响性能

### 设计决策对照

| 维度 | Star | Snowflake |
|------|------|-----------|
| 查询性能 | 优（少 JOIN） | 中（多 JOIN） |
| 存储成本 | 高（冗余） | 低（规范化） |
| ETL 复杂度 | 中（需处理层级冗余的更新） | 高（多表关联加载） |
| 业务理解 | 易（直观） | 难（需要了解表关系） |
| 维度层级变化 | 需要更新宽表 | 只需要更新层级表 |
| OLAP Cube 支持 | 原生支持 | 通常需要反规范化回星型 |

::: tip 实践建议
**大多数情况下选择星型模型**。现代数仓（ClickHouse、Doris、Snowflake）存储成本已大幅下降，星型带来的查询性能优势和开发效率优势远大于存储冗余的成本。雪花模型只在维度层级非常复杂且经常发生变化时才值得考虑。
:::

## 混合策略：谨慎反规范化

实际项目中往往采用混合方案：

1. **核心维度**（日期、用户、产品）— 星型宽表
2. **高基数且多级维度**（地域、组织架构）— 可考虑有限雪花化
3. **频繁变化的属性**（用户标签）— 可在 ETL 中做拉链处理，不拆表

```sql
-- 常见实践：宽表 + JSON 存灵活属性
CREATE TABLE dim_customer (
    customer_key   INT PRIMARY KEY,
    customer_id    VARCHAR(50),
    name           VARCHAR(200),
    email          VARCHAR(200),
    city           VARCHAR(100),
    state          VARCHAR(50),
    country        VARCHAR(50),
    tags           JSON,            -- 高频变化的非核心属性
    created_at     TIMESTAMP
);
```

## 相关文章

- [事实表与维度表详解](/knowledge-map/km-4-data-modeling/02-fact-dimension) — 深入理解事实与维度的内部类型
- [缓慢变化维度](/knowledge-map/km-4-data-modeling/03-scd) — 维度属性变更的处理策略
- [行业建模实战](/knowledge-map/km-4-data-modeling/04-industry-cases) — 电商与用户行为建模
