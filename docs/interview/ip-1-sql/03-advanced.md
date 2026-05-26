# 进阶 SQL 面试题

> 面向 3-5 年经验的数据分析师，考察复杂窗口函数应用、自连接、递归 CTE、性能优化等高级话题。

---

### 题目 1：会话时间分段（Sessionization）

**背景**：用户行为日志表 `user_logs(user_id, event_time, event_name)`。

**问题**：将用户行为划分为会话（Session），定义：同一用户相邻两次行为间隔超过 30 分钟则视为新会话。输出每个会话的开始时间、结束时间和行为数。

**预期输出**：

| user_id | session_start | session_end | event_count |
|---------|---------------|-------------|-------------|
| 1001 | 2024-01-01 10:00:00 | 2024-01-01 10:25:00 | 5 |
| 1001 | 2024-01-01 11:00:00 | 2024-01-01 11:10:00 | 3 |

**解答**：

```sql
WITH time_diff AS (
    SELECT
        user_id,
        event_time,
        event_name,
        LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) AS prev_time
    FROM user_logs
),
session_mark AS (
    SELECT
        user_id,
        event_time,
        event_name,
        SUM(CASE
            WHEN prev_time IS NULL
                 OR TIMESTAMPDIFF(MINUTE, prev_time, event_time) > 30
            THEN 1 ELSE 0
        END) OVER (PARTITION BY user_id ORDER BY event_time) AS session_id
    FROM time_diff
)
SELECT
    user_id,
    MIN(event_time) AS session_start,
    MAX(event_time) AS session_end,
    COUNT(*) AS event_count
FROM session_mark
GROUP BY user_id, session_id
ORDER BY user_id, session_start;
```

**考点**：利用 `LAG` + 条件累加构造会话 ID，是数据清洗中的高频场景。

---

### 题目 2：用户留存计算（Retention Analysis）

**背景**：用户登录表 `user_login(user_id, login_date)`。

**问题**：计算 2024 年 1 月新用户的次日、3 日、7 日、30 日留存率。

**预期输出**：

| first_date | new_users | day1_retention | day3_retention | day7_retention | day30_retention |
|------------|-----------|----------------|----------------|----------------|-----------------|
| 2024-01-01 | 1000 | 45.0% | 30.0% | 20.0% | 10.0% |
| 2024-01-02 | 1200 | 42.0% | 28.0% | 18.0% | 8.0% |

**解答**：

```sql
WITH first_login AS (
    SELECT user_id, MIN(login_date) AS first_date
    FROM user_login
    GROUP BY user_id
),
retention AS (
    SELECT
        f.first_date,
        COUNT(DISTINCT f.user_id) AS new_users,
        COUNT(DISTINCT CASE WHEN u.login_date = DATE_ADD(f.first_date, INTERVAL 1 DAY) THEN u.user_id END) AS day1_users,
        COUNT(DISTINCT CASE WHEN u.login_date = DATE_ADD(f.first_date, INTERVAL 3 DAY) THEN u.user_id END) AS day3_users,
        COUNT(DISTINCT CASE WHEN u.login_date = DATE_ADD(f.first_date, INTERVAL 7 DAY) THEN u.user_id END) AS day7_users,
        COUNT(DISTINCT CASE WHEN u.login_date = DATE_ADD(f.first_date, INTERVAL 30 DAY) THEN u.user_id END) AS day30_users
    FROM first_login f
    LEFT JOIN user_login u ON f.user_id = u.user_id
    WHERE f.first_date >= '2024-01-01' AND f.first_date < '2024-02-01'
    GROUP BY f.first_date
)
SELECT
    first_date,
    new_users,
    ROUND(day1_users / new_users * 100, 1) AS day1_retention,
    ROUND(day3_users / new_users * 100, 1) AS day3_retention,
    ROUND(day7_users / new_users * 100, 1) AS day7_retention,
    ROUND(day30_users / new_users * 100, 1) AS day30_retention
FROM retention
ORDER BY first_date;
```

**考点**：留存计算的标准方法，注意用 `LEFT JOIN` 保证基础用户数准确。

---

### 题目 3：查询每个用户在完成某事件前的行为序列

**背景**：用户行为表 `user_events(user_id, event_time, event_name)`。事件包括 `page_view`、`add_cart`、`purchase` 等。

**问题**：对于每个完成 `purchase` 事件的用户，查询其在首次购买前最近 5 条行为记录。

**解答**：

```sql
WITH first_purchase AS (
    SELECT user_id, MIN(event_time) AS purchase_time
    FROM user_events
    WHERE event_name = 'purchase'
    GROUP BY user_id
),
pre_purchase_events AS (
    SELECT
        e.user_id,
        e.event_time,
        e.event_name,
        ROW_NUMBER() OVER (PARTITION BY e.user_id ORDER BY e.event_time DESC) AS rn
    FROM user_events e
    INNER JOIN first_purchase fp ON e.user_id = fp.user_id
    WHERE e.event_time < fp.purchase_time
)
SELECT user_id, event_time, event_name
FROM pre_purchase_events
WHERE rn <= 5
ORDER BY user_id, event_time;
```

**考点**：结合聚合 + 窗口函数提取关键事件前的行为序列。

---

### 题目 4：多条件优先级匹配

**背景**：商品匹配规则表 `rules(rule_id, priority, category, brand, discount_rate)`。商品表 `products(product_id, category, brand)`。

**问题**：对每个商品，按规则优先级（数字越小越高）匹配第一条满足条件（category 和 brand 一致）的规则，返回折扣率。

**解答**：

```sql
WITH matched AS (
    SELECT
        p.product_id,
        r.discount_rate,
        ROW_NUMBER() OVER (PARTITION BY p.product_id ORDER BY r.priority) AS rn
    FROM products p
    LEFT JOIN rules r
        ON (r.category IS NULL OR r.category = p.category)
        AND (r.brand IS NULL OR r.brand = p.brand)
)
SELECT product_id, discount_rate
FROM matched
WHERE rn = 1;
```

**考点**：优先级匹配的通用解法，`NULL` 表示匹配全部。

---

### 题目 5：用递归 CTE 遍历树形结构

**背景**：部门表 `departments(dept_id, dept_name, parent_dept_id)`。

**问题**：输出完整部门层级树，显示每个部门的层级路径。

**预期输出**：

| dept_id | dept_name | level | path |
|---------|-----------|-------|------|
| 1 | 总公司 | 0 | /总公司 |
| 2 | 技术部 | 1 | /总公司/技术部 |
| 3 | 研发组 | 2 | /总公司/技术部/研发组 |

**解答**：

```sql
WITH RECURSIVE dept_tree AS (
    -- 根节点
    SELECT
        dept_id,
        dept_name,
        parent_dept_id,
        0 AS level,
        CONCAT('/', dept_name) AS path
    FROM departments
    WHERE parent_dept_id IS NULL

    UNION ALL

    -- 递归子节点
    SELECT
        d.dept_id,
        d.dept_name,
        d.parent_dept_id,
        dt.level + 1,
        CONCAT(dt.path, '/', d.dept_name)
    FROM departments d
    INNER JOIN dept_tree dt ON d.parent_dept_id = dt.dept_id
)
SELECT dept_id, dept_name, level, path
FROM dept_tree
ORDER BY path;
```

**考点**：递归 CTE 的写法及其在树形结构中的应用。

---

### 题目 6：查询时间段内每天的最大同时在线人数

**背景**：用户在线记录表 `sessions(user_id, start_time, end_time)`。

**问题**：统计每天的最大同时在线用户数。

**解答**：

```sql
WITH time_points AS (
    SELECT
        DATE(start_time) AS dt,
        start_time AS event_time,
        1 AS delta
    FROM sessions
    UNION ALL
    SELECT
        DATE(end_time) AS dt,
        end_time AS event_time,
        -1 AS delta
    FROM sessions
),
online_counts AS (
    SELECT
        dt,
        event_time,
        SUM(delta) OVER (PARTITION BY dt ORDER BY event_time) AS concurrent
    FROM time_points
)
SELECT
    dt,
    MAX(concurrent) AS max_online
FROM online_counts
GROUP BY dt
ORDER BY dt;
```

**考点**：差分法（事件扫描）计算最大同时在线，是经典思维题。

---

### 题目 7：处理间断日期填充缺失值

**背景**：每日销售表 `daily_sales(date, amount)`，存在日期空缺（没有销售记录的天）。

**问题**：生成连续的日期序列，缺失的销售金额用前一天的金额填充。

**解答**：

```sql
WITH RECURSIVE date_range AS (
    SELECT MIN(date) AS dt FROM daily_sales
    UNION ALL
    SELECT DATE_ADD(dt, INTERVAL 1 DAY)
    FROM date_range
    WHERE dt < (SELECT MAX(date) FROM daily_sales)
),
filled AS (
    SELECT
        dr.dt,
        ds.amount,
        MAX(ds.date) OVER (ORDER BY dr.dt) AS last_sale_date
    FROM date_range dr
    LEFT JOIN daily_sales ds ON dr.dt = ds.date
)
SELECT
    dt,
    FIRST_VALUE(amount) OVER (PARTITION BY last_sale_date ORDER BY dt) AS filled_amount
FROM filled
ORDER BY dt;
```

**考点**：递归 CTE 生成连续序列 + 窗口函数 `LAST_VALUE` / `FIRST_VALUE` 填充。

---

### 题目 8：物化路径查询与血缘分析

**背景**：数据血缘表 `lineage(child_table, parent_table, update_time)`。

**问题**：给定一个表名，用递归 CTE 追溯其所有上游依赖（直到无上游为止）。

**解答**：

```sql
WITH RECURSIVE upstream AS (
    -- 起始节点
    SELECT child_table AS table_name, parent_table, 0 AS level
    FROM lineage
    WHERE child_table = 'dws_sales_daily'

    UNION

    -- 递归上游
    SELECT l.child_table, l.parent_table, u.level + 1
    FROM lineage l
    INNER JOIN upstream u ON l.child_table = u.parent_table
)
SELECT DISTINCT table_name AS upstream_table, level
FROM upstream
ORDER BY level;
```

**考点**：递归 CTE 在有向无环图 (DAG) 中的应用。
