# KM 4. 数据建模（Data Modeling）

> 数据建模是数据仓库和 BI 系统的理论基础，决定了一个数据平台在查询性能、维护成本和扩展性上的表现。本节覆盖主流建模方法论、事实表与维度表的详细设计、缓慢变化维度的处理策略，以及实战案例。

## 章节

1. [维度建模方法论](/knowledge-map/km-4-data-modeling/01-dimensional-modeling) — Kimball 维度建模与 Inmon/Data Vault 流派对比、Star Schema 与 Snowflake Schema 的设计决策和权衡
2. [事实表与维度表](/knowledge-map/km-4-data-modeling/02-fact-dimension) — 事务/周期快照/累积快照三种事实表、Additive/Semi-Additive/Non-Additive 度量分类、一致性维度/退化维度/垃圾维度/角色扮演维度、代理键 vs 自然键
3. [缓慢变化维度](/knowledge-map/km-4-data-modeling/03-scd) — SCD Type 1 覆盖、Type 2 新增行+有效期、Type 3 新增列、Type 2 查询模式（有效日期过滤、最新记录检索）、实践经验
4. [行业建模实战](/knowledge-map/km-4-data-modeling/04-industry-cases) — 电商订单模型设计（fact_orders + dim 用户/产品/日期/门店）、用户行为事件模型设计（fact_events + dim 事件/设备）、7 个常见建模陷阱

## 参考

- [学习路径：数据建模入门](/learning-paths/path-2-core/01-data-modeling) — 快速入门版本
