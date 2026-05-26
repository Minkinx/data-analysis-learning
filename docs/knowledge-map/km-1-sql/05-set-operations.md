# 集合操作

> 集合操作符（Set Operations）将多个 SELECT 查询的结果集组合成一个结果集。它们对应数学集合论中的并集、交集和差集运算。

## 概述

SQL 的集合操作包括 `UNION`（并集）、`INTERSECT`（交集）和 `EXCEPT` / `MINUS`（差集）。与 JOIN 不同，集合操作是 **纵向拼接** 行，而不是横向扩展列。

### 使用规则

1. 各 SELECT 查询必须返回 **相同数量的列**
2. 对应列的数据类型必须 **兼容**
3. `ORDER BY` 只能出现在最后一个查询之后
4. 默认去重，如果需要保留重复行则使用 `ALL` 后缀

## UNION / UNION ALL（并集）

### UNION：合并结果并去重

```sql
-- 合并来自不同表的历史数据
SELECT user_id, user_name, email, 'current' AS source
FROM users_current
UNION
SELECT user_id, user_name, email, 'archive' AS source
FROM users_archive;
```

### UNION ALL：合并结果保留重复

```sql
-- 日志表按月分表，需要合并分析
SELECT user_id, action, action_date
FROM events_202501
UNION ALL
SELECT user_id, action, action_date
FROM events_202502
UNION ALL
SELECT user_id, action, action_date
FROM events_202503;
```

::: tip UNION vs UNION ALL
`UNION` 内部需要去重操作，会消耗额外的排序或哈希资源。如果确认结果集不会重复（如按月分表的情况），应始终使用 `UNION ALL` 以获得更好的性能。
:::

### 性能对比

| 操作 | 代价 | 适用场景 |
|------|------|---------|
| UNION ALL | 直接追加，无额外开销 | 分表合并、可确认无重复的情况 |
| UNION | 需要排序/哈希去重 | 需要去重且无法预先保证的场景 |

## INTERSECT（交集）

返回两个查询结果的共同行：

```sql
-- 同时在两个活动中的用户
SELECT user_id FROM campaign_a
INTERSECT
SELECT user_id FROM campaign_b;

-- 也可以用 INTERSECT ALL 保留多重交集的行数
SELECT user_id FROM campaign_a
INTERSECT ALL
SELECT user_id FROM campaign_b;
```

::: warning 方言差异
MySQL 不直接支持 `INTERSECT` 和 `EXCEPT`，需要改用 `IN` / `NOT IN` 或 `EXISTS` / `NOT EXISTS` 模拟：

```sql
-- MySQL 模拟 INTERSECT
SELECT DISTINCT a.user_id
FROM campaign_a a
WHERE a.user_id IN (SELECT user_id FROM campaign_b);

-- MySQL 模拟 EXCEPT
SELECT DISTINCT a.user_id
FROM campaign_a a
WHERE a.user_id NOT IN (SELECT user_id FROM campaign_b);
```
:::

## EXCEPT / MINUS（差集）

返回第一个查询结果中有、第二个查询结果中没有的行：

```sql
-- 参加了活动 A 但没有参加活动 B 的用户
SELECT user_id FROM campaign_a
EXCEPT
SELECT user_id FROM campaign_b;
```

### EXCEPT ALL 的语义

`EXCEPT ALL` 处理重复行时与 `EXCEPT` 不同：

- `EXCEPT`：只要 "A 中有而 B 中没有" 就保留一行，不管重复次数
- `EXCEPT ALL`：从 A 中减去 B 中存在的次数。例如 A 有 3 个相同的行，B 有 2 个，结果是保留 1 个

```sql
-- A: [1, 1, 1, 2, 3], B: [1, 1, 4]
SELECT * FROM A EXCEPT SELECT * FROM B;
-- 结果: [1, 2, 3]  (去重后判断)

SELECT * FROM A EXCEPT ALL SELECT * FROM B;
-- 结果: [1, 2, 3]  (3个1减去2个1，剩1个1)
```

## 集合操作与 JOIN 的对比

| 场景 | 集合操作 | JOIN |
|------|---------|------|
| 合并两个相似表的数据 | `UNION ALL` | 不合适 |
| 查找两个集合的共同成员 | `INTERSECT` | 可用 `INNER JOIN ... DISTINCT` 替代 |
| 查找集合 A 独有成员 | `EXCEPT` | 可用 `LEFT JOIN ... WHERE NULL` 替代 |
| 横向关联不同表的列 | 不合适 | 各种 JOIN |
| 处理重复行的方式 | 纵向追加/去重 | 横向扩展/过滤 |

## 实际应用场景

### 1. 跨时段的数据回溯

```sql
-- 合并最近 3 个月的数据（按月分表场景）
SELECT * FROM orders_20250301
UNION ALL
SELECT * FROM orders_20250401
UNION ALL
SELECT * FROM orders_20250501;
```

### 2. 排除列表

```sql
-- 黑名单用户排除
SELECT user_id, email FROM users
EXCEPT
SELECT user_id, email FROM blacklist;
```

### 3. 留存用户分析中的集合思维

```sql
-- 第 1 天活跃、第 7 天仍然活跃的用户
WITH day1_users AS (
  SELECT DISTINCT user_id FROM user_actions WHERE action_date = '2025-05-01'
),
day7_users AS (
  SELECT DISTINCT user_id FROM user_actions WHERE action_date = '2025-05-07'
)
SELECT day1_users.user_id
FROM day1_users
INTERSECT
SELECT day7_users.user_id
FROM day7_users;
```

## 排序与 LIMIT

`ORDER BY` 和 `LIMIT` 只能出现在整个集合操作的最后，不能单独作用于某个子查询：

```sql
-- 正确
SELECT user_id, created_at FROM users
UNION
SELECT user_id, created_at FROM users_archive
ORDER BY created_at DESC
LIMIT 10;

-- 错误（除非在子查询中用括号包起来）
SELECT user_id, created_at FROM users ORDER BY created_at DESC LIMIT 10
UNION
SELECT user_id, created_at FROM users_archive;
```

如需对单个子查询排序和分页，使用括号：

```sql
(SELECT * FROM events_202501 ORDER BY event_time DESC LIMIT 100)
UNION ALL
(SELECT * FROM events_202502 ORDER BY event_time DESC LIMIT 100)
ORDER BY event_time DESC;
```

## 相关文章

- [JOIN 详解](/knowledge-map/km-1-sql/02-joins) — 集合操作与 JOIN 的横向对比
- [子查询与 CTE](/knowledge-map/km-1-sql/03-subqueries-cte) — 集合操作常与 CTE 配合使用
- [实战场景](/knowledge-map/km-1-sql/08-scenarios) — 集合思维在分析场景中的运用
