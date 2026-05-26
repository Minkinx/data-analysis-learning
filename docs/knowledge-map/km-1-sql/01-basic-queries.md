# 基础查询与聚合

> 本节覆盖 SQL 最核心的查询结构：SELECT、FROM、WHERE、GROUP BY、HAVING、ORDER BY 以及聚合函数。是所有后续 SQL 操作的基石。

## 概述

SQL 查询的基本逻辑是 **先过滤，再分组，后排序**。理解子句的执行顺序比记住语法更重要，因为很多错误源于对执行顺序的误解。

## SELECT 与 FROM

最基本的查询从选择列开始：

```sql
-- 选择特定列
SELECT user_id, user_name, created_at
FROM users;

-- 列别名（AS 可省略）
SELECT user_id AS id, user_name AS name
FROM users;
```

::: tip
尽量避免使用 `SELECT *`。显式列出需要的列可以让查询意图更清晰，也更容易排查 schema 变更带来的问题。
:::

## WHERE 过滤

`WHERE` 在 **行级别** 过滤数据，在 `GROUP BY` 和聚合之前执行：

```sql
SELECT *
FROM orders
WHERE status = 'paid'
  AND created_at >= '2025-01-01'
  AND amount > 100;
```

### WHERE 中的常见陷阱

```sql
-- 错误：NULL 比较
WHERE status = NULL    -- 不生效，应使用 IS NULL

-- 正确
WHERE status IS NULL
  OR status IS NOT NULL

-- 字符串与数字隐式转换（可能产生全表扫描）
WHERE user_id = '123'  -- 如果 user_id 是数字类型，避免写引号
```

## GROUP BY 与聚合函数

### 常用聚合函数（Aggregation Functions）

| 函数 | 作用 | 注意事项 |
|------|------|---------|
| `COUNT(*)` | 统计行数 | 不忽略 NULL |
| `COUNT(column)` | 统计非 NULL 值的行数 | 忽略 NULL |
| `COUNT(DISTINCT column)` | 统计不重复的非 NULL 值个数 | 对大数据集性能开销大 |
| `SUM(column)` | 数值求和 | 忽略 NULL |
| `AVG(column)` | 平均值 | 等同于 `SUM / COUNT`，忽略 NULL |
| `MAX(column)` | 最大值 | 可用于字符串/日期 |
| `MIN(column)` | 最小值 | 可用于字符串/日期 |

```sql
-- 按用户统计订单数和总金额
SELECT user_id,
       COUNT(*)                    AS order_count,
       SUM(amount)                 AS total_amount,
       AVG(amount)                 AS avg_order_amount,
       MAX(created_at)             AS last_order_date,
       COUNT(DISTINCT product_id)  AS distinct_products
FROM orders
WHERE status = 'paid'
GROUP BY user_id;
```

### GROUP BY 执行顺序

SQL 子句的逻辑执行顺序：

1. `FROM` / `JOIN` — 确定数据源
2. `WHERE` — 行级过滤
3. `GROUP BY` — 分组
4. 聚合函数计算
5. `HAVING` — 分组后过滤
6. `SELECT` — 选择列和计算表达式
7. `ORDER BY` — 排序
8. `LIMIT` / `OFFSET` — 分页

::: warning 关键理解
`WHERE` 和 `HAVING` 的区别在于执行时机：`WHERE` 在分组前过滤行，`HAVING` 在分组后过滤组。不能在 `WHERE` 中引用聚合结果。
:::

## HAVING 过滤分组

`HAVING` 用于过滤分组后的结果，可以使用聚合函数：

```sql
SELECT user_id,
       COUNT(*)    AS order_count,
       SUM(amount) AS total_amount
FROM orders
WHERE status = 'paid'
GROUP BY user_id
HAVING COUNT(*) >= 5                 -- 只保留订单数 >= 5 的用户
   AND SUM(amount) > 1000;           -- 且总金额 > 1000
```

## ORDER BY 排序

```sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders
WHERE status = 'paid'
GROUP BY user_id
HAVING COUNT(*) >= 3
ORDER BY total_amount DESC,          -- 先按总金额降序
         user_id ASC;                -- 金额相同时按用户 ID 升序
```

::: tip ORDER BY 位置
`ORDER BY` 应当始终在 `GROUP BY` 和 `HAVING` 之后，`LIMIT` 之前。它是对最终结果集的排序。
:::

## LIMIT 与分页

```sql
-- 取前 10 条
SELECT * FROM products ORDER BY price DESC LIMIT 10;

-- 分页：第 2 页，每页 20 条
SELECT * FROM products ORDER BY product_id
LIMIT 20 OFFSET 20;  -- OFFSET = (page - 1) * page_size

-- 简写形式（MySQL 专用）
SELECT * FROM products ORDER BY product_id
LIMIT 20 OFFSET 20;
-- 等价于
SELECT * FROM products ORDER BY product_id
LIMIT 20, 20;
```

::: warning OFFSET 性能
`OFFSET` 值越大性能越差，因为数据库仍然需要扫描并丢弃前面的行。对于深度分页，考虑使用 **游标分页（Keyset Pagination）**：

```sql
WHERE product_id > last_seen_id
ORDER BY product_id
LIMIT 20;
```
:::

## 聚合的常见模式

### 分组统计与汇总

```sql
-- 多维度分组
SELECT category,
       status,
       COUNT(*)     AS cnt,
       SUM(amount)  AS total
FROM orders
GROUP BY category, status;
```

### 条件聚合（Pivot in SQL）

```sql
-- 将行转成列：统计每种状态下的订单数
SELECT category,
       COUNT(CASE WHEN status = 'pending'  THEN 1 END) AS pending_cnt,
       COUNT(CASE WHEN status = 'paid'     THEN 1 END) AS paid_cnt,
       COUNT(CASE WHEN status = 'refunded' THEN 1 END) AS refund_cnt
FROM orders
GROUP BY category;
```

## 子句速查表

| 子句 | 执行时机 | 可使用聚合 | 别名引用 |
|------|---------|-----------|---------|
| WHERE | GROUP BY 之前 | 否 | 不可引用 SELECT 别名 |
| HAVING | GROUP BY 之后 | 是 | 可引用 SELECT 别名（部分方言） |
| ORDER BY | SELECT 之后 | 是 | 可引用 SELECT 别名 |
| LIMIT | 最后 | 否 | 不可引用 |

## 相关文章

- [JOIN 详解](/knowledge-map/km-1-sql/02-joins) — 多表关联
- [子查询与 CTE](/knowledge-map/km-1-sql/03-subqueries-cte) — 复杂查询的构建块
- [窗口函数](/knowledge-map/km-1-sql/04-window-functions) — 不改变行数的计算
