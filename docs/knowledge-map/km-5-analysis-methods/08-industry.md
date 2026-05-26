# 行业专题分析场景

> 不同行业的分析侧重点差异巨大。本节覆盖电商、内容、金融、SaaS 四大行业的核心分析场景与方法。

## 电商分析场景

### 购买漏斗

电商的核心分析模型——从曝光到复购的全链路：

```
广告曝光 → 商品浏览 → 加入购物车 → 结算 → 支付成功 → 确认收货 → 复购
```

```sql
-- 电商大漏斗
WITH steps AS (
  SELECT user_id,
    MAX(CASE WHEN event_name = 'impression' THEN 1 ELSE 0 END) AS step_imp,
    MAX(CASE WHEN event_name = 'view_item'  THEN 1 ELSE 0 END) AS step_view,
    MAX(CASE WHEN event_name = 'add_cart'    THEN 1 ELSE 0 END) AS step_cart,
    MAX(CASE WHEN event_name = 'checkout'    THEN 1 ELSE 0 END) AS step_checkout,
    MAX(CASE WHEN event_name = 'payment'     THEN 1 ELSE 0 END) AS step_pay,
    MAX(CASE WHEN event_name = 'delivered'   THEN 1 ELSE 0 END) AS step_deliver
  FROM fact_events
  WHERE date_key BETWEEN 20260401 AND 20260430
  GROUP BY user_id
)
SELECT
  COUNT(DISTINCT CASE WHEN step_imp      = 1 THEN user_id END) AS "曝光用户",
  COUNT(DISTINCT CASE WHEN step_view     = 1 THEN user_id END) AS "浏览用户",
  COUNT(DISTINCT CASE WHEN step_cart     = 1 THEN user_id END) AS "加购用户",
  COUNT(DISTINCT CASE WHEN step_checkout = 1 THEN user_id END) AS "结算用户",
  COUNT(DISTINCT CASE WHEN step_pay      = 1 THEN user_id END) AS "支付用户",
  COUNT(DISTINCT CASE WHEN step_deliver  = 1 THEN user_id END) AS "收货用户"
FROM steps;
```

### 复购分析

复购是电商健康度的关键指标。**一次购买**可能是拉新活动的效果，**两次及以上购买**才是真正的用户粘性：

```sql
-- 复购率分析
SELECT
  order_month,
  total_customers,
  one_time_buyers,
  repurchasers,
  ROUND(repurchasers * 100.0 / total_customers, 1) AS repurchase_rate
FROM (
  SELECT
    DATE_TRUNC('month', first_order_date) AS order_month,
    COUNT(DISTINCT user_id) AS total_customers,
    COUNT(DISTINCT CASE WHEN order_count = 1 THEN user_id END) AS one_time_buyers,
    COUNT(DISTINCT CASE WHEN order_count >= 2 THEN user_id END) AS repurchasers
  FROM (
    SELECT user_id,
      MIN(order_date) AS first_order_date,
      COUNT(DISTINCT order_id) AS order_count
    FROM fact_orders
    GROUP BY user_id
  ) t GROUP BY DATE_TRUNC('month', first_order_date)
) t2 ORDER BY order_month;
```

### 购物车分析

典型问题：加购未支付的订单中，用户都在哪个环节流失？购物车中商品组合是什么？哪些促销策略能提升购物车转化？

```sql
-- 购物车商品组合分析（购物篮分析）
SELECT
  a.product_name AS product_a,
  b.product_name AS product_b,
  COUNT(*) AS co_occurrence,
  COUNT(*) * 1.0 / (
    SELECT COUNT(*) FROM cart_events WHERE product_name = a.product_name
  ) AS lift
FROM cart_events a
JOIN cart_events b ON a.session_id = b.session_id
  AND a.product_name < b.product_name
GROUP BY a.product_name, b.product_name
ORDER BY co_occurrence DESC;
```

## 内容平台分析场景

### 内容消费深度

传统 PV/UV 无法反映用户对内容质量的真实反馈，需要衡量**消费深度**：

| 指标 | 定义 | 含义 |
|------|------|------|
| 完播率 | 完整看完视频的用户占比 | 内容吸引力 |
| 阅读深度 | 文章滚动到 50%/80%/100% 的比例 | 信息密度匹配度 |
| 平均停留时长 | 单篇内容的平均消费时长 | 内容沉浸度 |
| 互动率 | 点赞/评论/收藏/分享数 ÷ 浏览数 | 内容共鸣度 |

```sql
-- 内容消费深度分析
SELECT
  content_id,
  COUNT(*) AS total_views,
  AVG(CASE WHEN scroll_depth >= 100 THEN 1 ELSE 0 END) AS completion_rate,
  AVG(dwell_time_seconds) AS avg_dwell_time,
  COUNT(CASE WHEN action = 'like' THEN 1 END) * 1.0 / COUNT(*) AS like_rate,
  COUNT(CASE WHEN action = 'share' THEN 1 END) * 1.0 / COUNT(*) AS share_rate
FROM content_consumption
WHERE date_key >= 20260401
GROUP BY content_id
ORDER BY total_views DESC;
```

### 创作者侧分析

内容平台需要同时服务消费者和生产者（创作者/KOL）：

```sql
-- 创作者活跃与收益分析
SELECT
  creator_id,
  COUNT(DISTINCT content_id) AS total_posts,
  SUM(views) AS total_views,
  SUM(revenue) AS total_revenue,
  SUM(revenue) / NULLIF(COUNT(DISTINCT content_id), 0) AS revenue_per_post,
  -- 创作活跃度分层
  CASE
    WHEN COUNT(DISTINCT DATE(publish_date)) >= 20 THEN '高频'
    WHEN COUNT(DISTINCT DATE(publish_date)) >= 10 THEN '中频'
    ELSE '低频'
  END AS activity_level
FROM creator_daily
WHERE month >= '2026-04-01'
GROUP BY creator_id;
```

## 金融分析场景

### 信贷风险分析

信贷业务的核心分析包括：逾期率（Delinquency）、坏账率（Charge-off）、回收率（Recovery）：

```sql
-- 账龄分析（Vintage Analysis）
SELECT
  loan_month,           -- 放款月份
  period_index,         -- 放款后第 N 个月
  SUM(CASE WHEN overdue_days > 30 THEN loan_amount ELSE 0 END) AS bad_amount,
  SUM(CASE WHEN overdue_days > 30 THEN loan_amount ELSE 0 END) * 1.0
    / SUM(loan_amount) AS bad_rate
FROM loan_performance
GROUP BY loan_month, period_index
ORDER BY loan_month, period_index;
```

**Vintage 分析**是金融行业特有的异动分析方法——按放款月份分组，跟踪各组的逾期率随账龄的变化。如果某月放款群组的逾期率曲线突然抬升，说明该月风控策略可能出了问题。

### 关键风险指标

| 指标 | 定义 | 健康范围 |
|------|------|---------|
| 逾期率（30d+） | 逾期 30 天以上贷款余额 / 总贷款余额 | < 3% |
| 坏账率 | 确认无法回收的贷款 / 总贷款 | < 1.5% |
| 拨备覆盖率 | 风险准备金 / 预期损失 | > 150% |
| 首逾率 | 首次还款即逾期的用户比例 | < 2% |

## SaaS 分析场景

### 用户健康度评分

SaaS 行业通过 **Health Score** 预判客户续约或流失：

```sql
-- SaaS 客户健康度评分
SELECT
  account_id,
  -- 活跃度维度（权重 40%）
  (days_active_last_30d / 30.0) * 40 AS activity_score,
  -- 功能采用维度（权重 30%）
  (features_used / total_features) * 30 AS adoption_score,
  -- 满意度维度（权重 30%）
  (avg_nps_score / 10.0) * 30 AS satisfaction_score,
  -- 综合得分（0-100）
  (days_active_last_30d / 30.0) * 40
    + (features_used / total_features) * 30
    + (avg_nps_score / 10.0) * 30 AS health_score,
  CASE
    WHEN health_score >= 80 THEN '健康'
    WHEN health_score >= 60 THEN '关注'
    ELSE '高危'
  END AS health_level
FROM customer_health;
```

### 扩展收入（Expansion Revenue）

SaaS 的成长动力来自三部分：**新增收入 + 扩展收入 - 流失收入**。扩展收入包括升级套餐、增加席位、交叉销售附加功能：

```sql
SELECT
  fiscal_quarter,
  SUM(new_revenue) AS new_revenue,
  SUM(expansion_revenue) AS expansion_revenue,
  SUM(churned_revenue) AS churned_revenue,
  (SUM(new_revenue) + SUM(expansion_revenue)
   - SUM(churned_revenue)) AS net_new_arr,
  SUM(expansion_revenue) * 1.0 / NULLIF(SUM(churned_revenue), 0)
    AS expansion_churn_ratio  -- > 1 表示净增长
FROM saas_arr
GROUP BY fiscal_quarter
ORDER BY fiscal_quarter;
```

### 功能采用分析

功能采用率是预测续约的前瞻指标。采用率高的客户续约概率显著更高：

```sql
-- 核心功能采用率（Power User Curve）
SELECT
  feature_name,
  COUNT(DISTINCT user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN usage_count >= 4 THEN user_id END) AS power_users,
  ROUND(COUNT(DISTINCT CASE WHEN usage_count >= 4 THEN user_id END) * 100.0
    / COUNT(DISTINCT user_id), 1) AS power_user_rate
FROM feature_usage
WHERE date_key >= DATE_SUB(CURRENT_DATE, 30)
GROUP BY feature_name
ORDER BY power_user_rate DESC;
```

## 行业分析方法选型速查

| 分析问题 | 适用方法 | 主要行业 |
|---------|---------|---------|
| 用户从哪步流失最多？ | 漏斗分析 | 电商、SaaS、金融 |
| 用户质量在改善还是恶化？ | 同期群分析 | 全部 |
| 用户是否长期使用产品？ | 留存分析 | 全部 |
| 哪些用户最值得投入资源？ | 用户分层 | 全部 |
| 广告预算应该投在哪里？ | 归因分析 | 电商、内容 |
| 指标为什么突然变了？ | 异动分析 | 全部 |
| 一个用户值多少钱？ | LTV 分析 | 全部 |
| 哪些功能决定续约？ | 功能采用分析 | SaaS |

## 相关文章

- [漏斗分析](/knowledge-map/km-5-analysis-methods/01-funnel) — 各行业的漏斗设计差异
- [用户分层](/knowledge-map/km-5-analysis-methods/04-user-segmentation) — RFM 与行业定制化
- [异动分析](/knowledge-map/km-5-analysis-methods/06-anomaly-detection) — Vintage 分析与监控告警
