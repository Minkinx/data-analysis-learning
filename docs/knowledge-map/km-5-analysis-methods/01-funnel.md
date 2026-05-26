# 漏斗分析（Funnel Analysis）

> 漏斗分析是最经典的用户行为分析方法之一，通过追踪用户在业务流程中的逐步转化，定位流失拐点，评估优化效果。

## 漏斗转化率计算

漏斗的每一层定义为用户完成的特定事件，转化率 = 到达下一层的用户数 / 当前层的用户数。

```sql
-- AARRR 漏斗：商品浏览 → 加购 → 下单 → 支付
WITH funnel AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event_name = 'view_item'   THEN user_id END) AS step_1,
    COUNT(DISTINCT CASE WHEN event_name = 'add_cart'    THEN user_id END) AS step_2,
    COUNT(DISTINCT CASE WHEN event_name = 'create_order' THEN user_id END) AS step_3,
    COUNT(DISTINCT CASE WHEN event_name = 'payment_success' THEN user_id END) AS step_4
  FROM fact_events
  WHERE date_key BETWEEN 20260401 AND 20260430
)
SELECT '浏览商品' AS stage, step_1 AS users, 100.0          AS rate FROM funnel
UNION ALL
SELECT '加入购物车',   step_2, ROUND(step_2 * 100.0 / step_1, 1) FROM funnel
UNION ALL
SELECT '创建订单',     step_3, ROUND(step_3 * 100.0 / step_2, 1) FROM funnel
UNION ALL
SELECT '支付成功',     step_4, ROUND(step_4 * 100.0 / step_3, 1) FROM funnel;
```

::: tip 计算口径一致
确保各步骤的统计周期、用户去重逻辑一致。如果步骤跨天，应选择相同的时间窗口。
:::

## 流失节点识别

通过 **Step-wise Drop-off Rate（步骤流失率）** 和 **Absolute Drop-off（绝对流失人数）** 定位最大瓶颈：

| 步骤 | 用户数 | 步骤转化率 | 绝对流失 | 整体转化率 |
|------|--------|-----------|---------|-----------|
| 浏览商品 | 100,000 | — | — | 100.0% |
| 加入购物车 | 35,000 | 35.0% | 65,000 | 35.0% |
| 创建订单 | 18,000 | 51.4% | 17,000 | 18.0% |
| 支付成功 | 14,500 | 80.6% | 3,500 | 14.5% |

本例中浏览 → 加购流失最大（65,000 人），是需优先优化的环节：检查商品详情页加载速度、价格透明度、是否要求登录等。

## 漏斗对比分析

### 前后对比（Before/After）

产品优化后，观察同口径漏斗转化率变化：

```sql
SELECT
  '优化前' AS period, stage, users, rate
FROM funnel WHERE date_key BETWEEN 20260301 AND 20260331
UNION ALL
SELECT
  '优化后', stage, users, rate
FROM funnel WHERE date_key BETWEEN 20260401 AND 20260430;
```

### 分群对比

将用户拆分为新客 vs 老客、iOS vs Android 等维度的子漏斗：

```sql
WITH user_seg AS (
  SELECT
    e.user_id,
    e.event_name,
    CASE WHEN u.register_date >= '2026-04-01' THEN '新客' ELSE '老客' END AS seg
  FROM fact_events e
  LEFT JOIN dim_user u ON e.user_id = u.user_id
  WHERE e.date_key BETWEEN 20260401 AND 20260430
)
SELECT seg, '浏览商品' AS stage,
       COUNT(DISTINCT CASE WHEN event_name = 'view_item' THEN user_id END) AS users
FROM user_seg GROUP BY seg
-- ...
```

::: warning 分群漏斗的可比性
不同分群的基数差异大时，关注转化率而非绝对人数。例如新客基数小但转化率高，不代表贡献大。
:::

## 漏斗类型选择

### 开放漏斗（Open Funnel）

用户可以从任意步骤进入，不强制顺序：

- **适用**：用户行为路径不固定的产品（如内容平台：首页 → 文章页 → 搜索 → 详情页）
- **计算**：统计各步骤的独立用户数，不要求前序步骤

### 闭合漏斗（Closed Funnel）

用户必须严格按顺序经过各步骤：

- **适用**：转化路径固定的业务流程（如电商下单：加购 → 结算 → 支付）
- **计算**：只统计经过完整路径的用户，step N + 1 用户须属于 step N 的子集

```sql
-- 闭合漏斗（严格顺序）
SELECT
  COUNT(DISTINCT user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN has_viewed = 1 AND has_cart = 1 AND has_paid = 1 THEN user_id END) AS converted
FROM (
  SELECT user_id,
    MAX(CASE WHEN event_name = 'view_item'      AND seq = 1 THEN 1 ELSE 0 END) AS has_viewed,
    MAX(CASE WHEN event_name = 'add_cart'        AND seq = 2 THEN 1 ELSE 0 END) AS has_cart,
    MAX(CASE WHEN event_name = 'payment_success' AND seq = 3 THEN 1 ELSE 0 END) AS has_paid
  FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time) AS seq
    FROM fact_events WHERE date_key BETWEEN 20260401 AND 20260430
  ) t GROUP BY user_id
) t2;
```

## 步骤间流失归因

找到用户在哪一步流失后，需归因流失原因：

| 流失步骤 | 可能原因 | 分析手段 |
|---------|---------|---------|
| 浏览 → 加购 | 价格无竞争力、评价差、需登录 | 跳出页分析、热力图、AB 测试 |
| 加购 → 下单 | 运费过高、库存不足 | 购物车放弃率、运费策略对比 |
| 下单 → 支付 | 支付方式少、支付报错 | 支付日志错误码分析、支付转化分渠道 |

**示例：加购后未下单的用户，最后访问页面分布**

```sql
SELECT last_page, COUNT(*) AS users
FROM (
  SELECT user_id, page_url AS last_page,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time DESC) AS rn
  FROM fact_events
  WHERE event_name = 'add_cart'
    AND date_key BETWEEN 20260401 AND 20260430
) t WHERE rn = 1 AND user_id NOT IN (
  SELECT DISTINCT user_id FROM fact_events WHERE event_name = 'create_order'
)
GROUP BY last_page ORDER BY users DESC;
```

## 相关文章

- [同期群分析](/knowledge-map/km-5-analysis-methods/02-cohort) — 从时间维度追踪用户群的转化变化
- [留存分析](/knowledge-map/km-5-analysis-methods/03-retention) — 漏斗之后的用户持续使用分析
- [归因分析](/knowledge-map/km-5-analysis-methods/05-attribution) — 多触点分配转化功劳
