# LTV 分析（Lifetime Value Analysis）

> LTV（用户生命周期价值）是用户从获客到流失全过程中为企业带来的总收益。LTV 分析回答了"愿意花多少钱获取一个用户"这个根本商业问题。

## LTV 的分类定义

- **Historical LTV（历史 LTV）**：用户过去实际贡献的总收入，仅能回溯
- **Predicted LTV（预测 LTV）**：基于现有行为预测用户未来的价值
- **Traditional LTV**：不考虑折现的简单加总
- **Discounted LTV**：考虑资金时间价值，未来收入按折现率折算

## 基于同期群的 LTV 计算

### 累计 LTV

最直接的方法：按同期群追踪每期收入，累加得到每个群组在生命周期内的平均累计收入。

```sql
-- 基于同期群的月累计收入
SELECT
  cohort_month,
  period_index,
  SUM(revenue) AS period_revenue,
  SUM(SUM(revenue)) OVER (
    PARTITION BY cohort_month
    ORDER BY period_index
  ) AS cumulative_revenue,
  SUM(SUM(revenue)) OVER (
    PARTITION BY cohort_month
    ORDER BY period_index
  ) / cohort_size AS cumulative_avg_ltv
FROM monthly_cohort_revenue
GROUP BY cohort_month, period_index
ORDER BY cohort_month, period_index;
```

### 典型 LTV 曲线

```
LTV (¥)
  ^
  |                         * (M+12: ¥580)
  |                      *
  |                   *
  |               *
  |           *
  |        *
  |     *
  |  *
  +--------------------------------→ 月龄
  0  2  4  6  8  10  12
```

**解读**：LTV 曲线在初期增长快（新客首月集中消费），之后趋于平缓（留存用户消费稳定）。12 个月的 LTV / CAC 是投放决策的关键指标。

## 预测 LTV 模型

当数据不足以观察到用户完整生命周期时，需要用模型来预测。

### Pareto/NBD 模型

Pareto/NBD 是预测非契约场景（非订阅）用户重复购买行为的经典模型：

- **假设**：用户活跃期服从 Pareto 分布，"活"多久是随机过程
- **假设**：活跃期内购买行为服从 NBD（负二项分布）
- **输出**：预测未来 T 期内用户的期望购买次数

```python
# BG/NBD 模型示例（使用 lifetimes 库）
from lifetimes import BetaGeoFitter
from lifetimes.utils import summary_data_from_transaction_data
import pandas as pd

# 准备数据：每个用户的 频率、最近购买时间、总观察时长
tx_data = pd.read_sql("""
  SELECT user_id, order_date, order_amount
  FROM fact_orders
  WHERE order_date >= '2025-05-01'
""", conn)

summary = summary_data_from_transaction_data(
    tx_data, 'user_id', 'order_date',
    observation_period_end='2026-05-01'
)
# summary: frequency, recency, T (观察时长)

# 训练 BG/NBD 模型
bgf = BetaGeoFitter(penalizer_coef=0.0)
bgf.fit(summary['frequency'], summary['recency'], summary['T'])

# 预测未来 30 天每个用户期望购买次数
summary['predicted_purchases_30d'] = bgf.conditional_expected_number_of_purchases_up_to_time(
    30, summary['frequency'], summary['recency'], summary['T']
)

# 结合客单价估算 LTV
avg_order_value = tx_data.groupby('user_id')['order_amount'].mean()
summary = summary.join(avg_order_value, on='user_id', how='left')
summary['predicted_ltv_30d'] = (summary['predicted_purchases_30d']
                                 * summary['order_amount'])
```

::: tip 适用场景
Pareto/NBD 和 BG/NBD 适用于**非契约型**业务（电商、内容付费、SaaS 按需使用），用户无需主动取消即可流失。对于订阅制业务（会员、SaaS 月付），更适用 **Retention-based LTV** 公式。
:::

### 留存率折现法（Retention-based LTV）

适用于契约型业务，已知各期留存率：

```
LTV = ARPU × Σ (retention_t × discount^t)   for t = 0 to N

其中:
  ARPU = 每期平均收入
  retention_t = 第 t 期的留存率
  discount = 折现因子（如 0.95）
```

```python
def retention_based_ltv(arpu, retention_rates, discount_rate=0.05, periods=60):
    """基于留存率的 LTV 计算"""
    ltv = 0
    for t in range(periods):
        if t < len(retention_rates):
            ret = retention_rates[t]
        else:
            # 假设留存率稳定在最后一个观测值
            ret = retention_rates[-1]
        ltv += arpu * ret / ((1 + discount_rate) ** t)
    return ltv
```

## LTV / CAC 比率

CAC（Customer Acquisition Cost，用户获取成本）是获取一个付费用户的平均花费。

| LTV / CAC | 评价 | 建议 |
|-----------|------|------|
| < 1x | 亏损获客 | 需立即优化：提高变现或降低获客成本 |
| 1-3x | 可接受 | 谨慎投放，重点提升留存或复购率 |
| 3-5x | 健康 | 可适度加大投放，同时关注 LTV 趋势 |
| > 5x | 优秀 | 可积极扩张，警惕市场饱和度 |

```sql
-- 各渠道 LTV / CAC 对比
SELECT
  channel,
  AVG(cac) AS avg_cac,
  AVG(ltv_12m) AS avg_ltv_12m,
  AVG(ltv_12m) / NULLIF(AVG(cac), 0) AS ltv_cac_ratio,
  COUNT(DISTINCT user_id) AS users
FROM (
  SELECT
    a.user_id,
    a.channel,
    a.cac,
    b.ltv_12m
  FROM acquisition_cost a
  LEFT JOIN user_ltv b ON a.user_id = b.user_id
) t
GROUP BY channel
ORDER BY ltv_cac_ratio DESC;
```

## LTV 分层应用

基于预测 LTV 对用户分层，制定差异化策略：

| LTV 分位 | 标签 | 特征 | 运营策略 |
|---------|------|------|---------|
| P80-100 | 高价值 | LTV 高 + 频次高 | VIP 维护、专享客服、独家权益 |
| P50-80 | 中等价值 | LTV 稳定，有提升空间 | 交叉销售、升级引导 |
| P20-50 | 低价值 | 低频、低客单 | 自动化促活、套餐营销 |
| P0-20 | 负价值 | 高退款、高客服成本 | 控制成本，必要时限制服务 |

```sql
-- 预测 LTV 分层
WITH user_ltv_pred AS (
  SELECT user_id,
    -- 简单预测：过去 3 个月收入 × 4（假设年度化）
    SUM(order_amount) * 4 AS predicted_annual_ltv
  FROM fact_orders
  WHERE order_date >= DATE_SUB(CURRENT_DATE, 90)
  GROUP BY user_id
)
SELECT user_id, predicted_annual_ltv,
  NTILE(5) OVER (ORDER BY predicted_annual_ltv DESC) AS ltv_quintile
FROM user_ltv_pred;
```

## LTV 分析的常见误区

| 误区 | 正确做法 |
|------|---------|
| LTV 不含成本 | 应使用 **净 LTV**（收入 - 履约成本 - 退款 - 客服成本） |
| 用全体用户平均 LTV | 应按获客渠道、用户分层分别计算 |
| 假设 LTV 曲线不变 | 产品功能迭代、市场环境变化会导致 LTV 漂移，需滚动更新 |
| 忽略折现 | 高折现率环境下，远期收入权重应降低 |
| CAC 包含品牌投放 | CAC 应按可归因渠道计算，品牌曝光成本单独核算 |

## 相关文章

- [同期群分析](/knowledge-map/km-5-analysis-methods/02-cohort) — LTV 计算的数据基础
- [留存分析](/knowledge-map/km-5-analysis-methods/03-retention) — 留存率是 LTV 的核心输入
- [用户分层](/knowledge-map/km-5-analysis-methods/04-user-segmentation) — LTV 驱动的分层运营
- [归因分析](/knowledge-map/km-5-analysis-methods/05-attribution) — 渠道级的 LTV / CAC 归因
