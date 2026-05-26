# 缓慢变化维度（Slowly Changing Dimensions）

> 维度属性随时间发生变化（如用户改名、商品换类目）时，数据仓库需要用相应的策略来管理这种变化。SCD 就是处理这类问题的标准方法。

## SCD Type 1 — 覆盖（Overwrite）

直接**覆盖**旧值，不保留历史：

```sql
-- Type 1：直接 UPDATE
UPDATE dim_customer
SET email = 'new@example.com',
    updated_at = CURRENT_TIMESTAMP
WHERE customer_id = 'C001';
```

| 方面 | 说明 |
|------|------|
| 历史记录 | 不保留，旧值丢失 |
| 实现复杂度 | 最低 |
| 适用场景 | 错误更正、不重要的属性（如联系方式） |
| 事实表影响 | 所有历史事实关联到当前值 |
| 审计能力 | 无 |

::: warning Type 1 的风险
一旦覆盖，历史事实关联到的维度属性变成了新值，历史分析将产生"错误的正确结果"。例如把商品类目从"数码"改为"家电"，2023 年的订单在分析时会显示为"家电"而不是"数码"。
:::

## SCD Type 2 — 新增行 + 有效期（New Row + Valid Period）

每次属性变化时**新增一条维度记录**，通过有效时间区间和当前标志来区分：

### 建表示例

```sql
CREATE TABLE dim_customer_scd2 (
    customer_key   INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_id    VARCHAR(50) NOT NULL,          -- 自然键
    name           VARCHAR(200),
    email          VARCHAR(200),
    city           VARCHAR(100),
    member_tier    VARCHAR(20),

    -- SCD Type 2 控制字段
    valid_from     DATE NOT NULL,                 -- 生效起始日期
    valid_to       DATE,                          -- 失效日期（NULL = 当前有效）
    is_current     BOOLEAN DEFAULT TRUE,          -- 当前有效标志
    version        INT DEFAULT 1,                 -- 版本号（可选）
    PRIMARY KEY (customer_key, valid_from)        -- 联合主键
);
```

### 更新过程（示例）

假设用户 `C001` 的会员等级从 `Silver` 变为 `Gold`：

```sql
-- 1. 将当前行的 valid_to 置为昨天，is_current 置为 FALSE
UPDATE dim_customer_scd2
SET valid_to = '2026-05-25',
    is_current = FALSE
WHERE customer_id = 'C001'
  AND is_current = TRUE;

-- 2. 插入新行
INSERT INTO dim_customer_scd2
    (customer_id, name, email, city, member_tier,
     valid_from, valid_to, is_current, version)
SELECT customer_id, name, email, city, 'Gold',
       '2026-05-26', NULL, TRUE, version + 1
FROM dim_customer_scd2
WHERE customer_id = 'C001'
  AND is_current = TRUE;  -- 注意这里需要基于旧的 current 行
```

### 查询模式

**按事实关联到当时的维度值：**

```sql
-- 查询 2025 年 12 月所有订单的用户等级
SELECT f.order_id,
       f.order_date,
       c.name,
       c.member_tier
FROM fact_orders f
JOIN dim_customer_scd2 c
  ON f.customer_id = c.customer_id
 AND f.order_date BETWEEN c.valid_from AND COALESCE(c.valid_to, '9999-12-31')
WHERE f.order_date BETWEEN '2025-12-01' AND '2025-12-31';
```

**取维度的当前版本：**

```sql
SELECT customer_id, name, member_tier
FROM dim_customer_scd2
WHERE is_current = TRUE;
```

**查看维度的完整变更历史：**

```sql
SELECT customer_id, name, member_tier,
       valid_from, valid_to, version
FROM dim_customer_scd2
WHERE customer_id = 'C001'
ORDER BY version;
```

## SCD Type 3 — 新增列（Add Column）

保留**有限的历史**，在表中增加额外列来存储前一个值：

```sql
CREATE TABLE dim_customer_scd3 (
    customer_key      INT PRIMARY KEY,
    customer_id       VARCHAR(50),
    name              VARCHAR(200),
    current_tier      VARCHAR(20),     -- 当前会员等级
    previous_tier     VARCHAR(20),     -- 上一个等级
    tier_changed_at   DATE             -- 等级变更日期
);
```

| 方面 | 说明 |
|------|------|
| 历史记录 | 仅保留上一次变化 |
| 实现复杂度 | 中 |
| 适用场景 | 只需要对比"变化前后"的场景 |
| 事实表影响 | 无（主键不变化） |

## SCD 对比总结

| 维度 | Type 1 | Type 2 | Type 3 |
|------|--------|--------|--------|
| 历史保留 | 不保留 | 完整历史 | 仅前一个值 |
| 存储成本 | 最低 | 最高（多行） | 低（多列） |
| 查询复杂度 | 最简单 | 最复杂（需时间过滤） | 简单 |
| 维表行数 | N（实体数） | N * K（变更次数） | N |
| 事实表是否需要重建 | 否 | 可能需要（新增代理键） | 否 |
| 适合的属性 | 不重要/错误修正 | 需要审计/历史分析的属性 | 只需前后对比的场景 |

::: tip 实践经验
- **身份标识类**（姓名、身份证号）— Type 2，需要追溯法律合规历史
- **分类标签类**（会员等级、产品类目）— Type 2，分析需要按当时分类统计
- **联系方式类**（手机号、地址）— Type 1 或 Type 2 取决于业务需求
- **错误修正类**（录入错误）— Type 1 直接覆盖
- **前后对比类**（升级前 vs 升级后）— 可考虑 Type 3 配合 Type 2 使用
:::

## Type 2 高级模式

### 通过窗口函数获取最新版本

```sql
-- 取每个客户的最新维度记录
SELECT customer_id, name, member_tier, valid_from
FROM (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY customer_id
               ORDER BY valid_from DESC
           ) AS rn
    FROM dim_customer_scd2
) ranked
WHERE rn = 1;
```

### 关联事实表时的 NULL 处理

当事实表关联维度表时，如果维度记录缺失（比如客户已删除），需要确保不会丢失事实：

```sql
SELECT f.order_id,
       COALESCE(c.name, '[Deleted]') AS customer_name,
       COALESCE(c.member_tier, 'Unknown') AS member_tier,
       f.order_amount
FROM fact_orders f
LEFT JOIN dim_customer_scd2 c
  ON f.customer_id = c.customer_id
 AND f.order_date BETWEEN c.valid_from AND COALESCE(c.valid_to, '9999-12-31');
```

## 相关文章

- [事实表与维度表详解](/knowledge-map/km-4-data-modeling/02-fact-dimension) — 维度表变体与键策略
- [维度建模方法论](/knowledge-map/km-4-data-modeling/01-dimensional-modeling) — Star vs Snowflake 与建模流派
- [行业建模实战](/knowledge-map/km-4-data-modeling/04-industry-cases) — 电商与用户行为建模
