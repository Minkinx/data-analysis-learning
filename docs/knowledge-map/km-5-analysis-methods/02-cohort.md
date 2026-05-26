# 同期群分析（Cohort Analysis）

> 同期群分析将用户按首次行为时间或其他共同特征分组，追踪各组在后续周期中的表现差异。它是衡量用户质量变化和产品迭代效果的核心方法。

## 同期群的定义方式

### 按获取时间（Time-based Cohorts）

最常见的方式：按用户首次访问或注册的周/月分组。

```sql
-- 注册月同期群（Retention Cohort 第一步）
WITH first_activity AS (
  SELECT user_id,
         DATE_TRUNC('month', MIN(event_time)) AS cohort_month
  FROM fact_events
  GROUP BY user_id
)
SELECT cohort_month, COUNT(DISTINCT user_id) AS cohort_size
FROM first_activity
GROUP BY cohort_month
ORDER BY cohort_month;
```

### 按行为特征（Behavior-based Cohorts）

例如按首单金额分档、按首次使用功能分组：

```sql
-- 按首单金额分档的同期群
SELECT
  CASE
    WHEN first_order_amount < 100   THEN '低客单'
    WHEN first_order_amount < 500   THEN '中客单'
    ELSE '高客单'
  END AS cohort_segment,
  COUNT(DISTINCT user_id) AS cohort_size
FROM (
  SELECT user_id, MIN(order_amount) AS first_order_amount
  FROM fact_orders
  GROUP BY user_id
) t GROUP BY cohort_segment;
```

## 同期群类型

### 留存同期群（Retention Cohort）

最经典的类型。观察各月注册用户在后续各月的回访比例：

| 注册月 | 用户数 | M+1 | M+2 | M+3 | M+4 | M+5 |
|--------|--------|-----|-----|-----|-----|-----|
| 2026-01 | 10,000 | 45% | 32% | 28% | 25% | 23% |
| 2026-02 | 9,500 | 44% | 31% | 27% | 24% | — |
| 2026-03 | 11,200 | 47% | 34% | 30% | —   | — |
| 2026-04 | 10,800 | 46% | 33% | —   | —   | — |

**解读要点**：

- **横向看**：同一批用户的留存衰减趋势是否健康（曲线是否快速收敛）
- **纵向看**：不同月份注册的用户质量是否在改善（M+1 留存是否上升）
- **异常信号**：某月新客的首月留存显著低于其他月份，可能是渠道质量或产品体验有变化

### 收入同期群（Revenue Cohort）

观察各群组在生命周期内的累计收入贡献：

```sql
SELECT
  cohort_month,
  period_index,  -- 注册后第 N 个月
  SUM(revenue) AS period_revenue,
  SUM(SUM(revenue)) OVER (
    PARTITION BY cohort_month
    ORDER BY period_index
  ) AS cumulative_revenue
FROM cohort_revenue_table
GROUP BY cohort_month, period_index;
```

### 活跃度同期群（Engagement Cohort）

按"活跃天数"或"事件数"进行分组，比较不同活跃度的用户在后续周期中的表现：

| 首月活跃天数分组 | 用户数 | M+1 留存 | M+3 留存 | 人均收入 |
|----------------|--------|---------|---------|---------|
| 1-3 天 | 20,000 | 18% | 8% | ¥12 |
| 4-7 天 | 8,000 | 42% | 24% | ¥45 |
| 8-14 天 | 3,500 | 68% | 52% | ¥120 |
| 15+ 天 | 1,200 | 85% | 73% | ¥280 |

## 同期群矩阵可视化

矩阵是最常见的同期群可视化形式。行 = 同期群，列 = 周期，单元格 = 指标值：

```
        M+0   M+1   M+2   M+3   M+4   M+5
2025-12  100%  48%   35%   29%   26%   24%
2026-01  100%  45%   32%   28%   25%   23%
2026-02  100%  44%   31%   27%   24%   —
2026-03  100%  47%   34%   30%   —     —
2026-04  100%  46%   33%   —     —     —
2026-05  100%  48%   —     —     —     —
```

::: tip 矩阵阅读技巧
1. 看对角线——同一家龄下最新群组是否优于历史群组
2. 看首列——新客规模是否稳定增长
3. 看尾部——留存是否在某个月份迅速收敛到稳态
4. 看异常列——是否存在全群组统一的留存陡降（可能是产品事故或市场事件）
:::

## 同期群分析的局限

| 局限 | 说明 | 缓解方案 |
|------|------|---------|
| 滞后性 | 需要积累多期数据才能看出趋势 | 配合预测模型（如 BG/NBD）提前预判 |
| 基数衰减 | 老群组存活用户数少，统计不稳定 | 设置最小样本阈值，标注样本量 |
| 比较偏差 | 不同时期的产品功能、市场环境不同 | 配合对照组实验解读 |
| 粒度选择 | 周粒度 vs 月粒度趋势不同 | 根据业务节奏选择，保持一致 |

```python
import pandas as pd
import matplotlib.pyplot as plt

# 同期群矩阵热力图示例
cohort_data = {
    'cohort':  ['2025-12', '2026-01', '2026-02', '2026-03'],
    'M+0':     [1.00, 1.00, 1.00, 1.00],
    'M+1':     [0.48, 0.45, 0.44, 0.47],
    'M+2':     [0.35, 0.32, 0.31, 0.34],
    'M+3':     [0.29, 0.28, 0.27, 0.30],
}
df = pd.DataFrame(cohort_data).set_index('cohort')

plt.figure(figsize=(8, 4))
plt.imshow(df.values, cmap='Blues', aspect='auto', vmin=0, vmax=1)
plt.colorbar(label='Retention Rate')
plt.yticks(range(len(df)), df.index)
plt.xticks(range(len(df.columns)), df.columns)
plt.title('Monthly Retention Cohort Matrix')
plt.show()
```

## 相关文章

- [留存分析](/knowledge-map/km-5-analysis-methods/03-retention) — 留存指标的定义与计算方法
- [用户分层](/knowledge-map/km-5-analysis-methods/04-user-segmentation) — 基于同期群的分层策略
- [LTV 分析](/knowledge-map/km-5-analysis-methods/07-ltv) — 同期群累计收入与生命周期价值
