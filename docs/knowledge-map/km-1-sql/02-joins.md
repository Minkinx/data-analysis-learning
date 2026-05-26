# JOIN 详解

> JOIN 是关系型数据库最核心的操作，也是数据查询中出错率最高的环节之一。本节系统梳理所有 JOIN 类型、行为特征及常见陷阱。

## 概述

JOIN 用于将多张表中的行根据关联条件（Join Condition）组合在一起。理解 JOIN 的本质是 **集合论中的笛卡尔积 + 过滤**：先对两表做笛卡尔积（所有行两两组合），再按 ON 条件筛选。

## INNER JOIN

只返回两表中匹配的行，不匹配的行丢弃：

```sql
SELECT o.order_id, o.amount, u.user_name
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id;
```

等效写法（不推荐，可读性差）：

```sql
SELECT o.order_id, o.amount, u.user_name
FROM orders o, users u
WHERE o.user_id = u.user_id;
```

::: info
`INNER JOIN` 是默认的 JOIN 类型，仅写 `JOIN` 等价于 `INNER JOIN`。
:::

## LEFT / RIGHT JOIN

### LEFT JOIN

左表所有行保留，右表无匹配时填 NULL：

```sql
SELECT u.user_id, u.user_name, o.order_id, o.amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id;
```

**典型场景**：查找没有订单的用户：

```sql
SELECT u.user_id, u.user_name
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL;
```

### RIGHT JOIN

右表所有行保留，与 LEFT JOIN 对称。通常可以用 LEFT JOIN 改写，建议统一使用 LEFT JOIN 以提高可读性：

```sql
-- RIGHT JOIN
SELECT u.user_id, u.user_name, o.order_id
FROM orders o
RIGHT JOIN users u ON o.user_id = u.user_id;

-- 等价 LEFT JOIN
SELECT u.user_id, u.user_name, o.order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id;
```

## FULL JOIN

两表全部保留，无匹配侧填 NULL。MySQL 不直接支持 `FULL JOIN`，需要 UNION 模拟：

```sql
-- 标准 SQL（PostgreSQL / SQL Server / SQLite）
SELECT u.*, o.*
FROM users u
FULL JOIN orders o ON u.user_id = o.user_id;

-- MySQL 模拟
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
UNION
SELECT u.*, o.*
FROM users u
RIGHT JOIN orders o ON u.user_id = o.user_id;
```

## CROSS JOIN

笛卡尔积，左表每行与右表每行组合。慎用——结果行数 = 左表行数 x 右表行数：

```sql
-- 生成日期 x 产品的所有组合
SELECT d.date, p.product_id, p.product_name
FROM date_dim d
CROSS JOIN products p;
```

## Self-Join（自关联）

同一张表自己关联自己，必须使用别名：

```sql
-- 查找员工及其上级
SELECT e1.name AS employee_name,
       e2.name AS manager_name
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.employee_id;
```

### 自关联的常见场景

```sql
-- 1. 连续日期与前一天对比
SELECT a.date, a.revenue,
       b.revenue AS prev_day_revenue
FROM daily_revenue a
LEFT JOIN daily_revenue b ON a.date = b.date + INTERVAL 1 DAY;

-- 2. 用户首次行为与后续行为的配对（留存分析基础）
SELECT a.user_id, a.action_date AS first_date,
       b.action_date AS return_date
FROM user_actions a
LEFT JOIN user_actions b
  ON a.user_id = b.user_id
 AND b.action_date > a.action_date;
```

## JOIN 条件的常见陷阱

### 1. 数据膨胀（Row Explosion）

这是 JOIN 中最常见也最危险的错误。当左表的 1 行关联到右表的 N 行时，结果集会膨胀 N 倍：

```sql
-- orders 表每条订单关联到多个 order_items
SELECT o.order_id, SUM(oi.quantity * oi.price) AS order_total
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;
```

如果聚合前先 JOIN 再 GROUP BY，结果正确但数据量膨胀。如果有多个 JOIN 链式膨胀，查询可能变慢几个数量级。

### 2. 重复行

当右表有重复的关联键时，JOIN 结果会包含重复行：

```sql
-- 如果 users 表有重复的 user_id，JOIN 后订单行会翻倍
SELECT o.*, u.user_name
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id;
```

### 3. ON 与 WHERE 的区别（针对 OUTER JOIN）

```sql
-- LEFT JOIN + WHERE 右表条件 = INNER JOIN 的语义
SELECT u.*, o.order_id
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.status = 'paid';
-- 上面的 WHERE 过滤了右表为 NULL 的行，实际变成了 INNER JOIN

-- 正确：将右表条件放入 ON 中
SELECT u.*, o.order_id
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
                  AND o.status = 'paid';
```

## JOIN 性能要点

1. **小表驱动大表** — 优化器通常会自动选择，但明确用小表做驱动表更安全
2. **关联键建索引** — JOIN ON 中的列应尽可能有索引
3. **避免 JOIN 过多表** — 超过 5-7 表 JOIN 时，考虑是否可以通过宽表或物化视图优化
4. **JOIN 顺序** — 使用 `EXPLAIN` 检查执行计划，确保大表在合适的位置

## JOIN 类型图解

| JOIN 类型 | 左表匹配 | 右表匹配 | 结果集 |
|-----------|---------|---------|--------|
| INNER JOIN | 匹配行 | 匹配行 | 两表交集 |
| LEFT JOIN  | 全部 | 匹配行 | 左表全部 + 右表匹配 |
| RIGHT JOIN | 匹配行 | 全部 | 右表全部 + 左表匹配 |
| FULL JOIN  | 全部 | 全部 | 两表并集 |
| CROSS JOIN | 全部 | 全部 | 笛卡尔积 |

## 相关文章

- [基础查询与聚合](/knowledge-map/km-1-sql/01-basic-queries) — 查询基础
- [子查询与 CTE](/knowledge-map/km-1-sql/03-subqueries-cte) — JOIN 的替代方案
- [查询优化](/knowledge-map/km-1-sql/07-optimization) — JOIN 性能调优
