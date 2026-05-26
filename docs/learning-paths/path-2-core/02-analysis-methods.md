# 分析方法论

> A/B Testing、漏斗分析、同期群分析等核心方法概述。深入参考请见 [KM 5. 分析方法论](/knowledge-map/km-5-analysis-methods/)。

## A/B Testing 完整流程

### 实验设计四要素
1. **假设**：H0 = 无差异，H1 = 有提升
2. **随机化单元**：用户级 / 会话级 / 事件级
3. **样本量计算**：基于 MDE（最小可检测效应）、α、β
4. **运行时长**：跑够一周以上，覆盖全周期

### 常见陷阱
- **Novelty Effect**：新功能短期兴奋，长期回落
- **SRM (Sample Ratio Mismatch)**：分流比例不等于预期
- **Multiple Testing**：看太多指标会增加假阳性

## 漏斗分析

```python
# 各步骤用户数
funnel = {
    '首页浏览': 100000,
    '搜索': 50000,
    '商品浏览': 30000,
    '加购物车': 10000,
    '支付': 5000,
}

# 步骤间转化率
for i in range(1, len(funnel)):
    step_names = list(funnel.keys())
    rate = funnel[step_names[i]] / funnel[step_names[i-1]]
    print(f'{step_names[i-1]} → {step_names[i]}: {rate:.1%}')
```

## 同期群分析（Cohort）

按首次行为时间分组，追踪各组后续表现。常见用途：
- **Retention Cohort**：各组留存曲线
- **Revenue Cohort**：各组累计收入
- 判断产品改版是否真正改善了留存

## 用户分层：RFM 模型

| 维度 | 定义 | 业务意义 |
|------|------|---------|
| Recency | 最近一次购买距今 | 活跃度 |
| Frequency | 购买频率 | 忠诚度 |
| Monetary | 消费金额 | 价值 |

三层各分 3-5 档，组合出用户分层策略。

> 深入了解请参阅 [KM 5. 分析方法论](/knowledge-map/km-5-analysis-methods/)。
