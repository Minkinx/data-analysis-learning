# 困难 SQL 面试题

> 面向高级 / 专家级数据岗位，考察复杂的连续问题、最大在线、Gaps & Islands、物化路径、行列转换等极限场景。这些题目往往需要多步 CTE 和精巧的窗口函数组合。

---

### 题目 1：Gaps & Islands — 找出连续缺勤记录

**背景**：考勤表 `attendance(emp_id, work_date, is_present)`，`is_present = 1` 表示出勤，`0` 表示缺勤。

**问题**：找出连续缺勤 3 天及以上的员工及其缺勤时间段。

**预期输出**：

| emp_id | start_date | end_date | absent_days |
|--------|------------|----------|-------------|
| 1001 | 2024-01-05 | 2024-01-08 | 4 |
| 1002 | 2024-01-10 | 2024-01-12 | 3 |

**解答**：

```sql
WITH absent_days AS (
    SELECT emp_id, work_date
    FROM attendance
    WHERE is_present = 0
),
date_grp AS (
    SELECT
        emp_id,
        work_date,
        DATE_SUB(work_date, ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY work_date)) AS grp
    FROM absent_days
),
islands AS (
    SELECT
        emp_id,
        grp,
        MIN(work_date) AS start_date,
        MAX(work_date) AS end_date,
        COUNT(*) AS absent_days
    FROM date_grp
    GROUP BY emp_id, grp
    HAVING COUNT(*) >= 3
)
SELECT emp_id, start_date, end_date, absent_days
FROM islands
ORDER BY start_date;
```

**考点**：Gaps & Islands 模式，用 `ROW_NUMBER` 构造分组标识。

---

### 题目 2：中位数与众数计算

**背景**：员工表 `employees(salary)`。

**问题**：同时计算薪资的中位数和众数（出现次数最多的值）。如果有多众数，全部返回。

**解答**：

```sql
WITH stats AS (
    SELECT
        salary,
        COUNT(*) AS freq,
        ROW_NUMBER() OVER (ORDER BY salary) AS rn,
        COUNT(*) OVER () AS total_cnt
    FROM employees
    GROUP BY salary
),
median AS (
    SELECT AVG(salary) AS median_salary
    FROM stats
    WHERE rn IN (FLOOR((total_cnt + 1) / 2.0), CEIL((total_cnt + 1) / 2.0))
),
mode_data AS (
    SELECT salary AS mode_salary
    FROM stats
    WHERE freq = (SELECT MAX(freq) FROM stats)
)
SELECT
    (SELECT median_salary FROM median) AS median_salary,
    GROUP_CONCAT(mode_salary ORDER BY mode_salary) AS mode_salaries
FROM mode_data;
```

**考点**：中位数与众数的同时计算，`GROUP_CONCAT` 拼接多众数结果。

---

### 题目 3：计算最大在线人数（面试高频）

**背景**：直播间进出表 `live_events(user_id, room_id, event_time, event_type)`，`event_type = 'enter'` 或 `'leave'`。

**问题**：统计每个直播间同时在线人数的峰值。

**解答**：

```sql
WITH event_stream AS (
    SELECT room_id, event_time,
        CASE WHEN event_type = 'enter' THEN 1 ELSE -1 END AS delta
    FROM live_events
),
concurrent AS (
    SELECT
        room_id,
        event_time,
        SUM(delta) OVER (PARTITION BY room_id ORDER BY event_time) AS concurrent_users
    FROM event_stream
)
SELECT
    room_id,
    MAX(concurrent_users) AS max_concurrent
FROM concurrent
GROUP BY room_id;
```

**考点**：差分法（扫描线算法），是系统设计面试的 SQL 版本。

---

### 题目 4：拼接不重叠的时间段

**背景**：项目表 `projects(project_id, start_date, end_date)`，项目时间可能有重叠。

**问题**：将同一项目的重叠/连续时间段合并，输出每个项目的不重叠时间段。

**预期输出**：

| project_id | merged_start | merged_end |
|------------|--------------|------------|
| P001 | 2024-01-01 | 2024-03-15 |
| P001 | 2024-04-01 | 2024-06-30 |

**解答**：

```sql
WITH ordered AS (
    SELECT
        project_id,
        start_date,
        end_date,
        MAX(end_date) OVER (PARTITION BY project_id ORDER BY start_date) AS max_end_sofar
    FROM projects
),
marked AS (
    SELECT
        project_id,
        start_date,
        end_date,
        CASE
            WHEN start_date > LAG(max_end_sofar) OVER (PARTITION BY project_id ORDER BY start_date)
            THEN 1 ELSE 0
        END AS is_new_group
    FROM ordered
),
grouped AS (
    SELECT
        project_id,
        start_date,
        end_date,
        SUM(is_new_group) OVER (PARTITION BY project_id ORDER BY start_date) AS group_id
    FROM marked
)
SELECT
    project_id,
    MIN(start_date) AS merged_start,
    MAX(end_date) AS merged_end
FROM grouped
GROUP BY project_id, group_id
ORDER BY project_id, merged_start;
```

**考点**：时间段合并（Merge Intervals），可类比于 LeetCode 56 的 SQL 版。

---

### 题目 5：序列模式匹配 — 漏斗分析

**背景**：用户事件表 `user_events(user_id, event_time, event_name)`。

**问题**：统计完成 `page_view -> add_cart -> purchase` 漏斗的用户数，要求事件顺序进行且每个步骤在上一事件发生后的 1 小时内完成。

**解答**：

```sql
WITH view_step AS (
    SELECT user_id, event_time AS t1
    FROM user_events
    WHERE event_name = 'page_view'
),
cart_step AS (
    SELECT DISTINCT
        v.user_id,
        v.t1,
        e.event_time AS t2
    FROM view_step v
    JOIN user_events e ON v.user_id = e.user_id
        AND e.event_name = 'add_cart'
        AND e.event_time > v.t1
        AND TIMESTAMPDIFF(HOUR, v.t1, e.event_time) <= 1
),
purchase_step AS (
    SELECT DISTINCT
        c.user_id,
        c.t1,
        c.t2,
        e.event_time AS t3
    FROM cart_step c
    JOIN user_events e ON c.user_id = e.user_id
        AND e.event_name = 'purchase'
        AND e.event_time > c.t2
        AND TIMESTAMPDIFF(HOUR, c.t2, e.event_time) <= 1
)
SELECT COUNT(DISTINCT user_id) AS funnel_users
FROM purchase_step;
```

**考点**：漏斗分析的自连接实现，时间窗口限制。

---

### 题目 6：中位数逼近计算（大数场景优化）

**背景**：超大规模表 `large_data(value INT)`，无法全部排序。

**问题**：在不全表排序的情况下，用直方图逼近计算中位数。

**解答**：

```sql
WITH histogram AS (
    SELECT
        FLOOR(value / 1000) * 1000 AS bucket_start,
        COUNT(*) AS cnt
    FROM large_data
    GROUP BY FLOOR(value / 1000) * 1000
),
cumulative AS (
    SELECT
        bucket_start,
        cnt,
        SUM(cnt) OVER (ORDER BY bucket_start) AS cum_cnt,
        SUM(cnt) OVER () AS total_cnt
    FROM histogram
),
median_bucket AS (
    SELECT bucket_start, cnt, cum_cnt, total_cnt
    FROM cumulative
    WHERE cum_cnt >= CEIL(total_cnt / 2.0)
    ORDER BY bucket_start
    LIMIT 1
)
SELECT
    bucket_start + 500 AS approximate_median
FROM median_bucket;
```

**考点**：大数据量下的近似中位数计算，Hive / Spark SQL 场景常用。

---

### 题目 7：多列去重计数（HyperLogLog 风格）

**背景**：访问表 `visits(user_id, page_id, visit_date)`。

**问题**：统计每个页面每天的独立用户数，以及截至当前每个页面的累计独立用户数。要求精确去重。

**解答**：

```sql
WITH daily_uv AS (
    SELECT
        page_id,
        visit_date,
        COUNT(DISTINCT user_id) AS daily_uv
    FROM visits
    GROUP BY page_id, visit_date
),
cumulative_uv AS (
    SELECT
        v.page_id,
        v.visit_date,
        v.daily_uv,
        (
            SELECT COUNT(DISTINCT user_id)
            FROM visits sub
            WHERE sub.page_id = v.page_id
              AND sub.visit_date <= v.visit_date
        ) AS cum_uv
    FROM daily_uv v
)
SELECT page_id, visit_date, daily_uv, cum_uv
FROM cumulative_uv
ORDER BY page_id, visit_date;
```

**考点**：关联子查询实现累计去重计数，效率低于窗口函数但精确。

---

### 题目 8：JOIN 优化与等价改写

**背景**：订单表 `orders(order_id, user_id, amount, created_at)`（100 万行），用户表 `users(user_id, city)`（10 万行）。

**原查询**：

```sql
SELECT o.order_id, u.city, o.amount
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
WHERE o.created_at >= '2024-01-01'
  AND u.city IN ('北京', '上海')
  AND o.amount > 100;
```

**问题**：上述查询有什么问题？如何优化？

**解答**：

**问题分析**：
1. `LEFT JOIN` 被 `WHERE u.city IN (...)` 隐式转换为 `INNER JOIN`，语义冲突
2. `WHERE` 条件在 JOIN 之后过滤，无法提前减少 JOIN 数据量
3. 大表 JOIN 未利用索引

**优化方案**：

```sql
-- 方案 1：使用 INNER JOIN 明确语义
SELECT o.order_id, u.city, o.amount
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id
WHERE o.created_at >= '2024-01-01'
  AND u.city IN ('北京', '上海')
  AND o.amount > 100;

-- 方案 2：子查询提前过滤
SELECT o.order_id, u.city, o.amount
FROM (
    SELECT user_id, city
    FROM users
    WHERE city IN ('北京', '上海')
) u
INNER JOIN orders o ON o.user_id = u.user_id
WHERE o.created_at >= '2024-01-01'
  AND o.amount > 100;

-- 方案 3：使用 EXISTS 改写（适用于某些数据库优化器）
SELECT o.order_id, '上海' AS city, o.amount
FROM orders o
WHERE o.created_at >= '2024-01-01'
  AND o.amount > 100
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = o.user_id AND u.city IN ('北京', '上海')
  );
```

**补充建议**：
- `orders.created_at` 和 `orders.user_id` 上建复合索引
- `users.city` 和 `users.user_id` 上建索引
- 数据量大时考虑分区表（按日期分区）
