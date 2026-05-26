# 归因分析（Attribution Analysis）

> 归因分析解决"功劳分配"问题：当一个转化事件由多个触点共同促成时，如何公平地将转化价值分配给每个触点。正确归因是优化投放预算和渠道策略的前提。

## 归因模型全景

归因模型分为 **规则驱动（Heuristic）** 和 **数据驱动（Data-driven）** 两大类。

## 单触点归因模型

### 末次点击归因（Last Click）

将 100% 功劳分配给转化前的最后一个触点：

- **优点**：简单、易实施、行业默认标准
- **缺点**：忽略所有前期触点的贡献，导致品牌/认知类渠道价值被低估
- **适用**：搜索广告、直接转化路径短的业务

```sql
-- 末次点击归因
WITH last_touch AS (
  SELECT user_id, channel,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time DESC) AS rn
  FROM attribution_events
  WHERE event_time < conversion_time
)
SELECT channel, COUNT(*) AS attributed_conversions
FROM last_touch WHERE rn = 1
GROUP BY channel ORDER BY attributed_conversions DESC;
```

### 首次点击归因（First Click）

将 100% 功劳分配给用户首次触达的渠道：

- **适用**：评估获客渠道效果、衡量品牌曝光
- **问题**：忽略后续触点的转化促进作用

## 多渠道归因模型

### 线性归因（Linear）

所有触点均分转化功劳：

- **适用**：长决策链路（如 B2B、SaaS、金融产品），每个触点都有贡献
- **特征**：无法区分各触点的重要性

### 时间衰减归因（Time Decay）

越靠近转化的触点权重越高，通常按指数衰减：

```sql
-- 时间衰减归因（指数衰减因子）
SELECT channel,
  SUM(POWER(0.5, touch_seq_from_end - 1)) AS attribution_weight
FROM (
  SELECT user_id, channel,
    ROW_NUMBER() OVER (
      PARTITION BY user_id ORDER BY event_time DESC
    ) AS touch_seq_from_end
  FROM attribution_events
  WHERE event_time < conversion_time
) t
GROUP BY channel;
```

### 位置归因（Position Based / U-Shaped）

首尾触点各占 40%，中间触点均分剩余 20%：

| 触点位置 | 权重 |
|---------|------|
| 首次点击 | 40% |
| 中间触点 | 均分 20% |
| 末次点击 | 40% |

- **适用**：同时重视获客和转化的场景
- **问题**：中间触点价值被系统性低估

## Shapley Value 归因

源自博弈论的 Shapley Value 提供了公理化的归因方案。它计算每个触点在所有可能"触点联盟"中的边际贡献平均值。

**核心思想**：一个触点的价值 = 加入各个触点组合时带来的增量转化概率的期望。

```python
import itertools
from typing import List, Dict

def shapley_attribution(channels: List[str],
                        conversion_func: callable) -> Dict[str, float]:
    """计算各渠道的 Shapley Value"""
    n = len(channels)
    values = {c: 0.0 for c in channels}

    for channel in channels:
        # 构造不包含 channel 的所有子集
        others = [c for c in channels if c != channel]
        for r in range(n):
            for subset in itertools.combinations(others, r):
                subset = list(subset)
                w = conversion_func(subset + [channel])  # 含 channel
                wo = conversion_func(subset)              # 不含 channel
                marginal = w - wo
                # 加权：该子集出现的概率
                weight = (len(subset) * (n - len(subset) - 1)) / n
                values[channel] += marginal * weight

    return values

# 假设已知各渠道组合下的转化率
def conv_rate(channels):
    mapping = {
        frozenset(['Search']): 0.02,
        frozenset(['Social']): 0.015,
        frozenset(['Email']): 0.025,
        frozenset(['Search', 'Social']): 0.04,
        frozenset(['Search', 'Email']): 0.06,
        frozenset(['Social', 'Email']): 0.05,
        frozenset(['Search', 'Social', 'Email']): 0.08,
    }
    return mapping.get(frozenset(channels), 0.0)

shapley_attribution(['Search', 'Social', 'Email'], conv_rate)
# 输出示例: {'Search': 0.032, 'Social': 0.022, 'Email': 0.036}
```

::: tip Shapley Value 的优势
- 唯一满足对称性、虚拟性、可加性、效率四个公理的归因方法
- 公平反映各渠道的独立贡献和协同效应
- 渠道越多，优势越明显
:::

## 数据驱动归因模型

数据驱动模型利用机器学习从用户路径数据中直接学习归因权重：

### 马尔可夫链归因

将用户路径建模为马尔可夫链，状态 = 各渠道，转移概率 = 渠道间跳转的概率。渠道的重要性 = 移除该渠道后整体转化率的下降幅度（Removal Effect）：

```python
import numpy as np

def removal_effect(transition_matrix, channels, removal_idx):
    """计算移除某渠道后的整体转化率"""
    # 将移除渠道的出链和入链概率置零
    mod_matrix = transition_matrix.copy()
    mod_matrix[removal_idx, :] = 0
    mod_matrix[:, removal_idx] = 0
    # 重新计算稳态转化率
    # ...
    return effect
```

### 基于深度学习的归因

对于大规模的时序用户路径，可使用 RNN 或 Transformer 建模：

- **输入**：`[user_id, channel_sequence, dwell_time, ...]`
- **输出**：每个触点的 attention weight（可解释为贡献度）
- **优势**：自动学习非线性交互和高阶特征

## 归因模型选型

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 搜索广告优化 | Last Click | 搜索是直接响应型，末次点击信号最强 |
| 品牌曝光评估 | First Click / Shapley | 品牌触点在早期，需要多触点公平分配 |
| 长决策链路（B2B） | Linear / Time Decay | 各触点均需传递信息 |
| 预算分配决策 | Shapley Value | 考虑协同效应，分配更公平 |
| 大规模自动优化 | Data-driven（ML） | 自适应学习，实时调整 |
| 初期试水 | Last Click + 辅助看 First Click | 复杂度低，快速验证 |

::: warning 归因分析的前提条件
- 需要有完整统一的用户标识体系（同一用户跨设备跨渠道的识别）
- 各触点的埋点时间戳须精确且对齐
- 曝光（Impression）与点击（Click）对转化的贡献不同，建议分开建模
:::

## 相关文章

- [漏斗分析](/knowledge-map/km-5-analysis-methods/01-funnel) — 归因与漏斗的配合使用
- [用户分层](/knowledge-map/km-5-analysis-methods/04-user-segmentation) — 按用户分层对比归因结果
- [LTV 分析](/knowledge-map/km-5-analysis-methods/07-ltv) — 归因渠道 × LTV 决定投放预算
