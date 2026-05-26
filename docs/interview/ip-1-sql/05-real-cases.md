# 大厂 SQL 真题

> 收集自字节跳动、阿里巴巴、腾讯、美团等一线互联网公司的真实面试题。部分题目根据 NDA 做了脱敏处理，但核心考点不变。

---

### 题目 1：字节跳动 — 视频完播率分析

**背景**：视频播放记录表 `video_play(user_id, video_id, play_start, play_duration, video_duration)`。`play_duration` 是实际播放时长（秒），`video_duration` 是视频总时长。

**问题**：计算每个视频的完播率（`play_duration >= video_duration * 0.95` 视为完播），按完播率降序排列。

**预期输出**：

| video_id | total_plays | completed_plays | completion_rate |
|----------|-------------|-----------------|-----------------|
| V001 | 10000 | 4500 | 45.00% |
| V002 | 8000 | 3200 | 40.00% |

**解答**：

```sql
SELECT
    video_id,
    COUNT(*) AS total_plays,
    SUM(CASE WHEN play_duration >= video_duration * 0.95 THEN 1 ELSE 0 END) AS completed_plays,
    ROUND(
        SUM(CASE WHEN play_duration >= video_duration * 0.95 THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
        2
    ) AS completion_rate
FROM video_play
GROUP BY video_id
ORDER BY completion_rate DESC;
```

**考点**：条件聚合 + 比率计算。

---

### 题目 2：阿里巴巴 — 商品复购率

**背景**：订单表 `orders(order_id, user_id, product_id, order_date)`。

**问题**：统计每个商品在 2024 年 1 月的复购率。定义：复购用户数 = 购买该商品 >= 2 次的用户数；复购率 = 复购用户数 / 总购买用户数。

**预期输出**：

| product_id | total_users | repeat_users | repurchase_rate |
|------------|-------------|--------------|-----------------|
| P001 | 500 | 120 | 24.00% |
| P002 | 300 | 60 | 20.00% |

**解答**：

```sql
WITH user_product AS (
    SELECT
        product_id,
        user_id,
        COUNT(*) AS purchase_count
    FROM orders
    WHERE order_date >= '2024-01-01' AND order_date < '2024-02-01'
    GROUP BY product_id, user_id
)
SELECT
    product_id,
    COUNT(user_id) AS total_users,
    SUM(CASE WHEN purchase_count >= 2 THEN 1 ELSE 0 END) AS repeat_users,
    ROUND(
        SUM(CASE WHEN purchase_count >= 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(user_id),
        2
    ) AS repurchase_rate
FROM user_product
GROUP BY product_id
ORDER BY repurchase_rate DESC;
```

**考点**：两级聚合计算复购率。

---

### 题目 3：腾讯 — 社交关系中的共同好友数

**背景**：好友关系表 `friendships(user_id, friend_id)`，表示双向好友关系（数据只存一条）。

**问题**：对于用户 `A` 和用户 `B`，计算他们的共同好友数。

**解答**：

```sql
WITH user_a_friends AS (
    SELECT friend_id FROM friendships WHERE user_id = 'A'
    UNION
    SELECT user_id FROM friendships WHERE friend_id = 'A'
),
user_b_friends AS (
    SELECT friend_id FROM friendships WHERE user_id = 'B'
    UNION
    SELECT user_id FROM friendships WHERE friend_id = 'B'
)
SELECT COUNT(*) AS common_friends
FROM user_a_friends a
INNER JOIN user_b_friends b ON a.friend_id = b.friend_id;
```

**考点**：好友关系的双向查询，注意数据存储方式。

**扩展**：如果要计算所有用户对的共同好友数，可以用自连接：

```sql
SELECT
    f1.user_id AS user1,
    f2.user_id AS user2,
    COUNT(*) AS common_friends
FROM friendships f1
JOIN friendships f2
    ON f1.friend_id = f2.friend_id
    AND f1.user_id < f2.user_id
GROUP BY f1.user_id, f2.user_id;
```

---

### 题目 4：美团 — 外卖配送超时率

**背景**：配送记录表 `delivery(order_id, restaurant_id, order_time, delivery_time, promised_time)`。

**问题**：统计每个商家的订单超时率（`delivery_time > promised_time`）和平均超时时长（分钟）。

**预期输出**：

| restaurant_id | total_orders | timeout_count | timeout_rate | avg_timeout_min |
|---------------|--------------|---------------|--------------|-----------------|
| R001 | 500 | 35 | 7.00% | 12.5 |
| R002 | 300 | 10 | 3.33% | 8.2 |

**解答**：

```sql
SELECT
    restaurant_id,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN delivery_time > promised_time THEN 1 ELSE 0 END) AS timeout_count,
    ROUND(
        SUM(CASE WHEN delivery_time > promised_time THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
        2
    ) AS timeout_rate,
    ROUND(
        AVG(CASE
            WHEN delivery_time > promised_time
            THEN TIMESTAMPDIFF(MINUTE, promised_time, delivery_time)
            ELSE NULL
        END), 1
    ) AS avg_timeout_min
FROM delivery
WHERE order_date >= '2024-01-01'
GROUP BY restaurant_id
ORDER BY timeout_rate DESC;
```

**考点**：时间差计算 + 条件聚合，`AVG` 配合 `CASE WHEN` 只计算超时订单的平均时长。

---

### 题目 5：字节跳动 — 用户活跃天数分布

**背景**：用户登录表 `user_login(user_id, login_date)`。

**问题**：统计 2024 年 1 月活跃用户按活跃天数（当月登录天数）的分布情况。

**预期输出**：

| active_days | user_count | proportion |
|-------------|------------|------------|
| 1 | 50000 | 25.00% |
| 2-5 | 80000 | 40.00% |
| 6-10 | 40000 | 20.00% |
| 10+ | 30000 | 15.00% |

**解答**：

```sql
WITH user_active_days AS (
    SELECT
        user_id,
        COUNT(DISTINCT login_date) AS active_days
    FROM user_login
    WHERE login_date >= '2024-01-01' AND login_date < '2024-02-01'
    GROUP BY user_id
),
grouped AS (
    SELECT
        CASE
            WHEN active_days = 1 THEN '1'
            WHEN active_days <= 5 THEN '2-5'
            WHEN active_days <= 10 THEN '6-10'
            ELSE '10+'
        END AS bucket,
        COUNT(user_id) AS user_count
    FROM user_active_days
    GROUP BY bucket
),
total AS (
    SELECT SUM(user_count) AS total_users FROM grouped
)
SELECT
    bucket,
    user_count,
    ROUND(user_count * 100.0 / total_users, 2) AS proportion
FROM grouped, total
ORDER BY bucket;
```

**考点**：分桶统计 + 占比计算。

---

### 题目 6：蚂蚁集团 — 风控中的交易对账

**背景**：两张表——`transactions(txn_id, user_id, amount, txn_time)` 和 `settlements(txn_id, settle_amount, settle_time)`。

**问题**：找出交易金额与结算金额不一致的记录，输出差异金额和差异率。

**解答**：

```sql
SELECT
    t.txn_id,
    t.user_id,
    t.amount AS txn_amount,
    s.settle_amount,
    (t.amount - s.settle_amount) AS diff_amount,
    ROUND(
        ABS(t.amount - s.settle_amount) / t.amount * 100,
        2
    ) AS diff_rate
FROM transactions t
JOIN settlements s ON t.txn_id = s.txn_id
WHERE t.amount != s.settle_amount
ORDER BY diff_rate DESC;
```

**考点**：表关联对账，金额差异分析。

---

### 题目 7：拼多多 — 商品降价对销量的影响

**背景**：商品价格变更表 `price_changes(product_id, old_price, new_price, change_time)`，订单表 `orders(order_id, product_id, order_time, quantity)`。

**问题**：对于 2024 年 1 月降价超过 10% 的商品，对比降价前后 7 天的日均销量变化。

**解答**：

```sql
WITH price_drop AS (
    SELECT
        product_id,
        old_price,
        new_price,
        change_time,
        (old_price - new_price) / old_price AS drop_ratio
    FROM price_changes
    WHERE (old_price - new_price) / old_price > 0.10
      AND change_time >= '2024-01-01' AND change_time < '2024-02-01'
),
before_sales AS (
    SELECT
        p.product_id,
        AVG(o.quantity) AS avg_daily_before
    FROM price_drop p
    JOIN orders o ON p.product_id = o.product_id
    WHERE o.order_time >= DATE_SUB(p.change_time, INTERVAL 7 DAY)
      AND o.order_time < p.change_time
    GROUP BY p.product_id
),
after_sales AS (
    SELECT
        p.product_id,
        AVG(o.quantity) AS avg_daily_after
    FROM price_drop p
    JOIN orders o ON p.product_id = o.product_id
    WHERE o.order_time >= p.change_time
      AND o.order_time < DATE_ADD(p.change_time, INTERVAL 7 DAY)
    GROUP BY p.product_id
)
SELECT
    p.product_id,
    p.old_price,
    p.new_price,
    ROUND(p.drop_ratio * 100, 2) AS drop_percentage,
    ROUND(b.avg_daily_before, 2) AS avg_daily_before,
    ROUND(a.avg_daily_after, 2) AS avg_daily_after,
    ROUND((a.avg_daily_after - b.avg_daily_before) / b.avg_daily_before * 100, 2) AS sales_change_pct
FROM price_drop p
JOIN before_sales b ON p.product_id = b.product_id
JOIN after_sales a ON p.product_id = a.product_id
ORDER BY sales_change_pct DESC;
```

**考点**：前后对比分析 + 多步 CTE。

---

### 题目 8：快手 — 直播间新老用户占比

**背景**：直播间进入记录 `live_enter(room_id, user_id, enter_time)`，用户注册表 `users(user_id, register_date)`。

**问题**：统计每个直播间每分钟的新用户（注册时间 < 首次进入直播间时间 <= 7 天）和老用户占比。

**解答**：

```sql
WITH user_type AS (
    SELECT
        le.room_id,
        DATE_FORMAT(le.enter_time, '%Y-%m-%d %H:%i') AS minute,
        le.user_id,
        CASE
            WHEN DATEDIFF(le.enter_time, u.register_date) <= 7 THEN 'new'
            ELSE 'old'
        END AS user_type
    FROM live_enter le
    JOIN users u ON le.user_id = u.user_id
)
SELECT
    room_id,
    minute,
    COUNT(*) AS total_users,
    SUM(CASE WHEN user_type = 'new' THEN 1 ELSE 0 END) AS new_users,
    SUM(CASE WHEN user_type = 'old' THEN 1 ELSE 0 END) AS old_users,
    ROUND(SUM(CASE WHEN user_type = 'new' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS new_user_pct
FROM user_type
GROUP BY room_id, minute
ORDER BY room_id, minute;
```

**考点**：用户类型分类 + 时间粒度聚合。
