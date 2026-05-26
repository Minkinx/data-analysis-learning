# 留存分析（Retention Analysis）

> 留存是衡量产品长期价值的核心指标。留存分析回答一个根本问题：用户在使用产品一次后，是否还会回来？

## 留存指标的定义

### Day N Retention（经典留存）

定义：用户在激活后第 N 天是否回访。

```sql
-- Day 1 / Day 7 / Day 30 留存
WITH user_first AS (
  SELECT user_id, MIN(DATE(event_time)) AS first_date
  FROM fact_events GROUP BY user_id
),
daily_active AS (
  SELECT DISTINCT user_id, DATE(event_time) AS active_date
  FROM fact_events
)
SELECT
  first_date,
  COUNT(DISTINCT u.user_id) AS new_users,
  COUNT(DISTINCT CASE WHEN DATEDIFF(a.active_date, u.first_date) = 1
    THEN u.user_id END) * 1.0 / COUNT(DISTINCT u.user_id) AS d1_retention,
  COUNT(DISTINCT CASE WHEN DATEDIFF(a.active_date, u.first_date) = 7
    THEN u.user_id END) * 1.0 / COUNT(DISTINCT u.user_id) AS d7_retention,
  COUNT(DISTINCT CASE WHEN DATEDIFF(a.active_date, u.first_date) = 30
    THEN u.user_id END) * 1.0 / COUNT(DISTINCT u.user_id) AS d30_retention
FROM user_first u
LEFT JOIN daily_active a ON u.user_id = a.user_id
GROUP BY first_date;
```

**特点**：严格定义，好比较。但对活跃模式不规律的用户不友好（哪天回访算 Day N？）。

### Rolling Retention（滚动留存）

定义：用户在激活后指定天数内**任意一天**回访即算留存。相比 Day N 留存，"窗口"更宽容。

| 指标 | Day 7 留存 | Rolling Day 7 留存 |
|------|-----------|-------------------|
| 定义 | 第 7 天精确回访 | 第 1-7 天内任意一天回访 |
| 数值 | 通常 15-30% | 通常 40-70% |
| 适用场景 | 高频产品（社交、IM） | 低频产品（电商、旅游） |

```sql
-- Rolling Day 7 留存
SELECT
  u.first_date,
  COUNT(DISTINCT u.user_id) AS new_users,
  COUNT(DISTINCT CASE WHEN DATEDIFF(a.active_date, u.first_date) BETWEEN 1 AND 7
    THEN u.user_id END) * 1.0 / COUNT(DISTINCT u.user_id) AS rolling_d7
FROM user_first u
LEFT JOIN daily_active a ON u.user_id = a.user_id
GROUP BY u.first_date;
```

### Bracket Retention（区间留存）

将时间划分为固定区间计算留存。典型区间：Week 1 / Week 2 / Month 1 / Month 2：

```sql
-- 月区间留存
SELECT
  u.cohort_month,
  period_index,
  COUNT(DISTINCT CASE WHEN a.active_month = u.cohort_month + INTERVAL period_index MONTH
    THEN u.user_id END) * 1.0 / cohort_size AS retention_rate
FROM cohort_table u
CROSS JOIN (SELECT 1 AS period_index UNION SELECT 2 UNION SELECT 3) periods
LEFT JOIN monthly_active a ON ...
GROUP BY u.cohort_month, period_index;
```

## 留存曲线解读

典型的留存曲线呈 **幂律衰减（Power Law Decay）**：

```
留存率
  |
 1.0 +   *
  |       *
 0.5 +        *
  |              *
 0.0 +---------------------→ 时间
      初始   快速衰减   平稳期
```

**三段式解读**：

1. **初始期（Day 0-7）** — 留存迅速下降，反映"新鲜感"用户的第一波流失
2. **衰减期（Week 2-8）** — 下降趋缓，反映是否形成使用习惯
3. **平稳期（Month 3+）** — 留存趋于稳定，这部分是产品的"核心用户"

::: warning 留存曲线的形状决定商业模式
社交/内容平台平稳期留存可能在 30-50% 以上，电商约 10-20%，工具类可能只有 5-10% —— 这不是"好"或"坏"，而是产品类型本身的属性。关键是 **趋势是否在改善**。
:::

## 幸存者分析（Survivorship Analysis）

幸存者分析追踪用户在每个周期后继续活跃的概率，类似医学中的 Kaplan-Meier 曲线：

```python
import pandas as pd
import numpy as np
from lifelines import KaplanMeierFitter

# 模拟留存数据：每个用户的活跃周期
data = pd.DataFrame({
    'user_id': range(1000),
    'tenure_days': np.random.exponential(30, 1000),  # 存活天数
    'is_active': np.random.binomial(1, 0.7, 1000),    # 是否仍活跃（右删失）
})

kmf = KaplanMeierFitter()
kmf.fit(durations=data['tenure_days'],
        event_observed=data['is_active'])
kmf.plot_survival_function()
```

**应用价值**：

- 预测用户流失时间：中位存活期是多少天？
- 分组对比：A/B 组的幸存曲线是否有显著差异（Log-rank test）
- 估算 LTV：幸存概率 × 每个周期收入 = 预期长期收入

## 流失预测框架（概念）

留存分析的延伸——预测哪些用户即将流失，以便提前干预：

1. **特征工程**
   - 近期行为：最后活跃距今天数、登录频率变化
   - 行为变化：事件数环比下降幅度、使用时长缩短
   - 静态特征：注册渠道、设备类型、地域

2. **建模方法**
   - 逻辑回归（可解释性好）：流失概率 = sigmoid(W · X + b)
   - 生存分析（Cox PH）：考虑时间维度的流失风险
   - 树模型（XGBoost/LightGBM）：特征交互能力强

3. **干预策略**
   - 预测流失概率 > 阈值 → 推送优惠/提醒/新内容
   - 分群干预：高价值用户 VIP 客服触达，普通用户自动推送

```sql
-- 流失预警 SQL 示例：30 天未活跃用户
SELECT user_id, MAX(event_time) AS last_active,
       DATEDIFF(CURRENT_DATE, MAX(event_time)) AS days_since_last,
       COUNT(*) AS total_events_30d_before
FROM fact_events
WHERE event_time >= DATE_SUB(CURRENT_DATE, 60)
GROUP BY user_id
HAVING days_since_last > 30;
```

::: tip 留存分析的工作流
1. 选定留存指标（Day N / Rolling / Bracket）
2. 按同期群拆分，观察趋势
3. 识别留存拐点，定位流失原因
4. 建立流失预测模型
5. 制定干预策略并评估效果
:::

## 相关文章

- [同期群分析](/knowledge-map/km-5-analysis-methods/02-cohort) — 纵向追踪留存变化
- [用户分层](/knowledge-map/km-5-analysis-methods/04-user-segmentation) — 基于留存行为的分群运营
- [LTV 分析](/knowledge-map/km-5-analysis-methods/07-ltv) — 留存与 LTV 的计算关系
- [异动分析](/knowledge-map/km-5-analysis-methods/06-anomaly-detection) — 留存率突变的归因排查
