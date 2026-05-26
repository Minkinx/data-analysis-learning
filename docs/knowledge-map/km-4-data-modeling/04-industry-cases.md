# 行业建模实战

> 本节以电商订单和用户行为事件两个典型场景为例，展示维度建模的完整设计过程，并总结常见建模陷阱。

## 案例一：电商订单模型设计

### 业务过程分析

电商核心业务过程（Business Process）：

```
下单 → 支付 → 发货 → 签收 → 退货（可选）
```

每个过程可以独立建模，也可以合并到累积快照中。

### 星型模型设计

```
                    ┌─────────────────┐
                    │   dim_product    │
                    │ product_key  PK  │◄──┐
                    │ product_id       │   │
                    │ product_name     │   │
                    │ category         │   │
                    │ brand            │   │
                    └─────────────────┘   │
                                          │
┌─────────────────┐    ┌────────────────────────────┐    ┌──────────────────┐
│   dim_user      │    │      fact_orders            │    │   dim_store      │
│ user_key     PK │───►│ order_key               PK │◄───│ store_key  PK    │
│ user_id         │    │ user_key     FK             │    │ store_id         │
│ user_name       │    │ product_key  FK             │    │ store_name       │
│ register_date   │    │ store_key    FK             │    │ region           │
│ member_tier     │    │ date_key     FK             │    └──────────────────┘
└─────────────────┘    │ order_amount                │
                        │ quantity                    │    ┌──────────────────┐
                        │ discount                    │    │   dim_date       │
                        │ shipping_fee                │    │ date_key     PK  │
┌─────────────────┐    │ status                      │◄───│ full_date        │
│ dim_payment     │    │ payment_method               │    │ year             │
│ payment_key  PK │───►│ refund_amount                │    │ month            │
│ payment_method  │    │ ...                          │    │ day              │
│ is_installment  │    └────────────────────────────┘    │ is_weekend       │
└─────────────────┘                                      └──────────────────┘
```

### 建表脚本

```sql
-- 事实表：订单事务
CREATE TABLE fact_orders (
    order_key       BIGINT PRIMARY KEY,
    user_key        INT NOT NULL REFERENCES dim_user(user_key),
    product_key     INT NOT NULL REFERENCES dim_product(product_key),
    store_key       INT NOT NULL REFERENCES dim_store(store_key),
    date_key        INT NOT NULL REFERENCES dim_date(date_key),
    payment_key     INT REFERENCES dim_payment(payment_key),
    order_id        VARCHAR(50),            -- 退化维度
    order_amount    DECIMAL(12,2) NOT NULL,  -- Additive
    quantity        INT NOT NULL,            -- Additive
    discount        DECIMAL(12,2) DEFAULT 0, -- Additive
    shipping_fee    DECIMAL(8,2) DEFAULT 0,  -- Additive
    unit_price      DECIMAL(10,2),           -- Non-Additive（用加权平均重算）
    tax_amount      DECIMAL(10,2) DEFAULT 0, -- Additive
    status          VARCHAR(20),             -- 退化维度
    created_at      TIMESTAMP NOT NULL
);

-- 维度表：用户
CREATE TABLE dim_user (
    user_key        INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id         VARCHAR(50) NOT NULL,
    user_name       VARCHAR(200),
    register_date   DATE,
    member_tier     VARCHAR(20),
    city            VARCHAR(100),
    -- SCD Type 2 字段
    valid_from      DATE NOT NULL,
    valid_to        DATE,
    is_current      BOOLEAN DEFAULT TRUE
);

-- 维度表：产品
CREATE TABLE dim_product (
    product_key     INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    product_id      VARCHAR(50) NOT NULL,
    product_name    VARCHAR(200),
    category        VARCHAR(100),
    sub_category    VARCHAR(100),
    brand           VARCHAR(100),
    unit_cost       DECIMAL(10,2),  -- 标准成本
    listing_price   DECIMAL(10,2)
);

-- 维度表：日期
CREATE TABLE dim_date (
    date_key        INT PRIMARY KEY,
    full_date       DATE NOT NULL,
    year            SMALLINT,
    quarter         TINYINT,
    month           TINYINT,
    day             TINYINT,
    day_of_week     TINYINT,
    is_weekend      BOOLEAN,
    is_holiday      BOOLEAN
);
```

### 常用分析 SQL

```sql
-- 每日销售额趋势
SELECT d.full_date,
       COUNT(DISTINCT f.order_id) AS order_cnt,
       SUM(f.order_amount)        AS revenue,
       SUM(f.quantity)            AS units_sold
FROM fact_orders f
JOIN dim_date d ON f.date_key = d.date_key
GROUP BY d.full_date
ORDER BY d.full_date;

-- 按品类的月度销售排名
SELECT d.year, d.month,
       p.category,
       SUM(f.order_amount) AS revenue,
       RANK() OVER (
           PARTITION BY d.year, d.month
           ORDER BY SUM(f.order_amount) DESC
       ) AS rank
FROM fact_orders f
JOIN dim_date d ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY d.year, d.month, p.category;

-- 新客 vs 老客的客单价对比
SELECT CASE WHEN u.register_date >= '2026-01-01' THEN 'New' ELSE 'Returning' END AS user_type,
       AVG(f.order_amount) AS avg_order_value,
       COUNT(*) / COUNT(DISTINCT f.user_key) AS avg_order_freq
FROM fact_orders f
JOIN dim_user u ON f.user_key = u.user_key AND u.is_current = TRUE
GROUP BY user_type;
```

## 案例二：用户行为事件模型

### 业务场景

埋点事件数据（如页面浏览、点击、加购、收藏），需要支持用户路径分析、漏斗分析和留存计算。

### 宽表事件模型设计

```sql
-- 用户行为事件事实表
CREATE TABLE fact_events (
    event_id        BIGINT PRIMARY KEY,
    user_key        INT NOT NULL REFERENCES dim_user(user_key),
    session_id      VARCHAR(100),          -- 会话 ID，退化维度
    event_name      VARCHAR(100) NOT NULL, -- 事件名（view_item, add_cart, purchase...）
    event_time      TIMESTAMP NOT NULL,    -- 事件发生时间
    date_key        INT NOT NULL REFERENCES dim_date(date_key),
    event_date_key  INT NOT NULL,          -- 事件日期（冗余，方便分区）
    page_url        VARCHAR(500),
    page_title      VARCHAR(200),
    referrer_url    VARCHAR(500),

    -- 事件属性（JSON，灵活存放下级参数）
    event_properties JSON,

    -- 设备信息（垃圾维度或 JSON）
    device_type     VARCHAR(20),           -- mobile / desktop / tablet
    browser         VARCHAR(50),
    os              VARCHAR(50),
    screen_resolution VARCHAR(20),

    -- 地理位置
    country         VARCHAR(50),
    city            VARCHAR(100),
    ip_address      VARCHAR(45)
);

-- 分区设计：按日期分区，提升查询性能
-- PARTITION BY RANGE (event_date_key)
```

### 事件维度设计

事件维度的变体设计：

```sql
-- 事件名称维度（低基数，可独立建表）
CREATE TABLE dim_event (
    event_key       INT PRIMARY KEY,
    event_name      VARCHAR(100) NOT NULL,
    event_group     VARCHAR(100),          -- 事件分组（浏览类、交易类）
    is_convert_event BOOLEAN DEFAULT FALSE -- 是否为转化事件
);

-- 设备维度（垃圾维度示例）
CREATE TABLE dim_device (
    device_key      INT PRIMARY KEY,
    device_type     VARCHAR(20),
    browser         VARCHAR(50),
    os              VARCHAR(50),
    UNIQUE (device_type, browser, os)      -- 所有组合唯一
);
```

### 漏斗分析 SQL

```sql
-- AARRR 漏斗：浏览 → 加购 → 下单 → 支付
WITH funnel_base AS (
    SELECT
        user_key,
        session_id,
        -- 判断是否发生了各阶段事件
        MAX(CASE WHEN event_name = 'view_item'  THEN 1 ELSE 0 END) AS step_view,
        MAX(CASE WHEN event_name = 'add_cart'   THEN 1 ELSE 0 END) AS step_cart,
        MAX(CASE WHEN event_name = 'create_order' THEN 1 ELSE 0 END) AS step_order,
        MAX(CASE WHEN event_name = 'payment_success' THEN 1 ELSE 0 END) AS step_pay
    FROM fact_events
    WHERE date_key BETWEEN 20250501 AND 20250526
    GROUP BY user_key, session_id
)
SELECT '浏览商品' AS step, COUNT(*) AS users FROM funnel_base WHERE step_view = 1
UNION ALL
SELECT '加入购物车', COUNT(*) FROM funnel_base WHERE step_cart  = 1
UNION ALL
SELECT '创建订单',   COUNT(*) FROM funnel_base WHERE step_order = 1
UNION ALL
SELECT '支付成功',   COUNT(*) FROM funnel_base WHERE step_pay   = 1;
```

### Session 路径分析

```sql
-- 每个 Session 的事件序列（用于路径分析）
SELECT user_key, session_id,
       ARRAY_AGG(event_name ORDER BY event_time) AS event_sequence
FROM fact_events
WHERE date_key = 20250526
GROUP BY user_key, session_id
HAVING COUNT(*) > 1;
```

## 常见建模陷阱

### 陷阱 1：事实表粒度过粗

将不同粒度的数据混在同一张表中。例如在 `fact_orders` 中同时按订单行和订单头存放度量。**一行的粒度必须是一致的。**

### 陷阱 2：忽略维度的父子关系

电商订单中包含多个商品，但每个商品在不同类目下的分类不同。这需要设计 `fact_order_items`（行级）而非直接在 `fact_orders` 中放所有商品信息。

### 陷阱 3：过度规范化

将所有维度拆成雪花状，导致查询时需要关联 10+ 张表。**对于分析查询，宽表比规范化的瘦表更有效率。**

### 陷阱 4：未处理维度的缓慢变化

用户等级变了，直接用 Type 1 覆盖，导致历史订单分析失真。**涉及需要历史回溯的维度属性，提前按 SCD Type 2 设计。**

### 陷阱 5：事实表中混入非度量字段

在事实表中存放单价、折扣率等非加性字段而不做说明。**将非度量字段标记为 Non-Additive，在文档中说明聚合方式（加权平均、取最新值等）。**

### 陷阱 6：遗漏代理键

直接使用业务系统的自然键作为维度主键，当业务键变更时发生级联更新。**始终使用代理键（Surrogate Key），自然键只作为查找字段。**

### 陷阱 7：设计的未来过度预留

为了"可能的未来需求"加入大量空字段。**保持模型精简，只建模当前已知的需求。未来可以通过新增维度或扩展 ETL 来应对。**

::: tip 最佳实践清单
- 每个事实表明确粒度定义并文档化
- 维度表使用代理键，业务键作为普通字段
- 频繁变化的维度属性提前按 SCD Type 2 设计
- 将低基数杂项归入垃圾维度
- 事实表中的度量注明聚合类型（Additive / Semi-Additive / Non-Additive）
- 按照业务过程拆分事实表，不贪大求全
:::

## 相关文章

- [维度建模方法论](/knowledge-map/km-4-data-modeling/01-dimensional-modeling) — Star vs Snowflake 与建模流派
- [事实表与维度表详解](/knowledge-map/km-4-data-modeling/02-fact-dimension) — 事实表类型与维度变体
- [缓慢变化维度](/knowledge-map/km-4-data-modeling/03-scd) — 维度属性的历史跟踪
