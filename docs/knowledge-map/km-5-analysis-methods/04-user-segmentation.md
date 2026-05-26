# 用户分层（User Segmentation）

> 用户分层是将用户按价值、行为或属性划分为不同群组的过程，是精细化运营的数据基础。好的分层方案应该 互斥、穷尽、可操作。

## RFM 模型

RFM 是用户价值分层最经典的框架，基于三个维度：

| 维度 | 含义 | 业务含义 |
|------|------|---------|
| **Recency（R）** | 最近一次购买距今天数 | 用户是否"活跃" |
| **Frequency（F）** | 一定周期内的购买频次 | 用户是否"忠诚" |
| **Monetary（M）** | 一定周期内的消费金额 | 用户是否"高价值" |

### RFM 评分计算

```sql
-- RFM 评分（5 分制等宽分箱）
WITH rfm_raw AS (
  SELECT user_id,
    DATEDIFF(CURRENT_DATE, MAX(order_date)) AS recency,
    COUNT(DISTINCT order_id) AS frequency,
    SUM(order_amount) AS monetary
  FROM fact_orders
  WHERE order_date >= DATE_SUB(CURRENT_DATE, 365)
  GROUP BY user_id
),
rfm_score AS (
  SELECT user_id,
    NTILE(5) OVER (ORDER BY recency ASC)  AS r_score,  -- 小 → 大分
    NTILE(5) OVER (ORDER BY frequency DESC) AS f_score, -- 大 → 大分
    NTILE(5) OVER (ORDER BY monetary DESC)  AS m_score  -- 大 → 大分
  FROM rfm_raw
)
SELECT *,
  CONCAT(r_score, f_score, m_score) AS rfm_cell,
  (r_score + f_score + m_score) AS rfm_total
FROM rfm_score;
```

### 分层映射

RFM 总分 3-15 分，映射到运营标签：

| 总分区间 | 标签 | 运营策略 |
|---------|------|---------|
| 13-15 | **重要价值用户** | VIP 维护、专属服务 |
| 10-12 | **重要发展用户** | 提升频次、交叉销售 |
| 7-9 | **一般价值用户** | 促销唤醒、批量触达 |
| 4-6 | **一般发展用户** | 自动化挽回 |
| 3 | **流失用户** | 暂不投入 |

::: tip 分箱方法的取舍
NTILE 等宽分箱简单但可能切断自然聚类。实践中结合业务判断设定阈值（如 R ≤ 7 天为活跃，F ≥ 5 次为高频，M ≥ 1000 为高客单）。
:::

## 基于聚类的分层（K-Means）

RFM 是规则驱动，聚类分析是数据驱动。K-Means 将行为相似的用户自动归入同一簇。

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd

# 准备特征
features = pd.read_sql("""
  SELECT user_id,
         DATEDIQ(CURRENT_DATE, MAX(order_date)) AS recency,
         COUNT(DISTINCT order_id) AS frequency,
         SUM(order_amount) AS monetary,
         AVG(order_amount) AS avg_order_value
  FROM fact_orders
  GROUP BY user_id
""", conn)

# 标准化
scaler = StandardScaler()
X = scaler.fit_transform(features[['recency', 'frequency',
                                    'monetary', 'avg_order_value']])

# 聚类（k=4）
kmeans = KMeans(n_clusters=4, random_state=42, n_init='auto')
features['cluster'] = kmeans.fit_predict(X)

# 解读各簇特征
features.groupby('cluster').agg({
    'recency': 'mean',
    'frequency': 'mean',
    'monetary': 'mean',
    'avg_order_value': 'mean',
    'user_id': 'count'
})
```

### 簇的解读

| 簇 | Recency | Frequency | Monetary | 命名 | 占比 |
|----|---------|-----------|----------|------|------|
| 0 | 高 | 低 | 低 | 流失用户 | 45% |
| 1 | 低 | 高 | 高 | 核心用户 | 15% |
| 2 | 低 | 中 | 中 | 活跃用户 | 25% |
| 3 | 中 | 低 | 中 | 潜力用户 | 15% |

::: warning K-Means 的注意事项
- K 值需通过肘部法则（Elbow Method）或轮廓系数（Silhouette Score）选择
- 对异常值敏感，聚类前做截尾处理
- 每次运行结果可能不同，设置 random_state 保证可复现
- 非球形分布的数据考虑 DBSCAN 或高斯混合模型
:::

## 分层策略映射

分层的最终目的是差异化运营策略：

| 分层 | 目标 | 策略 |
|------|------|------|
| 核心用户 | 保持忠诚，提升 LTV | 会员等级、专属优惠、新品优先体验 |
| 活跃用户 | 提升频次 | 满减券、会员积分、交叉推荐 |
| 潜力用户 | 激活复购 | 限时折扣、新人专享、精准推送 |
| 流失用户 | 低成本唤醒 | 大额优惠券、短信召回、社交媒体再营销 |
| 沉默用户 | 不投入 | 自然流失，不再主动触达 |

## 动态 vs 静态分层

### 静态分层

用户被分入一个固定层，不随行为变化而改变：

- **特点**：稳定、易理解、运营执行简单
- **适合**：基于用户注册信息的初始分层（渠道、地域、设备）
- **问题**：无法反映用户行为变化

### 动态分层

用户分层随时间滚动更新：

```sql
-- 每月滚动 RFM 分层
WITH monthly_rfm AS (
  SELECT
    DATE_TRUNC('month', CURRENT_DATE) AS eval_month,
    user_id,
    NTILE(5) OVER (ORDER BY DATEDIFF(CURRENT_DATE, MAX(order_date)) ASC) AS r,
    NTILE(5) OVER (ORDER BY COUNT(DISTINCT order_id) DESC) AS f,
    NTILE(5) OVER (ORDER BY SUM(order_amount) DESC) AS m
  FROM fact_orders
  WHERE order_date >= DATE_SUB(CURRENT_DATE, 365)
  GROUP BY user_id
)
SELECT eval_month, user_id,
  CASE WHEN r + f + m >= 13 THEN '核心用户'
       WHEN r + f + m >= 10 THEN '活跃用户'
       WHEN r + f + m >= 7  THEN '潜力用户'
       ELSE '流失用户'
  END AS segment
FROM monthly_rfm;
```

**适合场景**：
- 电商月度运营人群圈选
- 内容平台作者激励等级划分
- SaaS 客户健康度评分

**系统设计难点**：
- 分层结果的存储与更新（拉链表、物化视图）
- 一致性：同一个月内不同时间计算需稳定
- 反馈闭环：分层效果需和业务指标关联验证

## 相关文章

- [归因分析](/knowledge-map/km-5-analysis-methods/05-attribution) — 按分层评估渠道贡献
- [LTV 分析](/knowledge-map/km-5-analysis-methods/07-ltv) — 各分层用户的生命周期价值
- [同期群分析](/knowledge-map/km-5-analysis-methods/02-cohort) — 结合分层的同期群洞察
