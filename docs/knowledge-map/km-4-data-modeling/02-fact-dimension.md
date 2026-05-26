# 事实表与维度表

> 事实表（Fact Table）和维度表（Dimension Table）是维度建模的两大基石。本节深入介绍事实表的三种类型与度量分类、维度表的多种变体，以及键的选择策略。

## Fact Table 类型

事实表记录业务过程中的 **度量事件（Metrics Events）**。根据存储粒度不同，分为三种类型：

### 事务事实表（Transaction Fact）

记录每个业务事件的一行，是**最细粒度**的事实表：

```sql
CREATE TABLE fact_transaction_order (
    order_id        BIGINT PRIMARY KEY,
    product_key     INT NOT NULL,
    customer_key    INT NOT NULL,
    date_key        INT NOT NULL,
    store_key       INT NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    discount        DECIMAL(10,2) DEFAULT 0,
    order_amount    DECIMAL(10,2) NOT NULL
);
```

**特点**：行级事件、可最精确聚合、数据量最大

### 周期快照事实表（Periodic Snapshot Fact）

按固定时间间隔（每天/每月）记录度量的**快照**：

```sql
CREATE TABLE fact_daily_account_balance (
    account_key     INT NOT NULL,
    date_key        INT NOT NULL,
    end_of_day_bal  DECIMAL(15,2) NOT NULL,
    min_bal         DECIMAL(15,2) NOT NULL,
    max_bal         DECIMAL(15,2) NOT NULL,
    transaction_cnt INT DEFAULT 0,
    PRIMARY KEY (account_key, date_key)
);
```

**特点**：定期汇总、适合趋势分析、数据量可控（取决于时间粒度）

### 累积快照事实表（Accumulating Snapshot Fact）

记录一个**流程生命周期**中多个里程碑的状态，行在过程中被反复更新：

```sql
CREATE TABLE fact_order_fulfillment (
    order_id            BIGINT PRIMARY KEY,
    order_date_key      INT NOT NULL,
    payment_date_key    INT,        -- 先为空，支付后更新
    ship_date_key       INT,        -- 发货后更新
    delivery_date_key   INT,        -- 签收后更新
    return_date_key     INT,        -- 退货后更新
    order_amount        DECIMAL(10,2),
    actual_ship_days    INT,        -- 实际发货天数
    actual_delivery_days INT        -- 实际配送天数
);
```

**特点**：行被反复更新、用于流程分析（时效、转化）、行数最少（每订单一行）

### 三种事实表对比

| 维度 | 事务事实表 | 周期快照 | 累积快照 |
|------|-----------|---------|---------|
| 粒度 | 单行 = 单事件 | 单行 = 时间段 + 实体 | 单行 = 流程实例 |
| 更新方式 | 只插入（Append） | 只插入（Append） | 反复更新（Update） |
| 数据量 | 最大 | 中（取决于周期） | 最小 |
| 时间维度 | 事件时间 | 快照时间 | 多个里程碑时间 |
| 典型场景 | 订单明细、点击日志 | 账户余额、库存快照 | 订单履约、工单流转 |
| 是否可追加 | 持续追加 | 周期性追加 | 不追加，只更新 |

## 度量分类

事实表中的数值度量按聚合能力分为三类：

| 类型 | 定义 | 示例 | 跨时间聚合 |
|------|------|------|-----------|
| **Additive（可加）** | 跨所有维度可求和 | 销售额、数量、成本 | 直接 SUM |
| **Semi-Additive（半可加）** | 跨部分维度可求和 | 账户余额、库存量 | 不能 SUM 时间维度 |
| **Non-Additive（不可加）** | 不能跨任何维度求和 | 比率、单价、折扣率 | 需要加权平均 |

```sql
-- Additive: 任意维度求和
SELECT SUM(order_amount) FROM fact_transaction_order;   -- 有意义

-- Semi-Additive: 时间维度不能 SUM
SELECT account_key,
       AVG(end_of_day_bal) AS avg_balance               -- 用 AVG 而非 SUM
FROM fact_daily_account_balance
WHERE date_key BETWEEN 20250101 AND 20250526
GROUP BY account_key;

-- Non-Additive: 存储原始值，聚合时用公式重算
SELECT SUM(order_amount) / SUM(quantity) AS avg_price   -- 加权平均
FROM fact_transaction_order;
```

::: warning Semi-Additive 处理
对于余额、库存等半可加度量，跨时间聚合时应使用 `AVG` 或取 **期末值（Latest Value）**，而不是 `SUM`。
:::

## Dimension Table 变体

### 一致性维度（Conformed Dimension）

在多个数据集市/事实表之间**共享相同含义和取值**的维度。这是 Kimball 总线架构的核心：

```sql
-- dim_date 同时用于 sales、inventory、marketing 等多个事实表
CREATE TABLE dim_date (
    date_key    INT PRIMARY KEY,
    full_date   DATE NOT NULL,
    year        SMALLINT,
    quarter     TINYINT,
    month       TINYINT,
    week        TINYINT,
    is_weekend  BOOLEAN
);
```

### 退化维度（Degenerate Dimension）

维度的属性直接存放在事实表中，没有独立的维度表：

```sql
CREATE TABLE fact_orders (
    order_id    BIGINT PRIMARY KEY,   -- order_id 本身是维度属性
    product_key INT,
    order_no    VARCHAR(50),          -- 订单编号，退化维度
    -- ... 其他度量
);
```

当维度只有单个属性且不需要分层时，退化维度可以避免多余的关联。

### 垃圾维度（Junk Dimension）

将多个**低基数（Low-Cardinality）** 的杂项标志归并到一张表中：

```sql
-- 将多个标志合并为垃圾维度
CREATE TABLE dim_junk_order (
    junk_key        INT PRIMARY KEY,
    is_new_user     BOOLEAN,
    is_promo_order  BOOLEAN,
    payment_method  VARCHAR(20),
    ship_method     VARCHAR(20)
);

-- 事实表引用垃圾维度键
CREATE TABLE fact_orders (
    order_id    BIGINT PRIMARY KEY,
    junk_key    INT REFERENCES dim_junk_order(junk_key),
    -- ... 其他度量
);
```

### 角色扮演维度（Role-Playing Dimension）

同一张维度表在事实表中以**不同角色**出现多次：

```sql
CREATE TABLE fact_order_fulfillment (
    order_id         BIGINT PRIMARY KEY,
    order_date_key   INT REFERENCES dim_date(date_key),
    ship_date_key    INT REFERENCES dim_date(date_key),   -- 同一张 dim_date
    delivery_date_key INT REFERENCES dim_date(date_key)   -- 同一张 dim_date
);
```

在查询时需要用别名区分：

```sql
SELECT o.order_id,
       od.full_date  AS order_date,
       sd.full_date  AS ship_date,
       dd.full_date  AS delivery_date
FROM fact_order_fulfillment o
LEFT JOIN dim_date od ON o.order_date_key = od.date_key
LEFT JOIN dim_date sd ON o.ship_date_key = sd.date_key
LEFT JOIN dim_date dd ON o.delivery_date_key = dd.date_key;
```

## 代理键 vs 自然键

### 代理键（Surrogate Key）

系统自动生成的**无意义整数**（通常自增或序列），作为维度表的主键：

```sql
CREATE TABLE dim_product (
    product_key   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- 代理键
    product_id    VARCHAR(50) NOT NULL,                           -- 自然键
    product_name  VARCHAR(200),
    category      VARCHAR(100),
    -- ...
);
```

### 自然键（Natural Key）

业务系统中已有的唯一标识，如订单号、商品 SKU、身份证号等。

### 对比

| 维度 | 代理键 | 自然键 |
|------|--------|--------|
| 生成方式 | 系统自动生成（自增/UUID） | 业务系统中提取 |
| 可读性 | 无意义 | 有业务含义 |
| 唯一性 | 保证 | 可能因业务变更而不唯一 |
| 跨系统兼容 | 好 | 差（不同系统格式不同） |
| 维度变更影响 | 事实表不受影响 | 需要级联更新 |
| 存储开销 | 4~8 字节 | 可能很大（如 UUID/字符串） |
| SCD 支持 | 天然支持 | 难以处理历史变化 |

::: tip 代理键实践
**始终使用代理键**作为维度表主键，自然键作为业务标识字段。代理键隔离了源系统的变化，使维度建模更灵活。在 ETL 的维度加载过程中，通过自然键查找对应的代理键。
:::

## 相关文章

- [维度建模方法论](/knowledge-map/km-4-data-modeling/01-dimensional-modeling) — Star vs Snowflake 与建模流派
- [缓慢变化维度](/knowledge-map/km-4-data-modeling/03-scd) — 维度属性的历史跟踪
- [行业建模实战](/knowledge-map/km-4-data-modeling/04-industry-cases) — 电商与用户行为建模
