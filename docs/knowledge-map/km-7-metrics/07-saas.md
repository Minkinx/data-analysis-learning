# SaaS 行业指标体系（SaaS Metrics）

> SaaS 业务的指标体系围绕**经常性收入**展开，强调"订阅"而非"一次性交易"的商业模式。复购和续费比新购更重要——SaaS 增长的飞轮是：客户成功 → 复购/扩展 → NRR > 100% → 可预测增长 → 获客投资再放大。

## MRR / ARR

### 核心订阅收入指标

| 指标 | 全称 | 定义 |
|------|------|------|
| MRR | Monthly Recurring Revenue | 月经常性收入，按月订阅产生的收入总额 |
| ARR | Annual Recurring Revenue | 年经常性收入 = MRR × 12 |
| New MRR | 新客 MRR | 当月新客户贡献的 MRR |
| Expansion MRR | 扩展 MRR | 存量客户升级/加购带来的增量 MRR |
| Churned MRR | 流失 MRR | 当月流失客户损失的 MRR |
| Contraction MRR | 收缩 MRR | 存量客户降级减少的 MRR |
| Net New MRR | 净新增 MRR | New + Expansion - Churned - Contraction |

```sql
-- MRR 月度变动拆解
SELECT
  report_month,
  SUM(CASE WHEN mrr_type = 'new'         THEN mrr_amount ELSE 0 END) AS new_mrr,
  SUM(CASE WHEN mrr_type = 'expansion'   THEN mrr_amount ELSE 0 END) AS expansion_mrr,
  SUM(CASE WHEN mrr_type = 'churned'     THEN mrr_amount ELSE 0 END) AS churned_mrr,
  SUM(CASE WHEN mrr_type = 'contraction' THEN mrr_amount ELSE 0 END) AS contraction_mrr,
  SUM(CASE WHEN mrr_type = 'new' OR mrr_type = 'expansion'
    THEN mrr_amount ELSE 0 END) -
  SUM(CASE WHEN mrr_type = 'churned' OR mrr_type = 'contraction'
    THEN mrr_amount ELSE 0 END) AS net_new_mrr
FROM fact_mrr_monthly
GROUP BY report_month
ORDER BY report_month;
```

::: tip MRR 的"经常性"界定
不要把一次性收入算进 MRR。只有客户预期会持续支付的订阅费用才算 MRR——实施费、一次性培训费等应在收入中单独记录，否则 MRR 会被"虚高"。
:::

## NRR vs GRR

NRR（Net Revenue Retention）和 GRR（Gross Revenue Retention）是 SaaS 最关键的效率指标。

### 定义

- **GRR（Gross Revenue Retention）**：仅考虑流失，不考虑扩展/升级。反映客户粘性的最严格指标。
  ```
  GRR = (期初 MRR - Churned MRR - Contraction MRR) / 期初 MRR
  ```

- **NRR（Net Revenue Retention）**：同时考虑流失和扩展，反映存量客户的收入变化方向。
  ```
  NRR = (期初 MRR - Churned MRR - Contraction MRR + Expansion MRR) / 期初 MRR
  ```

### 解读

| NRR | 含义 | 业务含义 |
|-----|------|---------|
| > 120% | 极好 | 存量客户在高速扩展，净增长主要由老客户驱动 |
| 100-120% | 健康 | 扩展收入覆盖流失，存量客户净增长 |
| 90-100% | 需关注 | 流失略大于扩展，需要改善客户成功 |
| < 90% | 危险 | 老客户持续萎缩，靠新客填坑不可持续 |

```python
# NRR / GRR 计算示例
metrics = {
    "starting_mrr": 1_000_000,
    "new_mrr": 200_000,
    "expansion_mrr": 80_000,
    "churned_mrr": 40_000,
    "contraction_mrr": 20_000,
}

ending_mrr_before_new = (metrics["starting_mrr"]
    - metrics["churned_mrr"]
    - metrics["contraction_mrr"]
    + metrics["expansion_mrr"])

grr = ending_mrr_before_new / metrics["starting_mrr"]
# GRR = (1,000,000 - 40,000 - 20,000) / 1,000,000 = 0.94

nrr = (metrics["starting_mrr"]
    - metrics["churned_mrr"]
    - metrics["contraction_mrr"]
    + metrics["expansion_mrr"]) / metrics["starting_mrr"]
# NRR = (1,000,000 - 40,000 - 20,000 + 80,000) / 1,000,000 = 1.02

print(f"GRR: {grr:.1%}, NRR: {nrr:.1%}")
```

::: warning GRR 的行业参考
ToB 企业级 SaaS 的 GRR 通常在 90-95%，中小客户为主的 SaaS 可能在 80-90%。GRR < 80% 说明产品可能存在根本性问题（价值不够、交付失败或竞争失利）。
:::

## 用户健康度与产品采纳

### 客户健康评分（Health Score）

基于多维度打分来预测客户续约风险：

```python
def customer_health_score(usage_data):
    """
    综合产品使用数据评估客户健康度
    """
    scores = {
        "adoption": min(usage_data["active_users"] / usage_data["licensed_seats"], 1.0) * 40,
        "engagement": min(usage_data["weekly_active_days"] / 7, 1.0) * 25,
        "feature_depth": min(usage_data["core_features_used"] / usage_data["total_core_features"], 1.0) * 20,
        "support_tickets": max(0, 15 - usage_data["recent_open_tickets"]) if usage_data["recent_open_tickets"] < 5 else 5,
    }
    total = sum(scores.values())
    if total >= 85:
        return "healthy"
    elif total >= 60:
        return "attention"
    else:
        return "at_risk"
```

### 产品采纳指标

| 指标 | 定义 | 健康值 |
|------|------|--------|
| 激活率（Activation） | 达到"aha moment"的新用户占比 | > 60% |
| 核心功能采用率 | 使用核心功能 1+ 次的客户占比 | > 80% |
| 用户渗透率 | 实际活跃用户 / 付费席位 | > 60% |
| 功能功能使用广度 | 客户使用的功能模块数 / 总功能数 | > 50% |
| 月活跃率 | 月活跃用户 / 总付费用户 | > 80% |

```sql
-- 功能使用广度分析
WITH feature_usage AS (
  SELECT
    customer_id,
    COUNT(DISTINCT feature_name) AS features_used,
    (SELECT COUNT(DISTINCT feature_name) FROM dim_features
     WHERE is_core = 1) AS total_core_features
  FROM fact_feature_usage
  WHERE date_key BETWEEN 20260401 AND 20260430
  GROUP BY customer_id
)
SELECT
  CASE
    WHEN features_used * 1.0 / total_core_features >= 0.8 THEN '高深度 (>=80%)'
    WHEN features_used * 1.0 / total_core_features >= 0.5 THEN '中等 (50-80%)'
    ELSE '低深度 (<50%)'
  END AS adoption_level,
  COUNT(DISTINCT customer_id) AS customers,
  ROUND(AVG(features_used), 1) AS avg_features_used
FROM feature_usage
GROUP BY adoption_level
ORDER BY adoption_level;
```

## NPS 与客户满意度

| 指标 | 定义 | 跟踪方式 |
|------|------|---------|
| NPS | 净推荐值（推荐者% - 贬损者%） | 季度发送 NPS 调查 |
| CSAT | 客户满意度评分（1-5） | 每次客服交互后 |
| CES | 客户费力度评分 | 关键操作后即时触达 |
| Churn Survey | 流失原因调研 | 取消订阅时触发 |

```
NPS 分组（0-10 打分）：
- 推荐者 (9-10): 忠诚客户，应培养成案例/推荐人
- 被动者 (7-8): 满意但不狂热，最容易流向竞品
- 贬损者 (0-6): 不满且可能负面传播，需重点跟进

行业参考：B2B SaaS NPS 中位数约 30-40，头部 > 60
```

## Time-to-Value 与功能采用

**Time-to-Value（TTV）** 是 SaaS 客户成功的关键指标——用户从开始使用到第一次获得核心价值的时间。

| TTV | 含义 | 优化手段 |
|-----|------|---------|
| < 1 天 | 极佳 | 自助 onboarding + 模板 |
| 1-7 天 | 良好 | 引导式教程 + 客户成功跟进 |
| 7-30 天 | 需改善 | 缩短 onboarding 流程 |
| > 30 天 | 危险 | 客户可能放弃 |

::: info 功能采用曲线
典型的 SaaS 功能采用呈**幂律分布**：20% 的功能被 80% 的用户使用，剩余 80% 的功能使用率极低。分析功能采用曲线的目的是识别"高价值但低采用"的功能，针对性地推动用户教育和引导。
:::

## 相关文章

- [电商行业指标体系](/knowledge-map/km-7-metrics/04-ecommerce) — 电商 GMV 与转化分析
- [金融行业指标体系](/knowledge-map/km-7-metrics/05-finance) — 金融产品的资产与风控指标
- [内容行业指标体系](/knowledge-map/km-7-metrics/06-content) — 内容平台的 DAU 与消费深度
