# 子查询与 CTE

> 子查询（Subquery）和公用表表达式（Common Table Expression, CTE）是构建复杂查询的两种核心方式。CTE 在可读性和递归能力上更胜一筹，是现代 SQL 的首选。

## 概述

子查询是嵌套在另一个查询中的查询，可以出现在 SELECT、FROM、WHERE 子句中。CTE 则是通过 `WITH` 子句定义的命名临时结果集，可以在后续查询中多次引用。两者本质上是同一件事的不同写法，但 CTE 更清晰且支持递归。

## 标量子查询（Scalar Subquery）

返回单个值的子查询，可以出现在 SELECT 或 WHERE 中：

```sql
-- SELECT 中的标量子查询
SELECT user_id,
       order_amount,
       (SELECT AVG(order_amount) FROM orders) AS avg_amount,
       order_amount - (SELECT AVG(order_amount) FROM orders) AS diff
FROM orders;

-- WHERE 中的标量子查询
SELECT *
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);
```

::: tip 性能提示
标量子查询会对外部查询的每一行执行一次。如果子查询结果不变（如计算全局平均值），建议先计算为变量，或者使用窗口函数代替。
:::

## 行子查询与表子查询

```sql
-- 行子查询：比较复合值
SELECT *
FROM orders
WHERE (user_id, amount) = (
  SELECT user_id, MAX(amount)
  FROM orders
  GROUP BY user_id
  LIMIT 1
);

-- 表子查询：FROM 子句中的派生表（Derived Table）
SELECT dt.user_id, dt.order_count
FROM (
  SELECT user_id, COUNT(*) AS order_count
  FROM orders
  GROUP BY user_id
) dt
WHERE dt.order_count > 5;
```

## EXISTS 与 IN

### IN

```sql
-- 查找有订单的用户
SELECT *
FROM users
WHERE user_id IN (SELECT user_id FROM orders);
```

### EXISTS

```sql
-- 等价写法，但 EXISTS 通常性能更好
SELECT *
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);
```

### NOT IN 与 NOT EXISTS

```sql
-- 查找没有订单的用户
-- NOT IN 在有 NULL 值时行为不符合直觉（整个查询返回空）
SELECT *
FROM users
WHERE user_id NOT IN (SELECT user_id FROM orders);
-- 如果 orders.user_id 包含 NULL，上述查询返回 0 行！

-- 安全的写法：NOT EXISTS
SELECT *
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);
```

::: warning NOT IN 与 NULL
`NOT IN (subquery)` 如果子查询结果中包含任何 `NULL`，则整个查询的结果为空。因为 `x NOT IN (1, 2, NULL)` 等价于 `x != 1 AND x != 2 AND x != NULL`，而 `x != NULL` 的结果永远是 UNKNOWN。`NOT EXISTS` 没有这个问题。
:::

## CTE（Common Table Expression）

### 基本语法

```sql
WITH monthly_sales AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(amount) AS total
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT *
FROM monthly_sales
ORDER BY month;
```

### 多 CTE

```sql
WITH
paid_orders AS (
  SELECT * FROM orders WHERE status = 'paid'
),
user_stats AS (
  SELECT user_id,
         COUNT(*)    AS order_count,
         SUM(amount) AS total_amount
  FROM paid_orders
  GROUP BY user_id
)
SELECT u.user_id, u.user_name,
       COALESCE(us.order_count, 0)    AS order_count,
       COALESCE(us.total_amount, 0)   AS total_amount
FROM users u
LEFT JOIN user_stats us ON u.user_id = us.user_id;
```

### CTE 复用

CTE 的一大优势是可以在后续查询中多次引用，避免重复代码：

```sql
WITH top_products AS (
  SELECT product_id, SUM(quantity) AS total_sold
  FROM order_items
  GROUP BY product_id
  ORDER BY total_sold DESC
  LIMIT 100
)
-- 查询 1：热门商品的总销售额
SELECT tp.*, p.price, tp.total_sold * p.price AS revenue
FROM top_products tp
JOIN products p ON tp.product_id = p.product_id
UNION ALL
-- 查询 2：热门商品的分类分布
SELECT p.category, COUNT(*) AS product_count
FROM top_products tp
JOIN products p ON tp.product_id = p.product_id
GROUP BY p.category;
```

## 递归 CTE（Recursive CTE）

递归 CTE 是 SQL 中处理树形数据（组织架构、分类层级、关系链）的标准方式：

```sql
-- 查找组织架构树
WITH RECURSIVE org_tree AS (
  -- 基础情况（Anchor）：顶层节点
  SELECT employee_id, name, manager_id, 1 AS level
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- 递归步骤：连接子节点
  SELECT e.employee_id, e.name, e.manager_id, ot.level + 1
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT * FROM org_tree ORDER BY level, employee_id;
```

### 递归 CTE 的典型场景

```sql
-- 1. 生成连续日期序列
WITH RECURSIVE dates AS (
  SELECT '2025-01-01'::DATE AS dt
  UNION ALL
  SELECT dt + INTERVAL '1 DAY'
  FROM dates
  WHERE dt < '2025-01-31'
)
SELECT * FROM dates;

-- 2. 分裂逗号分隔的字符串（PostgreSQL）
WITH RECURSIVE split AS (
  SELECT 'a,b,c,d' AS str
  UNION ALL
  SELECT regexp_replace(str, '^[^,]+,', '')
  FROM split
  WHERE str LIKE '%,%'
)
SELECT regexp_replace(str, ',.*', '') AS item
FROM split;
```

### 递归 CTE 的注意事项

| 注意点 | 说明 |
|--------|------|
| 必须有 UNION ALL | 递归 CTE 只能使用 UNION ALL，不能使用 UNION |
| 终止条件 | 递归部分必须最终返回 0 行，否则会无限循环 |
| 递归深度限制 | 默认限制（如 PostgreSQL 默认 100），可通过 `SET max_recursive_cte_iterations = N` 调整 |
| 性能 | 递归 CTE 对大数据量树形结构性能不如物化路径（Materialized Path）方案 |

## 子查询 vs CTE 对比

| 特性 | 子查询 | CTE |
|------|-------|-----|
| 可读性 | 嵌套越深越难读 | 线性结构，从上到下 |
| 复用 | 需要重复写 | 可多次引用 |
| 递归 | 不支持 | 支持 `WITH RECURSIVE` |
| 调试 | 难以单独执行 | 可单独执行 CTE 部分 |
| 优化器 | 部分优化器会将派生表内联 | 部分优化器会物化 CTE |

## 相关文章

- [JOIN 详解](/knowledge-map/km-1-sql/02-joins) — CTE 常用于替代复杂 JOIN
- [窗口函数](/knowledge-map/km-1-sql/04-window-functions) — 与子查询相比的另一种选择
- [实战场景](/knowledge-map/km-1-sql/08-scenarios) — CTE 在留存和漏斗中的实际应用
