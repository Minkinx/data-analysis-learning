# 金融行业指标体系（Finance Metrics）

> 金融产品的指标体系以"资产规模"和"风险控制"为双核心。相比电商关注 GMV 和转化，金融产品更关注资金质量、风险暴露和用户生命周期价值。监管合规性（流动性、资本充足率）也是指标设计的重要约束。

## 资产规模与增长

| 指标 | 定义 | 关注点 |
|------|------|--------|
| 在贷余额 | 截至某日所有未结清贷款的本金总额 | 规模天花板与增速 |
| 月放款额 | 当月新发放贷款总额 | 业务活跃度 |
| 累计放款额 | 从首日到现在的累计贷款总额 | 业务体量 |
| 户均余额 | 在贷余额 / 在贷用户数 | 用户价值分层 |
| 资产增速 | (当期余额 - 上期余额) / 上期余额 | 扩张节奏 |

```sql
-- 在贷余额日级别快照
SELECT
  report_date,
  COUNT(DISTINCT user_id)        AS borrower_cnt,
  SUM(principal_balance)         AS total_balance,
  SUM(principal_balance) / NULLIF(COUNT(DISTINCT user_id), 0) AS avg_balance,
  -- 按账龄分段
  SUM(CASE WHEN loan_age_days <= 30  THEN principal_balance ELSE 0 END) AS balance_0_30d,
  SUM(CASE WHEN loan_age_days  > 30 AND loan_age_days <= 90
    THEN principal_balance ELSE 0 END) AS balance_31_90d,
  SUM(CASE WHEN loan_age_days  > 90 THEN principal_balance ELSE 0 END) AS balance_90d_plus
FROM fact_loan_snapshot
WHERE report_date = '2026-05-26';
```

## 逾期与风险指标

### 关键风险指标

| 指标 | 全称 | 定义 |
|------|------|------|
| FPD | First Payment Default | 首期还款即违约（逾期 ≥ 30 天）的比例 |
| M1 | Month 1 | 逾期 1-29 天 |
| M2 | Month 2 | 逾期 30-59 天 |
| M3+ | Month 3+ | 逾期 ≥ 90 天 |
| 不良率 | NPL Ratio | M3+ 余额 / 总在贷余额 |
| 入催率 | Flow-in Rate | 新增逾期用户数 / 应还款用户数 |
| 回收率 | Recovery Rate | 逾期回收金额 / 逾期总金额 |

### Vintage 分析

Vintage 分析是金融风控的核心工具：将每月放款的资产包按放款月份（vintage）分组，追踪各组在不同账龄下的逾期表现。

```sql
-- Vintage 逾期率表
SELECT
  DATE_TRUNC(loan_date, MONTH) AS vintage_month,
  loan_age_month,
  COUNT(DISTINCT loan_id) AS total_loans,
  SUM(CASE WHEN max_overdue_days >= 30 THEN 1 ELSE 0 END) AS m1_loans,
  SUM(CASE WHEN max_overdue_days >= 30 THEN 1 ELSE 0 END) * 1.0
    / NULLIF(COUNT(DISTINCT loan_id), 0) AS m1_rate
FROM fact_loan_performance
GROUP BY vintage_month, loan_age_month
ORDER BY vintage_month, loan_age_month;
```

| Vintage | M 1 | M 2 | M 3 | M 4 | M 5 | M 6 |
|---------|-----|-----|-----|-----|-----|-----|
| 2025-10 | 2.1% | 3.5% | 4.2% | 4.8% | 5.1% | 5.3% |
| 2025-11 | 1.9% | 3.2% | 4.0% | 4.5% | 4.9% | — |
| 2025-12 | 2.3% | 3.8% | 4.5% | 5.0% | — | — |
| 2026-01 | 2.5% | 4.1% | 4.9% | — | — | — |

::: warning Vintage 观察期
M3+ 风险需要至少 6 个月的账龄才能稳定，"年轻"的 Vintage（如 < 3 个月）的 M3+ 率尚无参考价值。对比不同 Vintage 时应在同一账龄下比较。
:::

## 用户生命周期

金融用户的典型生命周期分阶段：

```
获客 → 注册/授信 → 首贷激活 → 复贷 → 流失/注销
```

### 各阶段关键指标

| 阶段 | 指标 | 计算方式 |
|------|------|---------|
| 获客 | 授信转化率 | 完成授信用户 / 注册用户 |
| | CAC | 市场费用 / 新授信用户数 |
| 首贷 | 首贷激活率 | 首笔放款用户 / 授信用户 |
| | 首贷余额 | 首贷平均放款金额 |
| 复贷 | 复贷率（N 月） | N 月内再次借款用户 / 有过借款用户 |
| | 复贷间隔 | 上次结清到下次借款的天数 |
| 留存 | 借款频次 | 年均借款次数 |
| 流失 | 流失率 | 连续 N 月未借款用户 / 活跃借款用户 |

```sql
-- 用户关键行为里程碑分析
WITH user_milestones AS (
  SELECT
    user_id,
    MIN(register_date)   AS register_date,
    MIN(credit_date)     AS credit_date,
    MIN(first_loan_date) AS first_loan_date,
    MAX(loan_date)       AS last_loan_date,
    COUNT(DISTINCT loan_id) AS total_loans
  FROM dim_user u
  LEFT JOIN fact_loan l USING(user_id)
  GROUP BY user_id
)
SELECT
  DATE_TRUNC(register_date, MONTH) AS register_month,
  COUNT(DISTINCT user_id) AS registered_users,
  COUNT(DISTINCT CASE WHEN credit_date IS NOT NULL THEN user_id END) AS credited,
  COUNT(DISTINCT CASE WHEN first_loan_date IS NOT NULL THEN user_id END) AS activated,
  COUNT(DISTINCT CASE WHEN credit_date IS NOT NULL THEN user_id END) * 1.0
    / NULLIF(COUNT(DISTINCT user_id), 0) AS credit_rate,
  COUNT(DISTINCT CASE WHEN first_loan_date IS NOT NULL THEN user_id END) * 1.0
    / NULLIF(COUNT(DISTINCT CASE WHEN credit_date IS NOT NULL THEN user_id END), 0) AS activation_rate
FROM user_milestones
GROUP BY register_month;
```

## LTV / CAC

金融产品的 LTV 计算区别于电商，需要考虑资金成本、风险损失和运营费用。

```python
# 金融产品 LTV 简化模型
def calc_loan_ltv(user_profile):
    avg_loan_amount = user_profile["avg_loan_amount"]       # 平均单笔借款金额
    avg_tenure_months = user_profile["avg_tenure_months"]   # 平均借款期限
    interest_rate = user_profile["interest_rate"]           # 年化利率
    expected_loans = user_profile["expected_lifetime_loans"] # 生命周期内预期借款次数
    default_rate = user_profile["expected_default_rate"]    # 预期违约率
    funding_cost = user_profile["funding_cost_rate"]         # 资金成本率

    gross_profit_per_loan = avg_loan_amount * interest_rate / 12 * avg_tenure_months
    risk_cost_per_loan = avg_loan_amount * default_rate
    funding_cost_per_loan = avg_loan_amount * funding_cost_rate / 12 * avg_tenure_months

    ltv = (gross_profit_per_loan - risk_cost_per_loan - funding_cost_per_loan) * expected_loans
    return ltv
```

| 指标 | 健康参考 |
|------|---------|
| LTV / CAC | > 3x |
| CAC 回收期 | < 12 个月 |
| LTV 中位数 vs 均值 | 均值 > 中位数时存在长尾高价值用户 |

::: tip 金融指标的特殊性
金融指标不仅要看"数量"，更要看"质量"。同样是 100 亿在贷余额，客群 A 的坏账率 1.5% 和客群 B 的 4.5%，后面的利润天差地别。在做资产增长目标时，**必须绑定风险指标作为约束条件**。
:::

## 相关文章

- [电商行业指标体系](/knowledge-map/km-7-metrics/04-ecommerce) — 电商 GMV 与转化分析
- [内容行业指标体系](/knowledge-map/km-7-metrics/06-content) — 内容平台的 DAU 与消费深度
- [SaaS 行业指标体系](/knowledge-map/km-7-metrics/07-saas) — 订阅收入与客户健康度
