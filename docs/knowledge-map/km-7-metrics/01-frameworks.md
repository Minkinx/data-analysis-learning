# 指标框架与方法（Metric Frameworks & Methodology）

> 指标框架是构建业务指标体系的理论基石。不同的框架从不同视角回答"衡量什么"和"为什么衡量"——AARRR 关注用户生命周期转化，HEART 聚焦产品体验质量，GSM 从目标反向推导度量，而北极星指标指引全团队一致方向。

## AARRR 模型

AARRR（海盗指标）是用户增长分析中最经典的框架，按用户生命周期分为五个阶段：

| 阶段 | 英文 | 典型指标 | 关注问题 |
|------|------|---------|---------|
| 获取 | Acquisition | 新增用户、CAC、渠道来源分布 | 用户从哪里来？ |
| 激活 | Activation | 首次关键行为完成率（如注册、首次下单） | 用户第一次体验是否成功？ |
| 留存 | Retention | Day 1/7/30 留存率、流失率 | 用户是否回来？ |
| 变现 | Revenue | ARPU、ARPPU、LTV、付费转化率 | 用户是否付费？ |
| 传播 | Referral | K 因子、邀请转化率、NPS | 用户是否推荐别人？ |

```sql
-- 计算每日各阶段核心指标
SELECT
  date_key,
  COUNT(DISTINCT user_id)                                       AS dau,
  COUNT(DISTINCT CASE WHEN is_new = 1 THEN user_id END)          AS new_users,           -- Acquisition
  COUNT(DISTINCT CASE WHEN did_activation = 1 THEN user_id END)  AS activated_users,      -- Activation
  COUNT(DISTINCT CASE WHEN is_returning = 1 THEN user_id END)    AS retained_users,       -- Retention
  SUM(revenue)                                                   AS total_revenue,        -- Revenue
  COUNT(DISTINCT CASE WHEN referrer_id IS NOT NULL THEN user_id END) AS referred_users    -- Referral
FROM fact_user_daily
GROUP BY date_key;
```

::: tip AARRR 不是严格顺序的
在内容平台中，用户可能在未"激活"前就已经"变现"（如看到广告后购买），或是先"传播"再"获取"。AARRR 更多是分析框架而非用户必须经历的严格路径。
:::

## HEART 模型

HEART 由 Google 提出，用于衡量产品用户体验质量：

- **H**appiness（满意度）：NPS、CSAT、评分、调查反馈
- **E**ngagement（参与度）：使用频率、使用时长、人均操作次数
- **A**doption（采纳率）：新功能使用率、新用户完成特定操作的比率
- **R**etention（留存率）：Day N 留存、续订率、回访间隔
- **T**ask Success（任务成功率）：任务完成率、错误率、搜索成功率

```python
# HEART 分数卡示例
heart_scores = {
    "happiness": {"nps": 42, "csat": 4.1},
    "engagement": {"dau_mau": 0.35, "session_per_day": 2.1},
    "adoption": {"feature_adoption_rate": 0.28},
    "retention": {"d1": 0.45, "d7": 0.22, "d30": 0.12},
    "task_success": {"completion_rate": 0.83, "error_rate": 0.02}
}
```

::: tip HEART 与 AARRR 的定位差异
AARRR 侧重商业视角下的用户转化流程，HEART 侧重产品体验质量。实践中常将两者结合——用 AARRR 搭建指标体系框架，用 HEART 深入评估特定环节的体验水平。
:::

## GSM 方法

GSM（Goal / Signal / Metric）是从目标到可执行指标的推导方法论：

1. **Goal（目标）**：清晰描述期望的业务结果（定性）
2. **Signal（信号）**：用户或业务表现出什么行为说明目标达成
3. **Metric（指标）**：用什么数字量化这些信号

| 目标 | 信号 | 指标 |
|------|------|------|
| 提升搜索体验 | 用户更快找到目标内容、减少搜索失败 | 搜索成功率、搜索结果点击率、零结果率、搜索到点击的平均时间 |
| 增强社交连接 | 用户更频繁互动、好友链更紧密 | 日私信数、互关比例、内容分享率 |
| 减少支付流失 | 用户顺利完成支付流程 | 支付完成率、支付页面停留时间、错误提示率 |

```python
# GSM 示例：提升作业提交率
goal = "学生按时完成并提交作业"
signals = ["打开作业页面", "上传文件", "点击提交按钮"]
metrics = {
    "page_open_rate": 0.92,
    "upload_completion_rate": 0.78,
    "submission_rate": 0.65,
    "avg_submission_time": "22:30",  # 平均提交时间偏晚，暗示拖延
}
```

## 北极星指标（North Star Metric）

北极星指标是产品团队应核心关注的唯一指标，指引所有成员的决策方向。

### 定义原则

- **反映核心价值**：指标必须直接体现产品为用户创造的核心价值
- **引领增长**：北极星上升意味着长期业务健康
- **可量化、可操作**：团队能通过行动直接影响
- **团队可理解**：每个人都知道"我们在追求什么"

### 经典示例

| 产品 | 北极星指标 | 为什么 |
|------|-----------|--------|
| Airbnb | 预订过夜数 | 反映了 Airbnb 核心价值——旅行者获得住宿 |
| Spotify | 总收听时长 | 反映用户从产品中获得的价值量 |
| Facebook (早期) | 10 天内加 7 个好友的用户数 | 反映核心社交价值被激活 |
| Slack | 发送消息数 | 反映团队协作活跃度 |

### 分解方法

北极星指标需要分解为可执行的下层指标：

```
总收听时长 (North Star)
├── 活跃用户数  ← 增长团队
│   ├── 新用户注册
│   └── 老用户召回
├── 人均收听时长  ← 产品团队
│   ├── 播放器启动率
│   ├── 歌单推荐点击率
│   └── 离线下载使用率
└── 收听频次  ← 运营团队
    ├── 日/周推送打开率
    └── 新歌单上线频率
```

## 指标层级体系

组织级指标体系通常分为三层：

### 核心指标（Core Metrics）

业务健康度的顶层 KPI，通常 3-5 个，适合高管层关注：

```
GMV、DAU、LTV/CAC、NRR、NPS
```

### 服务指标（Service Metrics）

核心指标的构成要素，供业务线负责人关注：

```python
# 核心指标 vs 服务指标
gmv = visitors * conversion_rate * avg_order_value
#         ↑              ↑              ↑
#     流量指标       转化指标       客单价指标
```

### 代理指标（Proxy Metrics）

与服务指标强相关、可高频观测的先行指标，供一线团队关注：

| 服务指标 | 代理指标 | 依据 |
|---------|---------|------|
| 周留存率 | 首日是否完成 3 个关键动作 | 数据表明首日完成 3+ 动作的用户 7 日留存率高 2.3x |
| 搜索转化率 | 搜索结果首屏点击率 | 首屏点击率高表明搜索匹配度好 |
| 月收入 | 活跃付费用户数 × 人均付费额 | 收入拆解为量 × 价后，量通常先行变化 |

::: warning 代理指标需要持续验证
代理指标与服务指标的相关性可能随着产品迭代和市场变化而衰减，建议每季度做一次相关性检验。
:::

## 相关文章

- [指标管理](/knowledge-map/km-7-metrics/02-metrics-management) — 字典、命名规范与数据血缘
- [目标管理 OKR / KPI](/knowledge-map/km-7-metrics/03-okr-kpi) — 目标体系如何与指标联动
