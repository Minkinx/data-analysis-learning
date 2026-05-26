# 数据建模入门

> 数据建模是 BI 分析师的硬核技能，直接影响查询效率和可维护性。深入参考请见 [KM 4. 数据建模](/knowledge-map/km-4-data-modeling/)。

## 维度建模（Dimensional Modeling）

Kimball 提出的维度建模是 BI 领域最主流的建模方法。

### Star Schema（星型模型）

```
Fact Table（中间） ← Dimension Tables（四周）

                 ┌── dim_user ──┐
                 │              │
    dim_product ──┤  fact_orders ├── dim_date
                 │              │
                 └── dim_store ─┘
```

- **Fact Table**：存储度量（金额、数量），有外键关联维度
- **Dimension Table**：存储描述性属性（名称、分类、时间）

### Snowflake Schema

维度表进一步规范化（拆成子表），节省存储但增加 JOIN 复杂度。

## Fact Table 类型

| 类型 | 特点 | 示例 |
|------|------|------|
| 事务事实 | 每行一笔事件 | 订单表、点击日志 |
| 周期快照 | 定期汇总 | 每日余额快照 |
| 累积快照 | 记录整个生命周期 | 订单从创建到完成的完整记录 |

## Dimension Table 与 SCD

| SCD 类型 | 处理方式 | 适用场景 |
|----------|---------|---------|
| Type 1 | 直接覆盖 | 错误修正 |
| Type 2 | 新增记录 + 有效时间 | 历史可追溯（地址、分类） |
| Type 3 | 增加字段保留上期值 | 仅需当前 vs 上一期 |

> 深入了解请参阅 [KM 4. 数据建模](/knowledge-map/km-4-data-modeling/)。
