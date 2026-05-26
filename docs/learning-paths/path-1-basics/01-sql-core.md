# SQL 核心精讲

> 数据分析师的核心武器。本文覆盖从基础查询到窗口函数再到 BI 实战场景的完整路径。深入参考请见 [KM 1. SQL 完全指南](/knowledge-map/km-1-sql/)。

## 基础查询与聚合

### SELECT 子句顺序

```sql
SELECT column1, aggregate(column2)
FROM table
JOIN other_table ON table.id = other_table.id
WHERE condition
GROUP BY column1
HAVING aggregate_condition
ORDER BY column1
LIMIT n;
```

### 常用聚合函数

| 函数 | 用途 | 注意 |
|------|------|------|
| `COUNT(*)` | 行数统计 | `COUNT(1)` 等价，`COUNT(col)` 不计 NULL |
| `SUM(col)` | 求和 | 忽略 NULL |
| `AVG(col)` | 均值 | 先排除 NULL |
| `DISTINCT` | 去重 | `COUNT(DISTINCT col)` 代价高 |

### WHERE vs HAVING

- `WHERE`：在聚合前过滤行
- `HAVING`：在聚合后过滤分组

## 多表关联

### JOIN 类型速查

```sql
-- INNER JOIN：两表匹配的行
SELECT * FROM A INNER JOIN B ON A.id = B.a_id;

-- LEFT JOIN：左表全部 + 右表匹配（无匹配则为 NULL）
SELECT * FROM A LEFT JOIN B ON A.id = B.a_id;

-- FULL JOIN：两表全部（MySQL 用 UNION 模拟）
SELECT * FROM A LEFT JOIN B ON A.id = B.a_id
UNION
SELECT * FROM A RIGHT JOIN B ON A.id = B.a_id;
```

::: tip BI 场景
多表关联时注意**数据膨胀**：如果左表 1 行关联右表 N 行，结果集会膨胀 N 倍。聚合前先确认关联基数。
:::

## 子查询与 CTE

### CTE（Common Table Expression）

```sql
WITH active_users AS (
  SELECT user_id, COUNT(*) as login_count
  FROM user_actions
  WHERE action_date >= '2025-01-01'
  GROUP BY user_id
  HAVING COUNT(*) > 5
)
SELECT DATE_TRUNC('month', ua.action_date) as month,
       COUNT(DISTINCT au.user_id) as active_users
FROM user_actions ua
JOIN active_users au ON ua.user_id = au.user_id
GROUP BY 1;
```

## 窗口函数

窗口函数是 BI 面试**最高频考点**之一。

### 排名窗口

```sql
-- 各品类销售额排名
SELECT category, product, revenue,
       ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) as rank_no,
       RANK()       OVER (PARTITION BY category ORDER BY revenue DESC) as rank,
       DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) as dense_rank
FROM product_sales;
```

### 偏移窗口

```sql
-- 当日与前一日对比
SELECT date, revenue,
       LAG(revenue, 1) OVER (ORDER BY date) as prev_day_revenue,
       revenue - LAG(revenue, 1) OVER (ORDER BY date) as diff
FROM daily_revenue;
```

### 聚合窗口

```sql
-- 累计求和（Running Total）
SELECT date, revenue,
       SUM(revenue) OVER (ORDER BY date) as running_total
FROM daily_revenue;

-- 滑动平均（7 日）
SELECT date, revenue,
       AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as ma_7d
FROM daily_revenue;
```

## BI 实战场景 SQL

### 留存计算（Day N Retention）

```sql
WITH first_actions AS (
  SELECT user_id, MIN(action_date) as first_date
  FROM user_actions GROUP BY user_id
),
daily_actions AS (
  SELECT user_id, action_date
  FROM user_actions GROUP BY user_id, action_date
)
SELECT fa.first_date,
       COUNT(DISTINCT fa.user_id) as new_users,
       COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 1 THEN da.user_id END) as day_1_retained,
       COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 7 THEN da.user_id END) as day_7_retained
FROM first_actions fa
LEFT JOIN daily_actions da ON fa.user_id = da.user_id
GROUP BY fa.first_date;
```

### 漏斗转化

```sql
WITH step1 AS (SELECT user_id, MIN(event_time) as t FROM events WHERE event = 'page_view' GROUP BY 1),
     step2 AS (SELECT user_id, MIN(event_time) as t FROM events WHERE event = 'add_cart' GROUP BY 1),
     step3 AS (SELECT user_id, MIN(event_time) as t FROM events WHERE event = 'payment' GROUP BY 1)
SELECT 'page_view' as step, COUNT(*) as users FROM step1
UNION ALL
SELECT 'add_cart', COUNT(*) FROM step2 s2 WHERE EXISTS (SELECT 1 FROM step1 s1 WHERE s1.user_id = s2.user_id AND s1.t < s2.t)
UNION ALL
SELECT 'payment', COUNT(*) FROM step3 s3 WHERE EXISTS (SELECT 1 FROM step2 s2 WHERE s2.user_id = s3.user_id AND s2.t < s3.t);
```

## 查询优化要点

1. **避免 SELECT \*** — 只选取需要的列
2. **过滤下推** — WHERE 条件尽早过滤数据
3. **JOIN 顺序** — 小表驱动大表
4. **EXPLAIN** — 查看执行计划，关注 `type` 和 `rows`
5. **索引** — WHERE / JOIN / ORDER BY 涉及的列考虑建索引

> 深入了解请参阅 [KM 1. SQL 完全指南](/knowledge-map/km-1-sql/)，包含更完整的语法详解和优化技巧。
