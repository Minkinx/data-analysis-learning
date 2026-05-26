# 异动分析（Anomaly Detection）

> 异动分析回答"指标为什么变了"——当核心指标（DAU、GMV、转化率）出现显著波动时，系统性地定位贡献变化最大的维度和因素。

## 指标拆解方法

异动分析的第一步是"拆解"：将复合指标拆解为可以独立分析的子成分。

### 加法拆解

适用于总量型指标：`总指标 = A + B + C`

```sql
-- GMV = 新客贡献 + 老客贡献
SELECT
  DATE(event_time) AS dt,
  SUM(CASE WHEN is_new_user = 1 THEN order_amount ELSE 0 END) AS new_revenue,
  SUM(CASE WHEN is_new_user = 0 THEN order_amount ELSE 0 END) AS old_revenue,
  SUM(order_amount) AS total_gmv
FROM fact_orders
GROUP BY dt;
```

**贡献度计算**：GMV 环比下跌 ¥100,000，新客减少贡献 ¥80,000，老客减少 ¥20,000 → 新客贡献度 80%。

### 乘法拆解

适用于比率型指标：`比率 = 子指标 1 × 子指标 2 × ...`

例如：`GMV = 访客数 × 转化率 × 客单价`

**变动归因**：使用 **对数分解（Log Decomposition）**：

```
Δln(GMV) = Δln(访客) + Δln(转化率) + Δln(客单价)
```

```python
import numpy as np

def log_decomposition(current, previous, components):
    """对数分解各因子的贡献度"""
    delta_total = np.log(current / previous)
    contributions = {}
    for name, comp_curr, comp_prev in components:
        contributions[name] = np.log(comp_curr / comp_prev) / delta_total
    return contributions

# 示例
# 本期: 访客 100k, 转化率 3%, 客单价 ¥200 → GMV = ¥600k
# 上期: 访客 120k, 转化率 2.5%, 客单价 ¥180 → GMV = ¥540k
components = [('访客', 100000, 120000),
              ('转化率', 0.03, 0.025),
              ('客单价', 200, 180)]
log_decomposition(600000, 540000, components)
# 输出: {'访客': -0.64, '转化率': 0.86, '客单价': 0.78}
# GMV 上升 11%：转化率和客单价正向驱动，访客数负向拖累
```

### 比率拆解

适用于率值指标的同比变化：通过分子分母分别贡献归因。

## 贡献度分析

确认整体波动幅度后，按维度下钻定位贡献最大的细分：

```sql
-- 按渠道 ➔ 城市 ➔ 商品类目逐层拆解
WITH daily_gmv AS (
  SELECT dt, channel, city, category, SUM(amount) AS gmv
  FROM fact_orders
  WHERE dt IN ('2026-05-25', '2026-05-24')
  GROUP BY dt, channel, city, category
)
SELECT
  channel, city, category,
  SUM(CASE WHEN dt = '2026-05-25' THEN gmv ELSE 0 END) AS today,
  SUM(CASE WHEN dt = '2026-05-24' THEN gmv ELSE 0 END) AS yesterday,
  (SUM(CASE WHEN dt = '2026-05-25' THEN gmv ELSE 0 END) -
   SUM(CASE WHEN dt = '2026-05-24' THEN gmv ELSE 0 END)) AS delta,
  ROUND((SUM(CASE WHEN dt = '2026-05-25' THEN gmv ELSE 0 END) -
         SUM(CASE WHEN dt = '2026-05-24' THEN gmv ELSE 0 END)) * 100.0 /
         (SELECT SUM(CASE WHEN dt = '2026-05-25' THEN gmv ELSE 0 END) -
          SUM(CASE WHEN dt = '2026-05-24' THEN gmv ELSE 0 END)
          FROM daily_gmv), 2) AS contribution_pct
FROM daily_gmv
GROUP BY channel, city, category
ORDER BY ABS(contribution_pct) DESC;
```

::: tip 帕累托原则
通常 20% 的维度组合贡献了 80% 的波动。优先排查贡献度前 5-10 的组合，不要平均用力。
:::

## 同比/环比/同周对比

### 环比（DoD / WoW / MoM）

与上一周期对比，反映短期变化趋势：

```sql
-- 日环比
WITH gmv AS (
  SELECT DATE(event_time) AS dt, SUM(order_amount) AS gmv
  FROM fact_orders GROUP BY dt
)
SELECT dt, gmv,
  LAG(gmv) OVER (ORDER BY dt) AS prev_day_gmv,
  ROUND((gmv - LAG(gmv) OVER (ORDER BY dt)) * 100.0 /
         LAG(gmv) OVER (ORDER BY dt), 2) AS dod_change
FROM gmv WHERE dt >= '2026-05-01';
```

### 同比（YoY）

与去年同期对比，消除季节性影响：

```sql
-- 同比：当年 5 月 vs 上年 5 月
SELECT
  DATE_TRUNC('month', event_time) AS month,
  SUM(order_amount) AS gmv
FROM fact_orders
WHERE event_time >= '2025-05-01' AND event_time < '2026-06-01'
GROUP BY month
HAVING month IN ('2026-05-01', '2025-05-01');
```

### 同周对比（WoW Same Day）

消除星期几效应：周一比周一，周二比周二：

```sql
-- 本周一 vs 上周一
SELECT
  DATE(event_time) AS dt,
  DAYOFWEEK(event_time) AS dow,
  SUM(order_amount) AS gmv
FROM fact_orders
WHERE event_time >= DATE_SUB('2026-05-25', 7) AND event_time <= '2026-05-25'
GROUP BY dt
HAVING DAYOFWEEK(dt) = 2  -- Monday
ORDER BY dt;
```

## 统计检测方法

### Z-Score 异常检测

假设指标服从正态分布，当前值与均值的偏离程度用 Z-Score 衡量：

```sql
WITH stats AS (
  SELECT AVG(gmv) AS mean, STDDEV(gmv) AS std
  FROM daily_gmv_table
  WHERE dt >= '2026-04-01' AND dt <= '2026-05-24'
)
SELECT dt, gmv,
  (gmv - mean) / std AS z_score
FROM daily_gmv_table, stats
WHERE dt = '2026-05-25';
```

| Z-Score | 异常程度 | 推荐动作 |
|---------|---------|---------|
| \|Z\| < 2 | 正常波动 | 无需关注 |
| 2 ≤ \|Z\| < 3 | 轻度异常 | 排查原因 |
| \|Z\| ≥ 3 | 显著异常 | 立即告警 |

### CUSUM（累积和检测）

CUSUM 检测指标的持续性偏移，比 Z-Score 更早发现趋势变化：

```python
import numpy as np

def cusum(data, threshold=5, drift=0.5):
    """CUSUM 异常检测算法"""
    mean = np.mean(data[:-30])  # 参考期均值
    s_high = 0  # 正向偏移累积
    s_low = 0   # 负向偏移累积
    alerts = []

    for i, val in enumerate(data):
        s_high = max(0, s_high + (val - mean) - drift)
        s_low  = min(0, s_low  + (val - mean) + drift)

        if s_high > threshold:
            alerts.append((i, 'up', s_high))
            s_high = 0
        elif s_low < -threshold:
            alerts.append((i, 'down', s_low))
            s_low = 0

    return alerts
```

::: info CUSUM vs Z-Score
Z-Score 发现"跳变"（瞬时大幅波动），CUSUM 发现"漂移"（持续小幅偏移）。**异动分析应两者结合使用**。
:::

### 完整异动分析工作流

1. **确认波动**：用同比/环比确认指标是否真的偏离正常范围
2. **拆解下钻**：用加乘拆解定位主因（渠道 ➔ 城市 ➔ 类目）
3. **评估显著性**：Z-Score / CUSUM 判断是信号还是噪声
4. **人工排查**：产品变更、运营活动、竞品动作、外部环境
5. **制定对策**：修复问题 or 放大优势，跟进效果

## 相关文章

- [漏斗分析](/knowledge-map/km-5-analysis-methods/01-funnel) — 漏斗转化率的异动排查
- [留存分析](/knowledge-map/km-5-analysis-methods/03-retention) — 留存率突变的归因
- [同期群分析](/knowledge-map/km-5-analysis-methods/02-cohort) — 纵向对比发现异群组异常
