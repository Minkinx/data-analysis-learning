# 数据工程基础

> 分析师需要了解的数据工程知识，帮助更好地与数据团队协作和排查数据问题。深入参考请见 [KM 8. 数据工程基础](/knowledge-map/km-8-data-engineering)。

## ETL vs ELT

| | ETL | ELT |
|--|-----|-----|
| 转换位置 | 加载前（中间层） | 加载后（目标库） |
| 适用 | 传统数仓、结构化数据 | 云数仓（BigQuery / Snowflake / Redshift） |
| 灵活性 | 低 | 高 |

## 数仓分层（常用四层）

- **ODS**：源数据层，原封不动接入
- **DWD**：明细层，清洗去重
- **DWS**：汇总层，轻度聚合
- **ADS**：应用层，面向业务报表

## 数据 Pipeline 概念

```text
源数据 → 抽出（Extract）→ 转换（Transform）→ 加载（Load）→ 数据质量检查 → 报表
```

> 深入了解请参阅 [KM 8. 数据工程基础](/knowledge-map/km-8-data-engineering)。
