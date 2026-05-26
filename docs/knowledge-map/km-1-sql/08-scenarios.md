# 实战场景

> 本节汇集数据分析面试和日常工作中最经典的 SQL 场景：留存分析、漏斗转化、RFM 用户分层、连续登录、最大连续天数。每个场景都提供可直接使用的模板 SQL。
>
> **方言说明**：本文示例混合使用了 PostgreSQL 和 MySQL 语法。`DATE_TRUNC` 为 PostgreSQL 专用，`DATEDIFF` 为 MySQL 专用，`action_date - ROW_NUMBER()` 日期直接相减为 PostgreSQL 语法，已在对应位置标注。

## 概述

实战场景中的 SQL 通常是前七节知识的综合运用：CTE + 窗口函数 + JOIN + 条件聚合。理解每个场景的 **业务逻辑** 比记住 SQL 语法更重要——业务逻辑才决定 SQL 的写法。

## 留存分析（Retention SQL）

### Day N 留存

计算新增用户在指定天数后的留存率：

```sql
WITH first_actions AS (
  -- 每个用户首次活跃日期
  SELECT user_id, MIN(action_date) AS first_date
  FROM user_actions
  GROUP BY user_id
),
daily_active AS (
  -- 用户每日活跃（去重）
  SELECT DISTINCT user_id, action_date
  FROM user_actions
)
SELECT
  fa.first_date,
  COUNT(DISTINCT fa.user_id)                                                 AS new_users,
  COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 1  -- MySQL 语法
    THEN da.user_id END)                                                     AS day_1_retained,
  COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 3  -- MySQL 语法
    THEN da.user_id END)                                                     AS day_3_retained,
  COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 7  -- MySQL 语法
    THEN da.user_id END)                                                     AS day_7_retained,
  COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 30  -- MySQL 语法
    THEN da.user_id END)                                                     AS day_30_retained,
  -- 计算留存率
  ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF(da.action_date, fa.first_date) = 7  -- MySQL 语法
    THEN da.user_id END) * 1.0 / COUNT(DISTINCT fa.user_id), 4)              AS day_7_retention_rate
FROM first_actions fa
LEFT JOIN daily_active da
  ON fa.user_id = da.user_id
 AND da.action_date > fa.first_date
GROUP BY fa.first_date
ORDER BY fa.first_date;
```

### 周/月留存

```sql
WITH first_week AS (
  SELECT user_id, DATE_TRUNC('week', MIN(action_date)) AS first_week
  FROM user_actions
  GROUP BY user_id
),
weekly_active AS (
  SELECT DISTINCT user_id, DATE_TRUNC('week', action_date) AS active_week
  FROM user_actions
)
SELECT
  fw.first_week,
  wa.active_week,
  COUNT(DISTINCT fw.user_id) AS retained_users
FROM first_week fw
JOIN weekly_active wa
  ON fw.user_id = wa.user_id
 AND wa.active_week >= fw.first_week
GROUP BY fw.first_week, wa.active_week
ORDER BY fw.first_week, wa.active_week;
```

## 漏斗转化（Funnel SQL）

### 步骤严格漏斗

用户必须按顺序完成每一步，且时间递增：

```sql
WITH step1 AS (
  SELECT user_id, MIN(event_time) AS t
  FROM events WHERE event = 'page_view'
  GROUP BY user_id
),
step2 AS (
  SELECT user_id, MIN(event_time) AS t
  FROM events WHERE event = 'add_cart'
  GROUP BY user_id
),
step3 AS (
  SELECT user_id, MIN(event_time) AS t
  FROM events WHERE event = 'payment'
  GROUP BY user_id
)
SELECT 'page_view' AS funnel_step, COUNT(*) AS user_count
FROM step1
UNION ALL
SELECT 'add_cart', COUNT(*)
FROM step2 s2
WHERE EXISTS (
  SELECT 1 FROM step1 s1
  WHERE s1.user_id = s2.user_id AND s1.t < s2.t
)
UNION ALL
SELECT 'payment', COUNT(*)
FROM step3 s3
WHERE EXISTS (
  SELECT 1 FROM step2 s2
  WHERE s2.user_id = s3.user_id AND s2.t < s3.t
);
```

### 宽松漏斗（带时间窗口）

在一定时间窗口内完成一系列事件的用户：

```sql
WITH events_with_step AS (
  SELECT
    user_id, event, event_time,
    CASE event
      WHEN 'page_view' THEN 1
      WHEN 'add_cart'  THEN 2
      WHEN 'payment'   THEN 3
    END AS step_no
  FROM events
  WHERE event IN ('page_view', 'add_cart', 'payment')
),
funnel AS (
  SELECT user_id,
    MAX(CASE WHEN step_no >= 1 THEN 1 ELSE 0 END) AS step_1,
    MAX(CASE WHEN step_no >= 2 THEN 1 ELSE 0 END) AS step_2,
    MAX(CASE WHEN step_no >= 3 THEN 1 ELSE 0 END) AS step_3
  FROM events_with_step
  GROUP BY user_id
)
SELECT
  COUNT(*)                    AS total_users,
  SUM(step_1)                 AS page_view_users,
  ROUND(SUM(step_1) * 1.0 / COUNT(*), 4) AS page_view_rate,
  SUM(step_2)                 AS add_cart_users,
  ROUND(SUM(step_2) * 1.0 / SUM(step_1), 4) AS page_view_to_cart_rate,
  SUM(step_3)                 AS payment_users,
  ROUND(SUM(step_3) * 1.0 / SUM(step_2), 4) AS cart_to_payment_rate,
  ROUND(SUM(step_3) * 1.0 / COUNT(*), 4) AS overall_conversion
FROM funnel;
```

## RFM 用户分层

RFM（Recency, Frequency, Monetary）模型通过三个维度对用户分层：

```sql
WITH user_rfm AS (
  SELECT
    user_id,
    -- R：最近一次购买距今的天数（越小越活跃）
    DATEDIFF(CURRENT_DATE, MAX(order_date)) AS recency,  -- MySQL 语法
    -- F：购买频率
    COUNT(DISTINCT order_id)               AS frequency,
    -- M：总消费金额
    SUM(amount)                            AS monetary
  FROM orders
  WHERE status = 'paid'
  GROUP BY user_id
),
rfm_scores AS (
  SELECT *,
    -- 五分位数评分（也可用 NTILE）
    NTILE(5) OVER (ORDER BY recency ASC)   AS r_score,    -- R 越小分越高
    NTILE(5) OVER (ORDER BY frequency DESC) AS f_score,    -- F 越大分越高
    NTILE(5) OVER (ORDER BY monetary DESC)  AS m_score     -- M 越大分越高
  FROM user_rfm
)
SELECT *,
  CONCAT(r_score, f_score, m_score) AS rfm_cell,
  CASE
    WHEN r_score >= 4 AND f_score >= 4 THEN '重要价值用户'
    WHEN r_score >= 4 AND f_score >= 2 THEN '重要发展用户'
    WHEN r_score >= 2 AND f_score >= 4 THEN '重要保持用户'
    WHEN r_score >= 2 AND f_score >= 2 THEN '重要挽留用户'
    WHEN r_score >= 4 AND f_score <= 1 THEN '新用户'
    WHEN r_score <= 1 AND f_score >= 4 THEN '流失高价值用户'
    ELSE '一般用户'
  END AS user_segment
FROM rfm_scores;
```

## 连续登录 / 活跃（Consecutive Days）

### 查找连续登录 N 天以上的用户

```sql
WITH user_daily AS (
  SELECT DISTINCT user_id, action_date
  FROM user_actions
),
user_with_group AS (
  SELECT *,
    -- 用日期减去行号，连续日期的差值相同
    action_date - ROW_NUMBER() OVER (
      PARTITION BY user_id ORDER BY action_date
    ) AS grp  -- PostgreSQL 语法：日期直接减整数
  FROM user_daily
),
consecutive_groups AS (
  SELECT user_id, grp,
    COUNT(*) AS consecutive_days,
    MIN(action_date) AS start_date,
    MAX(action_date) AS end_date
  FROM user_with_group
  GROUP BY user_id, grp
  HAVING COUNT(*) >= 7  -- 连续 7 天以上
)
SELECT * FROM consecutive_groups
ORDER BY consecutive_days DESC;
```

**核心原理**：连续日期减去排名（ROW_NUMBER）得到的差值相同。这是处理连续性问题最经典的技巧。

### 最大连续活跃天数

```sql
WITH user_daily AS (
  SELECT DISTINCT user_id, action_date
  FROM user_actions
),
user_with_group AS (
  SELECT *,
    action_date - ROW_NUMBER() OVER (
      PARTITION BY user_id ORDER BY action_date
    ) AS grp
  FROM user_daily
),
consecutive_stats AS (
  SELECT user_id, grp,
    COUNT(*) AS consecutive_days
  FROM user_with_group
  GROUP BY user_id, grp
)
SELECT user_id, MAX(consecutive_days) AS max_consecutive_days
FROM consecutive_stats
GROUP BY user_id
ORDER BY max_consecutive_days DESC;
```

## 其他实用场景

### 同环比（Week-over-Week, Year-over-Year）

```sql
SELECT
  date,
  revenue,
  LAG(revenue, 7)  OVER (ORDER BY date) AS revenue_last_week,
  ROUND(
    (revenue - LAG(revenue, 7) OVER (ORDER BY date))
    / NULLIF(LAG(revenue, 7) OVER (ORDER BY date), 0) * 100,
    2
  ) AS wow_change_pct,
  LAG(revenue, 365) OVER (ORDER BY date) AS revenue_last_year,
  ROUND(
    (revenue - LAG(revenue, 365) OVER (ORDER BY date))
    / NULLIF(LAG(revenue, 365) OVER (ORDER BY date), 0) * 100,
    2
  ) AS yoy_change_pct
FROM daily_revenue;
```

### 用户首单分析

```sql
WITH first_orders AS (
  SELECT user_id,
    MIN(order_date) AS first_order_date,
    MIN(amount)     AS first_order_amount
  FROM orders
  WHERE status = 'paid'
  GROUP BY user_id
),
order_ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id ORDER BY order_date
    ) AS order_seq
  FROM orders
  WHERE status = 'paid'
)
-- 首单与复购间隔
SELECT
  fo.user_id,
  fo.first_order_date,
  o2.order_date AS second_order_date,
  DATEDIFF(o2.order_date, fo.first_order_date) AS days_to_second_order  -- MySQL 语法
FROM first_orders fo
LEFT JOIN order_ranked o2
  ON fo.user_id = o2.user_id AND o2.order_seq = 2
ORDER BY days_to_second_order;
```

### 分组对比统计

```sql
-- 每个类别的销售额与类别平均的对比
SELECT
  category, product_id, revenue,
  AVG(revenue) OVER (PARTITION BY category) AS category_avg,
  revenue - AVG(revenue) OVER (PARTITION BY category) AS diff_from_avg,
  ROUND(
    (revenue - AVG(revenue) OVER (PARTITION BY category))
    / NULLIF(AVG(revenue) OVER (PARTITION BY category), 0) * 100,
    2
  ) AS pct_diff_from_avg
FROM product_sales
ORDER BY category, revenue DESC;
```

## 相关文章

- [基础查询与聚合](/knowledge-map/km-1-sql/01-basic-queries) — 所有场景的基础
- [窗口函数](/knowledge-map/km-1-sql/04-window-functions) — 留存和 RFM 中大量使用
- [子查询与 CTE](/knowledge-map/km-1-sql/03-subqueries-cte) — CTE 是构建复杂场景的首选方式
