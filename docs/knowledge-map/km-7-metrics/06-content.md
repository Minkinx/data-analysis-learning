# 内容行业指标体系（Content Platform Metrics）

> 内容平台的商业模式核心在于"让用户花更多时间消费内容"，广告收入、订阅收入和打赏收入都建立在用户注意力基础上。DAU/MAU 是顶层指标，但真正驱动增长的是内容生态的供需匹配质量。

## DAU / MAU 与用户规模

### 用户规模的经典口径

| 指标 | 定义 | 备注 |
|------|------|------|
| DAU | 日活跃用户数 | 当日启动 app 且有一定时长的去重用户 |
| MAU | 月活跃用户数 | 当月活跃过的去重用户 |
| DAU / MAU | 用户粘性比率 | 0.2-0.5 为常见范围，越高越健康 |
| 周均使用天数 | 用户平均每周使用 app 的天数 | 反映使用习惯养成程度 |
| 月新增用户 | 当月首次激活的用户数 | 增长健康度信号 |

```sql
-- DAU / MAU 粘性计算
WITH dau AS (
  SELECT date_key, COUNT(DISTINCT user_id) AS dau_cnt
  FROM fact_user_activity
  WHERE date_key BETWEEN 20260401 AND 20260430
  GROUP BY date_key
)
SELECT
  AVG(dau_cnt) AS avg_dau,
  (SELECT COUNT(DISTINCT user_id) FROM fact_user_activity
   WHERE date_key BETWEEN 20260401 AND 20260430) AS mau,
  AVG(dau_cnt) * 1.0 /
    (SELECT COUNT(DISTINCT user_id) FROM fact_user_activity
     WHERE date_key BETWEEN 20260401 AND 20260430) AS dau_mau_ratio
FROM dau;
```

::: tip DAU 的质量比数量重要
即使 DAU 增长，如果增长集中在"低时长、低互动"用户群，广告变现效率反而可能下降。建议同时关注**有效 DAU**（时长 ≥ 3 分钟）或**核心 DAU**（完成关键行为的用户）。
:::

## 内容消费深度

### 时长与消费频次

| 指标 | 定义 | 行业参考 |
|------|------|---------|
| 人均使用时长 | 总时长 / DAU | 短视频 80-120 分钟，中视频 40-60 分钟 |
| 人均启动次数 | 日启动次数 / DAU | > 5 次为高频 |
| 人均内容消费数 | 日消费内容条数 / DAU | 短视频 100-200 条，图文 20-50 篇 |
| 会话时长 | 单次打开的平均时长 | > 10 分钟为沉浸 |

### 内容完播/完读率

```
视频完播率 = 观看完成 ≥ 90% 的次数 / 总播放次数
文章完读率 = 阅读至底部的人数 / 文章打开人数
```

不同内容类型的完播率差异很大：

| 内容类型 | 完播/完读率参考 | 优化方向 |
|---------|---------------|---------|
| 15-30s 短视频 | 40-60% | 开头 3s 吸引、节奏紧凑 |
| 3-10min 中视频 | 20-35% | 分段结构、悬念设置 |
| 图文文章 | 30-50% | 小标题分段、图文交替 |
| 音频播客 | 40-70% | 内容深度、开车/睡前场景 |

```sql
-- 视频完播率分析（按时长区间）
SELECT
  CASE
    WHEN video_duration_sec <= 15 THEN '0-15s'
    WHEN video_duration_sec <= 30 THEN '15-30s'
    WHEN video_duration_sec <= 60 THEN '30-60s'
    ELSE '60s+'
  END AS duration_bucket,
  COUNT(*) AS total_plays,
  SUM(CASE WHEN play_progress >= 0.9 THEN 1 ELSE 0 END) AS full_plays,
  SUM(CASE WHEN play_progress >= 0.9 THEN 1 ELSE 0 END) * 1.0 / COUNT(*) AS completion_rate,
  AVG(play_duration_sec) / NULLIF(AVG(video_duration_sec), 0) AS avg_completion_rate
FROM fact_video_play
WHERE date_key BETWEEN 20260401 AND 20260430
GROUP BY duration_bucket
ORDER BY duration_bucket;
```

## 内容生态指标

内容平台是典型的**双边市场**——内容创作者（供给侧）和消费者（需求侧）相互促进。

### 供给侧指标（创作者）

| 指标 | 定义 |
|------|------|
| 月活跃创作者数 | 当月发布 ≥ 1 条内容的创作者数 |
| 人均创作量 | 总发布内容数 / 活跃创作者数 |
| 创作者留存率 | 上月活跃创作者中本月继续创作的比例 |
| 头部内容占比 | Top 1% 内容的消费量占总消费量比例 |
| 创作者收入 | 创作者月均通过平台获得的收入 |

### 供需匹配指标

| 指标 | 定义 | 健康度 |
|------|------|--------|
| 消费生产比 | 总消费量 / 总生产量 | > 1000x 说明内容"供不应求" |
| 内容发现效率 | 推荐流消费占比 | > 60% 说明推荐系统有效 |
| 新内容曝光率 | 发布时间 1h 内获得曝光的内容比例 | > 30% 说明冷启动通畅 |
| 内容利用率 | 被消费的内容数 / 总内容数 | > 80% 避免内容沉积 |

### 内容质量指标

```python
# 内容质量评分示意
def content_quality_score(content_metrics):
    """
    综合评分 = 消费深度 + 互动质量 + 创作成本
    """
    consumption = 0.4 * content_metrics["completion_rate"] + 0.3 * content_metrics["avg_duration"]
    interaction = 0.4 * content_metrics["like_rate"] + 0.3 * content_metrics["share_rate"] \
                + 0.2 * content_metrics["comment_rate"] + 0.1 * content_metrics["collect_rate"]
    efficiency = content_metrics["total_views"] / max(content_metrics["creation_cost"], 1)
    return 0.5 * consumption + 0.3 * interaction + 0.2 * min(efficiency / 1000, 1.0)
```

::: warning 内容质量 vs 数量陷阱
很多内容平台在早期追求数量（DAU、内容数），但忽略了质量。低质量内容可能在短期内提升时长，但长期会导致用户疲劳和创作者流失。建议设置**质量门槛指标**作为增长的上限约束。
:::

## 变现效率

### ARPU / ARPPU

| 指标 | 计算 | 含义 |
|------|------|------|
| ARPU | 总收入 / MAU | 每个活跃用户贡献的收入 |
| ARPPU | 总收入 / 付费用户数 | 每个付费用户贡献的收入 |
| 付费渗透率 | 付费用户数 / MAU | 付费用户占比（广告变现平台低，订阅平台高） |

### 广告收入模型

```
广告收入 = DAU × 人均展示次数 × 千次展示收入（eCPM）

其中 eCPM = 广告点击率（CTR）× 每次点击费用（CPC）× 1000
```

```sql
-- 广告收入日级别拆解
SELECT
  date_key,
  COUNT(DISTINCT user_id)                            AS dau,
  SUM(ad_impressions)                                AS total_impressions,
  SUM(ad_impressions) * 1.0 / COUNT(DISTINCT user_id) AS impressions_per_user,
  SUM(ad_revenue)                                    AS ad_revenue,
  SUM(ad_revenue) * 1000 / NULLIF(SUM(ad_impressions), 0) AS ecpm,
  SUM(ad_revenue) / NULLIF(COUNT(DISTINCT user_id), 0)    AS arpu
FROM fact_ad_daily
WHERE date_key BETWEEN 20260401 AND 20260430
GROUP BY date_key;
```

| 广告形式 | eCPM 参考（中国） | 用户体验影响 |
|---------|-----------------|------------|
| 开屏广告 | ¥50-150 | 影响启动体验 |
| 信息流广告 | ¥15-50 | 影响内容消费连续性 |
| 贴片广告 | ¥10-30 | 影响完播率 |
| 激励视频 | ¥30-100 | 用户主动选择，体验较优 |

## 相关文章

- [电商行业指标体系](/knowledge-map/km-7-metrics/04-ecommerce) — 电商 GMV 与转化分析
- [金融行业指标体系](/knowledge-map/km-7-metrics/05-finance) — 金融产品的资产与风控指标
- [SaaS 行业指标体系](/knowledge-map/km-7-metrics/07-saas) — 订阅收入与客户健康度
